'use client';

import { useState, useRef, useCallback, useMemo, useTransition, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LocationData {
  name: string;
  address: string;
  mapsUrl: string;
  type: 'dine-in';
}

interface DeliveryData {
  name: string;
  platform: string;
  platformUrl: string;
  type: 'delivery';
}

const DINE_IN_LOCATIONS: LocationData[] = [
  {
    name: 'TASTY FOOD SERAING',
    address: '15 Rue Gustave Bailly, 4101 Seraing',
    mapsUrl: 'https://www.google.com/maps/search/15+Rue+Gustave+Bailly,+4101+Seraing',
    type: 'dine-in',
  },
  {
    name: 'TASTY FOOD ANGLEUR',
    address: '100 Rue Vaudrée, 4031 Angleur',
    mapsUrl: 'https://www.google.com/maps/search/100+Rue+Vaudrée,+4031+Angleur',
    type: 'dine-in',
  },
  {
    name: 'TASTY FOOD SAINT-GILLES',
    address: 'Rue Saint-Gilles 58, 4000 Liège',
    mapsUrl: 'https://www.google.com/maps/search/Rue+Saint-Gilles+58,+4000+Liège',
    type: 'dine-in',
  },
  {
    name: 'TASTY FOOD WANDRE',
    address: 'Rue du Pont de Wandre 75, 4020 Liège',
    mapsUrl: 'https://www.google.com/maps/search/Rue+du+Pont+de+Wandre+75,+4020+Liège',
    type: 'dine-in',
  },
];

const DELIVERY_LOCATIONS: DeliveryData[] = [
  {
    name: 'CROUSTY BY TASTY - SERAING',
    platform: 'Uber Eats',
    platformUrl: 'https://www.ubereats.com/stores/crousty-by-tasty-seraing',
    type: 'delivery',
  },
  {
    name: 'CROUSTY BY TASTY - ANGLEUR',
    platform: 'Uber Eats',
    platformUrl: 'https://www.ubereats.com/stores/crousty-by-tasty-angleur',
    type: 'delivery',
  },
  {
    name: 'CROUSTY BY TASTY - SAINT-GILLES',
    platform: 'Uber Eats',
    platformUrl: 'https://www.ubereats.com/stores/crousty-by-tasty-saint-gilles',
    type: 'delivery',
  },
  {
    name: 'CROUSTY BY TASTY - JEMEPPE',
    platform: 'Deliveroo',
    platformUrl: 'https://www.deliveroo.be/en/menu/liege/crousty-by-tasty-jemeppe',
    type: 'delivery',
  },
  {
    name: 'CROUSTY BY TASTY - ANGLEUR',
    platform: 'Takeaway.com',
    platformUrl: 'https://www.takeaway.com/en/order/crousty-by-tasty-angleur',
    type: 'delivery',
  },
];

function MessageItem({ message }: { message: Message }) {
  return (
    <div
      className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-lg rounded-lg p-4 ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <span className="text-xs opacity-70 mt-2 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messageList = useMemo(
    () => messages.map((m) => <MessageItem key={m.id} message={m} />),
    [messages],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsStreaming(true);

    startTransition(async () => {
      try {
        // Get API URL from environment or default to localhost
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        const response = await fetch(
          `${apiUrl}/api/chat/stream?message=${encodeURIComponent(userInput)}`,
          { method: 'GET', signal: AbortSignal.timeout(30000) },
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        let assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];
            if (!line.startsWith('data: ')) continue;

            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'token') {
                assistantContent += event.data.token;
                assistantMessage.content = assistantContent;

                setMessages((prev) => {
                  const updated = [...prev];
                  if (updated[updated.length - 1]?.role === 'assistant') {
                    updated[updated.length - 1] = assistantMessage;
                  } else {
                    updated.push(assistantMessage);
                  }
                  return updated;
                });
              } else if (event.type === 'error') {
                console.error('Stream error:', event.data.message);
              } else if (event.type === 'done') {
                setIsStreaming(false);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }

        scrollToBottom();
      } catch (err) {
        console.error('Fetch error:', err);
        setIsStreaming(false);
      }
    });
  }, [input, isStreaming, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, isStreaming],
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">🍽️ Tasty Food</h1>
          <p className="text-blue-100 text-xs">& 🍗 Crousty by Tasty</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-blue-500 p-2 rounded-full transition"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messageList.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="mb-4 text-2xl">👋</p>
            <p className="text-sm font-medium">Welcome to Tasty Food!</p>
            <p className="text-xs mt-2">
              Ask about dine-in reservations or delivery orders.
            </p>
          </div>
        )}
        {messageList}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 rounded-lg p-4 max-w-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4 rounded-b-lg">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about reservations or delivery..."
            disabled={isStreaming}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 disabled:opacity-50 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-100 border-t border-gray-200 p-3 max-h-24 overflow-y-auto rounded-b-lg">
        <p className="text-gray-600 text-xs mb-2 font-semibold">Quick Links:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {DINE_IN_LOCATIONS.slice(0, 2).map((loc) => (
            <a
              key={loc.name}
              href={loc.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate"
            >
              📍 {loc.name.split(' ').slice(2).join(' ')}
            </a>
          ))}
          {DELIVERY_LOCATIONS.slice(0, 2).map((loc) => (
            <a
              key={`${loc.name}-${loc.platform}`}
              href={loc.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline truncate"
            >
              🚚 {loc.platform}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
