/**
 * Type definitions for chatbot API
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
  stream?: boolean;
}

export interface RequestSummary {
  intent: 'menu_info' | 'order_help' | 'restaurant_info' | 'complaint' | 'compliment' | 'reservation' | 'game_info' | 'other';
  restaurant: 'seraing' | 'angleur' | 'saint-gilles' | 'wandre' | null;
  delivery_platform: 'uber_eats' | 'deliveroo' | 'takeaway' | null;
  language: 'fr' | 'en';
  urgency: 'normal' | 'high';
  needs_followup_by_staff: boolean;
  action_button: {
    text: string;
    url: string;
    type: 'order' | 'directions' | 'menu' | 'call';
  } | null;
}

export interface ChatResponse {
  message: string;
  summary?: RequestSummary;
  error?: string;
}
