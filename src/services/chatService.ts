import type { ChatMessage, RequestSummary } from '@/types/chat';

const API_BASE = '/api';

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onSummary: (summary: RequestSummary) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Send chat message with streaming response
 */
export async function sendChatMessageStream(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response stream');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'chunk') {
            callbacks.onChunk(data.content);
          } else if (data.type === 'summary') {
            callbacks.onSummary(JSON.parse(data.content));
          } else if (data.type === 'done') {
            callbacks.onDone();
          } else if (data.type === 'error') {
            callbacks.onError(data.message);
          }
        }
      }
    }
  } catch (error: any) {
    callbacks.onError(error.message || 'Network error');
  }
}

/**
 * Send chat message (non-streaming fallback)
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<{ message: string; summary?: RequestSummary }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}
