import { supabase } from '@/lib/supabase';

export interface SupportRequest {
  id: string;
  email: string;
  message: string;
  status: 'open' | 'answered' | 'closed' | 'timeout';
  created_at: string;
  updated_at: string;
  last_agent_reply_at: string | null;
}

export interface SupportMessage {
  id: string;
  request_id: string;
  author_type: 'user' | 'agent' | 'bot';
  body: string;
  created_at: string;
}

/**
 * Create a new support request
 */
export async function createSupportRequest(email: string, message: string): Promise<SupportRequest> {
  const { data, error } = await supabase
    .from('support_requests')
    .insert([{ email, message, status: 'open' }])
    .select()
    .single();

  if (error) throw error;

  // Trigger email notification via Edge Function
  try {
    const { data: functionData, error: functionError } = await supabase.functions.invoke('send-support-email', {
      body: { type: 'created', requestId: data.id },
    });

    if (functionError) {
      console.error('Failed to send email notification:', functionError);
    }
  } catch (emailError) {
    console.error('Email notification error:', emailError);
    // Don't throw - ticket was created successfully
  }

  return data;
}

/**
 * Get a support request by ID
 */
export async function getSupportRequest(requestId: string): Promise<SupportRequest | null> {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) {
    console.error('Error fetching support request:', error);
    return null;
  }

  return data;
}

/**
 * Get all messages for a support request
 */
export async function getSupportMessages(requestId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

/**
 * Add a message to a support request
 */
export async function addSupportMessage(
  requestId: string,
  body: string,
  authorType: 'user' | 'agent' | 'bot'
): Promise<SupportMessage> {
  const { data, error } = await supabase
    .from('support_messages')
    .insert([{ request_id: requestId, body, author_type: authorType }])
    .select()
    .single();

  if (error) throw error;

  // If agent replied, update last_agent_reply_at and status
  if (authorType === 'agent') {
    await supabase
      .from('support_requests')
      .update({ 
        last_agent_reply_at: new Date().toISOString(),
        status: 'answered'
      })
      .eq('id', requestId);

    // Send notification email
    try {
      await supabase.functions.invoke('send-support-email', {
        body: { type: 'agent_reply', requestId },
      });
    } catch (emailError) {
      console.error('Failed to send agent reply notification:', emailError);
    }
  }

  return data;
}

/**
 * Check if a support request has timed out (no agent reply after X hours)
 */
export async function checkRequestTimeout(requestId: string, hoursThreshold: number = 24): Promise<boolean> {
  const request = await getSupportRequest(requestId);
  
  if (!request) return false;
  if (request.last_agent_reply_at) return false; // Already got a reply
  if (request.status === 'closed' || request.status === 'timeout') return false;

  const createdAt = new Date(request.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceCreation > hoursThreshold;
}

/**
 * Mark a request as timed out and create a new one
 */
export async function escalateTimedOutRequest(
  oldRequestId: string,
  email: string,
  message: string
): Promise<SupportRequest> {
  // Mark old request as timeout
  await supabase
    .from('support_requests')
    .update({ status: 'timeout' })
    .eq('id', oldRequestId);

  // Create new request with escalation note
  const escalationMessage = `[ESCALATION] Pas de réponse au ticket précédent (ID: ${oldRequestId})\n\n${message}`;
  return createSupportRequest(email, escalationMessage);
}

/**
 * Update support request status
 */
export async function updateSupportRequestStatus(
  requestId: string,
  status: 'open' | 'answered' | 'closed' | 'timeout'
): Promise<void> {
  const { error } = await supabase
    .from('support_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) throw error;
}

/**
 * Subscribe to new messages in a support request (real-time)
 */
export function subscribeToMessages(
  requestId: string,
  callback: (message: SupportMessage) => void
) {
  return supabase
    .channel(`support-messages-${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `request_id=eq.${requestId}`,
      },
      (payload) => {
        callback(payload.new as SupportMessage);
      }
    )
    .subscribe();
}
