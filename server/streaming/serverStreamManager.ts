import Anthropic from '@anthropic-ai/sdk';
import { Request, Response } from 'express';

export interface TokenChunk {
  token: string;
  type: 'text' | 'error' | 'done';
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Server-side Stream Manager for Express
 * Handles Claude API streaming and SSE transmission
 */
export class ServerStreamManager {
  private anthropic: Anthropic;
  private bufferSize: number = 1024;
  private timeout: number = 60000;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  /**
   * Stream LLM response and send via SSE
   */
  async streamToSSE(
    res: Response,
    prompt: string,
    systemPrompt?: string,
  ): Promise<void> {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let tokenCount = 0;
    let buffer = '';

    try {
      // Create streaming request to Claude
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
        tokenCount++;

        // Emit token chunk
        const chunk: TokenChunk = {
          token: text,
          type: 'text',
          timestamp: Date.now(),
          metadata: { tokenCount },
        };

        this.sendSSE(res, chunk);

        // Flush buffer if size exceeded
        if (buffer.length >= this.bufferSize) {
          buffer = '';
        }
      });

      // Handle stream completion
      stream.on('end', () => {
        // Send remaining buffer if any
        if (buffer) {
          const chunk: TokenChunk = {
            token: buffer,
            type: 'text',
            timestamp: Date.now(),
          };
          this.sendSSE(res, chunk);
        }

        // Send done signal
        const doneChunk: TokenChunk = {
          token: '',
          type: 'done',
          timestamp: Date.now(),
          metadata: { totalTokens: tokenCount },
        };
        this.sendSSE(res, doneChunk);

        res.end();
      });

      // Handle stream errors
      stream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        
        const errorChunk: TokenChunk = {
          token: error.message,
          type: 'error',
          timestamp: Date.now(),
        };
        this.sendSSE(res, errorChunk);
        res.end();
      });

      // Timeout handling
      const timeoutId = setTimeout(() => {
        if (tokenCount === 0) {
          const timeoutChunk: TokenChunk = {
            token: 'Stream timeout: No tokens received',
            type: 'error',
            timestamp: Date.now(),
          };
          this.sendSSE(res, timeoutChunk);
          res.end();
        }
      }, this.timeout);

      // Clear timeout on completion/error
      stream.on('end', () => clearTimeout(timeoutId));
      stream.on('error', () => clearTimeout(timeoutId));

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Streaming error:', err);
      
      const errorChunk: TokenChunk = {
        token: err.message,
        type: 'error',
        timestamp: Date.now(),
      };
      this.sendSSE(res, errorChunk);
      res.end();
    }
  }

  /**
   * Send SSE formatted event
   */
  private sendSSE(res: Response, chunk: TokenChunk): void {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  /**
   * Handle backpressure
   */
  private async handleBackpressure(res: Response): Promise<void> {
    return new Promise((resolve) => {
      if (!res.write('')) {
        res.once('drain', resolve);
      } else {
        resolve();
      }
    });
  }
}

export const serverStreamManager = new ServerStreamManager();
