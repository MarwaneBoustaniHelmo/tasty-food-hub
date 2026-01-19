import { Helmet } from 'react-helmet-async';

interface Restaurant {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  description: string;
  image?: string;
  sameAs?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

interface LocalBusinessSchemaProps {
  restaurant?: Restaurant;
  isOrganization?: boolean;
}

/**
 * JSON-LD Schema.org markup for Local SEO
 * Generates Restaurant / LocalBusiness / Organization schema
 */
const LocalBusinessSchema = ({ restaurant, isOrganization = false }: LocalBusinessSchemaProps) => {
  // Main organization schema (for homepage)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Tasty Food Liège",
    "alternateName": "Tasty Food",
    "url": "https://tastyfoodliege.be",
    "logo": "https://tastyfoodliege.be/logo.png",
    "description": "Restaurant halal à Liège proposant des smash burgers, loaded fries et street food. 4 adresses : Seraing, Angleur, Saint-Gilles, Wandre.",
    "foundingDate": "2020",
    "areaServed": {
      "@type": "City",
      "name": "Liège",
      "containedInPlace": {
        "@type": "Country",
        "name": "Belgium"
      }
    },
    "sameAs": [
      "https://www.instagram.com/tastyfoodliege",
      "https://www.tiktok.com/@tastyfoodliege",
      "https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61553406575906/",
      "https://www.snapchat.com/add/tastyfoodlg"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["French", "Dutch"]
    }
  };

  // Restaurant-specific schema
  const restaurantSchema = restaurant ? {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FastFoodRestaurant", "FoodEstablishment"],
    "name": restaurant.name,
    "description": restaurant.description,
    "image": restaurant.image || "https://tastyfoodliege.be/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address,
      "addressLocality": restaurant.city,
      "postalCode": restaurant.postalCode,
      "addressCountry": "BE"
    },
    ...(restaurant.geo && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": restaurant.geo.latitude,
        "longitude": restaurant.geo.longitude
      }
    }),
    "url": "https://tastyfoodliege.be/restaurants",
    "telephone": "",
    "priceRange": "€€",
    "servesCuisine": ["Halal", "Fast Food", "American", "Burgers", "Street Food"],
    "menu": "https://tastyfoodliege.be/commander",
    "acceptsReservations": "False",
    "currenciesAccepted": "EUR",
    "paymentAccepted": "Cash, Credit Card, Debit Card",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "18:00",
        "closes": "02:00"
      }
    ],
    "hasMenu": {
      "@type": "Menu",
      "name": "Menu Tasty Food",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Smash Burgers",
          "description": "Burgers halal préparés avec la technique smash"
        },
        {
          "@type": "MenuSection",
          "name": "Loaded Fries",
          "description": "Frites garnies de toppings généreux"
        },
        {
          "@type": "MenuSection",
          "name": "Tex-Mex",
          "description": "Tacos et spécialités tex-mex halal"
        }
      ]
    },
    "sameAs": restaurant.sameAs || [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    }
  } : null;

  // All restaurants list for homepage
  const allRestaurantsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Restaurants Tasty Food à Liège",
    "description": "Liste des 4 restaurants Tasty Food dans la région de Liège",
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Restaurant",
          "name": "Tasty Food Seraing",
          "address": "15 Rue Gustave Baivy, 4101 Seraing",
          "servesCuisine": "Halal"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Restaurant",
          "name": "Tasty Food Angleur",
          "address": "100 Rue Vaudrée, 4031 Angleur",
          "servesCuisine": "Halal"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Restaurant",
          "name": "Tasty Food Saint-Gilles",
          "address": "Rue Saint-Gilles 58, 4000 Liège",
          "servesCuisine": "Halal"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Restaurant",
          "name": "Tasty Food Wandre",
          "address": "Rue du Pont de Wandre 75, 4020 Liège",
          "servesCuisine": "Halal"
        }
      }
    ]
  };

  return (
    <Helmet>
      {isOrganization && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(organizationSchema)}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(allRestaurantsSchema)}
          </script>
        </>
      )}
      {restaurantSchema && (
        <script type="application/ld+json">
          {JSON.stringify(restaurantSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default LocalBusinessSchema;
