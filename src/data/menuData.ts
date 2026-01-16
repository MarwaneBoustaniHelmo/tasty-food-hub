// ==========================================
// MENU DATA - Tasty Food Liège
// Données basées sur les menus officiels
// ==========================================

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  badges?: ('best-seller' | 'spicy' | 'nouveau' | 'veggie')[];
  options?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export interface RestaurantMenu {
  id: string;
  name: string;
  shortName: string;
  address: string;
  description: string;
  welcomeMessage: string;
  categories: MenuCategory[];
  platforms: {
    name: string;
    icon: string;
    href: string | null;
    color: string;
  }[];
}

// ==========================================
// MENU COMMUN (adapté par succursale)
// ==========================================

const commonCategories: MenuCategory[] = [
  {
    id: "menus",
    name: "Menus Burgers",
    icon: "🍔",
    items: [
      {
        id: "menu-double",
        name: "Menu Double Smash",
        description: "2 steaks smashés, cheddar fondu, sauce maison + frites + boisson",
        price: 13.90,
        badges: ["best-seller"],
        options: ["Choix de sauce", "Boisson au choix"]
      },
      {
        id: "menu-triple",
        name: "Menu Triple Smash",
        description: "3 steaks smashés pour les gros appétits + frites + boisson",
        price: 15.90,
        options: ["Choix de sauce", "Boisson au choix"]
      },
      {
        id: "menu-chicken",
        name: "Menu Chicken Burger",
        description: "Filet de poulet croustillant, salade, sauce + frites + boisson",
        price: 12.90,
        options: ["Choix de sauce", "Boisson au choix"]
      },
      {
        id: "menu-spicy",
        name: "Menu Spicy Burger",
        description: "Steak smashé, jalapeños, sauce piquante + frites + boisson",
        price: 13.50,
        badges: ["spicy"],
        options: ["Niveau de piquant", "Boisson au choix"]
      }
    ]
  },
  {
    id: "burgers",
    name: "Burgers",
    icon: "🍔",
    items: [
      {
        id: "double-smash",
        name: "Double Smash Burger",
        description: "2 steaks smashés 100% bœuf halal, cheddar fondu, oignons caramélisés, sauce signature",
        price: 9.90,
        badges: ["best-seller"],
        options: ["Extra fromage +1€", "Extra steak +2€"]
      },
      {
        id: "triple-smash",
        name: "Triple Smash Burger",
        description: "3 steaks smashés, triple cheddar, sauce maison généreuse",
        price: 11.90,
        options: ["Extra fromage +1€"]
      },
      {
        id: "chicken-burger",
        name: "Chicken Burger",
        description: "Filet de poulet pané croustillant, salade fraîche, tomate, sauce mayo maison",
        price: 8.90,
        options: ["Extra sauce +0.50€"]
      },
      {
        id: "spicy-burger",
        name: "Spicy Burger",
        description: "Steak smashé épicé, jalapeños, sauce piquante maison, cheddar",
        price: 9.50,
        badges: ["spicy"],
        options: ["Niveau de piquant"]
      },
      {
        id: "cheese-bacon",
        name: "Cheese & Bacon Burger",
        description: "Double steak, cheddar, bacon de dinde halal croustillant, sauce BBQ",
        price: 10.90,
        badges: ["nouveau"],
        options: ["Extra bacon +1.50€"]
      }
    ]
  },
  {
    id: "tacos",
    name: "Tacos & Fajitas",
    icon: "🌮",
    items: [
      {
        id: "tacos-classique",
        name: "Tacos Classique",
        description: "Tortilla grillée, viande au choix, sauce fromagère, frites maison",
        price: 8.50,
        badges: ["best-seller"],
        options: ["Viande: Poulet, Bœuf, Mixte", "Sauce: Fromagère, Algérienne, Samurai"]
      },
      {
        id: "tacos-xl",
        name: "Tacos XL",
        description: "Double portion de viande, double fromage, frites généreuses",
        price: 11.50,
        options: ["Viande: Poulet, Bœuf, Mixte"]
      },
      {
        id: "tacos-spicy",
        name: "Tacos Spicy",
        description: "Viande épicée, jalapeños, sauce piquante et fromagère",
        price: 9.50,
        badges: ["spicy"],
        options: ["Niveau de piquant"]
      },
      {
        id: "fajitas",
        name: "Fajitas Maison",
        description: "Tortillas souples, viande marinée, poivrons, oignons, crème fraîche",
        price: 10.90,
        options: ["Viande: Poulet, Bœuf"]
      }
    ]
  },
  {
    id: "tex-mex",
    name: "Tex-Mex",
    icon: "🧀",
    items: [
      {
        id: "nachos",
        name: "Nachos Maison",
        description: "Chips tortilla, cheddar fondu, jalapeños, guacamole, crème fraîche",
        price: 7.90,
        options: ["Extra guacamole +1.50€"]
      },
      {
        id: "quesadillas",
        name: "Quesadillas",
        description: "Tortilla croustillante, fromage fondu, viande au choix",
        price: 8.50,
        options: ["Viande: Poulet, Bœuf"]
      },
      {
        id: "nuggets",
        name: "Chicken Nuggets (x10)",
        description: "Nuggets de poulet croustillants avec sauce au choix",
        price: 6.90,
        options: ["Sauce: BBQ, Mayo, Ketchup, Curry"]
      }
    ]
  },
  {
    id: "frites",
    name: "Frites & Sides",
    icon: "🍟",
    items: [
      {
        id: "frites-maison",
        name: "Frites Maison",
        description: "Frites fraîches croustillantes à l'extérieur, fondantes à l'intérieur",
        price: 3.50,
        badges: ["best-seller"]
      },
      {
        id: "frites-loaded",
        name: "Loaded Frites",
        description: "Frites garnies de cheddar fondu, bacon de dinde, sauce",
        price: 6.90,
        badges: ["nouveau"],
        options: ["Sauce: BBQ, Cheese, Samurai"]
      },
      {
        id: "frites-cheese",
        name: "Cheese Frites",
        description: "Frites avec sauce cheddar crémeuse",
        price: 4.90
      },
      {
        id: "onion-rings",
        name: "Onion Rings",
        description: "Rondelles d'oignon panées et croustillantes",
        price: 4.50
      }
    ]
  },
  {
    id: "boissons",
    name: "Boissons",
    icon: "🥤",
    items: [
      { id: "coca", name: "Coca-Cola", description: "33cl", price: 2.50 },
      { id: "coca-zero", name: "Coca-Cola Zero", description: "33cl", price: 2.50 },
      { id: "fanta", name: "Fanta Orange", description: "33cl", price: 2.50 },
      { id: "sprite", name: "Sprite", description: "33cl", price: 2.50 },
      { id: "ice-tea", name: "Ice Tea Pêche", description: "33cl", price: 2.50 },
      { id: "eau", name: "Eau Minérale", description: "50cl", price: 2.00 },
      { id: "mojito", name: "Mojito Sans Alcool", description: "Menthe fraîche, citron vert, sucre de canne", price: 4.50, badges: ["nouveau"] }
    ]
  },
  {
    id: "desserts",
    name: "Desserts",
    icon: "🍰",
    items: [
      {
        id: "tiramisu",
        name: "Tiramisu Maison",
        description: "Crémeux au mascarpone et café, saupoudré de cacao",
        price: 5.00,
        badges: ["best-seller"]
      },
      {
        id: "cookie",
        name: "Cookie Géant",
        description: "Cookie aux pépites de chocolat, tiède sur demande",
        price: 3.50
      },
      {
        id: "brownie",
        name: "Brownie Chocolat",
        description: "Brownie fondant au chocolat noir intense",
        price: 4.00
      }
    ]
  },
  {
    id: "extras",
    name: "Extras & Sauces",
    icon: "🧴",
    items: [
      { id: "sauce-bbq", name: "Sauce BBQ", description: "Pot individuel", price: 0.50 },
      { id: "sauce-samurai", name: "Sauce Samurai", description: "Pot individuel", price: 0.50 },
      { id: "sauce-algerienne", name: "Sauce Algérienne", description: "Pot individuel", price: 0.50 },
      { id: "sauce-mayo", name: "Mayonnaise", description: "Pot individuel", price: 0.50 },
      { id: "sauce-ketchup", name: "Ketchup", description: "Pot individuel", price: 0.50 },
      { id: "extra-fromage", name: "Extra Fromage", description: "Tranche de cheddar", price: 1.00 },
      { id: "extra-viande", name: "Extra Viande", description: "Portion supplémentaire", price: 2.00 }
    ]
  }
];

// ==========================================
// RESTAURANTS DATA
// ==========================================

export const restaurantsMenu: RestaurantMenu[] = [
  {
    id: "seraing",
    name: "Seraing / Jemeppe-sur-Meuse",
    shortName: "Seraing",
    address: "Rue Gustave Baivy 15, 4101 Jemeppe-sur-Meuse",
    description: "Idéal pour Jemeppe, Seraing et environs. Street food halal premium avec smash burgers et concepts croustillants.",
    welcomeMessage: "Bienvenue chez Tasty Food Seraing ! 🔥 Découvrez nos burgers halal préparés avec passion.",
    categories: commonCategories,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-seraing", color: "bg-[#FF8000]" },
    ]
  },
  {
    id: "angleur",
    name: "Angleur",
    shortName: "Angleur",
    address: "100 Rue Vaudrée, 4031 Angleur, Liège",
    description: "Smash burgers halal et street food premium à Angleur. Le seul Tasty Food avec un site officiel de commande directe.",
    welcomeMessage: "Bienvenue chez Tasty Food Angleur ! 🌟 Commandez directement sur notre site ou via les apps.",
    categories: commonCategories,
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be/", color: "bg-primary" },
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/en/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-angleur", color: "bg-[#FF8000]" },
    ]
  },
  {
    id: "wandre",
    name: "Wandre",
    shortName: "Wandre",
    address: "Rue du Pont de Wandre 75, 4020 Wandre, Liège",
    description: "Tasty Food à Wandre, disponible sur les principales plateformes de livraison.",
    welcomeMessage: "Bienvenue chez Tasty Food Wandre ! 🍔 Commandez vos burgers halal préférés.",
    categories: commonCategories,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: null, color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-1", color: "bg-[#FF8000]" },
    ]
  },
  {
    id: "saint-gilles",
    name: "Saint-Gilles (Liège)",
    shortName: "Saint-Gilles",
    address: "58 Rue Saint-Gilles, 4000 Liège",
    description: "En plein centre de Liège. Smash burgers halal et concepts croustillants.",
    welcomeMessage: "Bienvenue chez Tasty Food Saint-Gilles ! 🏙️ Le goût du centre-ville.",
    categories: commonCategories,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-liege-1", color: "bg-[#FF8000]" },
    ]
  }
];

// ==========================================
// CROUSTY BY TASTY DATA
// ==========================================

export interface CroustyLocation {
  id: string;
  name: string;
  platforms: {
    name: string;
    icon: string;
    href: string | null;
    color: string;
  }[];
}

export const croustyLocations: CroustyLocation[] = [
  {
    id: "crousty-angleur",
    name: "Crousty By Tasty – Angleur",
    platforms: [
      { name: "Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-seraing",
    name: "Crousty By Tasty – Seraing",
    platforms: [
      { name: "Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-saint-gilles",
    name: "Crousty By Tasty – Saint-Gilles",
    platforms: [
      { name: "Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-jemeppe",
    name: "Crousty By Tasty – Jemeppe",
    platforms: [
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-jemeppe-sur-meuse/crousty-by-tasty", color: "bg-[#00CCBC]" },
    ],
  },
  {
    id: "crousty-takeaway",
    name: "Crousty By Tasty – Liège",
    platforms: [
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be-en/menu/crousty-by-tasty-liege", color: "bg-[#FF8000]" },
    ],
  },
];

// Helper to get menu highlights
export const getMenuHighlights = (restaurant: RestaurantMenu): MenuItem[] => {
  const highlights: MenuItem[] = [];
  restaurant.categories.forEach(category => {
    category.items.forEach(item => {
      if (item.badges?.includes('best-seller') && highlights.length < 6) {
        highlights.push(item);
      }
    });
  });
  return highlights;
};
