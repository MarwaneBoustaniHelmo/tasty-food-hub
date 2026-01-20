/**
 * Stream Manager - Client-side SSE consumer
 * Connects to Express backend streaming endpoint
 */

export interface StreamOptions {
  apiUrl?: string;
  timeout?: number;
}

export interface TokenChunk {
  token: string;
  type: 'text' | 'error' | 'done';
  timestamp: number;
  metadata?: Record<string, any>;
}

export class StreamManager {
  private apiUrl: string;
  private timeout: number;

  constructor(options: StreamOptions = {}) {
    this.apiUrl = options.apiUrl || 'http://localhost:3001/api/chat/stream';
    this.timeout = options.timeout || 60000;
  }

  /**
   * Stream LLM response via SSE from backend
   */
  async streamLLMResponse(
    prompt: string,
    systemPrompt?: string,
    onToken?: (chunk: TokenChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: (fullText: string) => void,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let fullText = '';
      let streamingText = '';

      try {
        // Build URL with query parameters
        const url = new URL(this.apiUrl);
        url.searchParams.set('message', prompt);
        if (systemPrompt) {
          url.searchParams.set('system', systemPrompt);
        }

        // Fetch streaming endpoint (GET with query params)
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'Accept': 'text/event-stream' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Parse streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Timeout handling
        const timeoutId = setTimeout(() => {
          reader.cancel();
          const timeoutError = new Error('Stream timeout');
          onError?.(timeoutError);
          reject(timeoutError);
        }, this.timeout);

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            clearTimeout(timeoutId);
            break;
          }

          // Decode chunk
          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split('\n');
          buffer = lines[lines.length - 1]; // Keep incomplete line

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];

            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6));

                if (event.type === 'token') {
                  const token = event.data.token;
                  streamingText += token;
                  fullText += token;
                  
                  const chunk: TokenChunk = {
                    token,
                    type: 'text',
                    timestamp: event.timestamp,
                    metadata: event.data,
                  };
                  onToken?.(chunk);
                } else if (event.type === 'error') {
                  console.error('Stream error:', event.data.message);
                  const chunk: TokenChunk = {
                    token: event.data.message,
                    type: 'error',
                    timestamp: event.timestamp,
                  };
                  onToken?.(chunk);
                  const error = new Error(event.data.message);
                  onError?.(error);
                  reject(error);
                  return;
                } else if (event.type === 'done') {
                  clearTimeout(timeoutId);
                  const chunk: TokenChunk = {
                    token: '',
                    type: 'done',
                    timestamp: event.timestamp,
                    metadata: event.data,
                  };
                  onToken?.(chunk);
                  onComplete?.(fullText);
                  resolve(fullText);
                  return;
                }
              } catch (error) {
                console.error('Failed to parse SSE data:', error);
              }
            }
          }
        }

        // If we exit loop without 'done' event
        onComplete?.(fullText);
        resolve(fullText);

      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        reject(err);
      }
    });
  }

  /**
   * Stream with RAG context
   */
  async streamWithRAG(
    userQuery: string,
    ragContext: string,
    language: 'fr' | 'en' | 'nl' = 'fr',
    onToken?: (chunk: TokenChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: (fullText: string) => void,
  ): Promise<string> {
    const systemPrompt = `You are Tasty Food support assistant. Answer using the provided context.

Language: ${language}

Context:
${ragContext}`;

    return this.streamLLMResponse(
      userQuery,
      systemPrompt,
      onToken,
      onError,
      onComplete,
    );
  }

  /**
   * Calculate streaming speed (tokens per second)
   */
  calculateSpeed(tokenCount: number, startTime: number): number {
    const elapsed = (Date.now() - startTime) / 1000;
    return elapsed > 0 ? tokenCount / elapsed : 0;
  }
}

export const streamManager = new StreamManager({
  apiUrl: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api/chat/stream`
    : 'http://localhost:3001/api/chat/stream',
  timeout: 60000,
});
