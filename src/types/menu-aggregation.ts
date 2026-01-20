// Menu aggregation types for TastyFood platform comparison

export type PlatformName = 'ubereats' | 'deliveroo' | 'takeaway';

export interface PlatformPriceInfo {
  platform: PlatformName;
  branch: string;              // "Angleur", "Saint-Gilles", "Wandre", "Seraing", ...
  url: string;                 // Source URL on the platform
  price: number;               // Item price (tax included)
  currency: string;            // e.g. "EUR"
  deliveryFee?: number | null; // Delivery fee if known
  minOrder?: number | null;    // Min order amount if known
  promoLabel?: string | null;  // e.g. "Free delivery over 20 €"
}

export interface MenuItem {
  id: string;                      // Internal stable ID (slug + hash)
  name: string;                    // Unified product name
  description?: string;
  category: string;                // e.g. "Menus burgers", "Sandwiches", ...
  tags: string[];                  // e.g. ["burger","menu","cheese"]
  imageUrl?: string | null;
  platforms: PlatformPriceInfo[];  // One entry per platform/branch
}

export interface ScraperResult {
  items: MenuItem[];
  deliveryFee?: number | null;
  minOrder?: number | null;
  errors?: string[];
}

export interface BranchConfig {
  id: string;
  name: string;
  platform: PlatformName;
  url: string;
}

// Uber Eats branch configurations
export const UBEREATS_BRANCHES: BranchConfig[] = [
  {
    id: 'ubereats-saint-gilles',
    name: 'Saint-Gilles',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ'
  },
  {
    id: 'ubereats-angleur',
    name: 'Angleur',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ'
  },
  {
    id: 'ubereats-wandre',
    name: 'Wandre',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ'
  },
  {
    id: 'ubereats-seraing',
    name: 'Seraing',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg'
  }
];

// Deliveroo branch configurations
export const DELIVEROO_BRANCHES: BranchConfig[] = [
  {
    id: 'deliveroo-angleur',
    name: 'Angleur',
    platform: 'deliveroo',
    url: 'https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur'
  },
  {
    id: 'deliveroo-seraing',
    name: 'Seraing',
    platform: 'deliveroo',
    url: 'https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing'
  }
];
