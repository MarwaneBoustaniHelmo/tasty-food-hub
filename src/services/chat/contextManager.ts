/**
 * Context Window Management (Claude-inspired)
 * Intelligent context windowing to keep conversations coherent across many turns
 */

import type { IntentResult, IntentType } from '../nlp/intentClassifier';

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  turns: Turn[];
  metadata: {
    startedAt: Date;
    lastActivityAt: Date;
    language: 'en' | 'fr' | 'nl';
    currentBranch?: string;
    currentPlatform?: 'ubereats' | 'deliveroo' | 'takeaway' | 'website';
    tickets: string[]; // IDs of related support tickets
    resolvedIntents: Set<IntentType>;
    failedIntents: Map<IntentType, number>; // intent → retry count
  };
  summary?: ConversationSummary; // generated periodically
}

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: IntentResult;
  actions?: Action[];
  tokens: number;
  metadata?: Record<string, any>;
}

export interface ConversationSummary {
  topic: string;
  keyPoints: string[];
  unresolved: string[];
  nextSteps: string[];
  generatedAt: Date;
}

export interface Action {
  type: string;
  label: string;
  payload: Record<string, any>;
}

interface LLMContextPayload {
  conversationHistory: string;
  metadata: string;
  tokenBudgetRemaining: number;
  state: 'healthy' | 'warning' | 'critical';
}

/**
 * Manages context window similar to Claude 200K model.
 * Strategy:
 * 1. Keep full conversation until context budget ~60% used
 * 2. Summarize older turns once budget exceeds 70%
 * 3. Always preserve most recent 5 turns and any urgent context
 * 4. Drop non-essential turns first
 */
export class ContextWindowManager {
  private maxTokens = 4000; // Budget for conversation context (not including system prompt)
  private summaryThreshold = 0.7; // When to trigger summarization
  private minKeptTurns = 5;
  
  /**
   * Calculate if we need to prune or summarize context
   */
  calculateContextState(context: ConversationContext): 'healthy' | 'warning' | 'critical' {
    const totalTokens = context.turns.reduce((sum, turn) => sum + turn.tokens, 0);
    const ratio = totalTokens / this.maxTokens;
    
    if (ratio > 0.85) return 'critical';
    if (ratio > this.summaryThreshold) return 'warning';
    return 'healthy';
  }
  
  /**
   * Prepare context for LLM input
   */
  buildLLMContext(context: ConversationContext): LLMContextPayload {
    const state = this.calculateContextState(context);
    let turns = [...context.turns];
    
    // Decide on pruning strategy
    if (state === 'critical') {
      turns = this.pruneTurns(turns, context);
    } else if (state === 'warning') {
      const summary = this.generateSummary(turns);
      // Replace old turns with a summary message
      const summaryTurn: Turn = {
        role: 'assistant',
        content: `[Conversation summary: ${summary.topic}. Key points: ${summary.keyPoints.join(', ')}. Unresolved: ${summary.unresolved.join(', ')}]`,
        timestamp: new Date(),
        tokens: this.estimateTokens(`[Conversation summary: ${summary.topic}. Key points: ${summary.keyPoints.join(', ')}]`),
        metadata: { isSummary: true },
      };
      turns = [summaryTurn, ...turns.slice(-this.minKeptTurns)];
    }
    
    // Build formatted context
    const formattedTurns = turns
      .map(turn => `${turn.role === 'user' ? 'Customer' : 'Assistant'}: ${turn.content}`)
      .join('\n\n');
    
    const metadata = `
[Session metadata]
- Language: ${context.metadata.language}
- Branch: ${context.metadata.currentBranch || 'not specified'}
- Platform: ${context.metadata.currentPlatform || 'not specified'}
- Duration: ${Math.round((Date.now() - context.metadata.startedAt.getTime()) / 1000)}s
- Resolved intents: ${Array.from(context.metadata.resolvedIntents).join(', ') || 'none'}
${context.metadata.tickets.length > 0 ? `- Related tickets: ${context.metadata.tickets.join(', ')}` : ''}
`.trim();
    
    return {
      conversationHistory: formattedTurns,
      metadata,
      tokenBudgetRemaining: this.maxTokens - turns.reduce((sum, t) => sum + t.tokens, 0),
      state,
    };
  }
  
  private pruneTurns(turns: Turn[], context: ConversationContext): Turn[] {
    // Keep most recent turns + any with high priority intents
    const priorityIntents = new Set([
      'complaint' as IntentType,
      'contact_support' as IntentType,
      'speak_agent' as IntentType,
      'refund' as IntentType,
      'missing_item' as IntentType,
      'wrong_order' as IntentType,
    ]);
    
    let kept = turns.slice(-this.minKeptTurns);
    const pruned = turns.slice(0, -this.minKeptTurns);
    
    // Also keep turns with priority intents
    for (const turn of pruned.reverse()) {
      if (turn.intent && priorityIntents.has(turn.intent.primary.intent)) {
        kept = [turn, ...kept];
      }
    }
    
    return kept.slice(-20); // max 20 recent turns
  }
  
  private generateSummary(turns: Turn[]): ConversationSummary {
    // Extract key info from turns
    const userMessages = turns.filter(t => t.role === 'user').map(t => t.content);
    const allIntents = turns
      .map(t => t.intent?.primary.intent)
      .filter(Boolean) as IntentType[];
    
    // Determine main topic
    const intentCounts = allIntents.reduce((acc, intent) => {
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {} as Record<IntentType, number>);
    
    const topIntent = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general inquiry';
    
    const keyPoints = userMessages.slice(-3); // last 3 user messages as key points
    
    // Check for unresolved issues
    const unresolved: string[] = [];
    if (turns.some(t => t.intent?.sentiment.hasComplaint)) {
      unresolved.push('Complaint not fully resolved');
    }
    if (turns.slice(-3).some(t => t.intent?.primary.confidence && t.intent.primary.confidence < 0.5)) {
      unresolved.push('Recent unclear intents');
    }
    
    return {
      topic: topIntent,
      keyPoints,
      unresolved,
      nextSteps: ['Continue conversation', 'Offer escalation if needed'],
      generatedAt: new Date(),
    };
  }
  
  /**
   * Estimate token count for a string (rough approximation)
   * Rule of thumb: ~1 token per 4 characters for English
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Add a turn to the context and update metadata
   */
  addTurn(
    context: ConversationContext,
    role: 'user' | 'assistant',
    content: string,
    intent?: IntentResult,
    actions?: Action[]
  ): ConversationContext {
    const turn: Turn = {
      role,
      content,
      timestamp: new Date(),
      intent,
      actions,
      tokens: this.estimateTokens(content),
    };
    
    // Update metadata
    context.metadata.lastActivityAt = new Date();
    
    if (intent) {
      // Track resolved intents
      if (intent.primary.confidence > 0.7) {
        context.metadata.resolvedIntents.add(intent.primary.intent);
      } else {
        // Track failed intents
        const currentCount = context.metadata.failedIntents.get(intent.primary.intent) || 0;
        context.metadata.failedIntents.set(intent.primary.intent, currentCount + 1);
      }
      
      // Update current branch/platform from entities
      if (intent.entities.branch) {
        context.metadata.currentBranch = intent.entities.branch;
      }
      if (intent.entities.platform) {
        context.metadata.currentPlatform = intent.entities.platform;
      }
    }
    
    return {
      ...context,
      turns: [...context.turns, turn],
    };
  }
  
  /**
   * Create a new conversation context
   */
  createContext(sessionId: string, language: 'en' | 'fr' | 'nl' = 'fr'): ConversationContext {
    return {
      sessionId,
      turns: [],
      metadata: {
        startedAt: new Date(),
        lastActivityAt: new Date(),
        language,
        tickets: [],
        resolvedIntents: new Set(),
        failedIntents: new Map(),
      },
    };
  }
  
  /**
   * Check if conversation should be closed due to inactivity
   */
  shouldCloseConversation(context: ConversationContext, inactivityThresholdMs: number = 30 * 60 * 1000): boolean {
    const timeSinceLastActivity = Date.now() - context.metadata.lastActivityAt.getTime();
    return timeSinceLastActivity > inactivityThresholdMs;
  }
  
  /**
   * Get conversation duration in minutes
   */
  getConversationDuration(context: ConversationContext): number {
    return Math.round((Date.now() - context.metadata.startedAt.getTime()) / 60000);
  }
  
  /**
   * Detect if user is repeating the same question (frustration signal)
   */
  detectRepetitiveQuestions(context: ConversationContext): boolean {
    if (context.turns.length < 4) return false;
    
    const recentUserTurns = context.turns
      .filter(t => t.role === 'user')
      .slice(-4);
    
    // Check if recent intents are very similar
    const recentIntents = recentUserTurns
      .map(t => t.intent?.primary.intent)
      .filter(Boolean) as IntentType[];
    
    const uniqueIntents = new Set(recentIntents);
    
    // If user asked the same intent 3+ times recently, they're likely frustrated
    return uniqueIntents.size === 1 && recentIntents.length >= 3;
  }
}

/**
 * Utility: Export conversation for debugging/analytics
 */
export function exportConversation(context: ConversationContext): string {
  const lines: string[] = [
    '=== CONVERSATION EXPORT ===',
    `Session ID: ${context.sessionId}`,
    `Language: ${context.metadata.language}`,
    `Duration: ${Math.round((Date.now() - context.metadata.startedAt.getTime()) / 60000)} minutes`,
    `Turns: ${context.turns.length}`,
    `Resolved intents: ${Array.from(context.metadata.resolvedIntents).join(', ')}`,
    '',
    '=== MESSAGES ===',
    '',
  ];
  
  for (const turn of context.turns) {
    const timestamp = turn.timestamp.toISOString();
    const speaker = turn.role === 'user' ? 'CUSTOMER' : 'ASSISTANT';
    const intent = turn.intent ? ` [${turn.intent.primary.intent} @ ${turn.intent.primary.confidence.toFixed(2)}]` : '';
    
    lines.push(`[${timestamp}] ${speaker}${intent}:`);
    lines.push(turn.content);
    lines.push('');
  }
  
  return lines.join('\n');
}
