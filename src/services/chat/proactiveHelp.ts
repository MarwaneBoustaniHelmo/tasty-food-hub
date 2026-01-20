/**
 * Proactive Help Detection
 * Analyze user behavior to offer timely interventions
 */

import type { ConversationContext } from './contextManager';
import { ConversationState } from './conversationStateMachine';
import type { IntentType } from '../nlp/intentClassifier';

export interface ProactiveOpportunity {
  type: string;
  confidence: number; // 0-1
  message: string;
  action: 'offer_escalation' | 'offer_tracking_notification' | 'escalate_immediately' | 'suggest_faq' | 'suggest_order';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export class ProactiveHelpEngine {
  /**
   * Detect when user might need help without asking
   */
  async analyzeUserBehavior(context: ConversationContext): Promise<ProactiveOpportunity[]> {
    const opportunities: ProactiveOpportunity[] = [];
    
    // Pattern 1: User has been in FAQ mode for 5+ minutes without taking action
    const timeInFAQ = this.calculateTimeInState(context, ConversationState.FAQ_MODE);
    if (timeInFAQ > 5 * 60 * 1000) {
      opportunities.push({
        type: 'faq_fatigue',
        confidence: 0.8,
        message: 'Vous avez d\'autres questions? Je peux vous mettre en contact avec un agent si vous préférez.',
        action: 'offer_escalation',
        priority: 'normal',
      });
    }
    
    // Pattern 2: User keeps asking similar questions (confusion signal)
    const intentDiversity = this.calculateIntentDiversity(context);
    if (intentDiversity < 0.3 && context.turns.length > 4) {
      opportunities.push({
        type: 'user_confusion',
        confidence: 0.75,
        message: 'Je remarque que vous avez plusieurs questions. Souhaitez-vous parler directement avec notre équipe pour un suivi personnalisé?',
        action: 'offer_escalation',
        priority: 'high',
      });
    }
    
    // Pattern 3: Order tracking – user is checking too frequently (might be anxious)
    const trackingAttempts = context.turns.filter(
      t => t.intent?.primary.intent === ('track_order' as IntentType)
    ).length;
    
    if (trackingAttempts > 3) {
      opportunities.push({
        type: 'delivery_anxiety',
        confidence: 0.7,
        message: 'Votre commande est en cours de livraison. Voulez-vous que je vérifie le statut exact avec le restaurant?',
        action: 'offer_tracking_notification',
        priority: 'normal',
      });
    }
    
    // Pattern 4: Negative sentiment + repeated attempts to get refund
    const refundAttempts = context.metadata.failedIntents.get('refund' as IntentType) || 0;
    const hasNegativeSentiment = context.turns
      .slice(-3)
      .some(t => t.intent?.sentiment.polarity === 'negative');
    
    if (refundAttempts > 1 && hasNegativeSentiment) {
      opportunities.push({
        type: 'frustrated_user',
        confidence: 0.85,
        message: 'Je comprends votre frustration. Laissez-moi escalader immédiatement votre demande à un responsable qui pourra traiter votre remboursement.',
        action: 'escalate_immediately',
        priority: 'urgent',
      });
    }
    
    // Pattern 5: User has been asking FAQs but hasn't ordered
    const hasFAQActivity = context.turns.filter(
      t => t.intent?.primary.intent.startsWith('faq_')
    ).length > 3;
    
    const conversationDuration = Date.now() - context.metadata.startedAt.getTime();
    if (hasFAQActivity && conversationDuration > 3 * 60 * 1000) { // 3 minutes
      opportunities.push({
        type: 'potential_order',
        confidence: 0.6,
        message: 'Vous avez toutes les informations dont vous avez besoin? Prêt à passer commande?',
        action: 'suggest_order',
        priority: 'low',
      });
    }
    
    // Pattern 6: Inactivity after question (user might have left)
    const lastTurnTime = context.turns[context.turns.length - 1]?.timestamp;
    if (lastTurnTime) {
      const timeSinceLastTurn = Date.now() - lastTurnTime.getTime();
      if (timeSinceLastTurn > 2 * 60 * 1000 && timeSinceLastTurn < 5 * 60 * 1000) {
        opportunities.push({
          type: 'inactivity_check',
          confidence: 0.5,
          message: 'Êtes-vous toujours là? N\'hésitez pas à me poser d\'autres questions!',
          action: 'suggest_faq',
          priority: 'low',
        });
      }
    }
    
    // Pattern 7: Repetitive question detection (same intent 3+ times)
    const recentIntents = context.turns
      .slice(-5)
      .map(t => t.intent?.primary.intent)
      .filter(Boolean) as IntentType[];
    
    const intentCounts = recentIntents.reduce((acc, intent) => {
      acc[intent] = (acc[intent] || 0) + 1;
      return acc;
    }, {} as Record<IntentType, number>);
    
    const maxCount = Math.max(...Object.values(intentCounts));
    if (maxCount >= 3) {
      opportunities.push({
        type: 'repetitive_question',
        confidence: 0.8,
        message: 'Je vois que cette question vous préoccupe. Voulez-vous que je vous mette en contact avec quelqu\'un qui puisse vous donner une réponse plus détaillée?',
        action: 'offer_escalation',
        priority: 'high',
      });
    }
    
    // Sort by priority and confidence
    return opportunities.sort((a, b) => {
      const priorityWeight = { urgent: 4, high: 3, normal: 2, low: 1 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.confidence - a.confidence;
    });
  }
  
  private calculateTimeInState(context: ConversationContext, targetState: ConversationState): number {
    // Find first turn in this state
    let startTime = context.metadata.startedAt;
    
    for (const turn of context.turns) {
      if (turn.metadata?.state === targetState) {
        startTime = turn.timestamp;
        break;
      }
    }
    
    return Date.now() - startTime.getTime();
  }
  
  private calculateIntentDiversity(context: ConversationContext): number {
    const intents = new Set(
      context.turns
        .map(t => t.intent?.primary.intent)
        .filter(Boolean)
    );
    
    return intents.size / Math.max(1, context.turns.length);
  }
  
  /**
   * Determine if proactive intervention should be shown
   */
  shouldShowProactiveHelp(
    opportunity: ProactiveOpportunity,
    lastProactiveTime?: Date
  ): boolean {
    // Don't show proactive help too frequently
    if (lastProactiveTime) {
      const timeSinceLastProactive = Date.now() - lastProactiveTime.getTime();
      const minInterval = 2 * 60 * 1000; // 2 minutes minimum between proactive messages
      
      if (timeSinceLastProactive < minInterval) {
        return false;
      }
    }
    
    // Only show high-confidence opportunities
    if (opportunity.confidence < 0.6) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get proactive message with appropriate tone
   */
  formatProactiveMessage(opportunity: ProactiveOpportunity, language: 'en' | 'fr' | 'nl'): string {
    const messages = {
      en: {
        faq_fatigue: 'Having trouble finding what you need? I can connect you with our team for personalized help.',
        user_confusion: 'I notice you have several questions. Would you like to speak directly with someone from our team?',
        delivery_anxiety: 'Your order is on its way! Want me to check the exact status with the restaurant?',
        frustrated_user: 'I understand your frustration. Let me escalate your request to a manager immediately.',
        potential_order: 'Ready to place your order? I can help you get started!',
        inactivity_check: 'Still there? Feel free to ask more questions!',
        repetitive_question: 'I see this is important to you. Want me to connect you with someone who can give you a more detailed answer?',
      },
      fr: {
        faq_fatigue: 'Difficile de trouver ce que vous cherchez? Je peux vous mettre en contact avec notre équipe.',
        user_confusion: 'Je remarque que vous avez plusieurs questions. Voulez-vous parler directement avec quelqu\'un de notre équipe?',
        delivery_anxiety: 'Votre commande est en cours de livraison! Voulez-vous que je vérifie le statut exact?',
        frustrated_user: 'Je comprends votre frustration. Laissez-moi escalader immédiatement votre demande.',
        potential_order: 'Prêt à commander? Je peux vous aider!',
        inactivity_check: 'Toujours là? N\'hésitez pas à poser d\'autres questions!',
        repetitive_question: 'Je vois que c\'est important pour vous. Voulez-vous que je vous mette en contact avec quelqu\'un?',
      },
      nl: {
        faq_fatigue: 'Moeite met vinden wat je zoekt? Ik kan je in contact brengen met ons team.',
        user_confusion: 'Ik merk dat je meerdere vragen hebt. Wil je direct met iemand van ons team spreken?',
        delivery_anxiety: 'Je bestelling is onderweg! Wil je dat ik de exacte status controleer?',
        frustrated_user: 'Ik begrijp je frustratie. Laat me je verzoek onmiddellijk doorverwijzen.',
        potential_order: 'Klaar om te bestellen? Ik kan helpen!',
        inactivity_check: 'Ben je er nog? Stel gerust meer vragen!',
        repetitive_question: 'Ik zie dat dit belangrijk voor je is. Wil je dat ik je in contact breng met iemand?',
      },
    };
    
    return messages[language][opportunity.type as keyof typeof messages.en] || opportunity.message;
  }
}

/**
 * Track when proactive help was last shown
 */
export class ProactiveHelpTracker {
  private lastProactiveTime?: Date;
  private shownOpportunities = new Set<string>();
  
  recordProactiveHelp(opportunityType: string): void {
    this.lastProactiveTime = new Date();
    this.shownOpportunities.add(opportunityType);
  }
  
  getLastProactiveTime(): Date | undefined {
    return this.lastProactiveTime;
  }
  
  hasShownOpportunity(opportunityType: string): boolean {
    return this.shownOpportunities.has(opportunityType);
  }
  
  reset(): void {
    this.lastProactiveTime = undefined;
    this.shownOpportunities.clear();
  }
}
