# Advanced Technical Implementation Guide - Chatbot System

This document provides comprehensive technical specifications for optimizing, scaling, and maintaining the Tasty Food chatbot system.

## 1. Database Optimization

### Indexes for Performance

**Update migration file to add optimized indexes:**

```sql
-- File: supabase/migrations/20260120000001_optimize_support_indexes.sql

-- Composite index for fast message retrieval per ticket (most common query)
CREATE INDEX IF NOT EXISTS idx_support_messages_request_created 
  ON public.support_messages(request_id, created_at DESC);

-- Email lookup for rate limiting and user history
CREATE INDEX IF NOT EXISTS idx_support_requests_email_created 
  ON public.support_requests(email, created_at DESC);

-- Status + created_at for agent queue sorting
CREATE INDEX IF NOT EXISTS idx_support_requests_status_created 
  ON public.support_requests(status, created_at DESC);

-- Priority flagging (add priority column first)
ALTER TABLE public.support_requests 
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' 
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

CREATE INDEX IF NOT EXISTS idx_support_requests_priority 
  ON public.support_requests(priority, created_at DESC);

-- Composite index for agent dashboard queries
CREATE INDEX IF NOT EXISTS idx_support_requests_dashboard 
  ON public.support_requests(status, priority, created_at DESC);
```

### Pagination Implementation

**Service layer with pagination:**

```typescript
// File: src/services/supportRequests.ts

interface PaginatedMessages {
  messages: SupportMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Get messages for a support request with pagination
 * @param requestId - Ticket UUID
 * @param limit - Number of messages to fetch (default: 20)
 * @param cursor - ISO timestamp of last message for pagination
 */
export async function getSupportMessagesPaginated(
  requestId: string,
  limit: number = 20,
  cursor?: string
): Promise<PaginatedMessages> {
  let query = supabase
    .from('support_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(limit + 1); // Fetch one extra to check if there are more

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paginated messages:', error);
    return { messages: [], hasMore: false };
  }

  const hasMore = data.length > limit;
  const messages = hasMore ? data.slice(0, limit) : data;

  return {
    messages: messages.reverse(), // Reverse to show oldest first in UI
    hasMore,
    nextCursor: hasMore ? messages[0].created_at : undefined,
  };
}
```

**React component with infinite scroll:**

```typescript
// File: src/components/chat/TicketConversation.tsx

import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['messages', ticketId],
  queryFn: ({ pageParam }) =>
    getSupportMessagesPaginated(ticketId, 20, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

// In JSX:
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loader={<Loader key={0} />}
>
  {data?.pages.flatMap(page => page.messages).map(msg => (
    <MessageBubble key={msg.id} message={msg} />
  ))}
</InfiniteScroll>
```

### Analytics Table

```sql
-- File: supabase/migrations/20260120000002_create_support_analytics.sql

CREATE TABLE IF NOT EXISTS public.support_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metrics
  metric_type text NOT NULL CHECK (metric_type IN (
    'ticket_created',
    'message_sent',
    'ticket_resolved',
    'agent_response',
    'user_satisfaction',
    'timeout_escalation'
  )),
  
  -- References
  request_id uuid REFERENCES public.support_requests(id) ON DELETE CASCADE,
  agent_id uuid, -- Future: reference to agents table
  
  -- Intent classification
  user_intent text CHECK (user_intent IN (
    'faq',
    'problem',
    'complaint',
    'compliment',
    'order_tracking',
    'general_inquiry',
    'unknown'
  )),
  
  -- Timing metrics
  response_time_seconds integer, -- Time to first agent response
  resolution_time_seconds integer, -- Time to close ticket
  
  -- Additional context
  metadata jsonb, -- Flexible field for extra data
  
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_metric_type ON public.support_analytics(metric_type, created_at DESC);
CREATE INDEX idx_analytics_request_id ON public.support_analytics(request_id);
CREATE INDEX idx_analytics_user_intent ON public.support_analytics(user_intent, created_at DESC);
CREATE INDEX idx_analytics_created_at ON public.support_analytics(created_at DESC);

-- Function to automatically calculate response time
CREATE OR REPLACE FUNCTION public.track_agent_response_time()
RETURNS trigger AS $$
BEGIN
  -- When agent sends first message, calculate response time
  IF NEW.author_type = 'agent' THEN
    INSERT INTO public.support_analytics (
      metric_type,
      request_id,
      response_time_seconds
    )
    SELECT 
      'agent_response',
      NEW.request_id,
      EXTRACT(EPOCH FROM (NEW.created_at - r.created_at))::integer
    FROM public.support_requests r
    WHERE r.id = NEW.request_id
      AND r.last_agent_reply_at IS NULL; -- First response only
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_response_time
  AFTER INSERT ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.track_agent_response_time();
```

**Analytics tracking service:**

```typescript
// File: src/services/analytics.ts

export async function trackSupportEvent(
  metricType: 'ticket_created' | 'message_sent' | 'ticket_resolved' | 'timeout_escalation',
  requestId: string,
  additionalData?: {
    userIntent?: string;
    metadata?: Record<string, any>;
  }
) {
  await supabase.from('support_analytics').insert({
    metric_type: metricType,
    request_id: requestId,
    user_intent: additionalData?.userIntent,
    metadata: additionalData?.metadata,
  });
}

// Usage:
await createSupportRequest(email, message);
await trackSupportEvent('ticket_created', requestId, {
  userIntent: classifyIntent(message), // AI or keyword-based
  metadata: { platform: 'web', source: 'help_menu' }
});
```

---

## 2. Real-Time Updates & WebSockets

### Supabase Realtime Implementation

```typescript
// File: src/hooks/useSupportRealtime.ts

import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions {
  ticketId: string;
  onNewMessage: (message: SupportMessage) => void;
  onAgentTyping?: (isTyping: boolean) => void;
}

export function useSupportRealtime({
  ticketId,
  onNewMessage,
  onAgentTyping,
}: UseRealtimeOptions) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      channel = supabase
        .channel(`support-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'support_messages',
            filter: `request_id=eq.${ticketId}`,
          },
          (payload) => {
            onNewMessage(payload.new as SupportMessage);
            
            // Show notification if agent message
            if ((payload.new as SupportMessage).author_type === 'agent') {
              new Notification('Nouvelle réponse Tasty Food', {
                body: 'Un agent a répondu à votre ticket',
                icon: '/favicon.ico',
              });
            }
          }
        )
        .on('presence', { event: 'sync' }, () => {
          // Track who's viewing the ticket (future: agent typing indicator)
          const state = channel.presenceState();
          const agents = Object.values(state).filter(
            (user: any) => user.role === 'agent'
          );
          onAgentTyping?.(agents.length > 0);
        })
        .subscribe();
    };

    setupRealtime();

    return () => {
      channel?.unsubscribe();
    };
  }, [ticketId, onNewMessage, onAgentTyping]);
}
```

**Usage in TicketConversation:**

```typescript
const [isAgentTyping, setIsAgentTyping] = useState(false);

useSupportRealtime({
  ticketId,
  onNewMessage: (msg) => {
    setMessages((prev) => [...prev, msg]);
  },
  onAgentTyping: (typing) => {
    setIsAgentTyping(typing);
  },
});

// In JSX:
{isAgentTyping && (
  <div className="text-sm text-gray-500 italic">
    Un agent est en train d'écrire...
  </div>
)}
```

### Debouncing for Performance

```typescript
// File: src/hooks/useDebounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Debounce search input
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  // Only search after user stops typing for 300ms
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 3. Caching Strategy

### React Query Configuration

```typescript
// File: src/App.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### FAQ Caching

```typescript
// File: src/hooks/useFAQCache.ts

import { useQuery } from '@tanstack/react-query';

export function useFAQContent() {
  return useQuery({
    queryKey: ['faq-content'],
    queryFn: async () => {
      // Check sessionStorage first
      const cached = sessionStorage.getItem('faq-content');
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from Supabase (future: dynamic FAQ from DB)
      const { data } = await supabase.from('faq_entries').select('*');
      
      // Cache in sessionStorage
      sessionStorage.setItem('faq-content', JSON.stringify(data));
      
      return data;
    },
    staleTime: Infinity, // FAQ rarely changes
    cacheTime: Infinity, // Keep in cache forever
  });
}
```

### Ticket Cache Invalidation

```typescript
// File: src/hooks/useSupportTicket.ts

import { useQueryClient } from '@tanstack/react-query';

export function useSupportTicket(ticketId: string) {
  const queryClient = useQueryClient();

  // When agent replies, bust cache
  useSupportRealtime({
    ticketId,
    onNewMessage: (msg) => {
      if (msg.author_type === 'agent') {
        // Invalidate ticket data
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        queryClient.invalidateQueries({ queryKey: ['messages', ticketId] });
      }
    },
  });

  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getSupportRequest(ticketId),
    staleTime: 30 * 1000, // 30s cache
  });
}
```

---

## 4. Performance Metrics & Monitoring

### Performance Instrumentation

```typescript
// File: src/services/performance.ts

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class ChatPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  // Track time from action to completion
  startMeasure(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Send to analytics
    this.sendToAnalytics(metric);

    // Log if slow
    if (value > 1000) {
      console.warn(`[Performance] ${name} took ${value.toFixed(2)}ms`, metadata);
    }
  }

  private async sendToAnalytics(metric: PerformanceMetric) {
    // Send to Sentry, Google Analytics, or custom endpoint
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send metric:', error);
    }
  }

  // Get performance summary
  getSummary(metricName?: string): Record<string, any> {
    const filtered = metricName
      ? this.metrics.filter(m => m.name === metricName)
      : this.metrics;

    if (filtered.length === 0) return {};

    const values = filtered.map(m => m.value);
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.percentile(values, 0.95),
    };
  }

  private percentile(arr: number[], p: number): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}

export const perfMonitor = new ChatPerformanceMonitor();
```

**Usage in components:**

```typescript
// Track help menu render time
const endMeasure = perfMonitor.startMeasure('help_menu_render');
// ... render logic
endMeasure();

// Track ticket submission
const submitEndMeasure = perfMonitor.startMeasure('ticket_submit');
await createSupportRequest(email, message);
submitEndMeasure();

// Track message send time
const sendEndMeasure = perfMonitor.startMeasure('message_send');
await addSupportMessage(ticketId, body, 'user');
sendEndMeasure();
```

### Core Web Vitals Tracking

```typescript
// File: src/services/webVitals.ts

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function trackWebVitals() {
  onCLS((metric) => {
    perfMonitor.recordMetric('web_vitals_cls', metric.value);
  });

  onFID((metric) => {
    perfMonitor.recordMetric('web_vitals_fid', metric.value);
  });

  onFCP((metric) => {
    perfMonitor.recordMetric('web_vitals_fcp', metric.value);
  });

  onLCP((metric) => {
    perfMonitor.recordMetric('web_vitals_lcp', metric.value);
  });

  onTTFB((metric) => {
    perfMonitor.recordMetric('web_vitals_ttfb', metric.value);
  });
}

// Initialize in App.tsx
useEffect(() => {
  trackWebVitals();
}, []);
```

---

## 5. Error Handling & Graceful Degradation

### Retry Logic with Exponential Backoff

```typescript
// File: src/lib/retry.ts

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(initialDelay * 2 ** attempt, maxDelay);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage:
const request = await retryWithBackoff(
  () => getSupportRequest(ticketId),
  {
    maxRetries: 3,
    shouldRetry: (error) => error.status >= 500, // Only retry server errors
  }
);
```

### Offline Queue with IndexedDB

```typescript
// File: src/lib/offlineQueue.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineQueueDB extends DBSchema {
  messages: {
    key: string;
    value: {
      id: string;
      ticketId: string;
      body: string;
      createdAt: number;
      retryCount: number;
    };
  };
}

class OfflineMessageQueue {
  private db?: IDBPDatabase<OfflineQueueDB>;

  async init() {
    this.db = await openDB<OfflineQueueDB>('offline-queue', 1, {
      upgrade(db) {
        db.createObjectStore('messages', { keyPath: 'id' });
      },
    });
  }

  async enqueue(ticketId: string, body: string) {
    if (!this.db) await this.init();

    const message = {
      id: crypto.randomUUID(),
      ticketId,
      body,
      createdAt: Date.now(),
      retryCount: 0,
    };

    await this.db!.add('messages', message);
    return message.id;
  }

  async dequeue() {
    if (!this.db) await this.init();
    const messages = await this.db!.getAll('messages');
    return messages;
  }

  async remove(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete('messages', id);
  }

  async syncAll() {
    const messages = await this.dequeue();

    for (const msg of messages) {
      try {
        await addSupportMessage(msg.ticketId, msg.body, 'user');
        await this.remove(msg.id);
        console.log('✅ Synced offline message:', msg.id);
      } catch (error) {
        console.error('Failed to sync message:', error);
        // Increment retry count or remove after X failures
      }
    }
  }
}

export const offlineQueue = new OfflineMessageQueue();

// Sync when online
window.addEventListener('online', () => {
  offlineQueue.syncAll();
});
```

### Centralized Error Handler

```typescript
// File: src/lib/errorHandler.ts

interface ErrorContext {
  user?: string;
  action: string;
  component?: string;
  metadata?: Record<string, any>;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public context: ErrorContext,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export function handleChatError(error: any, context: ErrorContext) {
  const chatError = new ChatError(
    error.message || 'An error occurred',
    context,
    error
  );

  // Log to console (dev)
  console.error('[ChatError]', chatError.message, chatError.context);

  // Send to Sentry (production)
  if (import.meta.env.PROD) {
    // Sentry.captureException(chatError);
  }

  // Store in analytics
  supabase.from('error_logs').insert({
    error_type: chatError.name,
    message: chatError.message,
    context: chatError.context,
    stack: chatError.stack,
  });

  // Return user-friendly message
  return getUserFriendlyMessage(error);
}

function getUserFriendlyMessage(error: any): string {
  if (!navigator.onLine) {
    return 'Vous semblez hors ligne. Vérifiez votre connexion internet.';
  }

  if (error.status >= 500) {
    return 'Nos serveurs rencontrent un problème temporaire. Réessayez dans un instant.';
  }

  if (error.status === 404) {
    return 'Cette ressource n\'existe pas ou a été supprimée.';
  }

  if (error.status === 429) {
    return 'Trop de requêtes. Attendez un moment avant de réessayer.';
  }

  return 'Une erreur inattendue s\'est produite. Réessayez ou contactez le support.';
}
```

---

## 6. Agent Dashboard Backend

### API Endpoints

```typescript
// File: server/routes/agent.ts

import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

/**
 * GET /api/agent/tickets - Get paginated ticket queue
 */
router.get('/tickets', async (req, res) => {
  const {
    status = 'open',
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 20,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const { data, error, count } = await supabase
    .from('support_requests')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order(sort as string, { ascending: order === 'asc' })
    .range(offset, offset + Number(limit) - 1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    tickets: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil((count || 0) / Number(limit)),
    },
  });
});

/**
 * GET /api/agent/tickets/:id - Get ticket details with messages
 */
router.get('/tickets/:id', async (req, res) => {
  const { id } = req.params;

  const [ticketResult, messagesResult] = await Promise.all([
    supabase.from('support_requests').select('*').eq('id', id).single(),
    supabase
      .from('support_messages')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (ticketResult.error) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json({
    ticket: ticketResult.data,
    messages: messagesResult.data || [],
  });
});

/**
 * PATCH /api/agent/tickets/:id - Update ticket status
 */
router.patch('/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, agent_note } = req.body;

  const { data, error } = await supabase
    .from('support_requests')
    .update({ status, priority, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log agent action
  await supabase.from('agent_actions').insert({
    ticket_id: id,
    action: 'status_change',
    details: { status, priority, agent_note },
  });

  res.json({ ticket: data });
});

/**
 * POST /api/agent/tickets/:id/messages - Agent reply
 */
router.post('/tickets/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  const { data, error } = await addSupportMessage(id, body, 'agent');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: data });
});

/**
 * GET /api/agent/analytics - Dashboard analytics
 */
router.get('/analytics', async (req, res) => {
  const { from, to } = req.query;

  // Average response time
  const { data: responseTimeData } = await supabase
    .from('support_analytics')
    .select('response_time_seconds')
    .eq('metric_type', 'agent_response')
    .gte('created_at', from)
    .lte('created_at', to);

  const avgResponseTime =
    responseTimeData?.reduce((sum, r) => sum + (r.response_time_seconds || 0), 0) /
    (responseTimeData?.length || 1);

  // Ticket counts by status
  const { data: statusCounts } = await supabase
    .from('support_requests')
    .select('status')
    .gte('created_at', from)
    .lte('created_at', to);

  const statusBreakdown = statusCounts?.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  res.json({
    avgResponseTimeSeconds: avgResponseTime,
    statusBreakdown,
    totalTickets: statusCounts?.length || 0,
  });
});

export default router;
```

### Agent Dashboard UI (Conceptual)

```typescript
// File: src/pages/AgentDashboard.tsx

export const AgentDashboard: React.FC = () => {
  const { data: tickets } = useQuery({
    queryKey: ['agent-tickets', 'open'],
    queryFn: () => fetch('/api/agent/tickets?status=open').then(r => r.json()),
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>

      {/* Analytics Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard title="Open Tickets" value={tickets?.pagination.total} />
        <StatCard title="Avg Response Time" value="2.5h" />
        <StatCard title="Resolution Rate" value="94%" />
      </div>

      {/* Ticket Queue */}
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets?.tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## 7. Rate Limiting & Abuse Prevention

### Supabase Edge Function with Rate Limiting

```typescript
// File: supabase/functions/rate-limit/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  maxTicketsPerDay: number;
  maxMessagesPerHour: number;
}

const config: RateLimitConfig = {
  maxTicketsPerDay: 5,
  maxMessagesPerHour: 100,
};

async function checkTicketRateLimit(email: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('support_requests')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneDayAgo);

  return (count || 0) < config.maxTicketsPerDay;
}

async function checkMessageRateLimit(ticketId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('request_id', ticketId)
    .gte('created_at', oneHourAgo);

  return (count || 0) < config.maxMessagesPerHour;
}

serve(async (req) => {
  const { action, email, ticketId } = await req.json();

  let allowed = true;

  if (action === 'create_ticket') {
    allowed = await checkTicketRateLimit(email);
  } else if (action === 'send_message') {
    allowed = await checkMessageRateLimit(ticketId);
  }

  return new Response(
    JSON.stringify({ allowed }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Frontend Integration

```typescript
// File: src/services/supportRequests.ts

export async function createSupportRequest(email: string, message: string) {
  // Check rate limit first
  const { data: rateLimitCheck } = await supabase.functions.invoke('rate-limit', {
    body: { action: 'create_ticket', email },
  });

  if (!rateLimitCheck.allowed) {
    throw new Error(
      'Vous avez atteint la limite de tickets pour aujourd\'hui. Réessayez demain ou contactez-nous directement.'
    );
  }

  // Proceed with ticket creation
  const { data, error } = await supabase
    .from('support_requests')
    .insert([{ email, message, status: 'open' }])
    .select()
    .single();

  if (error) throw error;

  // Trigger email
  await supabase.functions.invoke('send-support-email', {
    body: { type: 'created', requestId: data.id },
  });

  return data;
}
```

---

## 8. Email Sending Resilience

### Retry Queue Table

```sql
-- File: supabase/migrations/20260120000003_email_retry_queue.sql

CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.support_requests(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN ('created', 'agent_reply')),
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  retry_count integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  next_retry_at timestamptz
);

CREATE INDEX idx_email_queue_status ON public.email_queue(status, next_retry_at);
```

### Edge Function with Retry Logic

```typescript
// File: supabase/functions/send-support-email/index.ts

async function sendEmailWithRetry(emailData: EmailRequest) {
  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${resendResponse.statusText}`);
    }

    // Mark as sent
    await supabase
      .from('email_queue')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('request_id', emailData.requestId)
      .eq('email_type', emailData.type);

    return { success: true };
  } catch (error) {
    // Add to retry queue
    await supabase.from('email_queue').insert({
      request_id: emailData.requestId,
      email_type: emailData.type,
      recipient_email: emailData.to,
      status: 'pending',
      next_retry_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Retry in 1 hour
      last_error: error.message,
    });

    throw error;
  }
}
```

### Cron Job for Retry

```typescript
// File: supabase/functions/email-retry-worker/index.ts

serve(async () => {
  // Fetch pending emails that are ready for retry
  const { data: pendingEmails } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .lt('retry_count', 5); // Max 5 retries

  for (const email of pendingEmails || []) {
    try {
      await sendEmailWithRetry({
        type: email.email_type,
        requestId: email.request_id,
        to: email.recipient_email,
      });
    } catch (error) {
      // Increment retry count
      await supabase
        .from('email_queue')
        .update({
          retry_count: email.retry_count + 1,
          next_retry_at: new Date(
            Date.now() + Math.pow(2, email.retry_count) * 60 * 60 * 1000
          ).toISOString(), // Exponential backoff
          last_error: error.message,
        })
        .eq('id', email.id);
    }
  }

  return new Response('OK');
});
```

**Schedule in Supabase Dashboard:**
```sql
-- Cron trigger (pg_cron extension)
SELECT cron.schedule(
  'email-retry-worker',
  '0 * * * *', -- Every hour
  $$ SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/email-retry-worker',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_KEY"}'
  ) $$
);
```

---

## 9. Localization & Multi-Language Support

### Translation Files Structure

```
public/locales/
├── en/
│   ├── common.json
│   ├── faq.json
│   └── errors.json
├── fr/
│   ├── common.json
│   ├── faq.json
│   └── errors.json
└── nl/
    ├── common.json
    ├── faq.json
    └── errors.json
```

**Example FAQ translation:**

```json
// public/locales/fr/faq.json
{
  "certifications": {
    "title": "Quelles certifications avez-vous ?",
    "answer": "Nous sommes certifiés 100% HALAL par AVS..."
  },
  "is_halal": {
    "title": "Est-ce HALAL ?",
    "answer": "OUI, 100% HALAL certifié ! Toute notre viande..."
  }
}

// public/locales/en/faq.json
{
  "certifications": {
    "title": "What certifications do you have?",
    "answer": "We are 100% HALAL certified by AVS..."
  },
  "is_halal": {
    "title": "Is it HALAL?",
    "answer": "YES, 100% HALAL certified! All our meat..."
  }
}
```

### i18n Configuration

```typescript
// File: src/i18n/config.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import enFaq from '@/locales/en/faq.json';
import frCommon from '@/locales/fr/common.json';
import frFaq from '@/locales/fr/faq.json';
import nlCommon from '@/locales/nl/common.json';
import nlFaq from '@/locales/nl/faq.json';

i18n
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, faq: enFaq },
      fr: { common: frCommon, faq: frFaq },
      nl: { common: nlCommon, faq: nlFaq },
    },
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export const HelpMenu: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'faq']);

  return (
    <div>
      <h2>{t('common:help_menu_title')}</h2>
      <button onClick={() => i18n.changeLanguage('en')}>
        English
      </button>
      <button onClick={() => i18n.changeLanguage('fr')}>
        Français
      </button>
      
      <p>{t('faq:is_halal.answer')}</p>
    </div>
  );
};
```

### Store User Language Preference

```sql
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id text PRIMARY KEY, -- email or UUID
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'nl')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 10. Developer UX in VS Code

### Test Utilities

```typescript
// File: src/test-utils/mockData.ts

export const mockSupportRequest: SupportRequest = {
  id: 'test-ticket-123',
  email: 'test@example.com',
  message: 'Test support request',
  status: 'open',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_agent_reply_at: null,
};

export const mockMessages: SupportMessage[] = [
  {
    id: 'msg-1',
    request_id: 'test-ticket-123',
    author_type: 'user',
    body: 'Hello, I need help',
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    request_id: 'test-ticket-123',
    author_type: 'agent',
    body: 'Hi! How can I help you?',
    created_at: new Date().toISOString(),
  },
];

export function createMockTicket(overrides?: Partial<SupportRequest>): SupportRequest {
  return { ...mockSupportRequest, ...overrides };
}
```

### Storybook Stories

```typescript
// File: src/components/chat/HelpMenu.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { HelpMenu } from './HelpMenu';

const meta: Meta<typeof HelpMenu> = {
  title: 'Chat/HelpMenu',
  component: HelpMenu,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof HelpMenu>;

export const Default: Story = {
  args: {
    onOptionSelect: (option) => console.log('Selected:', option),
  },
};

export const WithFrenchLocale: Story = {
  args: {
    onOptionSelect: (option) => console.log('Sélectionné:', option),
  },
  parameters: {
    i18n: { locale: 'fr' },
  },
};
```

### Debug Page

```typescript
// File: src/pages/ChatDebug.tsx

export const ChatDebug: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>('welcome');
  const [ticketId, setTicketId] = useState('');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chat Debug Panel</h1>

      {/* State Control */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Force Chat State:</h2>
        <div className="flex gap-2">
          {['welcome', 'help', 'faq', 'track', 'support', 'ticket'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as ChatMode)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Performance Metrics:</h2>
        <pre>{JSON.stringify(perfMonitor.getSummary(), null, 2)}</pre>
      </div>

      {/* Database State */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Database State:</h2>
        <DatabaseInspector />
      </div>

      {/* Event Log */}
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Event Log:</h2>
        <EventLogViewer />
      </div>
    </div>
  );
};
```

### Database Inspector Component

```typescript
const DatabaseInspector: React.FC = () => {
  const { data: tickets } = useQuery({
    queryKey: ['debug-tickets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
    refetchInterval: 2000, // Auto-refresh every 2s
  });

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Recent Tickets:</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="text-left p-1">ID</th>
            <th className="text-left p-1">Email</th>
            <th className="text-left p-1">Status</th>
            <th className="text-left p-1">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets?.map((ticket) => (
            <tr key={ticket.id} className="border-b">
              <td className="p-1 font-mono">{ticket.id.slice(0, 8)}</td>
              <td className="p-1">{ticket.email}</td>
              <td className="p-1">
                <span className={`px-2 py-1 rounded text-xs ${
                  ticket.status === 'open' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {ticket.status}
                </span>
              </td>
              <td className="p-1">{new Date(ticket.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Apply database optimization indexes
- [ ] Implement pagination for messages
- [ ] Add basic error handling with retry logic
- [ ] Set up performance monitoring

### Phase 2: Real-Time & Caching (Week 3-4)
- [ ] Implement Supabase Realtime subscriptions
- [ ] Configure React Query caching strategy
- [ ] Add offline queue with IndexedDB
- [ ] Build agent typing indicator

### Phase 3: Analytics & Monitoring (Week 5-6)
- [ ] Create support_analytics table
- [ ] Implement event tracking throughout app
- [ ] Build performance metrics dashboard
- [ ] Set up Web Vitals tracking

### Phase 4: Agent Dashboard (Week 7-8)
- [ ] Build agent API endpoints
- [ ] Create agent dashboard UI
- [ ] Add ticket queue with sorting/filtering
- [ ] Implement suggested responses

### Phase 5: Production Hardening (Week 9-10)
- [ ] Implement rate limiting
- [ ] Add email retry queue
- [ ] Set up Sentry error tracking
- [ ] Create debug tools and Storybook stories

### Phase 6: Localization (Week 11-12)
- [ ] Set up i18next
- [ ] Create translation files (FR/EN/NL)
- [ ] Build language switcher
- [ ] Store user language preferences

---

## Monitoring Checklist

**Daily:**
- [ ] Check error logs in Sentry
- [ ] Review open ticket count
- [ ] Monitor average response time

**Weekly:**
- [ ] Analyze performance metrics (p95 latencies)
- [ ] Review user satisfaction scores
- [ ] Check email delivery rates
- [ ] Update FAQ based on common questions

**Monthly:**
- [ ] Review database query performance
- [ ] Optimize slow queries with EXPLAIN ANALYZE
- [ ] Update dependencies
- [ ] Review and update localization files

---

This implementation guide provides a complete roadmap for building a production-ready, enterprise-grade chatbot system. Each section can be implemented incrementally as the system grows. 🚀
