/**
 * LLM-Assisted Response Generation
 * When templates don't fit, use an LLM with constrained generation
 */

import type { ConversationContext } from './contextManager';
import type { IntentResult } from '../nlp/intentClassifier';
import { ContextWindowManager } from './contextManager';

interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LLMCall {
  model: string;
  messages: LLMMessage[];
  system: string;
  max_tokens: number;
  temperature: number;
  top_p: number;
  stop_sequences?: string[];
}

interface LLMResponse {
  response: string;
  confidence: number;
  sources: string[];
}

/**
 * Generate response using LLM when templates don't cover the intent
 */
export async function generateLLMResponse(
  userMessage: string,
  intent: IntentResult,
  context: ConversationContext,
  systemPrompt: string,
): Promise<LLMResponse> {
  // Build context payload
  const contextManager = new ContextWindowManager();
  const llmContext = contextManager.buildLLMContext(context);
  
  // Prepare messages for Claude/GPT
  const messages: LLMMessage[] = [];
  
  // Add conversation history (sparse to save tokens)
  const recentTurns = context.turns.slice(-8);
  for (const turn of recentTurns) {
    messages.push({
      role: turn.role,
      content: turn.content,
    });
  }
  
  // Add metadata as context
  const metadataMessage = `[Session Context]\n${llmContext.metadata}\n\n${userMessage}`;
  messages.push({
    role: 'user',
    content: metadataMessage,
  });
  
  // Call LLM with constraints
  const response = await callLLM({
    model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5
    messages,
    system: systemPrompt,
    max_tokens: 300, // Keep responses short
    temperature: 0.5, // Reduced hallucination risk
    top_p: 0.9,
    stop_sequences: ['User:', 'Customer:', '---', '\n\n\n'], // Prevent model from continuing
  });
  
  // Post-process response for safety
  let text = response.content;
  
  // Remove any "as an AI" disclaimers
  text = text.replace(/As an AI[^.]*\./gi, '');
  text = text.replace(/I'm an AI[^.]*\./gi, '');
  text = text.replace(/I am an artificial intelligence[^.]*\./gi, '');
  
  // Remove overly formal greetings if mid-conversation
  if (context.turns.length > 2) {
    text = text.replace(/^(Hello|Hi|Bonjour|Salut)[,!]?\s*/i, '');
  }
  
  // Truncate if too long
  if (text.length > 500) {
    text = text.substring(0, 480) + '...';
  }
  
  // Extract sources mentioned (e.g., [source:menu] or [source:faq])
  const sourceMatch = text.match(/\[source:([^\]]+)\]/g) || [];
  const sources = sourceMatch.map(m => m.replace(/[\[\]]/g, '').replace('source:', ''));
  
  // Remove source tags from final text
  text = text.replace(/\[source:[^\]]+\]/g, '');
  
  return {
    response: text.trim(),
    confidence: response.confidence_score || 0.80,
    sources,
  };
}

/**
 * Call LLM provider (Anthropic Claude, OpenAI GPT, etc.)
 * This is a placeholder; integrate with your actual LLM provider.
 */
async function callLLM(payload: LLMCall): Promise<any> {
  // OPTION 1: Anthropic Claude (recommended for large context)
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    return callAnthropic(payload);
  }
  
  // OPTION 2: OpenAI GPT-4 Turbo
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    return callOpenAI(payload);
  }
  
  // OPTION 3: Fallback to mock response (for development)
  console.warn('[LLM] No API key configured. Using mock response.');
  return {
    content: 'Je peux vous aider avec votre question. Pouvez-vous me donner plus de détails?',
    confidence_score: 0.5,
  };
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(payload: LLMCall): Promise<any> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: payload.model,
        max_tokens: payload.max_tokens,
        system: payload.system,
        messages: payload.messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        temperature: payload.temperature,
        top_p: payload.top_p,
        stop_sequences: payload.stop_sequences,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract text content
    const content = data.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');
    
    return {
      content,
      confidence_score: 0.85, // Claude responses are generally high quality
    };
  } catch (error) {
    console.error('[Anthropic] API call failed:', error);
    throw error;
  }
}

/**
 * Call OpenAI GPT API
 */
async function callOpenAI(payload: LLMCall): Promise<any> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: payload.model === 'claude-3-5-sonnet-20241022' ? 'gpt-4-turbo-preview' : payload.model,
        messages: [
          { role: 'system', content: payload.system },
          ...payload.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: payload.max_tokens,
        temperature: payload.temperature,
        top_p: payload.top_p,
        stop: payload.stop_sequences,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      confidence_score: 0.80,
    };
  } catch (error) {
    console.error('[OpenAI] API call failed:', error);
    throw error;
  }
}

/**
 * Validate LLM response for safety and quality
 */
export function validateLLMResponse(response: LLMResponse): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for empty response
  if (!response.response || response.response.trim().length === 0) {
    issues.push('Empty response');
  }
  
  // Check for too short response (likely incomplete)
  if (response.response.length < 10) {
    issues.push('Response too short');
  }
  
  // Check for hallucination indicators
  const hallucinationPatterns = [
    /\[PLACEHOLDER\]/i,
    /\[INSERT.*\]/i,
    /\[TODO\]/i,
    /lorem ipsum/i,
  ];
  
  for (const pattern of hallucinationPatterns) {
    if (pattern.test(response.response)) {
      issues.push(`Hallucination detected: ${pattern.source}`);
    }
  }
  
  // Check confidence threshold
  if (response.confidence < 0.4) {
    issues.push('Low confidence score');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Fallback response when LLM fails or validation fails
 */
export function getFallbackResponse(intent: IntentResult): string {
  if (intent.sentiment.hasComplaint) {
    return `Je comprends votre préoccupation. Pour vous aider au mieux, je vais vous mettre en contact avec notre équipe de support. Un agent vous répondra rapidement. Pouvez-vous me donner votre email?`;
  }
  
  if (intent.escalationFlag) {
    return `Je vois que votre demande nécessite une attention particulière. Laissez-moi vous connecter avec notre équipe de support. Quel est le meilleur moyen de vous contacter?`;
  }
  
  return `Je ne suis pas sûr d'avoir bien compris votre question. Pourriez-vous reformuler ou me dire si vous souhaitez:
• Commander un repas
• Suivre votre commande
• Signaler un problème
• Parler à un agent`;
}

/**
 * Rate limit LLM calls to avoid excessive costs
 */
class LLMRateLimiter {
  private callCount = 0;
  private resetTime = Date.now() + 60 * 60 * 1000; // 1 hour window
  private maxCallsPerHour = 100;
  
  canMakeCall(): boolean {
    // Reset counter if window expired
    if (Date.now() > this.resetTime) {
      this.callCount = 0;
      this.resetTime = Date.now() + 60 * 60 * 1000;
    }
    
    return this.callCount < this.maxCallsPerHour;
  }
  
  recordCall(): void {
    this.callCount++;
  }
  
  getRemainingCalls(): number {
    return Math.max(0, this.maxCallsPerHour - this.callCount);
  }
}

export const rateLimiter = new LLMRateLimiter();
