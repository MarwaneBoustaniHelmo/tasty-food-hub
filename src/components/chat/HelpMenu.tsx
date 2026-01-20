import React from 'react';
import { HelpCircle, Package, Shield, Info, Mail, MapPin } from 'lucide-react';

export interface HelpOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: 'faq' | 'track' | 'support';
}

interface HelpMenuProps {
  onOptionSelect: (option: HelpOption) => void;
}

const HELP_OPTIONS: HelpOption[] = [
  {
    id: 'certifications',
    label: 'Quelles certifications avez-vous ?',
    icon: <Shield className="w-5 h-5" />,
    action: 'faq',
  },
  {
    id: 'how-to-order',
    label: 'Comment commander ?',
    icon: <MapPin className="w-5 h-5" />,
    action: 'faq',
  },
  {
    id: 'is-halal',
    label: 'Est-ce HALAL ?',
    icon: <Shield className="w-5 h-5" />,
    action: 'faq',
  },
  {
    id: 'what-is-halal',
    label: 'Qu\'est-ce que HALAL ?',
    icon: <Info className="w-5 h-5" />,
    action: 'faq',
  },
  {
    id: 'track-order',
    label: 'Suivre ma commande',
    icon: <Package className="w-5 h-5" />,
    action: 'track',
  },
  {
    id: 'contact-support',
    label: 'Contacter le support',
    icon: <Mail className="w-5 h-5" />,
    action: 'support',
  },
];

export const HelpMenu: React.FC<HelpMenuProps> = ({ onOptionSelect }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <HelpCircle className="w-4 h-4" />
        <span>Choisissez une option :</span>
      </div>
      
      <div className="grid gap-2">
        {HELP_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onOptionSelect(option)}
            className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 text-left group"
          >
            <div className="flex-shrink-0 text-gray-600 group-hover:text-yellow-600 transition-colors">
              {option.icon}
            </div>
            <span className="text-sm font-medium text-gray-800 group-hover:text-yellow-800">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// FAQ content database
export const FAQ_CONTENT: Record<string, string> = {
  certifications: `🏅 **Nos Certifications**

Chez Tasty Food, nous sommes fiers d'être certifiés **100% HALAL** par des organismes reconnus.

• Viande certifiée HALAL par AVS (Autorité de Contrôle Halal)
• Traçabilité complète de nos produits
• Contrôles réguliers de nos fournisseurs
• Respect strict des normes HALAL

Tous nos burgers, tacos et produits carnés sont garantis HALAL. 🍔✨`,

  'how-to-order': `📱 **Comment Commander ?**

C'est très simple ! Vous avez plusieurs options :

**1. Plateformes de livraison :**
• Uber Eats
• Deliveroo
• Takeaway.com

**2. Site officiel (Click & Collect) :**
• Angleur : tastyfoodangleur.be

**3. Chatbot (je peux vous aider maintenant) :**
Dites-moi simplement dans quelle zone vous êtes et je vous montrerai toutes les options disponibles ! 🚀`,

  'is-halal': `✅ **OUI, nous sommes 100% HALAL !**

Tous nos produits sont certifiés HALAL :

• Viande bovine HALAL certifiée
• Poulet HALAL certifié
• Pas de porc ni alcool dans nos produits
• Certification par organisme reconnu (AVS)

Vous pouvez commander en toute confiance. Notre engagement HALAL est au cœur de notre identité ! 🕌🍔`,

  'what-is-halal': `📖 **Qu'est-ce que HALAL ?**

HALAL (حلال) signifie "licite" ou "permis" en arabe.

**Dans l'alimentation :**
• La viande provient d'animaux abattus selon le rite islamique
• L'animal doit être sain et traité avec respect
• Pas de porc ni de produits dérivés
• Pas d'alcool ni de produits intoxicants

**Chez Tasty Food :**
Nous respectons scrupuleusement ces principes. Notre viande est certifiée HALAL, nos fournisseurs sont contrôlés, et nous garantissons une traçabilité complète.

C'est une garantie de qualité et de respect de vos convictions religieuses. 🙏`,
};
