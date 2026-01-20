
# Customer Support System - Tasty Food

Complete customer help chatbot with guided assistance, email ticketing, and agent handoff.

## 🎯 Overview

This system provides:
- **Interactive help menu** with FAQ, order tracking, and support ticketing
- **Email-based ticketing** with confirmation and conversation tracking
- **Real-time messaging** between users and agents
- **Automatic escalation** when agents take too long to respond
- **Mobile-first design** integrated with the existing dark theme

## 🏗️ Architecture

```
┌─────────────────────┐
│  EnhancedChatBot    │ (Main UI component)
└──────────┬──────────┘
           │
    ┌──────┴─────────────────────┬────────────────────┐
    │                            │                    │
┌───▼──────┐        ┌───────────▼──────┐   ┌────────▼─────────┐
│ HelpMenu │        │ OrderTrackingFlow│   │ TicketConversation│
└───┬──────┘        └──────────────────┘   └────────┬─────────┘
    │                                                 │
┌───▼───────────────┐                    ┌───────────▼─────────────┐
│SupportRequestForm │                    │ supportRequests.ts      │
└───────────────────┘                    │ (API service)           │
                                         └───────────┬─────────────┘
                                                     │
                                         ┌───────────▼─────────────┐
                                         │ Supabase                │
                                         │ - support_requests      │
                                         │ - support_messages      │
                                         │ - send-support-email    │
                                         └─────────────────────────┘
```

## 📁 File Structure

```
src/
├── components/
│   ├── EnhancedChatBot.tsx          # Main chatbot component
│   └── chat/
│       ├── HelpMenu.tsx             # Help options menu + FAQ content
│       ├── SupportRequestForm.tsx   # Create new support ticket
│       ├── OrderTrackingFlow.tsx    # Order tracking by platform
│       └── TicketConversation.tsx   # Ticket messages & replies
├── services/
│   └── supportRequests.ts           # Supabase API calls
└── lib/
    └── supabase.ts                  # Supabase client

supabase/
├── migrations/
│   └── 20260120000000_create_support_system.sql  # Database schema
└── functions/
    └── send-support-email/
        └── index.ts                 # Email notifications via Resend
```

## 🚀 Getting Started

### 1. Apply Database Migration

```bash
# Connect to local Supabase
psql -h localhost -p 54322 -U postgres -d postgres

# Apply migration
\i supabase/migrations/20260120000000_create_support_system.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. Set Up Edge Function

#### Deploy the email function:

```bash
supabase functions deploy send-support-email
```

#### Configure environment variables in Supabase Dashboard:

```bash
RESEND_API_KEY=re_xxxxxxxxxx
CHAT_URL=https://tastyfood.be/support
```

**Get Resend API Key:**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your sending domain (or use sandbox for testing)

### 3. Update Environment Variables

Create or update `.env.local`:

```env
# Supabase (local development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase

# Production Supabase
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
```

(Already included if using the project's package.json)

### 5. Use the Enhanced ChatBot

Replace the existing `ChatBot` component in `src/App.tsx`:

```tsx
// Old
import ChatBot from '@/components/ChatBot';

// New
import { EnhancedChatBot } from '@/components/EnhancedChatBot';

// In component tree
<EnhancedChatBot />
```

Or run both side-by-side for A/B testing.

## 💬 User Flow

### 1. Initial Contact

User clicks the floating chat button → Bot asks "Do you need help?"

**Options:**
- "Yes, need help" → Shows help menu
- "No, I want to order" → Shows ordering info (can integrate existing flow)

### 2. Help Menu

Six options displayed as buttons:
1. **Certifications** → FAQ answer
2. **How to order** → FAQ answer
3. **Is it HALAL?** → FAQ answer
4. **What is HALAL?** → FAQ answer
5. **Track my order** → Order tracking flow
6. **Contact support** → Support form

### 3. Order Tracking

1. User selects platform (Uber Eats, Deliveroo, Takeaway, Tasty Food website)
2. User enters order number (optional)
3. Opens platform's tracking page in new tab

### 4. Support Ticket Creation

1. User fills form:
   - Email (required, validated)
   - Message (required)
2. On submit:
   - Creates `support_requests` row
   - Triggers Edge Function to send confirmation email
   - Email contains deep link: `https://tastyfood.be/support?ticket=<uuid>`
3. Bot confirms: "Check your email for the tracking link"

### 5. Ticket Conversation

When user clicks email link:

1. Chatbot opens in "ticket mode"
2. Shows ticket status badge (open/answered/closed/timeout)
3. Displays conversation history
4. User can send messages → stored in `support_messages`
5. Real-time updates when agent replies

### 6. Timeout Escalation

If no agent reply after 24 hours:

1. Warning appears: "Agent is taking longer than expected"
2. User can choose to escalate
3. Creates new ticket, marks old one as "timeout"
4. Sends new confirmation email

## 🛠️ Agent Workflow (Admin Side)

### View Open Tickets

Query Supabase dashboard or create admin UI:

```sql
SELECT id, email, message, status, created_at
FROM support_requests
WHERE status = 'open'
ORDER BY created_at DESC;
```

### Reply to Ticket

Use Supabase client or admin UI to insert message:

```typescript
import { supabase } from './supabase';

await supabase.from('support_messages').insert({
  request_id: 'ticket-uuid',
  author_type: 'agent',
  body: 'Hello! I can help you with that...'
});
```

This will:
- Update `last_agent_reply_at` timestamp
- Change status to "answered"
- Send notification email to user
- Show message in user's chat (real-time via Supabase subscriptions)

### Close Ticket

```sql
UPDATE support_requests
SET status = 'closed'
WHERE id = 'ticket-uuid';
```

## 🎨 Customization

### Add/Remove Help Options

Edit `src/components/chat/HelpMenu.tsx`:

```typescript
const HELP_OPTIONS: HelpOption[] = [
  {
    id: 'new-option',
    label: 'New Help Topic',
    icon: <Icon className="w-5 h-5" />,
    action: 'faq', // or 'track' or 'support'
  },
  // ... existing options
];

// Add FAQ content
export const FAQ_CONTENT: Record<string, string> = {
  'new-option': `Your answer here with **markdown** support.`,
};
```

### Change Timeout Threshold

In `src/components/chat/TicketConversation.tsx`:

```typescript
// Change from 24 hours to 12 hours
const timedOut = await checkRequestTimeout(ticketId, 12);
```

### Customize Email Templates

Edit `supabase/functions/send-support-email/index.ts`:

- Change colors in CSS
- Update text content
- Add company logo
- Modify subject lines

### Modify Tracking Platforms

Edit `src/components/chat/OrderTrackingFlow.tsx`:

```typescript
const TRACKING_PLATFORMS = [
  {
    id: 'new-platform',
    name: 'New Platform',
    color: 'bg-blue-500',
    trackingUrl: 'https://...',
    instructions: 'How to track on this platform',
  },
];
```

## 🧪 Testing

### Test Support Flow Locally

1. Start Supabase: `supabase start` (or Docker)
2. Start dev server: `npm run dev:all`
3. Open chat → "Contact support"
4. Fill form with test email
5. Check Supabase dashboard for new `support_requests` row

### Test Email Function Locally

```bash
supabase functions serve send-support-email --env-file .env.local
```

Then trigger via curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-support-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"type":"created","requestId":"uuid-here"}'
```

### Test Real-Time Updates

1. Open two browser windows
2. Window 1: User chat with ticket open
3. Window 2: Supabase dashboard
4. Insert agent message via dashboard
5. Message should appear instantly in Window 1

## 📊 Database Schema Reference

### support_requests

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User's email |
| message | text | Initial support request |
| status | enum | open, answered, closed, timeout |
| created_at | timestamptz | When ticket was created |
| updated_at | timestamptz | Last modification |
| last_agent_reply_at | timestamptz | When agent last responded |

### support_messages

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| request_id | uuid | Foreign key to support_requests |
| author_type | enum | user, agent, bot |
| body | text | Message content |
| created_at | timestamptz | When message was sent |

## 🔒 Security Considerations

### Row Level Security (RLS)

Current policies allow public read/insert. For production:

**Option 1: Email-based access** (no auth required)
```sql
-- Users can only see their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_requests FOR SELECT
  USING (email = current_setting('request.jwt.claims')::json->>'email');
```

**Option 2: Authenticated users only**
```sql
-- Require authentication
CREATE POLICY "Authenticated users only"
  ON support_requests FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Option 3: Session-based** (store ticket ID in local storage, no backend validation)

Current implementation uses Option 3 for simplicity.

### Input Validation

- Email regex validation in frontend
- SQL injection prevention via Supabase parameterized queries
- XSS protection via React's escaping (except intentional markdown)

## 🐛 Troubleshooting

### Emails Not Sending

**Check:**
1. `RESEND_API_KEY` is set in Supabase Edge Functions
2. Resend domain is verified
3. Check Edge Function logs: `supabase functions logs send-support-email`

**Test email manually:**
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@yourdomain.com","to":"test@example.com","subject":"Test","html":"Test"}'
```

### Real-Time Not Working

**Check:**
1. Supabase Realtime is enabled for `support_messages` table
2. Browser WebSocket connection is active
3. RLS policies allow reading messages

**Debug:**
```typescript
const subscription = supabase
  .channel('test')
  .on('postgres_changes', { ... }, (payload) => {
    console.log('Received:', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });
```

### Ticket Not Loading

**Check:**
1. UUID in URL is valid
2. Ticket exists in database: `SELECT * FROM support_requests WHERE id = 'uuid';`
3. Browser console for errors
4. Network tab shows successful API call

## 📈 Future Enhancements

- [ ] Admin dashboard for agents to manage tickets
- [ ] Agent assignment system (round-robin or manual)
- [ ] Ticket priority levels (low/normal/high/urgent)
- [ ] Satisfaction survey after ticket closure
- [ ] Attachment support (images, files)
- [ ] Chatbot AI integration for smarter FAQ answers
- [ ] Analytics: response time, resolution rate, common issues
- [ ] Multi-language support (FR/EN/NL)
- [ ] WhatsApp/SMS notifications option
- [ ] Canned responses for agents

## 📝 License

Part of Tasty Food website. All rights reserved.

---

**Need help?** Create a support ticket using the chatbot! 😄🍔
