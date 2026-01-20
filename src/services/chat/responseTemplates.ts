/**
 * Response Template System
 * Minimize hallucinations by using pre-validated templates for common intents
 */

import type { ConversationContext } from './contextManager';
import type { IntentResult, IntentType, EntityExtraction } from '../nlp/intentClassifier';

export interface ResponseTemplate {
  id: string;
  intent: IntentType;
  condition?: (context: ConversationContext, intent: IntentResult) => boolean;
  template: string | ((context: ConversationContext, entities: EntityExtraction) => string);
  suggestions?: string[]; // next steps user can take
  metadata?: {
    canEscalate: boolean;
    priority: number;
    tags: string[];
  };
}

const TEMPLATES: ResponseTemplate[] = [
  // HALAL & Certifications
  {
    id: 'faq_halal_main',
    intent: 'faq_halal' as IntentType,
    template: `Oui, **Tasty Food est 100% HALAL certifié** 🟢

Tous nos produits sont certifiés HALAL par l'AVS (Association of Verification Services), l'organisme officiel belge de certification HALAL.

**Détails:**
• Viande (bœuf, poulet, agneau): 100% HALAL certifiée
• Poisson: Frais et conforme HALAL
• Préparation: Zones dédiées pour éviter toute contamination croisée

Vous avez d'autres questions sur nos certifications?`,
    suggestions: ['Voir notre menu HALAL', 'Commander maintenant', 'Appeler le restaurant'],
    metadata: { canEscalate: false, priority: 10, tags: ['faq', 'dietary', 'certification'] },
  },
  
  {
    id: 'faq_certifications',
    intent: 'faq_certifications' as IntentType,
    template: `**Nos certifications officielles:**

🟢 **HALAL**: Certifié par AVS Belgium (100% de nos viandes)
✅ **Hygiène**: Agence Fédérale pour la Sécurité de la Chaîne Alimentaire (AFSCA)
🌱 **Options végétariennes**: Disponibles sur demande

Tous nos certificats sont affichés en restaurant et disponibles sur demande. Souhaitez-vous commander ou en savoir plus?`,
    suggestions: ['Commander', 'Questions sur les ingrédients', 'Appeler'],
    metadata: { canEscalate: false, priority: 9, tags: ['faq', 'certification'] },
  },
  
  // Order Tracking
  {
    id: 'track_order_ubereats',
    intent: 'track_order' as IntentType,
    condition: (ctx, intent) => intent.entities.platform === 'ubereats',
    template: (ctx, entities) => {
      const orderNum = entities.orderNumber || '[votre numéro de commande]';
      return `**Pour suivre votre commande Uber Eats:**

1. Ouvrez l'app Uber Eats
2. Appuyez sur **"Vos commandes"** en bas
3. Trouvez votre commande #${orderNum}
4. Vous verrez le statut en temps réel avec la position du livreur

📍 **Délai habituel**: 20-30 minutes depuis notre restaurant d'Angleur

La commande semble bloquée ou en retard? Je peux escalader le problème. Pouvez-vous partager le numéro de commande?`;
    },
    suggestions: ['J\'ai le numéro', 'Commande bloquée', 'Demander un remboursement'],
    metadata: { canEscalate: true, priority: 9, tags: ['tracking', 'ubereats'] },
  },
  
  {
    id: 'track_order_deliveroo',
    intent: 'track_order' as IntentType,
    condition: (ctx, intent) => intent.entities.platform === 'deliveroo',
    template: `**Pour suivre votre commande Deliveroo:**

1. Ouvrez l'app Deliveroo
2. Allez dans **"Commandes"**
3. Sélectionnez votre commande active
4. Suivez le livreur sur la carte en temps réel

⏱️ **Temps estimé**: 25-35 minutes

Besoin d'aide supplémentaire? Donnez-moi votre numéro de commande et je vérifie.`,
    suggestions: ['Numéro de commande', 'Problème de livraison', 'Contact restaurant'],
    metadata: { canEscalate: true, priority: 9, tags: ['tracking', 'deliveroo'] },
  },
  
  {
    id: 'track_order_generic',
    intent: 'track_order' as IntentType,
    template: `**Pour suivre votre commande:**

Veuillez me dire sur quelle plateforme vous avez commandé:
• **Uber Eats**
• **Deliveroo**
• **Takeaway.com**
• **Site Tasty Food**

Je vous guiderai ensuite étape par étape! 📱`,
    suggestions: ['Uber Eats', 'Deliveroo', 'Takeaway', 'Site web'],
    metadata: { canEscalate: false, priority: 8, tags: ['tracking'] },
  },
  
  // Complaints
  {
    id: 'complaint_missing_item',
    intent: 'missing_item' as IntentType,
    template: (ctx, entities) => `Je suis vraiment désolé pour cet oubli! 😞 C'est inacceptable.

**Pour vous aider rapidement:**
1. Numéro de commande: ${entities.orderNumber || '?'}
2. Quels articles manquent?
3. Sur quelle plateforme avez-vous commandé?

Une fois que j'ai ces infos, je peux:
• Traiter un remboursement immédiat
• Organiser une nouvelle livraison des articles manquants
• Escalader à un responsable si besoin

Partagez les détails et je m'occupe de tout de suite.`,
    suggestions: ['Remboursement', 'Nouvelle livraison', 'Parler à un responsable'],
    metadata: { canEscalate: true, priority: 10, tags: ['complaint', 'missing'] },
  },
  
  {
    id: 'complaint_wrong_order',
    intent: 'wrong_order' as IntentType,
    template: `Oh non! Je comprends votre frustration. Recevoir la mauvaise commande, c'est vraiment décevant. 😔

**Dites-moi:**
• Qu'avez-vous reçu à la place?
• Qu'aviez-vous commandé?
• Numéro de commande (si vous l'avez)

Je vais immédiatement escalader cela à notre équipe pour:
✅ Remboursement complet
✅ Ou nouvelle livraison gratuite de la bonne commande

Votre satisfaction est notre priorité. Donnez-moi les détails.`,
    suggestions: ['Remboursement', 'Bonne commande gratuite', 'Escalader maintenant'],
    metadata: { canEscalate: true, priority: 10, tags: ['complaint', 'wrong_order'] },
  },
  
  {
    id: 'quality_issue',
    intent: 'quality_issue' as IntentType,
    template: `Je suis sincèrement désolé que la qualité n'ait pas été à la hauteur de vos attentes. 😟 Nous prenons cela très au sérieux.

**Pouvez-vous me préciser:**
• Quel produit avait un problème?
• Qu'est-ce qui n'allait pas (froid, brûlé, goût, etc.)?
• Votre numéro de commande

Je vais transmettre cela immédiatement à notre manager pour:
• Enquête interne
• Remboursement ou bon de compensation
• S'assurer que cela ne se reproduise pas

Votre feedback nous aide à nous améliorer. Merci de nous le signaler.`,
    suggestions: ['Remboursement', 'Bon de compensation', 'Parler au manager'],
    metadata: { canEscalate: true, priority: 10, tags: ['complaint', 'quality'] },
  },
  
  // Refunds
  {
    id: 'refund_request',
    intent: 'refund' as IntentType,
    template: `Je comprends que vous souhaitez un remboursement. Laissez-moi vous aider.

**Informations nécessaires:**
• Numéro de commande
• Raison du remboursement (article manquant, mauvaise qualité, etc.)
• Plateforme de commande (Uber Eats, Deliveroo, etc.)

**Délai de traitement:** 3-5 jours ouvrables une fois approuvé.

Je vais escalader votre demande à notre équipe de support qui la traitera en priorité. Partagez les détails s'il vous plaît.`,
    suggestions: ['Donner les infos', 'Escalader maintenant', 'Annuler la demande'],
    metadata: { canEscalate: true, priority: 9, tags: ['refund'] },
  },
  
  // FAQ - Ordering
  {
    id: 'faq_ordering',
    intent: 'faq_ordering' as IntentType,
    template: `**Comment commander chez Tasty Food:**

📱 **En ligne:**
• Uber Eats: [Lien Uber Eats]
• Deliveroo: [Lien Deliveroo]
• Takeaway.com: [Lien Takeaway]
• Notre site: tastyfood.be

📞 **Par téléphone:**
Appelez le restaurant le plus proche:
• Angleur: +32 4 XXX XX XX
• Saint-Gilles: +32 4 XXX XX XX

🏪 **Sur place:**
Venez directement au restaurant (carte & espèces acceptées)

**Délai de livraison:** 30-40 minutes en moyenne.

Prêt à commander?`,
    suggestions: ['Commander sur Uber Eats', 'Commander sur Deliveroo', 'Voir les restaurants'],
    metadata: { canEscalate: false, priority: 8, tags: ['faq', 'ordering'] },
  },
  
  // FAQ - Hours
  {
    id: 'faq_hours',
    intent: 'faq_hours' as IntentType,
    template: (ctx, entities) => {
      const branch = entities.branch || ctx.metadata.currentBranch;
      if (branch) {
        return `**Horaires Tasty Food ${branch.charAt(0).toUpperCase() + branch.slice(1)}:**

🕐 Lundi - Vendredi: 11h00 - 23h00
🕐 Samedi - Dimanche: 10h00 - 00h00

📞 Appelez le restaurant pour confirmer les horaires du jour.

Souhaitez-vous commander maintenant?`;
      }
      
      return `**Nos horaires:**

🕐 Lun - Ven: 11h00 - 23h00
🕐 Sam - Dim: 10h00 - 00h00

*(Horaires pouvant varier selon le restaurant)*

**Nos restaurants:**
• Angleur
• Saint-Gilles
• Wandre
• Seraing
• Jemeppe-sur-Meuse

Quel restaurant vous intéresse?`;
    },
    suggestions: ['Angleur', 'Saint-Gilles', 'Wandre', 'Commander maintenant'],
    metadata: { canEscalate: false, priority: 7, tags: ['faq', 'hours'] },
  },
  
  // FAQ - Menu
  {
    id: 'faq_menu',
    intent: 'faq_menu' as IntentType,
    template: `**Notre menu Tasty Food:**

🍔 **Burgers "Smash"**
• Technique spéciale: pressés sur le grill pour une croûte croustillante
• 100% HALAL certifié
• Recettes signatures

🍟 **Accompagnements**
• Frites croustillantes maison
• Chicken wings
• Sauces variées

🥤 **Boissons**
• Milkshakes
• Sodas
• Jus frais

🌱 **Options végétariennes** disponibles!

Consultez le menu complet sur Uber Eats ou Deliveroo. Prêt à commander?`,
    suggestions: ['Voir menu complet', 'Commander', 'Questions ingrédients'],
    metadata: { canEscalate: false, priority: 8, tags: ['faq', 'menu'] },
  },
  
  // Greetings
  {
    id: 'greeting_main',
    intent: 'greeting' as IntentType,
    template: `Bonjour! 👋 Bienvenue chez Tasty Food!

Je suis Tasty, votre assistant virtuel. Comment puis-je vous aider aujourd'hui?

**Je peux vous aider avec:**
• Informations sur nos burgers HALAL 🍔
• Suivi de commande 📦
• Horaires et adresses 📍
• Questions sur le menu 📋
• Support et réclamations 💬`,
    suggestions: ['Commander', 'Suivre ma commande', 'Infos HALAL', 'Autre question'],
    metadata: { canEscalate: false, priority: 5, tags: ['greeting'] },
  },
  
  // Escalation
  {
    id: 'escalation_request',
    intent: 'speak_agent' as IntentType,
    template: `Bien sûr! Je comprends que vous préférez parler à quelqu'un.

Je vais vous mettre en contact avec notre équipe de support. Un agent humain répondra à votre demande dans les **2 heures** (pendant les heures d'ouverture).

**En attendant:**
Pouvez-vous me donner quelques détails sur votre problème pour que l'agent soit mieux préparé?
• Votre email
• Nature du problème
• Numéro de commande (si applicable)`,
    suggestions: ['Créer un ticket', 'Donner les détails', 'Attendre l\'agent'],
    metadata: { canEscalate: true, priority: 9, tags: ['escalation'] },
  },
  
  // Out of scope
  {
    id: 'out_of_scope',
    intent: 'out_of_scope' as IntentType,
    template: `Je suis spécialisé dans l'aide aux clients de Tasty Food (commandes, menu, support). 

Votre question semble sortir de mon domaine d'expertise. 🤔

**Je peux vous aider avec:**
• Commandes et livraisons
• Menu et certifications HALAL
• Réclamations et support
• Informations sur nos restaurants

Voulez-vous me poser une autre question ou parler à un agent?`,
    suggestions: ['Poser une autre question', 'Parler à un agent', 'Commander'],
    metadata: { canEscalate: true, priority: 3, tags: ['out_of_scope'] },
  },
];

/**
 * Find the best matching template for a given intent
 */
export function findResponseTemplate(
  intent: IntentType,
  context: ConversationContext,
  intentResult: IntentResult,
): ResponseTemplate | null {
  const matching = TEMPLATES.filter(t => t.intent === intent);
  
  // Try conditional templates first
  for (const template of matching) {
    if (template.condition && template.condition(context, intentResult)) {
      return template;
    }
  }
  
  // Fallback to first non-conditional match
  return matching.find(t => !t.condition) || null;
}

/**
 * Render a template with context and entities
 */
export function renderResponse(
  template: ResponseTemplate,
  context: ConversationContext,
  entities: EntityExtraction,
): string {
  if (typeof template.template === 'string') {
    return template.template;
  }
  return template.template(context, entities);
}

/**
 * Get all available templates (for debugging/admin)
 */
export function getAllTemplates(): ResponseTemplate[] {
  return TEMPLATES;
}

/**
 * Add a custom template at runtime
 */
export function addTemplate(template: ResponseTemplate): void {
  TEMPLATES.push(template);
}
