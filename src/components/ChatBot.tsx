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
    } 
    else if (step === 'craving') {
      if (selectedLoc) {
        const locData = LOCATIONS[selectedLoc];
        handleBotResponse(
          `Excellent choix ! 🤤 Voici toutes les options disponibles pour commander à ${locData.name} :`, 
          'end',
          locData.platforms // On passe la liste des plateformes ici
        );
      }
    }
  };

  const resetChat = () => {
    setMessages([]);
    setStep('init');
    handleBotResponse("On repart à zéro ! 🔄 Dans quelle ville êtes-vous ?", 'location');
  };

  return (
    <>
      {/* BOUTON FLOTTANT */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center
          ${isOpen ? 'bg-black text-white rotate-90' : 'bg-yellow-500 text-black rotate-0 hover:bg-yellow-400'}
        `}
        aria-label="Ouvrir le chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} strokeWidth={2.5} />}
        {!isOpen && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
        )}
      </button>

      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[90vw] md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-black p-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-black">🍔</div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">Tasty Bot</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-400 text-xs font-medium">Assistant Commande</span>
                </div>
              </div>
            </div>
            <button onClick={resetChat} className="text-gray-500 hover:text-white transition-colors" title="Recommencer">
              <RefreshCcw size={16} />
            </button>
          </div>

          {/* Zone de Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 min-h-[300px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  
                  {/* --- AFFICHAGE MULTI-PLATEFORMES --- */}
                  {msg.showPlatforms && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.showPlatforms.map((platform, idx) => (
                        <a 
                          key={idx}
                          href={platform.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`${platform.color} hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm flex items-center justify-between text-xs`}
                        >
                          <span className="flex items-center gap-2">
                            <ShoppingBag size={14} />
                            {platform.name}
                          </span>
                          <ExternalLink size={14}/>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center h-10">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone d'Actions (Chips) */}
          <div className="p-3 bg-white border-t border-gray-100">
            {step === 'location' && !isTyping && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LOCATIONS).map(([key, data]) => (
                  <button 
                    key={key}
                    onClick={() => handleUserChoice(data.name, key)}
                    className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-yellow-400 hover:text-black hover:border-yellow-500 text-gray-700 text-xs font-semibold py-3 px-2 rounded-xl border border-gray-200 transition-all duration-200"
                  >
                    <MapPin size={14} /> {data.name}
                  </button>
                ))}
              </div>
            )}

            {step === 'craving' && !isTyping && (
              <div className="flex flex-wrap gap-2 justify-center">
                {['Un Smash Burger 🍔', 'Des Tacos 🌮', 'Le Crousty 🍗', 'Juste des frites 🍟'].map((item) => (
                  <button 
                    key={item}
                    onClick={() => handleUserChoice(item)}
                    className="bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-medium py-2 px-4 rounded-full border border-gray-200 transition-all duration-200"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {step === 'end' && (
              <p className="text-center text-xs text-gray-400 italic">
                Choisissez votre plateforme préférée ci-dessus
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;