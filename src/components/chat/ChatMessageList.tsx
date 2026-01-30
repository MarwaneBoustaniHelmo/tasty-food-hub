import { useEffect, useRef } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bot, User } from 'lucide-react';

export function ChatMessageList() {
  const { messages, isLoading, error } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Salut ! Je suis Crousty 👋
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ton assistant virtuel Tasty Food ! Je peux t'aider à commander, trouver un restaurant, répondre à tes questions sur le menu... Pose-moi n'importe quoi ! 🍔
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Avatar */}
          <div
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>

          {/* Message bubble */}
          <div
            className={`flex-1 max-w-[85%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`rounded-2xl px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1 px-1">
              {format(message.timestamp, 'HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 px-1">
              Crousty est en train d'écrire...
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
          ❌ {error}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
