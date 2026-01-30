export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface RequestSummary {
  intent: string;
  restaurant: string | null;
  delivery_platform: string | null;
  language: string;
  urgency: 'normal' | 'high';
  needs_followup_by_staff: boolean;
  action_button: {
    text: string;
    url: string;
    type: 'order' | 'directions' | 'menu' | 'call';
  } | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  currentSummary: RequestSummary | null;
}
