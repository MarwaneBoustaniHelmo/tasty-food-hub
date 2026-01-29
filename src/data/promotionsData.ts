// ==========================================
// PROMOTIONS DATA - Tasty Food Liège
// Données des promotions par restaurant et plateforme
// Fallback JSON pour l'affichage dynamique
// ==========================================

export interface Promotion {
  id: string;
  platform: "ubereats" | "deliveroo" | "takeaway" | "website" | "all";
  text: string;
  type: "discount" | "freeDelivery" | "combo" | "special";
  validUntil?: string; // ISO date string
  active: boolean;
}

export interface RestaurantPromotions {
  restaurantId: string;
  promotions: Promotion[];
}

// Current promotions data (can be updated via CMS or manually)
export const promotionsData: RestaurantPromotions[] = [
  {
    restaurantId: "seraing",
    promotions: [
      {
        id: "seraing-uber-free",
        platform: "ubereats",
        text: "Livraison offerte dès 15€",
        type: "freeDelivery",
        active: true
      },
      {
        id: "seraing-deliveroo-10",
        platform: "deliveroo",
        text: "-20% sur votre 1ère commande",
        type: "discount",
        active: true
      }
    ]
  },
  {
    restaurantId: "angleur",
    promotions: [
      {
        id: "angleur-site-10",
        platform: "website",
        text: "Commande directe sans frais de service",
        type: "special",
        active: true
      },
      {
        id: "angleur-uber-combo",
        platform: "ubereats",
        text: "Menu Duo à 22€ au lieu de 27€",
        type: "combo",
        active: true
      }
    ]
  },
  {
    restaurantId: "wandre",
    promotions: [
      {
        id: "wandre-takeaway-free",
        platform: "takeaway",
        text: "Frais de livraison réduits",
        type: "freeDelivery",
        active: true
      }
    ]
  },
  {
    restaurantId: "saint-gilles",
    promotions: [
      {
        id: "stgilles-uber-new",
        platform: "ubereats",
        text: "-15% avec le code TASTY15",
        type: "discount",
        active: true
      },
      {
        id: "stgilles-deliveroo-combo",
        platform: "deliveroo",
        text: "1 dessert offert dès 20€",
        type: "combo",
        active: true
      }
    ]
  }
];

// Helper function to get promotions for a specific restaurant
export const getPromotionsForRestaurant = (restaurantId: string): Promotion[] => {
  const restaurantPromos = promotionsData.find(r => r.restaurantId === restaurantId);
  if (!restaurantPromos) return [];
  
  return restaurantPromos.promotions.filter(promo => {
    if (!promo.active) return false;
    if (promo.validUntil) {
      return new Date(promo.validUntil) > new Date();
    }
    return true;
  });
};

// Helper to get promo icon by type
export const getPromoIcon = (type: Promotion["type"]): string => {
  switch (type) {
    case "discount":
      return "🏷️";
    case "freeDelivery":
      return "🚚";
    case "combo":
      return "🎁";
    case "special":
      return "⭐";
    default:
      return "🔥";
  }
};

// Helper to get platform display name
export const getPlatformName = (platform: Promotion["platform"]): string => {
  switch (platform) {
    case "ubereats":
      return "Uber Eats";
    case "deliveroo":
      return "Deliveroo";
    case "takeaway":
      return "Takeaway.com";
    case "website":
      return "Commander en ligne";
    case "all":
      return "Toutes plateformes";
    default:
      return platform;
  }
};
