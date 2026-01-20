import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { HelpMenu, FAQ_CONTENT, type HelpOption } from './chat/HelpMenu';
import { SupportRequestForm } from './chat/SupportRequestForm';
import { OrderTrackingFlow } from './chat/OrderTrackingFlow';
import { TicketConversation } from './chat/TicketConversation';

type ChatMode = 'welcome' | 'help' | 'faq' | 'track' | 'support' | 'ticket' | 'ordering';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  markdown?: boolean;
}

export const EnhancedChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Check for ticket parameter in URL
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const ticket = params.get('ticket');
      
      if (ticket) {
        setTicketId(ticket);
        setMode('ticket');
      } else if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  }, [isOpen]);

  const showWelcomeMessage = () => {
    addBotMessage(
      "👋 Salut ! Bienvenue chez **Tasty Food**.\n\nComment puis-je vous aider aujourd'hui ?",
      true
    );
    setMode('welcome');
  };

  const addBotMessage = (text: string, markdown = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text, sender: 'bot', markdown },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, sender: 'user' }]);
  };

  const handleWelcomeResponse = (needsHelp: boolean) => {
    addUserMessage(needsHelp ? 'Oui, j\'ai besoin d\'aide' : 'Non, je veux commander');
    
    if (needsHelp) {
      setTimeout(() => {
        addBotMessage('Parfait ! Je suis là pour vous aider. 😊');
        setMode('help');
      }, 700);
    } else {
      setTimeout(() => {
        addBotMessage('Super ! Pour commander, utilisez l\'une de nos plateformes de livraison. Je peux aussi vous guider si vous avez des questions !');
        // Could integrate the existing ordering flow here
      }, 700);
    }
  };

  const handleHelpOption = (option: HelpOption) => {
    addUserMessage(option.label);

    if (option.action === 'faq') {
      const answer = FAQ_CONTENT[option.id];
      setTimeout(() => {
        addBotMessage(answer, true);
        setTimeout(() => {
          addBotMessage('Autre chose ? 🤔');
          setMode('help');
        }, 1000);
      }, 700);
      setMode('faq');
    } else if (option.action === 'track') {
      setTimeout(() => {
        addBotMessage('Je vais vous aider à suivre votre commande ! 📦');
        setMode('track');
      }, 700);
    } else if (option.action === 'support') {
      setTimeout(() => {
        addBotMessage('Je vais créer un ticket pour vous. Un agent vous répondra rapidement ! 🎫');
        setMode('support');
      }, 700);
    }
  };

  const handleSupportSuccess = (requestId: string) => {
    addBotMessage(
      '✅ **Votre ticket a été créé !**\n\nVous allez recevoir un email de confirmation avec un lien pour suivre votre conversation.\n\nConsultez votre boîte mail ! 📧',
      true
    );
    
    setTimeout(() => {
      addBotMessage('Autre chose ? 🤔');
      setMode('help');
    }, 2000);
  };

  const handleBackToHelp = () => {
    addBotMessage('D\'accord ! Comment puis-je encore vous aider ?');
    setMode('help');
  };

  const handleCloseTicket = () => {
    setTicketId(null);
    setMessages([]);
    setMode('welcome');
    
    // Remove ticket param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('ticket');
    window.history.replaceState({}, '', url);
    
    showWelcomeMessage();
  };

  const resetChat = () => {
    setMessages([]);
    setMode('welcome');
    setTicketId(null);
    showWelcomeMessage();
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    return text
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.startsWith('• ')) {
          return `<li class="ml-4">${line.substring(2)}</li>`;
        }
        return line;
      })
      .join('<br />');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${
          isOpen
            ? 'bg-black text-white rotate-90'
            : 'bg-yellow-500 text-black rotate-0 hover:bg-yellow-400'
        }`}
        aria-label="Chat d'aide"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} strokeWidth={2.5} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[90vw] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[600px] animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-xl shadow-inner">
                🍔
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Tasty Food Help</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-300 text-xs">En ligne</span>
                </div>
              </div>
            </div>
            {mode !== 'ticket' && (
              <button
                onClick={resetChat}
                className="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Ticket Conversation Mode */}
          {mode === 'ticket' && ticketId && (
            <TicketConversation ticketId={ticketId} onClose={handleCloseTicket} />
          )}

          {/* Regular Chat Mode */}
          {mode !== 'ticket' && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 min-h-[300px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-black text-white rounded-br-none'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.markdown ? (
                        <div
                          className="leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                        />
                      ) : (
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                      <div
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                {mode === 'welcome' && !isTyping && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWelcomeResponse(true)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Oui, besoin d'aide
                    </button>
                    <button
                      onClick={() => handleWelcomeResponse(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Non, commander
                    </button>
                  </div>
                )}

                {mode === 'help' && !isTyping && (
                  <HelpMenu onOptionSelect={handleHelpOption} />
                )}

                {mode === 'track' && <OrderTrackingFlow onBack={handleBackToHelp} />}

                {mode === 'support' && (
                  <SupportRequestForm
                    onSuccess={handleSupportSuccess}
                    onCancel={handleBackToHelp}
                  />
                )}

                {mode === 'faq' && !isTyping && (
                  <button
                    onClick={handleBackToHelp}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    ← Menu d'aide
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
