// ==========================================
// CHATBOT INTELLIGENCE LAYER
// Query analysis and context preparation
// ==========================================

import {
  chatbotMenu,
  findItemsByTag,
  findItemsByBudget,
  suggestComboForBudget,
  getPopularItems,
  searchMenuByName,
  type ChatbotMenuItem,
  type MenuCombo,
} from "../src/data/chatbotMenu.js";

import {
  locations,
  findLocationsByCity,
  getDineInLocations,
  getDeliveryLocations,
  type Location,
} from "../src/data/locations.js";

export interface QueryAnalysis {
  intent:
    | "reservation"
    | "delivery"
    | "menu_query"
    | "location_info"
    | "hours"
    | "feedback"
    | "general";
  confidence: number;
  keywords: string[];
  mentionedItems: string[];
  mentionedLocations: string[];
  budget?: number;
  preferences: string[];
}

/**
 * Analyze user query to determine intent and extract entities
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const lowerQuery = query.toLowerCase();

  // Initialize analysis
  const analysis: QueryAnalysis = {
    intent: "general",
    confidence: 0.5,
    keywords: [],
    mentionedItems: [],
    mentionedLocations: [],
    preferences: [],
  };

  // Intent detection patterns
  const intentPatterns = {
    reservation: /\b(réserv|table|book|rendez-vous|place|dîner|déjeuner)\b/i,
    delivery: /\b(livraison|deliver|commande|order|uber|deliveroo|takeaway)\b/i,
    menu_query: /\b(menu|manger|burger|frites|tacos|prix|coût|combien|recommend|suggest)\b/i,
    location_info: /\b(adresse|où|where|localisation|quartier|proche|près)\b/i,
    hours: /\b(heure|ouvert|open|ferme|close|horaire)\b/i,
    feedback: /\b(avis|feedback|complaint|problème|satisfait|content|déçu)\b/i,
  };

  // Detect intent
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(lowerQuery)) {
      analysis.intent = intent as QueryAnalysis["intent"];
      analysis.confidence = 0.8;
      break;
    }
  }

  // Extract budget if mentioned
  const budgetMatch = lowerQuery.match(/(\d+)\s*€|budget.*?(\d+)|(\d+)\s*euros?/i);
  if (budgetMatch) {
    analysis.budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]);
  }

  // Extract location mentions
  const locationNames = [
    "seraing",
    "angleur",
    "saint-gilles",
    "wandre",
    "jemeppe",
    "liège",
  ];
  for (const locName of locationNames) {
    if (lowerQuery.includes(locName)) {
      analysis.mentionedLocations.push(locName);
    }
  }

  // Extract menu item mentions
  for (const item of chatbotMenu) {
    if (
      lowerQuery.includes(item.name.toLowerCase()) ||
      (item.nameEn && lowerQuery.includes(item.nameEn.toLowerCase()))
    ) {
      analysis.mentionedItems.push(item.id);
    }
  }

  // Extract preferences
  const preferencePatterns = {
    spicy: /\b(épicé|spicy|piquant|hot)\b/i,
    vegetarian: /\b(végétarien|vegetarian|veggie|sans viande)\b/i,
    chicken: /\b(poulet|chicken)\b/i,
    beef: /\b(boeuf|beef|viande)\b/i,
    cheese: /\b(fromage|cheese|cheddar)\b/i,
  };

  for (const [pref, pattern] of Object.entries(preferencePatterns)) {
    if (pattern.test(lowerQuery)) {
      analysis.preferences.push(pref);
    }
  }

  return analysis;
}

/**
 * Prepare relevant context based on query analysis
 */
export function prepareContext(analysis: QueryAnalysis): {
  relevantMenu: ChatbotMenuItem[];
  relevantLocations: Location[];
  suggestedCombos: MenuCombo[];
} {
  const context = {
    relevantMenu: [] as ChatbotMenuItem[],
    relevantLocations: [] as Location[],
    suggestedCombos: [] as MenuCombo[],
  };

  // Menu context
  if (analysis.intent === "menu_query") {
    // If specific items mentioned, include them
    if (analysis.mentionedItems.length > 0) {
      context.relevantMenu = chatbotMenu.filter((item) =>
        analysis.mentionedItems.includes(item.id)
      );
    }

    // Add items matching preferences
    for (const pref of analysis.preferences) {
      context.relevantMenu.push(...findItemsByTag(pref));
    }

    // If budget specified, suggest items within budget
    if (analysis.budget) {
      const budgetItems = findItemsByBudget(analysis.budget);
      context.relevantMenu.push(...budgetItems.slice(0, 5));

      // Suggest combo if budget allows
      const combo = suggestComboForBudget(analysis.budget);
      if (combo) {
        context.suggestedCombos.push(combo);
      }
    }

    // If no specific context, show popular items
    if (context.relevantMenu.length === 0) {
      context.relevantMenu = getPopularItems();
    }

    // Remove duplicates
    context.relevantMenu = Array.from(
      new Map(context.relevantMenu.map((item) => [item.id, item])).values()
    ).slice(0, 10);
  }

  // Location context
  if (
    analysis.intent === "reservation" ||
    analysis.intent === "location_info" ||
    analysis.intent === "hours"
  ) {
    if (analysis.mentionedLocations.length > 0) {
      for (const locName of analysis.mentionedLocations) {
        context.relevantLocations.push(...findLocationsByCity(locName));
      }
    } else {
      // Show dine-in locations for reservations
      context.relevantLocations = getDineInLocations();
    }
  }

  if (analysis.intent === "delivery") {
    if (analysis.mentionedLocations.length > 0) {
      for (const locName of analysis.mentionedLocations) {
        const deliveryLocs = getDeliveryLocations().filter((loc) =>
          loc.city.toLowerCase().includes(locName)
        );
        context.relevantLocations.push(...deliveryLocs);
      }
    } else {
      // Show all delivery options
      context.relevantLocations = getDeliveryLocations();
    }
  }

  return context;
}

/**
 * Get smart suggestions based on query
 */
export function getSmartSuggestions(analysis: QueryAnalysis): string[] {
  const suggestions: string[] = [];

  switch (analysis.intent) {
    case "reservation":
      suggestions.push(
        "Réserver une table à Seraing",
        "Voir les horaires d'Angleur",
        "Table pour ce soir"
      );
      break;

    case "delivery":
      suggestions.push(
        "Commander via Uber Eats",
        "Voir les zones de livraison",
        "Quel est le délai de livraison ?"
      );
      break;

    case "menu_query":
      suggestions.push(
        "Quels sont vos best-sellers ?",
        "Menu pour 2 personnes à 25€",
        "Options végétariennes disponibles ?"
      );
      break;

    case "location_info":
      suggestions.push(
        "Restaurant le plus proche de moi",
        "Adresse de Tasty Food Wandre",
        "Comment venir en transport ?"
      );
      break;

    case "hours":
      suggestions.push(
        "Ouvert le dimanche ?",
        "Horaires de déjeuner",
        "Jusqu'à quelle heure ce soir ?"
      );
      break;

    default:
      suggestions.push(
        "Réserver une table",
        "Voir le menu",
        "Commander en livraison"
      );
  }

  return suggestions;
}
