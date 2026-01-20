import Anthropic from '@anthropic-ai/sdk';

export interface StreamOptions {
  bufferSize?: number;
  timeout?: number;
  encoding?: 'utf-8' | 'ascii';
}

export interface TokenChunk {
  token: string;
  type: 'text' | 'error' | 'done';
  timestamp: number;
  metadata?: Record<string, any>;
}

export class StreamManager {
  private bufferSize: number = 1024;
  private timeout: number = 60000;
  private encoding: 'utf-8' | 'ascii' = 'utf-8';
  private anthropic: Anthropic;

  constructor(options: StreamOptions = {}) {
    this.bufferSize = options.bufferSize || 1024;
    this.timeout = options.timeout || 60000;
    this.encoding = options.encoding || 'utf-8';
    
    this.anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
      dangerouslyAllowBrowser: true, // For Vite client-side
    });
  }

  /**
   * Stream LLM response token-by-token
   */
  async streamLLMResponse(
    prompt: string,
    systemPrompt?: string,
    onToken?: (chunk: TokenChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: (fullText: string) => void,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let fullText = '';
        let tokenCount = 0;
        let buffer = '';

        // Create streaming request
        const stream = await this.anthropic.messages.stream({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          temperature: 0.5,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        });

        // Process each text delta
        stream.on('text', (text: string) => {
          buffer += text;
          fullText += text;
          tokenCount++;

          // Emit token chunk
          onToken?.({
            token: text,
            type: 'text',
            timestamp: Date.now(),
            metadata: { tokenCount },
          });

          // Flush buffer if size exceeded
          if (buffer.length >= this.bufferSize) {
            buffer = '';
          }
        });

        // Handle stream completion
        stream.on('end', () => {
          // Emit remaining buffer
          if (buffer) {
            onToken?.({
              token: buffer,
              type: 'text',
              timestamp: Date.now(),
            });
          }

          // Emit done signal
          onToken?.({
            token: '',
            type: 'done',
            timestamp: Date.now(),
            metadata: { totalTokens: tokenCount, fullText },
          });

          onComplete?.(fullText);
          resolve(fullText);
        });

        // Handle stream errors
        stream.on('error', (error: Error) => {
          console.error('Stream error:', error);
          
          onToken?.({
            token: error.message,
            type: 'error',
            timestamp: Date.now(),
          });

          onError?.(error);
          reject(error);
        });

        // Timeout handling
        const timeoutId = setTimeout(() => {
          if (tokenCount === 0) {
            const timeoutError = new Error('Stream timeout: No tokens received');
            onError?.(timeoutError);
            reject(timeoutError);
          }
        }, this.timeout);

        // Clear timeout on completion
        stream.on('end', () => clearTimeout(timeoutId));
        stream.on('error', () => clearTimeout(timeoutId));

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
   * Format token for SSE transmission (for server-side use)
   */
  formatSSEEvent(chunk: TokenChunk): string {
    return `data: ${JSON.stringify(chunk)}\n\n`;
  }

  /**
   * Estimate tokens remaining
   */
  estimateTokensRemaining(currentTokens: number, targetLength: number = 300): number {
    return Math.max(0, targetLength - currentTokens);
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
  bufferSize: 512,
  timeout: 60000,
});
