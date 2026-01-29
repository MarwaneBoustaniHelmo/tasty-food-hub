// ==========================================
// LOCATIONS DATA - Tasty Food Liège
// Complete restaurant information for chatbot grounding
// ==========================================

export interface Location {
  id: string;
  name: string;
  type: "dine-in" | "delivery-only";
  address: string;
  city: string;
  postalCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hours: {
    lunch: string;
    dinner: string;
    note?: string;
  };
  services: {
    dineIn: boolean;
    delivery: boolean;
    takeaway: boolean;
    reservations: boolean;
  };
  platforms: {
    name: string;
    url: string;
    type: "website" | "uber-eats" | "deliveroo" | "takeaway";
  }[];
  features: string[];
  googleMapsUrl: string;
}

export const locations: Location[] = [
  // Dine-in locations (Tasty Food)
  {
    id: "seraing",
    name: "Tasty Food Seraing",
    type: "dine-in",
    address: "15 Rue Gustave Baivy",
    city: "Seraing (Jemeppe-sur-Meuse)",
    postalCode: "4101",
    coordinates: {
      latitude: 50.6167,
      longitude: 5.5000,
    },
    hours: {
      lunch: "12:00-14:30",
      dinner: "19:00-23:00",
      note: "Ouvert tous les jours",
    },
    services: {
      dineIn: true,
      delivery: false,
      takeaway: true,
      reservations: true,
    },
    platforms: [
      {
        name: "Site Officiel",
        url: "https://www.tastyfoodseraing-seraing.be",
        type: "website",
      },
    ],
    features: [
      "Restaurant phare",
      "Terrasse",
      "Parking disponible",
      "Wifi gratuit",
      "Paiement par carte",
    ],
    googleMapsUrl:
      "https://www.google.com/maps/search/15+Rue+Gustave+Baivy,+4101+Seraing",
  },
  {
    id: "angleur",
    name: "Tasty Food Angleur",
    type: "dine-in",
    address: "100 Rue Vaudrée",
    city: "Angleur",
    postalCode: "4031",
    coordinates: {
      latitude: 50.6119,
      longitude: 5.6003,
    },
    hours: {
      lunch: "12:00-14:30",
      dinner: "19:00-23:00",
      note: "Ouvert tous les jours",
    },
    services: {
      dineIn: true,
      delivery: false,
      takeaway: true,
      reservations: true,
    },
    platforms: [
      {
        name: "Site Officiel",
        url: "https://www.tastyfoodangleur.be",
        type: "website",
      },
    ],
    features: [
      "Proche gare d'Angleur",
      "Salle familiale",
      "Wifi gratuit",
      "Paiement par carte",
    ],
    googleMapsUrl:
      "https://www.google.com/maps/search/100+Rue+Vaudrée,+4031+Angleur",
  },
  {
    id: "saint-gilles",
    name: "Tasty Food Saint-Gilles",
    type: "dine-in",
    address: "Rue Saint-Gilles 58",
    city: "Liège",
    postalCode: "4000",
    coordinates: {
      latitude: 50.6326,
      longitude: 5.5797,
    },
    hours: {
      lunch: "12:00-14:30",
      dinner: "19:00-23:00",
      note: "Ouvert tous les jours",
    },
    services: {
      dineIn: true,
      delivery: false,
      takeaway: true,
      reservations: true,
    },
    platforms: [],
    features: [
      "Centre-ville de Liège",
      "Ambiance moderne",
      "Wifi gratuit",
      "Paiement par carte",
    ],
    googleMapsUrl:
      "https://www.google.com/maps/search/Rue+Saint-Gilles+58,+4000+Liège",
  },
  {
    id: "wandre",
    name: "Tasty Food Wandre",
    type: "dine-in",
    address: "Rue du Pont de Wandre 75",
    city: "Liège",
    postalCode: "4020",
    coordinates: {
      latitude: 50.6667,
      longitude: 5.6333,
    },
    hours: {
      lunch: "12:00-14:30",
      dinner: "19:00-23:00",
      note: "Ouvert tous les jours",
    },
    services: {
      dineIn: true,
      delivery: false,
      takeaway: true,
      reservations: true,
    },
    platforms: [],
    features: [
      "Quartier calme",
      "Parking facile",
      "Wifi gratuit",
      "Paiement par carte",
    ],
    googleMapsUrl:
      "https://www.google.com/maps/search/Rue+du+Pont+de+Wandre+75,+4020+Liège",
  },
  // Delivery-only locations (Crousty by Tasty)
  {
    id: "crousty-seraing",
    name: "Crousty by Tasty - Seraing",
    type: "delivery-only",
    address: "Cuisine partagée avec Tasty Food Seraing",
    city: "Seraing",
    postalCode: "4101",
    coordinates: {
      latitude: 50.6167,
      longitude: 5.5000,
    },
    hours: {
      lunch: "Voir Uber Eats",
      dinner: "Voir Uber Eats",
      note: "Horaires variables selon la plateforme",
    },
    services: {
      dineIn: false,
      delivery: true,
      takeaway: false,
      reservations: false,
    },
    platforms: [
      {
        name: "Uber Eats",
        url: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw",
        type: "uber-eats",
      },
    ],
    features: ["Poulet croustillant", "Livraison rapide", "Halal certifié"],
    googleMapsUrl: "",
  },
  {
    id: "crousty-angleur",
    name: "Crousty by Tasty - Angleur",
    type: "delivery-only",
    address: "Cuisine partagée avec Tasty Food Angleur",
    city: "Angleur",
    postalCode: "4031",
    coordinates: {
      latitude: 50.6119,
      longitude: 5.6003,
    },
    hours: {
      lunch: "Voir plateforme",
      dinner: "Voir plateforme",
      note: "Horaires variables selon la plateforme",
    },
    services: {
      dineIn: false,
      delivery: true,
      takeaway: false,
      reservations: false,
    },
    platforms: [
      {
        name: "Uber Eats",
        url: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg",
        type: "uber-eats",
      },
      {
        name: "Takeaway.com",
        url: "https://www.takeaway.com/be/menu/crousty-by-tasty-angleur",
        type: "takeaway",
      },
    ],
    features: ["Poulet croustillant", "Livraison rapide", "Halal certifié"],
    googleMapsUrl: "",
  },
  {
    id: "crousty-saint-gilles",
    name: "Crousty by Tasty - Saint-Gilles",
    type: "delivery-only",
    address: "Cuisine partagée avec Tasty Food Saint-Gilles",
    city: "Liège",
    postalCode: "4000",
    coordinates: {
      latitude: 50.6326,
      longitude: 5.5797,
    },
    hours: {
      lunch: "Voir Uber Eats",
      dinner: "Voir Uber Eats",
      note: "Horaires variables selon la plateforme",
    },
    services: {
      dineIn: false,
      delivery: true,
      takeaway: false,
      reservations: false,
    },
    platforms: [
      {
        name: "Uber Eats",
        url: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w",
        type: "uber-eats",
      },
    ],
    features: ["Poulet croustillant", "Livraison rapide", "Halal certifié"],
    googleMapsUrl: "",
  },
  {
    id: "crousty-jemeppe",
    name: "Crousty by Tasty - Jemeppe",
    type: "delivery-only",
    address: "Concept livraison uniquement",
    city: "Jemeppe-sur-Meuse",
    postalCode: "4101",
    coordinates: {
      latitude: 50.6167,
      longitude: 5.5000,
    },
    hours: {
      lunch: "Voir Deliveroo",
      dinner: "Voir Deliveroo",
      note: "Horaires variables selon la plateforme",
    },
    services: {
      dineIn: false,
      delivery: true,
      takeaway: false,
      reservations: false,
    },
    platforms: [
      {
        name: "Deliveroo",
        url: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing",
        type: "deliveroo",
      },
    ],
    features: ["Poulet croustillant", "Livraison rapide", "Halal certifié"],
    googleMapsUrl: "",
  },
];

// Helper functions for chatbot
export function findLocationById(id: string): Location | undefined {
  return locations.find((loc) => loc.id === id);
}

export function findLocationsByCity(city: string): Location[] {
  return locations.filter((loc) =>
    loc.city.toLowerCase().includes(city.toLowerCase())
  );
}

export function getDineInLocations(): Location[] {
  return locations.filter((loc) => loc.type === "dine-in");
}

export function getDeliveryLocations(): Location[] {
  return locations.filter((loc) => loc.type === "delivery-only");
}

export function findNearestLocation(
  userLat: number,
  userLon: number
): Location | null {
  let nearest: Location | null = null;
  let minDistance = Infinity;

  for (const loc of locations) {
    const distance = Math.sqrt(
      Math.pow(loc.coordinates.latitude - userLat, 2) +
        Math.pow(loc.coordinates.longitude - userLon, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = loc;
    }
  }

  return nearest;
}
