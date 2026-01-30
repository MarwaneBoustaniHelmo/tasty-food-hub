import { useChatStore } from '@/hooks/useChatStore';
import { MessageCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatContextBar } from '@/components/chat/ChatContextBar';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWidget() {
  const { isOpen, setOpen, clearMessages, messages } = useChatStore();

  return (
    <>
      {/* Floating launcher button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-2 border-white"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="sr-only">Ouvrir le chat</span>
            </Button>

            {/* Notification badge (example) */}
            {/* <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              1
            </span> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 flex flex-col bg-background border border-border shadow-2xl
                         inset-x-4 bottom-4 top-4 rounded-2xl
                         md:right-6 md:bottom-6 md:left-auto md:top-auto md:w-[400px] md:h-[600px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">Crousty by Tasty</h2>
                    <p className="text-xs text-white/80">Ton assistant personnel 🍔</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearMessages}
                      className="h-8 w-8 text-white hover:bg-white/20"
                      title="Effacer la conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="h-8 w-8 text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Context bar (conditional) */}
              <ChatContextBar />

              {/* Messages */}
              <ChatMessageList />

              {/* Input */}
              <ChatInput />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
