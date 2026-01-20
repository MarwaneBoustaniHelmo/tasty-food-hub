import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatBot from './ChatBot';
import { cn } from '@/lib/utils';

/**
 * Floating ChatBot Button
 * Displays a fixed bottom-right button that opens the chatbot modal
 */
const ChatBotFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay mount animation
    const timer = setTimeout(() => setIsMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14 md:w-16 md:h-16',
          'bg-red-cta hover:bg-red-cta/90',
          'text-white rounded-full shadow-2xl',
          'flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'hover:scale-110 active:scale-95',
          'focus:outline-none focus:ring-4 focus:ring-red-cta/30',
          'group',
          isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        )}
        aria-label={isOpen ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:rotate-90" />
        ) : (
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-110" />
        )}
        
        {/* Notification badge (optional - can show unread count) */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-background text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Chat Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat Modal */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50',
          'w-[calc(100vw-3rem)] max-w-md',
          'h-[70vh] max-h-[600px]',
          'bg-background border-2 border-red-cta/30',
          'rounded-2xl shadow-2xl',
          'transition-all duration-300 ease-out',
          'overflow-hidden',
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* ChatBot Component */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-cta to-red-cta/80 px-5 py-4 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Assistant Tasty Food</h3>
                <p className="text-xs text-white/80">En ligne • Réponse instantanée</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            <ChatBot />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBotFloatingButton;
