import { ragClient } from '@/services/rag/ragClient';
import { guardrailsEngine } from '@/services/guardrails/guardrailRules';
import { toolOrchestrator } from '@/services/tools/toolOrchestrator';
import { registerOrderTools } from '@/services/tools/orderTools';
import { registerTicketTools } from '@/services/tools/ticketTools';
import { registerBranchTools } from '@/services/tools/branchTools';
import { IntentType } from '@/services/nlp/intentClassifier';

interface ConversationContext {
  sessionId: string;
  userEmail?: string;
  turns: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  metadata: {
    startedAt: Date;
    lastActivityAt: Date;
    language: 'fr' | 'en' | 'nl';
    tickets: string[];
    resolvedIntents: Set<string>;
    failedIntents: Map<string, number>;
  };
}

export class AdvancedChatEngine {
  private toolsRegistered = false;

  constructor() {
    // Register all tools on initialization
    if (!this.toolsRegistered) {
      registerOrderTools();
      registerTicketTools();
      registerBranchTools();
      this.toolsRegistered = true;
    }
  }

  /**
   * Main chat processing pipeline
   */
  async processUserMessage(
    userMessage: string,
    conversationContext: ConversationContext,
  ): Promise<{
    response: string;
    escalate: boolean;
    escalationReason?: string;
    usedRAG: boolean;
    usedTools: boolean;
    metadata: Record<string, any>;
  }> {
    const startTime = Date.now();
    const metadata: Record<string, any> = {};

    try {
      // Step 1: Validate input (guardrails)
      const inputValidation = await guardrailsEngine.processMessage(userMessage, '', {
        userEmail: conversationContext.userEmail,
      });

      if (!inputValidation.approved) {
        return {
          response: inputValidation.userMessage.violations[0]?.message || 'Your message could not be processed.',
          escalate: true,
          escalationReason: 'Input validation failed',
          usedRAG: false,
          usedTools: false,
          metadata: { violations: inputValidation.userMessage.violations },
        };
      }

      // Step 2: Classify intent (simplified - you can integrate your full intent classifier)
      const intent = this.classifyIntent(userMessage);
      metadata.intent = intent;
      metadata.confidence = 0.8; // placeholder

      // Step 3: Determine strategy (RAG, Tools, or direct LLM)
      const strategy = this.determineStrategy(intent);
      metadata.strategy = strategy;

      let response: string;
      let usedRAG = false;
      let usedTools = false;

      if (strategy === 'rag_only') {
        // RAG approach: retrieval + LLM generation
        const ragResult = await ragClient.queryWithContext(userMessage, conversationContext.metadata.language);
        response = ragResult.answer;
        metadata.ragDocuments = ragResult.sources.map(s => s.title);
        usedRAG = true;
      } else if (strategy === 'rag_with_tools') {
        // RAG + Function calling
        const ragResult = await ragClient.queryWithContext(userMessage, conversationContext.metadata.language);
        const ragContext = ragResult.sources.map(s => s.content).join('\n\n');

        const systemPrompt = `You are Tasty Food support assistant. Use the provided context and available tools to help the customer.

Context from knowledge base:
${ragContext}`;

        const allowedTools = this.getAllowedToolsByIntent(intent);

        const orchestratorResult = await toolOrchestrator.executeLLMWithTools(
          userMessage,
          systemPrompt,
          allowedTools,
          { userEmail: conversationContext.userEmail, userLanguage: conversationContext.metadata.language },
        );

        response = orchestratorResult.finalResponse;
        metadata.toolsExecuted = orchestratorResult.toolsUsed.map(t => ({ name: t.toolName, success: t.success }));
        usedRAG = true;
        usedTools = true;
      } else if (strategy === 'tools_only') {
        // Tools only (no RAG context needed)
        const systemPrompt = `You are Tasty Food support assistant. Use the available tools to help the customer.`;
        const allowedTools = this.getAllowedToolsByIntent(intent);

        const orchestratorResult = await toolOrchestrator.executeLLMWithTools(
          userMessage,
          systemPrompt,
          allowedTools,
          { userEmail: conversationContext.userEmail, userLanguage: conversationContext.metadata.language },
        );

        response = orchestratorResult.finalResponse;
        metadata.toolsExecuted = orchestratorResult.toolsUsed.map(t => ({ name: t.toolName, success: t.success }));
        usedTools = true;
      } else {
        // Direct LLM (fallback)
        response = 'Je suis désolé, je ne peux pas répondre à cette demande pour le moment. Laissez-moi vous mettre en contact avec notre équipe.';
      }

      // Step 4: Validate output (guardrails)
      const outputValidation = await guardrailsEngine.processMessage(userMessage, response, {
        ragDocuments: metadata.ragDocuments,
      });

      if (!outputValidation.approved || outputValidation.llmOutput.shouldEscalate) {
        return {
          response: outputValidation.llmOutput.filtered,
          escalate: true,
          escalationReason: outputValidation.escalationReason || 'Output validation required escalation',
          usedRAG,
          usedTools,
          metadata: { ...metadata, violations: outputValidation.llmOutput.violations },
        };
      }

      // Success
      return {
        response: outputValidation.llmOutput.filtered,
        escalate: false,
        usedRAG,
        usedTools,
        metadata: { ...metadata, processingTime: Date.now() - startTime },
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        response: 'An error occurred. Let me connect you with our support team.',
        escalate: true,
        escalationReason: error instanceof Error ? error.message : 'Unknown error',
        usedRAG: false,
        usedTools: false,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Simple intent classification (can be replaced with full NLP classifier)
   */
  private classifyIntent(message: string): IntentType {
    const lowerMessage = message.toLowerCase();

    // FAQ intents
    if (lowerMessage.match(/halal|certification|viande/i)) return IntentType.FAQ_HALAL;
    if (lowerMessage.match(/allergi|gluten|lactose|ingredient/i)) return IntentType.FAQ_INGREDIENTS;
    if (lowerMessage.match(/heure|ouvert|ferme|localisation|adresse/i)) return IntentType.FAQ_HOURS;

    // Order intents
    if (lowerMessage.match(/suivi|track|commander|order|livraison/i)) return IntentType.TRACK_ORDER;
    if (lowerMessage.match(/annul/i)) return IntentType.CANCEL_ORDER;

    // Support intents
    if (lowerMessage.match(/plainte|complaint|problem|issue/i)) return IntentType.COMPLAINT;
    if (lowerMessage.match(/remboursement|refund/i)) return IntentType.REFUND;
    if (lowerMessage.match(/manquant|missing|oubli/i)) return IntentType.MISSING_ITEM;
    if (lowerMessage.match(/mauvais|wrong|incorrect/i)) return IntentType.WRONG_ORDER;

    // Branch info
    if (lowerMessage.match(/contact|telephone|phone|appel/i)) return IntentType.GET_BRANCH_INFO;

    return IntentType.GENERAL_INQUIRY;
  }

  /**
   * Determine processing strategy based on intent
   */
  private determineStrategy(
    intent: IntentType,
  ): 'rag_only' | 'rag_with_tools' | 'tools_only' | 'direct_llm' {
    const toolIntents = [
      IntentType.TRACK_ORDER,
      IntentType.CREATE_TICKET,
      IntentType.CANCEL_ORDER,
    ];

    const ragIntents = [
      IntentType.FAQ_HALAL,
      IntentType.FAQ_CERTIFICATIONS,
      IntentType.FAQ_HOURS,
      IntentType.FAQ_INGREDIENTS,
    ];

    const ragWithToolsIntents = [
      IntentType.GET_BRANCH_INFO,
      IntentType.COMPLAINT,
      IntentType.REFUND,
    ];

    if (toolIntents.includes(intent)) {
      return 'tools_only';
    }

    if (ragWithToolsIntents.includes(intent)) {
      return 'rag_with_tools';
    }

    if (ragIntents.includes(intent)) {
      return 'rag_only';
    }

    return 'direct_llm';
  }

  /**
   * Get allowed tools based on intent
   */
  private getAllowedToolsByIntent(intent: IntentType): string[] {
    const mapping: Partial<Record<IntentType, string[]>> = {
      [IntentType.TRACK_ORDER]: ['get_order_status', 'get_branch_contact'],
      [IntentType.CREATE_TICKET]: ['create_support_ticket', 'get_ticket_status'],
      [IntentType.CANCEL_ORDER]: ['cancel_order', 'create_support_ticket'],
      [IntentType.GET_BRANCH_INFO]: ['get_branch_hours', 'get_branch_contact'],
      [IntentType.COMPLAINT]: ['create_support_ticket', 'get_order_status'],
      [IntentType.REFUND]: ['create_support_ticket', 'get_order_status'],
      [IntentType.MISSING_ITEM]: ['create_support_ticket', 'get_order_status'],
      [IntentType.WRONG_ORDER]: ['create_support_ticket', 'get_order_status'],
    };

    return mapping[intent] || [];
  }
}

export const advancedChatEngine = new AdvancedChatEngine();
