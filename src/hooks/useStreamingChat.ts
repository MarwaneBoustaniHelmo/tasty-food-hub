import { useState, useCallback, useRef } from 'react';
import { streamManager } from '@/services/streaming/streamManager';
import type { TokenChunk } from '@/services/streaming/streamManager';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
  metadata?: Record<string, any>;
}

export interface UseStreamingChatOptions {
  systemPrompt?: string;
  onError?: (error: Error) => void;
  onStreamStart?: () => void;
  onStreamEnd?: (fullText: string) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [streamSpeed, setStreamSpeed] = useState(0);
  
  const streamStartTime = useRef<number>(0);
  const tokenCount = useRef<number>(0);
  const abortController = useRef<AbortController | null>(null);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Create abort controller for cancellation
    abortController.current = new AbortController();

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Reset streaming state
    setIsStreaming(true);
    setCurrentStream('');
    tokenCount.current = 0;
    streamStartTime.current = Date.now();
    setStreamSpeed(0);

    options.onStreamStart?.();

    try {
      const fullResponse = await streamManager.streamLLMResponse(
        content,
        options.systemPrompt,
        (chunk: TokenChunk) => {
          if (chunk.type === 'text') {
            setCurrentStream(prev => prev + chunk.token);
            tokenCount.current++;

            // Update speed every 10 tokens
            if (tokenCount.current % 10 === 0) {
              const speed = streamManager.calculateSpeed(
                tokenCount.current,
                streamStartTime.current
              );
              setStreamSpeed(Math.round(speed * 10) / 10); // Round to 1 decimal
            }
          } else if (chunk.type === 'error') {
            console.error('Stream error:', chunk.token);
            options.onError?.(new Error(chunk.token));
          }
        },
        (error) => {
          console.error('Streaming error:', error);
          options.onError?.(error);
        },
        (fullText) => {
          // Add complete assistant message
          const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: fullText,
            timestamp: new Date(),
            metadata: {
              tokenCount: tokenCount.current,
              streamDuration: Date.now() - streamStartTime.current,
              avgSpeed: streamSpeed,
            },
          };

          setMessages(prev => [...prev, assistantMessage]);
          setCurrentStream('');
          setIsStreaming(false);
          setStreamSpeed(0);

          options.onStreamEnd?.(fullText);
        },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('Streaming failed:', err);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Désolé, une erreur est survenue: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);

      setCurrentStream('');
      setIsStreaming(false);
      setStreamSpeed(0);

      options.onError?.(err);
    }
  }, [isStreaming, options]);

  /**
   * Cancel current streaming
   */
  const cancelStream = useCallback(() => {
    abortController.current?.abort();
    setIsStreaming(false);
    setCurrentStream('');
    setStreamSpeed(0);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentStream('');
  }, []);

  /**
   * Retry last message
   */
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove messages after last user message
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === lastUserMessage.id);
        return prev.slice(0, idx + 1);
      });

      // Resend
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isStreaming,
    currentStream,
    streamSpeed,
    sendMessage,
    cancelStream,
    clearMessages,
    retryLastMessage,
  };
}
