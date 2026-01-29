// ==========================================
// CHATBOT MENU DATA - Tasty Food
// Optimized menu structure for conversational AI
// ==========================================

export interface ChatbotMenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  price: number;
  category: string;
  tags: string[]; // For filtering: spicy, vegetarian, best-seller, halal, etc.
  allergens?: string[];
  available: boolean;
}

export interface MenuCombo {
  id: string;
  name: string;
  items: string[]; // Item IDs
  totalPrice: number;
  savings: number;
  description: string;
}

// Comprehensive menu for chatbot intelligence
export const chatbotMenu: ChatbotMenuItem[] = [
  // Burgers
  {
    id: "double-smash",
    name: "Double Smash Burger",
    nameEn: "Double Smash Burger",
    description:
      "2 steaks smashés 100% bœuf halal, cheddar fondu, oignons caramélisés, sauce signature",
    price: 9.9,
    category: "burgers",
    tags: ["halal", "best-seller", "beef", "smash"],
    allergens: ["gluten", "lactose"],
    available: true,
  },
  {
    id: "triple-smash",
    name: "Triple Smash Burger",
    nameEn: "Triple Smash Burger",
    description: "3 steaks smashés, triple cheddar, sauce maison généreuse",
    price: 11.9,
    category: "burgers",
    tags: ["halal", "beef", "smash", "large"],
    allergens: ["gluten", "lactose"],
    available: true,
  },
  {
    id: "chicken-burger",
    name: "Chicken Burger Crispy",
    nameEn: "Crispy Chicken Burger",
    description:
      "Filet de poulet croustillant, salade fraîche, tomates, sauce mayo",
    price: 8.9,
    category: "burgers",
    tags: ["halal", "chicken", "crispy"],
    allergens: ["gluten", "eggs"],
    available: true,
  },
  {
    id: "spicy-burger",
    name: "Spicy Smash Burger",
    nameEn: "Spicy Smash Burger",
    description:
      "Steak smashé, jalapeños, sauce piquante maison, oignons grillés",
    price: 10.5,
    category: "burgers",
    tags: ["halal", "beef", "spicy", "hot"],
    allergens: ["gluten", "lactose"],
    available: true,
  },
  {
    id: "bacon-burger",
    name: "Bacon Smash Burger",
    nameEn: "Bacon Smash Burger",
    description: "Double steak smashé, bacon de dinde halal, cheddar, sauce BBQ",
    price: 11.5,
    category: "burgers",
    tags: ["halal", "beef", "bacon", "bbq"],
    allergens: ["gluten", "lactose"],
    available: true,
  },

  // Loaded Fries
  {
    id: "loaded-fries",
    name: "Loaded Frites",
    nameEn: "Loaded Fries",
    description:
      "Frites garnies de cheddar fondu, bacon de dinde halal, sauce spéciale",
    price: 6.9,
    category: "sides",
    tags: ["halal", "fries", "cheese", "bacon", "best-seller"],
    allergens: ["lactose"],
    available: true,
  },
  {
    id: "cheese-fries",
    name: "Cheese Frites",
    nameEn: "Cheese Fries",
    description: "Frites avec sauce cheddar crémeuse onctueuse",
    price: 4.9,
    category: "sides",
    tags: ["halal", "fries", "cheese", "vegetarian"],
    allergens: ["lactose"],
    available: true,
  },
  {
    id: "classic-fries",
    name: "Frites Classiques",
    nameEn: "Classic Fries",
    description: "Frites fraîches et croustillantes, portion généreuse",
    price: 3.5,
    category: "sides",
    tags: ["halal", "fries", "vegetarian", "vegan"],
    allergens: [],
    available: true,
  },

  // Tacos & Tex-Mex
  {
    id: "beef-tacos",
    name: "Tacos Beef",
    nameEn: "Beef Tacos",
    description: "Tortilla garnie de viande hachée halal, fromage, sauce tex-mex",
    price: 8.5,
    category: "tacos",
    tags: ["halal", "beef", "mexican", "best-seller"],
    allergens: ["gluten", "lactose"],
    available: true,
  },
  {
    id: "chicken-tacos",
    name: "Tacos Chicken",
    nameEn: "Chicken Tacos",
    description: "Tortilla garnie de poulet mariné halal, cheddar, sauce épicée",
    price: 8.5,
    category: "tacos",
    tags: ["halal", "chicken", "mexican", "spicy"],
    allergens: ["gluten", "lactose"],
    available: true,
  },

  // Drinks
  {
    id: "coca-cola",
    name: "Coca-Cola",
    nameEn: "Coca-Cola",
    description: "33cl",
    price: 2.5,
    category: "drinks",
    tags: ["soft-drink", "cold"],
    allergens: [],
    available: true,
  },
  {
    id: "sprite",
    name: "Sprite",
    nameEn: "Sprite",
    description: "33cl",
    price: 2.5,
    category: "drinks",
    tags: ["soft-drink", "cold", "lemon"],
    allergens: [],
    available: true,
  },
  {
    id: "ice-tea",
    name: "Ice Tea Pêche",
    nameEn: "Peach Ice Tea",
    description: "33cl",
    price: 2.5,
    category: "drinks",
    tags: ["soft-drink", "cold", "peach"],
    allergens: [],
    available: true,
  },
  {
    id: "water",
    name: "Eau Minérale",
    nameEn: "Mineral Water",
    description: "50cl",
    price: 2.0,
    category: "drinks",
    tags: ["water", "cold"],
    allergens: [],
    available: true,
  },

  // Desserts
  {
    id: "tiramisu",
    name: "Tiramisu Maison",
    nameEn: "Homemade Tiramisu",
    description: "Crémeux au mascarpone et café, saupoudré de cacao",
    price: 5.0,
    category: "desserts",
    tags: ["dessert", "italian", "best-seller"],
    allergens: ["eggs", "gluten", "lactose"],
    available: true,
  },
  {
    id: "brownie",
    name: "Brownie Chocolat",
    nameEn: "Chocolate Brownie",
    description: "Brownie fondant au chocolat noir intense",
    price: 4.0,
    category: "desserts",
    tags: ["dessert", "chocolate"],
    allergens: ["eggs", "gluten", "lactose"],
    available: true,
  },
];

// Popular combos for budget recommendations
export const menuCombos: MenuCombo[] = [
  {
    id: "combo-2-persons",
    name: "Menu pour 2 personnes",
    items: ["double-smash", "chicken-burger", "loaded-fries", "coca-cola", "sprite"],
    totalPrice: 24.9,
    savings: 3.1,
    description:
      "2 burgers + 1 loaded fries + 2 boissons - Parfait pour un repas à deux",
  },
  {
    id: "combo-family",
    name: "Menu Famille (4 personnes)",
    items: [
      "double-smash",
      "double-smash",
      "chicken-burger",
      "spicy-burger",
      "loaded-fries",
      "loaded-fries",
      "coca-cola",
      "coca-cola",
      "sprite",
      "ice-tea",
    ],
    totalPrice: 52.0,
    savings: 8.0,
    description: "4 burgers + 2 loaded fries + 4 boissons - Idéal famille",
  },
  {
    id: "combo-solo",
    name: "Menu Solo",
    items: ["double-smash", "classic-fries", "coca-cola"],
    totalPrice: 13.9,
    savings: 2.0,
    description: "1 burger + frites + boisson - Menu complet solo",
  },
];

// Helper functions for chatbot intelligence
export function findItemsByTag(tag: string): ChatbotMenuItem[] {
  return chatbotMenu.filter((item) =>
    item.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function findItemsByCategory(category: string): ChatbotMenuItem[] {
  return chatbotMenu.filter((item) => item.category === category);
}

export function findItemsByBudget(
  maxPrice: number,
  category?: string
): ChatbotMenuItem[] {
  let items = chatbotMenu.filter((item) => item.price <= maxPrice);

  if (category) {
    items = items.filter((item) => item.category === category);
  }

  return items.sort((a, b) => b.price - a.price);
}

export function suggestComboForBudget(budget: number): MenuCombo | null {
  const affordableCombos = menuCombos.filter(
    (combo) => combo.totalPrice <= budget
  );

  if (affordableCombos.length === 0) return null;

  // Return the most expensive combo within budget (best value)
  return affordableCombos.sort((a, b) => b.totalPrice - a.totalPrice)[0];
}

export function getPopularItems(): ChatbotMenuItem[] {
  return chatbotMenu.filter((item) => item.tags.includes("best-seller"));
}

export function getVegetarianOptions(): ChatbotMenuItem[] {
  return chatbotMenu.filter((item) => item.tags.includes("vegetarian"));
}

export function getSpicyOptions(): ChatbotMenuItem[] {
  return chatbotMenu.filter((item) => item.tags.includes("spicy"));
}

export function searchMenuByName(query: string): ChatbotMenuItem[] {
  const lowerQuery = query.toLowerCase();
  return chatbotMenu.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.nameEn && item.nameEn.toLowerCase().includes(lowerQuery)) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}
