/**
 * Intent Classification Engine
 * Multi-layer system for understanding user intent with entity extraction and sentiment analysis
 */

import type { ConversationContext } from '../chat/contextManager';

export enum IntentType {
  // FAQ / Knowledge
  FAQ_HALAL = 'faq_halal',
  FAQ_CERTIFICATIONS = 'faq_certifications',
  FAQ_HOURS = 'faq_hours',
  FAQ_ORDERING = 'faq_ordering',
  FAQ_INGREDIENTS = 'faq_ingredients',
  FAQ_MENU = 'faq_menu',
  FAQ_DELIVERY = 'faq_delivery',
  
  // Operations
  TRACK_ORDER = 'track_order',
  ORDER_STATUS = 'order_status',
  DELIVERY_TIME = 'delivery_time',
  
  // Support
  COMPLAINT = 'complaint',
  REFUND = 'refund',
  MISSING_ITEM = 'missing_item',
  WRONG_ORDER = 'wrong_order',
  QUALITY_ISSUE = 'quality_issue',
  
  // Account & Preferences
  ACCOUNT = 'account',
  ALLERGIES = 'allergies',
  PREFERENCES = 'preferences',
  
  // Escalation
  CONTACT_SUPPORT = 'contact_support',
  SPEAK_AGENT = 'speak_agent',
  
  // Meta
  GREETING = 'greeting',
  UNCLEAR = 'unclear',
  OUT_OF_SCOPE = 'out_of_scope',
}

export interface IntentResult {
  primary: {
    intent: IntentType;
    confidence: number; // 0-1
    tokens: string[];
  };
  alternatives: Array<{ intent: IntentType; confidence: number }>;
  entities: EntityExtraction;
  sentiment: SentimentScore;
  requiresContext: boolean; // whether to load historical context
  escalationFlag: boolean; // if true, prepare for handoff
}

export interface EntityExtraction {
  orderNumber?: string;
  platform?: 'ubereats' | 'deliveroo' | 'takeaway' | 'website';
  branch?: string;
  email?: string;
  phone?: string;
  allergens?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface SentimentScore {
  polarity: 'positive' | 'neutral' | 'negative';
  intensity: number; // -1 to 1
  hasComplaint: boolean;
  hasUrgency: boolean;
}

/**
 * Pipeline:
 * 1. Tokenization & normalization
 * 2. Entity extraction (regex + NER model)
 * 3. Semantic embedding (use text-embedding-3-small or CLIP for speed)
 * 4. Intent classification (cosine similarity or small DistilBERT)
 * 5. Confidence thresholding
 */
export async function classifyIntent(
  userMessage: string,
  context?: ConversationContext
): Promise<IntentResult> {
  // Step 1: Tokenize & normalize
  const normalized = userMessage.toLowerCase().trim();
  const tokens = normalized.split(/\s+/);
  
  // Step 2: Extract entities (regex patterns)
  const entities = extractEntities(normalized, context);
  
  // Step 3: Get semantic embedding (outsource to Claude API or local embedding model)
  const embedding = await getEmbedding(userMessage);
  
  // Step 4: Intent matching via cosine similarity to intent templates
  const intentScores = await computeIntentScores(embedding, tokens, context);
  const primary = intentScores.find(s => s.confidence > 0.4) || {
    intent: IntentType.UNCLEAR,
    confidence: 0.0,
  };
  
  // Step 5: Sentiment & urgency analysis
  const sentiment = analyzeSentiment(normalized, entities);
  
  // Step 6: Decide if escalation needed
  const escalationFlag = 
    sentiment.hasComplaint || 
    sentiment.intensity < -0.7 ||
    entities.priority === 'urgent';
  
  return {
    primary: {
      ...primary,
      tokens,
    },
    alternatives: intentScores.slice(1, 3),
    entities,
    sentiment,
    requiresContext: [
      IntentType.ORDER_STATUS,
      IntentType.TRACK_ORDER,
      IntentType.COMPLAINT,
      IntentType.REFUND,
    ].includes(primary.intent),
    escalationFlag,
  };
}

function extractEntities(text: string, context?: ConversationContext): EntityExtraction {
  const entities: EntityExtraction = {};
  
  // Order number (format: platform-specific patterns)
  const orderMatch = text.match(/order\s*#?(\d{8,12})|tracking\s*#?(\d{8,12})/i);
  if (orderMatch) {
    entities.orderNumber = orderMatch[1] || orderMatch[2];
  }
  
  // Platform detection
  if (/uber\s*eats?|ubereats/i.test(text)) {
    entities.platform = 'ubereats';
  } else if (/deliveroo/i.test(text)) {
    entities.platform = 'deliveroo';
  } else if (/takeaway|just\s*eat/i.test(text)) {
    entities.platform = 'takeaway';
  }
  
  // Branch detection
  const branches = ['angleur', 'saint-gilles', 'wandre', 'seraing', 'jemeppe'];
  entities.branch = branches.find(b => text.includes(b));
  
  // Email detection
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    entities.email = emailMatch[0];
  }
  
  // Phone detection
  const phoneMatch = text.match(/\+?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}/);
  if (phoneMatch) {
    entities.phone = phoneMatch[0];
  }
  
  // Allergen detection
  const allergenPatterns = [
    'peanut', 'nut', 'gluten', 'dairy', 'soy', 'shellfish', 'sesame',
    'lactose', 'egg', 'wheat', 'fish'
  ];
  entities.allergens = allergenPatterns.filter(a => 
    new RegExp(`\\b${a}\\b`, 'i').test(text)
  );
  
  // Priority flag
  if (/urgent|asap|immediately|now|emergency/i.test(text)) {
    entities.priority = 'urgent';
  } else if (/problem|issue|wrong|missing|complaint/i.test(text)) {
    entities.priority = 'high';
  } else if (/question|wondering|curious/i.test(text)) {
    entities.priority = 'low';
  } else {
    entities.priority = 'normal';
  }
  
  // Use context to fill in missing entities
  if (context) {
    if (!entities.branch && context.metadata.currentBranch) {
      entities.branch = context.metadata.currentBranch;
    }
    if (!entities.platform && context.metadata.currentPlatform) {
      entities.platform = context.metadata.currentPlatform;
    }
  }
  
  return entities;
}

function analyzeSentiment(text: string, entities: EntityExtraction): SentimentScore {
  // Simple heuristic; can be replaced with a small transformer model
  const negativeWords = /wrong|missing|bad|terrible|never|refuse|angry|rude|unhappy|disappointed|awful|horrible|worst|hate|disgusting/i;
  const positiveWords = /great|love|excellent|thank|appreciated|happy|amazing|perfect|wonderful|fantastic|delicious|best/i;
  const urgencyWords = /urgent|asap|now|immediately|waiting|stuck|help|please|emergency/i;
  const complaintWords = /problem|issue|complaint|refund|money\s*back|cancel|disappointed|unacceptable/i;
  
  const hasNegative = negativeWords.test(text);
  const hasPositive = positiveWords.test(text);
  const hasUrgency = urgencyWords.test(text);
  const hasComplaint = complaintWords.test(text) || 
                       entities.priority === 'high' || 
                       entities.priority === 'urgent';
  
  let polarity: 'positive' | 'neutral' | 'negative' = 'neutral';
  let intensity = 0;
  
  if (hasNegative && hasComplaint) {
    polarity = 'negative';
    intensity = -0.9;
  } else if (hasNegative) {
    polarity = 'negative';
    intensity = -0.6;
  } else if (hasPositive) {
    polarity = 'positive';
    intensity = 0.7;
  }
  
  // Boost negative intensity if multiple negative indicators
  const negativeCount = (text.match(negativeWords) || []).length;
  if (negativeCount > 2) {
    intensity = Math.max(-1, intensity - 0.2);
  }
  
  return {
    polarity,
    intensity,
    hasComplaint,
    hasUrgency,
  };
}

async function getEmbedding(text: string): Promise<number[]> {
  // TODO: Integrate with OpenAI's text-embedding-3-small for speed/cost balance
  // Or use Supabase pgvector with a local model (all-MiniLM-L6-v2)
  // For now, return dummy; integrate your preferred embedder
  
  // Example integration with OpenAI (when implemented):
  // const response = await fetch('https://api.openai.com/v1/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'text-embedding-3-small',
  //     input: text,
  //   }),
  // });
  // const data = await response.json();
  // return data.data[0].embedding;
  
  return Array(384).fill(0); // placeholder
}

async function computeIntentScores(
  embedding: number[],
  tokens: string[],
  context?: ConversationContext
): Promise<Array<{ intent: IntentType; confidence: number }>> {
  // Compute cosine similarity between user embedding and intent template embeddings
  // For simplicity, use token-based scoring + embedding distance
  
  const scores: Record<string, number> = {};
  
  // Initialize all intents with 0
  Object.values(IntentType).forEach(intent => {
    scores[intent] = 0;
  });
  
  // Token-based boosting (keyword matching with multi-language support)
  const tokenString = tokens.join(' ');
  
  // Greetings
  if (/^(hi|hello|hey|bonjour|salut|hallo|hoi|good\s*(morning|afternoon|evening))$/i.test(tokenString)) {
    scores[IntentType.GREETING] = 0.95;
  }
  
  // HALAL-related queries (FR/EN/NL)
  if (/(halal|haram|islamic|muslim|viande|meat|vlees|certif)/i.test(tokenString)) {
    scores[IntentType.FAQ_HALAL] = 0.85;
    scores[IntentType.FAQ_CERTIFICATIONS] = 0.75;
  }
  
  // Order tracking
  if (/(track|where|status|delivery|arrived|livraison|suivi|suivre|volgen|bezorging)/i.test(tokenString)) {
    scores[IntentType.TRACK_ORDER] = 0.80;
    scores[IntentType.ORDER_STATUS] = 0.75;
    scores[IntentType.DELIVERY_TIME] = 0.70;
  }
  
  // Complaints and issues
  if (/(wrong|missing|problem|issue|complaint|manque|problème|erreur|verkeerd|ontbreekt)/i.test(tokenString)) {
    scores[IntentType.COMPLAINT] = 0.80;
    
    if (/(missing|manque|ontbreekt)/i.test(tokenString)) {
      scores[IntentType.MISSING_ITEM] = 0.90;
    }
    if (/(wrong|erreur|verkeerd)/i.test(tokenString)) {
      scores[IntentType.WRONG_ORDER] = 0.90;
    }
    if (/(quality|bad|terrible|awful|mauvais|slecht)/i.test(tokenString)) {
      scores[IntentType.QUALITY_ISSUE] = 0.85;
    }
  }
  
  // Refund requests
  if (/(refund|money.*back|remboursement|rembourser|terugbetaling)/i.test(tokenString)) {
    scores[IntentType.REFUND] = 0.85;
  }
  
  // Ordering questions
  if (/(order|how.*buy|how.*get|purchase|commander|acheter|bestellen|kopen)/i.test(tokenString)) {
    scores[IntentType.FAQ_ORDERING] = 0.75;
  }
  
  // Hours/opening times
  if (/(open|hours|time|ferme|ouvert|horaire|geopend|sluit|uur)/i.test(tokenString)) {
    scores[IntentType.FAQ_HOURS] = 0.85;
  }
  
  // Menu questions
  if (/(menu|what.*have|items|burger|fries|carte|plat|gerecht|hamburger)/i.test(tokenString)) {
    scores[IntentType.FAQ_MENU] = 0.80;
  }
  
  // Ingredients/allergens
  if (/(ingredient|contain|allerg|gluten|lactose|ingrédient|contient|bevat|allergisch)/i.test(tokenString)) {
    scores[IntentType.FAQ_INGREDIENTS] = 0.85;
    scores[IntentType.ALLERGIES] = 0.80;
  }
  
  // Contact/support
  if (/(contact|support|help|agent|speak|human|aide|parler|quelqu'un|hulp|spreken)/i.test(tokenString)) {
    scores[IntentType.CONTACT_SUPPORT] = 0.75;
    scores[IntentType.SPEAK_AGENT] = 0.80;
  }
  
  // Boost scores based on context
  if (context) {
    // If user previously asked about tracking, boost tracking-related intents
    const recentTrackingAttempts = context.turns
      .slice(-5)
      .filter(t => t.intent?.primary.intent === IntentType.TRACK_ORDER)
      .length;
    
    if (recentTrackingAttempts > 0) {
      scores[IntentType.TRACK_ORDER] = Math.min(1, (scores[IntentType.TRACK_ORDER] || 0) + 0.15);
      scores[IntentType.ORDER_STATUS] = Math.min(1, (scores[IntentType.ORDER_STATUS] || 0) + 0.15);
    }
    
    // If user previously had complaints, boost complaint-related intents
    if (context.metadata.resolvedIntents.has(IntentType.COMPLAINT)) {
      scores[IntentType.REFUND] = Math.min(1, (scores[IntentType.REFUND] || 0) + 0.1);
      scores[IntentType.SPEAK_AGENT] = Math.min(1, (scores[IntentType.SPEAK_AGENT] || 0) + 0.1);
    }
  }
  
  // Convert to sorted array
  return Object.entries(scores)
    .map(([intent, confidence]) => ({ 
      intent: intent as IntentType, 
      confidence 
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .filter(x => x.confidence > 0.1);
}

/**
 * Utility: Check if intent requires immediate escalation
 */
export function requiresImmediateEscalation(intent: IntentResult): boolean {
  return (
    intent.escalationFlag ||
    intent.sentiment.intensity < -0.8 ||
    intent.entities.priority === 'urgent' ||
    [IntentType.SPEAK_AGENT, IntentType.REFUND, IntentType.COMPLAINT].includes(
      intent.primary.intent
    )
  );
}

/**
 * Utility: Get human-readable intent description
 */
export function getIntentDescription(intent: IntentType): string {
  const descriptions: Record<IntentType, string> = {
    [IntentType.FAQ_HALAL]: 'HALAL certification inquiry',
    [IntentType.FAQ_CERTIFICATIONS]: 'Certifications and credentials',
    [IntentType.FAQ_HOURS]: 'Opening hours',
    [IntentType.FAQ_ORDERING]: 'How to order',
    [IntentType.FAQ_INGREDIENTS]: 'Ingredients and composition',
    [IntentType.FAQ_MENU]: 'Menu items',
    [IntentType.FAQ_DELIVERY]: 'Delivery information',
    [IntentType.TRACK_ORDER]: 'Order tracking',
    [IntentType.ORDER_STATUS]: 'Order status check',
    [IntentType.DELIVERY_TIME]: 'Delivery time estimate',
    [IntentType.COMPLAINT]: 'General complaint',
    [IntentType.REFUND]: 'Refund request',
    [IntentType.MISSING_ITEM]: 'Missing item report',
    [IntentType.WRONG_ORDER]: 'Wrong order received',
    [IntentType.QUALITY_ISSUE]: 'Quality concern',
    [IntentType.ACCOUNT]: 'Account management',
    [IntentType.ALLERGIES]: 'Allergy inquiry',
    [IntentType.PREFERENCES]: 'Dietary preferences',
    [IntentType.CONTACT_SUPPORT]: 'Contact support',
    [IntentType.SPEAK_AGENT]: 'Request human agent',
    [IntentType.GREETING]: 'Greeting',
    [IntentType.UNCLEAR]: 'Unclear intent',
    [IntentType.OUT_OF_SCOPE]: 'Out of scope',
  };
  
  return descriptions[intent] || 'Unknown intent';
}
