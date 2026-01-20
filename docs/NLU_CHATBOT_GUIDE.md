# Advanced NLU Chatbot System - Implementation Guide

**Version 4.0** – Production specification for ChatGPT/Claude-level conversation quality

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Integration Guide](#integration-guide)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This system implements an **advanced Natural Language Understanding (NLU) chatbot** with:

- **Multi-layer intent classification** with entity extraction
- **Claude-inspired context window management** (4000 tokens)
- **Hybrid response generation** (templates + LLM fallback)
- **Conversation state machine** for complex multi-turn dialogs
- **Proactive help detection** based on user behavior
- **Multi-language support** (French, English, Dutch)
- **Intelligent escalation** to human agents

**Goal:** Achieve ChatGPT/Claude-level conversation quality adapted to restaurant support context.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT (Message)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Intent Classifier (NLU Engine)                 │
│  • Tokenization & normalization                              │
│  • Entity extraction (regex + patterns)                      │
│  • Semantic embedding (optional)                             │
│  • Intent scoring (keyword + context)                        │
│  • Sentiment analysis                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Context Window Manager (Memory)                    │
│  • Track conversation history                                │
│  • Prune/summarize when token budget > 70%                   │
│  • Preserve critical turns (complaints, escalations)         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Conversation State Machine (Logic)                  │
│  • Determine current state (FAQ, Support, Escalation, etc.)  │
│  • Apply state transitions based on intent                   │
│  • Execute actions (notify agents, create tickets)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Response Generation (Hybrid)                      │
│  1. Try pre-validated templates first                        │
│  2. Fallback to LLM (Claude/GPT) if no template              │
│  3. Post-process & validate response                         │
│  4. Add quick reply suggestions                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Proactive Help Engine (Optional)                   │
│  • Detect user frustration patterns                          │
│  • Offer timely interventions                                │
│  • Suggest escalation when appropriate                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESPONSE TO USER                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Intent Classifier (`src/services/nlp/intentClassifier.ts`)

**Purpose:** Understand what the user wants with high accuracy.

**Features:**
- **23 intent types** (FAQ, tracking, complaints, escalation, etc.)
- **Entity extraction** (order numbers, platforms, branches, emails, allergens)
- **Sentiment analysis** (polarity + intensity)
- **Multi-language keyword matching** (FR/EN/NL)
- **Context-aware scoring** (boosts intents based on conversation history)

**Key Functions:**
```typescript
classifyIntent(message: string, context?: ConversationContext): Promise<IntentResult>
extractEntities(text: string, context?: ConversationContext): EntityExtraction
analyzeSentiment(text: string, entities: EntityExtraction): SentimentScore
requiresImmediateEscalation(intent: IntentResult): boolean
```

**Example Usage:**
```typescript
import { classifyIntent } from '@/services/nlp/intentClassifier';

const intent = await classifyIntent('Est-ce que votre viande est halal?');
// Result:
// {
//   primary: { intent: 'faq_halal', confidence: 0.85, tokens: [...] },
//   entities: {},
//   sentiment: { polarity: 'neutral', intensity: 0, hasComplaint: false },
//   escalationFlag: false
// }
```

---

### 2. Context Window Manager (`src/services/chat/contextManager.ts`)

**Purpose:** Manage conversation memory efficiently (4000 token budget).

**Features:**
- **Automatic pruning** when token usage > 70%
- **Smart summarization** of older turns
- **Priority preservation** (complaints, escalations always kept)
- **Conversation export** for debugging/analytics

**Key Classes:**
```typescript
ContextWindowManager
  - createContext(sessionId, language): ConversationContext
  - addTurn(context, role, content, intent): ConversationContext
  - buildLLMContext(context): LLMContextPayload
  - shouldCloseConversation(context, inactivityThresholdMs): boolean
  - detectRepetitiveQuestions(context): boolean
```

**Example Usage:**
```typescript
import { ContextWindowManager } from '@/services/chat/contextManager';

const manager = new ContextWindowManager();
let context = manager.createContext('session-123', 'fr');

// Add user turn
context = manager.addTurn(context, 'user', 'Bonjour!', greetingIntent);

// Add assistant turn
context = manager.addTurn(context, 'assistant', 'Bonjour! Comment puis-je vous aider?');

// Build context for LLM
const llmContext = manager.buildLLMContext(context);
console.log(llmContext.conversationHistory);
console.log(llmContext.tokenBudgetRemaining);
```

---

### 3. System Prompts (`src/services/chat/systemPrompts.ts`)

**Purpose:** Define bot behavior and knowledge base.

**Prompts:**
- `SYSTEM_PROMPT_V1` - Main prompt (restaurant support)
- `SYSTEM_PROMPT_AGENT_MODE` - Agent assist mode
- `SYSTEM_PROMPT_FAQ_MODE` - Quick FAQ responses
- `ESCALATION_PROMPT` - Escalation handling
- `SENSITIVE_TOPIC_PROMPT` - Allergens/religious topics

**Dynamic Prompt Builder:**
```typescript
buildDynamicSystemPrompt(
  branchInfo?: { name, hours, phone },
  agentMode?: boolean,
  faqMode?: boolean
): string
```

**Example:**
```typescript
import { buildDynamicSystemPrompt, addLanguageContext } from '@/services/chat/systemPrompts';

let prompt = buildDynamicSystemPrompt(
  { name: 'Angleur', hours: '11:00-23:00', phone: '+32 4 XXX XX XX' },
  false, // not agent mode
  true   // FAQ mode
);

prompt = addLanguageContext(prompt, 'fr');
```

---

### 4. Response Templates (`src/services/chat/responseTemplates.ts`)

**Purpose:** Pre-validated responses to minimize hallucinations.

**Templates:**
- HALAL certification (French)
- Order tracking (Uber Eats, Deliveroo, generic)
- Complaints (missing item, wrong order, quality issue)
- Refunds
- FAQ (ordering, hours, menu)
- Greetings, escalation, out-of-scope

**Key Functions:**
```typescript
findResponseTemplate(intent, context, intentResult): ResponseTemplate | null
renderResponse(template, context, entities): string
```

**Example:**
```typescript
import { findResponseTemplate, renderResponse } from '@/services/chat/responseTemplates';

const template = findResponseTemplate('faq_halal', context, intentResult);
if (template) {
  const response = renderResponse(template, context, intentResult.entities);
  console.log(response); // "Oui, Tasty Food est 100% HALAL certifié..."
}
```

---

### 5. LLM Response Generator (`src/services/chat/llmResponseGenerator.ts`)

**Purpose:** Fallback to Claude/GPT when templates don't cover the intent.

**Features:**
- **Claude 3.5 Sonnet** integration (primary)
- **OpenAI GPT-4 Turbo** fallback
- **Constrained generation** (max 300 tokens, temperature 0.5)
- **Post-processing** (remove "as an AI", truncate, validate)
- **Rate limiting** (100 calls/hour)

**Key Functions:**
```typescript
generateLLMResponse(message, intent, context, systemPrompt): Promise<LLMResponse>
validateLLMResponse(response): { isValid, issues }
getFallbackResponse(intent): string
```

**Environment Variables:**
```env
VITE_ANTHROPIC_API_KEY=sk-...
VITE_OPENAI_API_KEY=sk-...
```

**Example:**
```typescript
import { generateLLMResponse, validateLLMResponse } from '@/services/chat/llmResponseGenerator';

const llmResponse = await generateLLMResponse(
  userMessage,
  intentResult,
  context,
  SYSTEM_PROMPT_V1
);

const validation = validateLLMResponse(llmResponse);
if (validation.isValid) {
  console.log(llmResponse.response);
} else {
  console.error('LLM response failed validation:', validation.issues);
}
```

---

### 6. Conversation State Machine (`src/services/chat/conversationStateMachine.ts`)

**Purpose:** Manage complex multi-turn conversations.

**States:**
- `IDLE` - No conversation
- `ACTIVE_CONVERSATION` - General chat
- `FAQ_MODE` - Answering FAQs
- `SUPPORT_TICKET_MODE` - Creating ticket
- `ESCALATION_PENDING` - Escalating to agent
- `AGENT_CONVERSATION` - Connected with human agent
- `WAITING_FOR_AGENT` - Waiting for agent response
- `CLOSED` - Conversation ended

**Key Methods:**
```typescript
ConversationStateMachine
  - processUserInput(message, context): Promise<{ response, newState, nextActions }>
  - getCurrentState(): ConversationState
  - setState(newState): void
  - isAgentInterventionAllowed(): boolean
```

**Example:**
```typescript
import { ConversationStateMachine } from '@/services/chat/conversationStateMachine';

const stateMachine = new ConversationStateMachine();

const result = await stateMachine.processUserInput(
  'Je n\'ai pas reçu ma commande',
  context
);

console.log(result.response);      // "Je suis désolé pour cet oubli..."
console.log(result.newState);      // ESCALATION_PENDING
console.log(result.nextActions);   // [{ type: 'suggest_escalation', ... }]
```

---

### 7. Proactive Help Engine (`src/services/chat/proactiveHelp.ts`)

**Purpose:** Detect user frustration and offer timely help.

**Patterns Detected:**
- **FAQ fatigue** (5+ mins in FAQ mode without action)
- **User confusion** (asking similar questions repeatedly)
- **Delivery anxiety** (tracking order 3+ times)
- **Frustrated user** (negative sentiment + repeated refund attempts)
- **Potential order** (browsing FAQs for 3+ minutes)
- **Inactivity** (2-5 mins since last message)
- **Repetitive questions** (same intent 3+ times)

**Key Classes:**
```typescript
ProactiveHelpEngine
  - analyzeUserBehavior(context): Promise<ProactiveOpportunity[]>
  - shouldShowProactiveHelp(opportunity, lastProactiveTime): boolean
  - formatProactiveMessage(opportunity, language): string

ProactiveHelpTracker
  - recordProactiveHelp(opportunityType): void
  - hasShownOpportunity(opportunityType): boolean
```

**Example:**
```typescript
import { ProactiveHelpEngine, ProactiveHelpTracker } from '@/services/chat/proactiveHelp';

const engine = new ProactiveHelpEngine();
const tracker = new ProactiveHelpTracker();

const opportunities = await engine.analyzeUserBehavior(context);

for (const opp of opportunities) {
  if (engine.shouldShowProactiveHelp(opp, tracker.getLastProactiveTime())) {
    const message = engine.formatProactiveMessage(opp, 'fr');
    console.log('Proactive help:', message);
    tracker.recordProactiveHelp(opp.type);
    break; // Show only one
  }
}
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install @anthropic-ai/sdk  # For Claude
# OR
npm install openai              # For GPT-4
```

### Step 2: Set Environment Variables

```env
# .env
VITE_ANTHROPIC_API_KEY=sk-ant-...
# OR
VITE_OPENAI_API_KEY=sk-...

# Optional: Supabase for embeddings (pgvector)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Step 3: Integrate with Existing ChatBot Component

```typescript
// src/components/EnhancedChatBot.tsx
import { classifyIntent } from '@/services/nlp/intentClassifier';
import { ContextWindowManager } from '@/services/chat/contextManager';
import { ConversationStateMachine } from '@/services/chat/conversationStateMachine';
import { ProactiveHelpEngine } from '@/services/chat/proactiveHelp';

const EnhancedChatBot: React.FC = () => {
  const [context, setContext] = useState<ConversationContext>();
  const contextManager = useRef(new ContextWindowManager());
  const stateMachine = useRef(new ConversationStateMachine());
  const proactiveEngine = useRef(new ProactiveHelpEngine());
  
  useEffect(() => {
    // Initialize context
    const newContext = contextManager.current.createContext(
      crypto.randomUUID(),
      'fr' // detected language
    );
    setContext(newContext);
  }, []);
  
  const handleUserMessage = async (message: string) => {
    if (!context) return;
    
    // Add user turn
    const updatedContext = contextManager.current.addTurn(
      context,
      'user',
      message
    );
    
    // Process input through state machine
    const result = await stateMachine.current.processUserInput(
      message,
      updatedContext
    );
    
    // Add assistant turn
    const finalContext = contextManager.current.addTurn(
      updatedContext,
      'assistant',
      result.response
    );
    
    setContext(finalContext);
    
    // Check for proactive help opportunities
    const opportunities = await proactiveEngine.current.analyzeUserBehavior(finalContext);
    // Handle opportunities...
    
    return result.response;
  };
  
  return (
    <div className="chatbot">
      {/* Your UI */}
    </div>
  );
};
```

---

## Configuration

### Intent Classifier Configuration

```typescript
// Customize intent patterns in src/services/nlp/intentClassifier.ts
// Example: Add new intent
export enum IntentType {
  // ... existing intents
  FAQ_VEGAN = 'faq_vegan', // NEW
}

// Add keyword patterns
if (/(vegan|végétarien|vegetarian|plant.*based)/i.test(tokenString)) {
  scores[IntentType.FAQ_VEGAN] = 0.85;
}
```

### Context Window Configuration

```typescript
// Adjust token budget in src/services/chat/contextManager.ts
class ContextWindowManager {
  private maxTokens = 6000; // Increase to 6000 tokens
  private summaryThreshold = 0.75; // Summarize at 75% usage
  private minKeptTurns = 10; // Keep last 10 turns always
}
```

### LLM Configuration

```typescript
// Change model in src/services/chat/llmResponseGenerator.ts
const response = await callLLM({
  model: 'gpt-4-turbo-preview', // Switch to GPT-4
  max_tokens: 500, // Longer responses
  temperature: 0.7, // More creative
});
```

---

## Testing

### Unit Tests

```typescript
// __tests__/intentClassifier.test.ts
import { classifyIntent } from '@/services/nlp/intentClassifier';

describe('Intent Classifier', () => {
  test('detects HALAL FAQ intent', async () => {
    const result = await classifyIntent('Est-ce que votre viande est halal?');
    expect(result.primary.intent).toBe('faq_halal');
    expect(result.primary.confidence).toBeGreaterThan(0.7);
  });
  
  test('detects complaint with negative sentiment', async () => {
    const result = await classifyIntent('Ma commande est mauvaise et froide!');
    expect(result.primary.intent).toBe('complaint');
    expect(result.sentiment.polarity).toBe('negative');
    expect(result.escalationFlag).toBe(true);
  });
});
```

### Integration Tests

```typescript
// __tests__/stateMachine.test.ts
import { ConversationStateMachine } from '@/services/chat/conversationStateMachine';

describe('State Machine', () => {
  test('transitions from ACTIVE to FAQ_MODE', async () => {
    const stateMachine = new ConversationStateMachine();
    const context = createMockContext();
    
    const result = await stateMachine.processUserInput(
      'Quelles sont vos heures d\'ouverture?',
      context
    );
    
    expect(result.newState).toBe('faq_mode');
    expect(result.response).toContain('Nos horaires');
  });
});
```

---

## Deployment

### Week 1: Intent Classification + Templates
- ✅ Deploy `intentClassifier.ts`
- ✅ Deploy `responseTemplates.ts`
- Test with FAQ queries

### Week 2: Context Management + LLM
- ✅ Deploy `contextManager.ts`
- ✅ Deploy `llmResponseGenerator.ts`
- Configure API keys
- Test with multi-turn conversations

### Week 3: State Machine + Escalation
- ✅ Deploy `conversationStateMachine.ts`
- Integrate with support ticket system
- Test escalation flows

### Week 4: Proactive Help + Analytics
- ✅ Deploy `proactiveHelp.ts`
- Integrate behavior tracking
- Set up monitoring dashboards

### Week 5: Production Hardening
- Load testing (100+ concurrent users)
- Error monitoring (Sentry)
- Performance optimization
- A/B testing different prompts

---

## Performance Optimization

### 1. Caching Intent Classification Results
```typescript
const intentCache = new Map<string, IntentResult>();

async function classifyIntentCached(message: string): Promise<IntentResult> {
  const cacheKey = message.toLowerCase().trim();
  if (intentCache.has(cacheKey)) {
    return intentCache.get(cacheKey)!;
  }
  
  const result = await classifyIntent(message);
  intentCache.set(cacheKey, result);
  return result;
}
```

### 2. Lazy Load LLM (Only When Needed)
```typescript
// Only call LLM if templates don't cover the intent
const template = findResponseTemplate(intent, context);
if (template) {
  return renderResponse(template, context); // Fast path
}

// Fallback to LLM
return await generateLLMResponse(...); // Slow path
```

### 3. Batch Context Updates
```typescript
// Instead of updating context on every message
// Batch updates every 5 messages or 30 seconds
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Intent Accuracy**: % of correctly classified intents
2. **Response Time**: Avg time from user message to bot response
3. **Template Usage**: % responses from templates vs LLM
4. **Escalation Rate**: % conversations escalated to agents
5. **User Satisfaction**: Feedback scores (1-5 stars)
6. **LLM Cost**: $ per conversation
7. **Proactive Help Effectiveness**: % users who accept proactive suggestions

### Logging Example

```typescript
// Log every intent classification
console.log('[Intent]', {
  sessionId: context.sessionId,
  message: userMessage.substring(0, 50),
  intent: intentResult.primary.intent,
  confidence: intentResult.primary.confidence,
  sentiment: intentResult.sentiment.polarity,
  escalationFlag: intentResult.escalationFlag,
});
```

---

## Troubleshooting

### Issue: Intent Confidence Always Low

**Cause:** Keyword patterns too specific or missing.

**Fix:** Expand keyword patterns in `computeIntentScores()`:
```typescript
// Add more variations
if (/(order|commander|acheter|bestellen|kopen|buy|get)/i.test(tokenString)) {
  scores[IntentType.FAQ_ORDERING] = 0.75;
}
```

### Issue: LLM Responses Too Long

**Cause:** `max_tokens` set too high.

**Fix:** Reduce `max_tokens` in `llmResponseGenerator.ts`:
```typescript
const response = await callLLM({
  max_tokens: 200, // Reduced from 300
});
```

### Issue: Context Window Exceeds Budget

**Cause:** Too many turns kept in memory.

**Fix:** Reduce `minKeptTurns` or increase summarization threshold:
```typescript
class ContextWindowManager {
  private minKeptTurns = 3; // Keep only last 3 turns
  private summaryThreshold = 0.6; // Summarize at 60% usage
}
```

### Issue: Proactive Help Too Intrusive

**Cause:** Min interval too short.

**Fix:** Increase min interval in `shouldShowProactiveHelp()`:
```typescript
const minInterval = 5 * 60 * 1000; // 5 minutes (up from 2)
```

---

## Next Steps

1. **Add Embeddings**: Integrate OpenAI `text-embedding-3-small` or Supabase pgvector for semantic search
2. **Train Custom NER**: Use spaCy or Hugging Face to extract entities more accurately
3. **A/B Test Prompts**: Experiment with different system prompts to improve quality
4. **Multi-Language**: Expand templates and patterns for Dutch and English
5. **Agent Dashboard**: Build real-time agent interface to handle escalations
6. **Voice Integration**: Add Whisper API for voice-to-text input

---

**Documentation Version:** 4.0  
**Last Updated:** January 20, 2026  
**Maintainer:** Tasty Food Development Team
