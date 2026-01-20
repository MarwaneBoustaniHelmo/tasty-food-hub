/**
 * Conversation State Machine
 * Manages complex multi-turn conversations with intelligent state transitions
 */

import type { ConversationContext } from './contextManager';
import type { IntentResult, IntentType } from '../nlp/intentClassifier';
import { classifyIntent } from '../nlp/intentClassifier';
import { findResponseTemplate, renderResponse } from './responseTemplates';
import { generateLLMResponse, validateLLMResponse, getFallbackResponse, rateLimiter } from './llmResponseGenerator';
import { SYSTEM_PROMPT_V1 } from './systemPrompts';

export enum ConversationState {
  IDLE = 'idle',
  ACTIVE_CONVERSATION = 'active_conversation',
  AWAITING_USER_INPUT = 'awaiting_user_input',
  FAQ_MODE = 'faq_mode',
  SUPPORT_TICKET_MODE = 'support_ticket_mode',
  AGENT_HANDOFF_IN_PROGRESS = 'agent_handoff_in_progress',
  AGENT_CONVERSATION = 'agent_conversation',
  WAITING_FOR_AGENT = 'waiting_for_agent',
  ESCALATION_PENDING = 'escalation_pending',
  CLOSED = 'closed',
}

interface Action {
  type: string;
  label: string;
  payload: Record<string, any>;
}

interface StateTransition {
  from: ConversationState;
  to: ConversationState;
  condition: (context: ConversationContext, intent: IntentResult) => boolean;
  action?: (context: ConversationContext) => Promise<void>;
}

const STATE_TRANSITIONS: StateTransition[] = [
  {
    from: ConversationState.IDLE,
    to: ConversationState.ACTIVE_CONVERSATION,
    condition: () => true,
  },
  {
    from: ConversationState.ACTIVE_CONVERSATION,
    to: ConversationState.FAQ_MODE,
    condition: (ctx, intent) =>
      [
        'faq_halal' as IntentType,
        'faq_certifications' as IntentType,
        'faq_ordering' as IntentType,
        'faq_hours' as IntentType,
        'faq_menu' as IntentType,
        'faq_ingredients' as IntentType,
      ].includes(intent.primary.intent),
  },
  {
    from: ConversationState.ACTIVE_CONVERSATION,
    to: ConversationState.SUPPORT_TICKET_MODE,
    condition: (ctx, intent) =>
      intent.primary.intent === ('contact_support' as IntentType) ||
      intent.primary.intent === ('speak_agent' as IntentType),
    action: async (ctx) => {
      // Pre-fill ticket with context
      console.log('[StateMachine] Pre-filling ticket context for user');
    },
  },
  {
    from: ConversationState.ACTIVE_CONVERSATION,
    to: ConversationState.ESCALATION_PENDING,
    condition: (ctx, intent) =>
      intent.escalationFlag ||
      (intent.primary.confidence < 0.5 && intent.sentiment.hasComplaint) ||
      [
        'complaint' as IntentType,
        'refund' as IntentType,
        'missing_item' as IntentType,
        'wrong_order' as IntentType,
        'quality_issue' as IntentType,
      ].includes(intent.primary.intent),
    action: async (ctx) => {
      // Alert agent panel
      await notifyAgentQueue(ctx);
    },
  },
  {
    from: ConversationState.FAQ_MODE,
    to: ConversationState.SUPPORT_TICKET_MODE,
    condition: (ctx, intent) =>
      intent.primary.intent === ('contact_support' as IntentType) ||
      intent.primary.intent === ('speak_agent' as IntentType),
  },
  {
    from: ConversationState.FAQ_MODE,
    to: ConversationState.ESCALATION_PENDING,
    condition: (ctx, intent) => intent.escalationFlag || intent.sentiment.hasComplaint,
  },
  {
    from: ConversationState.ESCALATION_PENDING,
    to: ConversationState.AGENT_CONVERSATION,
    condition: (ctx) => ctx.metadata.tickets.length > 0, // Ticket assigned to agent
  },
  {
    from: ConversationState.SUPPORT_TICKET_MODE,
    to: ConversationState.WAITING_FOR_AGENT,
    condition: (ctx) => ctx.metadata.tickets.length > 0,
  },
];

async function notifyAgentQueue(context: ConversationContext): Promise<void> {
  // TODO: Implement agent notification system
  console.log('[StateMachine] Notifying agent queue for session:', context.sessionId);
  
  // Example: Send webhook to agent dashboard
  // await fetch('/api/agent/notify', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     sessionId: context.sessionId,
  //     priority: 'high',
  //     summary: context.turns.slice(-1)[0]?.content,
  //   }),
  // });
}

export class ConversationStateMachine {
  private currentState: ConversationState = ConversationState.IDLE;
  
  async processUserInput(
    userMessage: string,
    context: ConversationContext,
  ): Promise<{
    response: string;
    newState: ConversationState;
    nextActions: Action[];
  }> {
    // Classify intent
    const intentResult = await classifyIntent(userMessage, context);
    
    // Find applicable transition
    const transition = STATE_TRANSITIONS.find(
      t => t.from === this.currentState && t.condition(context, intentResult),
    );
    
    const newState = transition?.to || this.currentState;
    
    // Execute transition action
    if (transition?.action) {
      try {
        await transition.action(context);
      } catch (error) {
        console.error('[StateMachine] Transition action failed:', error);
      }
    }
    
    // Generate response based on new state
    const response = await this.generateStateResponse(
      userMessage,
      newState,
      intentResult,
      context
    );
    
    // Determine next actions
    const nextActions = this.planNextActions(newState, intentResult, context);
    
    this.currentState = newState;
    
    return { response, newState, nextActions };
  }
  
  private async generateStateResponse(
    userMessage: string,
    state: ConversationState,
    intent: IntentResult,
    context: ConversationContext,
  ): Promise<string> {
    switch (state) {
      case ConversationState.FAQ_MODE: {
        // Try templates first
        const template = findResponseTemplate(intent.primary.intent, context, intent);
        if (template) {
          return renderResponse(template, context, intent.entities);
        }
        
        // Fallback to LLM if no template
        if (rateLimiter.canMakeCall()) {
          rateLimiter.recordCall();
          const llmResponse = await generateLLMResponse(
            userMessage,
            intent,
            context,
            SYSTEM_PROMPT_V1
          );
          
          const validation = validateLLMResponse(llmResponse);
          if (validation.isValid) {
            return llmResponse.response;
          }
        }
        
        return getFallbackResponse(intent);
      }
      
      case ConversationState.SUPPORT_TICKET_MODE:
        return `Je vais vous aider à ouvrir un ticket de support. Pour que notre équipe puisse vous aider rapidement:

**Informations nécessaires:**
1. Votre adresse email
2. Description de votre problème

Pouvez-vous me donner ces informations?`;
      
      case ConversationState.ESCALATION_PENDING:
        return `Je transmets votre demande à notre équipe de support. Un agent prendra en charge votre dossier dans les plus brefs délais.

**En attendant:**
• Vous recevrez un email de confirmation
• Un agent vous répondra sous 2-4 heures (en heures d'ouverture)
• Vous pouvez ajouter des détails supplémentaires ci-dessous

Y a-t-il autre chose que je devrais transmettre à l'équipe?`;
      
      case ConversationState.WAITING_FOR_AGENT:
        return `✅ Vous êtes maintenant en contact avec notre équipe de support. Un agent vous répondra dès que possible.

**Temps d'attente estimé:** 2-4 heures

Vous recevrez une notification par email dès qu'un agent prendra en charge votre demande. Merci de votre patience!`;
      
      case ConversationState.AGENT_CONVERSATION:
        return `Votre conversation est maintenant gérée par un agent humain. Toutes vos questions recevront une réponse personnalisée.`;
      
      case ConversationState.CLOSED:
        return `Cette conversation a été clôturée. Si vous avez besoin d'aide, n'hésitez pas à démarrer une nouvelle conversation!`;
      
      default: {
        // Active conversation - check if we can use a template
        const template = findResponseTemplate(intent.primary.intent, context, intent);
        if (template) {
          return renderResponse(template, context, intent.entities);
        }
        
        // Use LLM for complex responses
        if (rateLimiter.canMakeCall()) {
          rateLimiter.recordCall();
          try {
            const llmResponse = await generateLLMResponse(
              userMessage,
              intent,
              context,
              SYSTEM_PROMPT_V1
            );
            
            const validation = validateLLMResponse(llmResponse);
            if (validation.isValid) {
              return llmResponse.response;
            }
          } catch (error) {
            console.error('[LLM] Response generation failed:', error);
          }
        }
        
        return getFallbackResponse(intent);
      }
    }
  }
  
  private planNextActions(
    state: ConversationState,
    intent: IntentResult,
    context: ConversationContext,
  ): Action[] {
    const actions: Action[] = [];
    
    if (state === ConversationState.FAQ_MODE) {
      actions.push({
        type: 'suggest_order',
        label: 'Prêt à commander?',
        payload: { platforms: ['ubereats', 'deliveroo', 'takeaway', 'website'] },
      });
      actions.push({
        type: 'suggest_contact',
        label: 'Autre question?',
        payload: { action: 'continue_conversation' },
      });
    }
    
    if (intent.sentiment.hasComplaint || intent.sentiment.polarity === 'negative') {
      actions.push({
        type: 'suggest_escalation',
        label: 'Parler à un agent',
        payload: { urgency: intent.entities.priority || 'high' },
      });
    }
    
    if (
      state === ConversationState.ACTIVE_CONVERSATION &&
      intent.primary.intent === ('track_order' as IntentType)
    ) {
      actions.push({
        type: 'suggest_platforms',
        label: 'Sélectionnez votre plateforme',
        payload: {
          options: ['Uber Eats', 'Deliveroo', 'Takeaway', 'Site web'],
        },
      });
    }
    
    return actions;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): ConversationState {
    return this.currentState;
  }
  
  /**
   * Force state change (useful for testing or manual override)
   */
  setState(newState: ConversationState): void {
    this.currentState = newState;
  }
  
  /**
   * Check if state allows for agent intervention
   */
  isAgentInterventionAllowed(): boolean {
    return [
      ConversationState.ESCALATION_PENDING,
      ConversationState.WAITING_FOR_AGENT,
      ConversationState.AGENT_CONVERSATION,
    ].includes(this.currentState);
  }
  
  /**
   * Check if state is terminal (conversation ended)
   */
  isTerminalState(): boolean {
    return this.currentState === ConversationState.CLOSED;
  }
}

/**
 * Utility: Get human-readable state description
 */
export function getStateDescription(state: ConversationState): string {
  const descriptions: Record<ConversationState, string> = {
    [ConversationState.IDLE]: 'Inactive',
    [ConversationState.ACTIVE_CONVERSATION]: 'Active conversation',
    [ConversationState.AWAITING_USER_INPUT]: 'Waiting for user response',
    [ConversationState.FAQ_MODE]: 'FAQ assistance',
    [ConversationState.SUPPORT_TICKET_MODE]: 'Creating support ticket',
    [ConversationState.AGENT_HANDOFF_IN_PROGRESS]: 'Transferring to agent',
    [ConversationState.AGENT_CONVERSATION]: 'Connected with agent',
    [ConversationState.WAITING_FOR_AGENT]: 'Waiting for agent response',
    [ConversationState.ESCALATION_PENDING]: 'Escalation in progress',
    [ConversationState.CLOSED]: 'Conversation closed',
  };
  
  return descriptions[state] || 'Unknown state';
}
