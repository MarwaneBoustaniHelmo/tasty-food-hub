import { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '@/hooks/useChatStore';
import { sendChatMessageStream } from '@/services/chatService';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, addMessage, updateLastMessage, setLoading, setError, setSummary } = useChatStore();

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || messages.length > 0 && messages[messages.length - 1].role === 'user' && useChatStore.getState().isLoading) {
      return;
    }

    // Add user message
    addMessage({ role: 'user', content: trimmedInput });
    setInput('');
    setError(null);
    setLoading(true);

    // Create empty assistant message
    addMessage({ role: 'assistant', content: '' });

    try {
      await sendChatMessageStream(
        [...messages, { id: '', role: 'user', content: trimmedInput, timestamp: Date.now() }],
        {
          onChunk: (text) => {
            updateLastMessage(text);
          },
          onSummary: (summary) => {
            setSummary(summary);
          },
          onDone: () => {
            setLoading(false);
          },
          onError: (error) => {
            setError(error);
            setLoading(false);
          },
        }
      );
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Écris ton message... (Enter pour envoyer, Shift+Enter pour une nouvelle ligne)"
          className="resize-none min-h-[44px] max-h-[120px] text-sm"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || useChatStore.getState().isLoading}
          size="icon"
          className="shrink-0 h-11 w-11"
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        💡 Astuce : Appuie sur <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Entrée</kbd> pour envoyer
      </p>
    </div>
  );
}
