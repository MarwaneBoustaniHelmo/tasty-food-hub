// ==========================================
// CHATBOT PROMPT BUILDER
// Intelligent context construction for Gemini
// ==========================================

import type { Location } from "../src/data/locations";
import type { ChatbotMenuItem, MenuCombo } from "../src/data/chatbotMenu";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatContext {
  userQuery: string;
  conversationHistory: ChatMessage[];
  userLocale: string;
  relevantMenu: ChatbotMenuItem[];
  relevantLocations: Location[];
  suggestedCombos?: MenuCombo[];
  userIntent?: string;
}

/**
 * Build enhanced system prompt with grounded data
 */
export function buildSystemPrompt(context: {
  locations: Location[];
  popularItems: ChatbotMenuItem[];
  menuCategories: string[];
}): string {
  const { locations, popularItems, menuCategories } = context;

  const dineInLocations = locations
    .filter((loc) => loc.type === "dine-in")
    .map(
      (loc) =>
        `- ${loc.name}: ${loc.address}, ${loc.city} ${loc.postalCode}\n  Heures: Déjeuner ${loc.hours.lunch}, Dîner ${loc.hours.dinner}\n  ${loc.services.reservations ? "✅ Réservations acceptées" : "❌ Pas de réservations"}`
    )
    .join("\n");

  const deliveryLocations = locations
    .filter((loc) => loc.type === "delivery-only")
    .map(
      (loc) =>
        `- ${loc.name}: Livraison via ${loc.platforms.map((p) => p.name).join(", ")}\n  Zone: ${loc.city}`
    )
    .join("\n");

  const popularItemsList = popularItems
    .map((item) => `- ${item.name}: ${item.description} (${item.price}€)`)
    .join("\n");

  return `Tu es "Crousty", l'assistant conversationnel intelligent de Tasty Food à Liège, Belgique.

🎯 TON RÔLE
Tu aides les clients à :
1. Choisir parmi nos burgers halal smashés, loaded fries et tacos
2. Réserver une table dans l'un de nos 4 restaurants
3. Commander en livraison via nos plateformes partenaires
4. Obtenir des infos sur horaires, localisations, et menu

✅ TU DOIS TOUJOURS
- Répondre en français par défaut (ou dans la langue du client)
- Être concis (2-3 phrases max par réponse)
- Poser UNE question claire si tu as besoin d'info
- Suggérer des actions concrètes (réserver, commander, voir menu)
- Utiliser des emojis avec parcimonie (🍔 🍟 📍 ⏰)

❌ TU NE DOIS JAMAIS
- Inventer des informations sur prix ou disponibilité
- Parler de sujets non-liés au restaurant
- Donner des conseils médicaux ou nutritionnels détaillés
- Répondre à des questions politiques/religieuses/sensibles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 NOS 4 RESTAURANTS (Sur place)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${dineInLocations}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 LIVRAISON (Crousty by Tasty)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${deliveryLocations}

⚠️ IMPORTANT: Les restaurants "Tasty Food" NE font PAS de livraison - c'est uniquement sur place ou à emporter. Pour la livraison, c'est "Crousty by Tasty" sur les plateformes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍔 MENU (Aperçu des best-sellers)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${popularItemsList}

Catégories disponibles: ${menuCategories.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 GESTION DES CONVERSATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLUX RÉSERVATION:
1. Demander: Quel restaurant ? (Seraing/Angleur/Saint-Gilles/Wandre)
2. Demander: Quel jour ? (Aujourd'hui/Demain/Date précise)
3. Demander: Quelle heure ? (Déjeuner 12h-14h30 ou Dîner 19h-23h)
4. Demander: Combien de personnes ?
5. Demander: Nom et contact (téléphone ou email)
6. Confirmer: "Parfait ! Votre table pour X personnes..."

FLUX LIVRAISON:
1. Demander: Dans quel quartier êtes-vous ? (Seraing/Angleur/etc.)
2. Proposer: Les plateformes disponibles pour cette zone
3. Donner: Le lien direct pour commander

FLUX MENU:
1. Demander: Qu'est-ce qui vous fait envie ? (Burgers/Frites/Tacos/Budget)
2. Suggérer: 2-3 options adaptées
3. Proposer: Des accompagnements ou formules

FLUX FEEDBACK:
1. Écouter attentivement
2. Reformuler: "Si je comprends bien..."
3. Remercier sincèrement
4. Demander: "Autre chose que je peux faire ?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 FORMAT DE RÉPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

À la FIN de chaque réponse, ajoute un JSON de contexte (invisible au client):

<!--META
{
  "intent": "[reservation|delivery|menu_info|hours|location|feedback|other]",
  "location": "[seraing|angleur|saint-gilles|wandre|null]",
  "service_type": "[dine_in|delivery|both|unknown]",
  "next_step": "[ask_date|ask_time|provide_link|suggest_items|null]"
}
-->

EXEMPLE DE RÉPONSE:
"Vous voulez réserver à Seraing ? Super ! Pour quel jour souhaitez-vous venir ? 📅"

<!--META
{
  "intent": "reservation",
  "location": "seraing",
  "service_type": "dine_in",
  "next_step": "ask_date"
}
-->`;
}

/**
 * Build user prompt with conversation context
 */
export function buildUserPrompt(context: ChatContext): string {
  const {
    userQuery,
    conversationHistory,
    relevantMenu,
    relevantLocations,
    suggestedCombos,
  } = context;

  let prompt = "";

  // Add recent conversation history (last 5 exchanges)
  if (conversationHistory.length > 0) {
    prompt += "HISTORIQUE DE CONVERSATION:\n";
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      prompt += `${msg.role === "user" ? "Client" : "Crousty"}: ${msg.content}\n`;
    }
    prompt += "\n";
  }

  // Add relevant menu items if available
  if (relevantMenu && relevantMenu.length > 0) {
    prompt += "ARTICLES PERTINENTS DU MENU:\n";
    for (const item of relevantMenu.slice(0, 5)) {
      prompt += `- ${item.name}: ${item.description} (${item.price}€)\n`;
      if (item.tags.length > 0) {
        prompt += `  Tags: ${item.tags.join(", ")}\n`;
      }
    }
    prompt += "\n";
  }

  // Add relevant locations
  if (relevantLocations && relevantLocations.length > 0) {
    prompt += "LOCALISATIONS PERTINENTES:\n";
    for (const loc of relevantLocations) {
      prompt += `- ${loc.name}: ${loc.address}, ${loc.city}\n`;
      if (loc.type === "dine-in") {
        prompt += `  Heures: ${loc.hours.lunch} & ${loc.hours.dinner}\n`;
      } else {
        prompt += `  Livraison via: ${loc.platforms.map((p) => p.name).join(", ")}\n`;
      }
    }
    prompt += "\n";
  }

  // Add suggested combos
  if (suggestedCombos && suggestedCombos.length > 0) {
    prompt += "FORMULES SUGGÉRÉES:\n";
    for (const combo of suggestedCombos) {
      prompt += `- ${combo.name}: ${combo.description} (${combo.totalPrice}€ au lieu de ${combo.totalPrice + combo.savings}€)\n`;
    }
    prompt += "\n";
  }

  // Add the actual user query
  prompt += `NOUVELLE QUESTION DU CLIENT:\n${userQuery}\n\n`;
  prompt +=
    "INSTRUCTIONS: Réponds de manière concise et utile en te basant sur le contexte ci-dessus. N'invente rien.";

  return prompt;
}

/**
 * Extract metadata from assistant response
 */
export function extractMetadata(
  response: string
): Record<string, any> | null {
  const metaMatch = response.match(/<!--META\s*([\s\S]*?)-->/);

  if (!metaMatch) return null;

  try {
    return JSON.parse(metaMatch[1]);
  } catch {
    return null;
  }
}

/**
 * Clean response by removing metadata comments
 */
export function cleanResponse(response: string): string {
  return response.replace(/<!--META[\s\S]*?-->/g, "").trim();
}
