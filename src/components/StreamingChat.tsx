import { useState, useRef, useEffect } from 'react';
import { streamManager } from '@/services/streaming/streamManager';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface StreamingChatProps {
  className?: string;
  placeholder?: string;
  systemPrompt?: string;
}

export function StreamingChat({ 
  className, 
  placeholder = "Posez votre question...",
  systemPrompt,
}: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [tokenSpeed, setTokenSpeed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamStartTime = useRef<number>(0);
  const tokenCount = useRef<number>(0);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  /**
   * Send message and stream response
   */
  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    // Add user message
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    tokenCount.current = 0;
    streamStartTime.current = Date.now();

    try {
      // Stream response
      const fullResponse = await streamManager.streamLLMResponse(
        input,
        systemPrompt,
        (chunk) => {
          if (chunk.type === 'text') {
            setStreamingText(prev => prev + chunk.token);
            tokenCount.current++;
            
            // Update speed every 5 tokens
            if (tokenCount.current % 5 === 0) {
              const speed = streamManager.calculateSpeed(
                tokenCount.current, 
                streamStartTime.current
              );
              setTokenSpeed(Math.round(speed));
            }
          } else if (chunk.type === 'error') {
            console.error('Stream error:', chunk.token);
            setStreamingText(prev => prev + `\n[Erreur: ${chunk.token}]`);
          }
        },
        (error) => {
          console.error('Streaming error:', error);
          setStreamingText(prev => prev || `Erreur: ${error.message}`);
        },
        (fullText) => {
          // Add complete assistant message
          setMessages(prev => [
            ...prev,
            { 
              role: 'assistant', 
              content: fullText,
              timestamp: new Date(),
            },
          ]);
          setStreamingText('');
          setIsStreaming(false);
          setTokenSpeed(0);
        },
      );
    } catch (error) {
      console.error('Streaming failed:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Désolé, une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          timestamp: new Date(),
        },
      ]);
      setStreamingText('');
      setIsStreaming(false);
      setTokenSpeed(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gold to-gold-light">
        <h3 className="text-lg font-bebas text-white">
          Chat Support • Réponses en temps réel
        </h3>
        {isStreaming && tokenSpeed > 0 && (
          <p className="text-xs text-white/80">
            Streaming • {tokenSpeed} tokens/s
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Posez votre question pour commencer</p>
            <p className="text-xs mt-2">Les réponses apparaîtront en temps réel ✨</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex",
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg shadow-sm",
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-gold to-gold-light text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white text-gray-800 border border-gray-200 shadow-sm">
              <p className="text-sm whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-2 h-4 bg-gold animate-pulse ml-1" />
              </p>
              <p className="text-xs text-gray-500 mt-1">En cours de frappe...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isStreaming}
            rows={1}
            className={cn(
              "flex-1 px-4 py-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "resize-none"
            )}
          />
          <button
            onClick={handleSendMessage}
            disabled={isStreaming || !input.trim()}
            className={cn(
              "px-6 py-2 bg-gradient-to-r from-gold to-gold-light text-white rounded-lg",
              "hover:shadow-lg transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Streaming...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Appuyez sur Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  );
}

/**
 * Performance comparison stats component
 */
export function StreamingStats({ 
  streamSpeed, 
  totalTokens 
}: { 
  streamSpeed: number; 
  totalTokens: number;
}) {
  const estimatedImprovement = 8; // 8x perceived speed improvement

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      <h4 className="font-semibold text-green-900 mb-2">⚡ Performance en temps réel</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Vitesse</p>
          <p className="text-lg font-bold text-green-700">{streamSpeed} tokens/s</p>
        </div>
        <div>
          <p className="text-gray-600">Ressenti utilisateur</p>
          <p className="text-lg font-bold text-green-700">{estimatedImprovement}x plus rapide</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-600">Total traité</p>
          <p className="text-lg font-bold text-green-700">{totalTokens} tokens</p>
        </div>
      </div>
    </div>
  );
}
