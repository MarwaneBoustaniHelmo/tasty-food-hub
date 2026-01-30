import { create } from 'zustand';
import type { ChatMessage, ChatState, RequestSummary } from '@/types/chat';

interface ChatActions {
  setOpen: (open: boolean) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSummary: (summary: RequestSummary | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,
  currentSummary: null,

  setOpen: (open) => set({ isOpen: open }),
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      },
    ],
  })),

  updateLastMessage: (content) => set((state) => {
    const messages = [...state.messages];
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      messages[messages.length - 1].content += content;
    }
    return { messages };
  }),

  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSummary: (summary) => set({ currentSummary: summary }),

  clearMessages: () => set({ messages: [], currentSummary: null, error: null }),
}));
