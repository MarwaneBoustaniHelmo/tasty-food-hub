import { ExternalLink, MapPin, Info, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

// Types
interface Platform {
  name: string;
  icon: string;
  href: string | null;
  color: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  description: string;
  platforms: Platform[];
  hasOfficialSite?: boolean;
}

// =============================
// TASTY FOOD RESTAURANTS DATA
// =============================
const tastyFoodRestaurants: Restaurant[] = [
  {
    id: "seraing",
    name: "Seraing / Jemeppe-sur-Meuse",
    address: "Rue Gustave Baivy 15, 4101 Jemeppe-sur-Meuse",
    description: "Idéal pour Jemeppe, Seraing et environs. Street food halal premium avec smash burgers et concepts croustillants.",
    hasOfficialSite: false,
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      { name: "Commander sur Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-seraing", color: "bg-[#FF8000]" },
    ],
  },
  {
    id: "angleur",
    name: "Angleur",
    address: "100 Rue Vaudrée, 4031 Angleur, Liège",
    description: "Smash burgers halal et street food premium à Angleur. Le seul Tasty Food avec un site officiel de commande directe.",
    hasOfficialSite: true,
    platforms: [
      { name: "Commander sur le site officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be/", color: "bg-primary" },
      { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
      { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.fr/en/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      { name: "Commander sur Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-angleur", color: "bg-[#FF8000]" },
    ],
  },
  {
    id: "wandre",
    name: "Wandre",
    address: "Rue du Pont de Wandre 75, 4020 Wandre, Liège",
    description: "Tasty Food à Wandre, disponible sur les principales plateformes de livraison.",
    hasOfficialSite: false,
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Commander sur Deliveroo", icon: "🚴", href: null, color: "bg-[#00CCBC]" },
      { name: "Commander sur Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-1", color: "bg-[#FF8000]" },
    ],
  },
  {
    id: "saint-gilles",
    name: "Saint-Gilles (Liège)",
    address: "58 Rue Saint-Gilles, 4000 Liège",
    description: "En plein centre de Liège. Smash burgers halal et concepts croustillants. Tasty Food n'a pas de site officiel global, seulement celui d'Angleur.",
    hasOfficialSite: false,
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
      { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      { name: "Commander sur Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-liege-1", color: "bg-[#FF8000]" },
    ],
  },
];

// =============================
// CROUSTY BY TASTY DATA
// =============================
interface CroustyLocation {
  id: string;
  name: string;
  platforms: Platform[];
}

const croustyLocations: CroustyLocation[] = [
  {
    id: "crousty-angleur",
    name: "Crousty By Tasty – Angleur",
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-seraing",
    name: "Crousty By Tasty – Seraing / Jemeppe",
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-saint-gilles",
    name: "Crousty By Tasty – Saint-Gilles (Liège)",
    platforms: [
      { name: "Commander sur Uber Eats", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]" },
    ],
  },
  {
    id: "crousty-jemeppe-deliveroo",
    name: "Crousty By Tasty – Jemeppe-sur-Meuse",
    platforms: [
      { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-jemeppe-sur-meuse/crousty-by-tasty", color: "bg-[#00CCBC]" },
    ],
  },
  {
    id: "crousty-takeaway",
    name: "Crousty By Tasty – Liège / Jemeppe",
    platforms: [
      { name: "Commander sur Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be-en/menu/crousty-by-tasty-liege", color: "bg-[#FF8000]" },
    ],
  },
];

// Platform Button Component
const PlatformButton = ({ platform }: { platform: Platform }) => {
  if (!platform.href) {
    return (
      <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-muted/50 text-muted-foreground opacity-60 cursor-not-allowed min-h-[48px]">
        <span className="text-xl opacity-50">{platform.icon}</span>
        <span className="flex-1 font-medium text-sm">{platform.name}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded">Non disponible</span>
      </div>
    );
  }

  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`mobile-platform-btn ${platform.color}`}
      aria-label={platform.name}
    >
      <span className="text-xl" aria-hidden="true">{platform.icon}</span>
      <span className="flex-1 font-semibold text-sm md:text-base">{platform.name}</span>
      <ExternalLink size={18} className="opacity-70" aria-hidden="true" />
    </a>
  );
};

// Restaurant Section Component
const RestaurantSection = ({ restaurant }: { restaurant: Restaurant }) => (
  <article
    id={restaurant.id}
    className="rounded-2xl border p-5 md:p-8 bg-card border-border scroll-mt-24"
  >
    {/* Header */}
    <header className="flex items-start gap-3 mb-5 md:mb-6">
      <div className="p-2 md:p-3 rounded-xl bg-primary/20 shrink-0">
        <MapPin className="text-primary" size={24} aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-2xl md:text-3xl text-gradient-gold">
          Tasty Food {restaurant.name}
        </h2>
        <address className="text-sm text-muted-foreground not-italic mt-1">
          {restaurant.address}
        </address>
      </div>
    </header>

    {/* Description */}
    <p className="text-foreground/80 text-sm md:text-base mb-5 leading-relaxed">
      {restaurant.description}
    </p>

    {/* Order Section */}
    <section aria-label="Commander en ligne">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide flex items-center gap-2">
        🍔 Choisissez votre plateforme de livraison
      </h3>
      <nav className="space-y-2">
        {restaurant.platforms.map((platform, index) => (
          <PlatformButton key={index} platform={platform} />
        ))}
      </nav>
    </section>
  </article>
);

const Order = () => {
  return (
    <main className="pt-24 md:pt-28 pb-32 md:pb-20 min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Commander Halal à Liège – Livraison Uber Eats, Deliveroo, Takeaway"
        description="Commandez vos burgers halal en ligne à Liège. Livraison via Uber Eats, Deliveroo, Takeaway. 4 restaurants : Seraing, Angleur, Saint-Gilles, Wandre. Crousty By Tasty disponible."
        canonical="/commander"
      />

      <div className="container px-4">
        {/* Header */}
        <header className="text-center mb-6 md:mb-10">
          <h1 className="section-title mb-3 md:mb-4">
            <span className="text-gradient-gold">COMMANDER</span> EN LIGNE
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Choisissez votre restaurant Tasty Food ou Crousty By Tasty le plus proche de chez vous.
          </p>
        </header>

        {/* Important Banner */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="p-4 md:p-5 rounded-2xl bg-primary/10 border-2 border-primary/40">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20 shrink-0">
                <AlertTriangle size={20} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-base md:text-lg mb-1">
                  💡 Conseil pour une livraison plus rapide
                </p>
                <p className="text-foreground/80 text-sm md:text-base leading-relaxed">
                  Choisissez toujours le restaurant ou le Crousty By Tasty <strong>le plus proche de chez vous</strong> (Seraing / Jemeppe, Angleur, Wandre, Saint-Gilles, etc.). 
                  Sélectionnez ensuite votre plateforme préférée (Uber Eats, Deliveroo, Takeaway.com).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <nav className="max-w-3xl mx-auto mb-8" aria-label="Navigation rapide">
          <p className="text-sm text-muted-foreground mb-3 text-center">Commandez dans votre quartier :</p>
          <div className="flex flex-wrap justify-center gap-2">
            {tastyFoodRestaurants.map((r) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                className="px-3 py-2 rounded-lg bg-secondary/80 text-foreground text-xs md:text-sm font-medium hover:bg-secondary transition-colors"
              >
                {r.name}
              </a>
            ))}
            <a
              href="#crousty-section"
              className="px-3 py-2 rounded-lg bg-accent/20 text-accent text-xs md:text-sm font-medium hover:bg-accent/30 transition-colors border border-accent/30"
            >
              🍗 Crousty By Tasty
            </a>
          </div>
        </nav>

        {/* ======================== */}
        {/* TASTY FOOD RESTAURANTS */}
        {/* ======================== */}
        <section className="space-y-6 md:space-y-8 max-w-3xl mx-auto mb-12">
          <h2 className="sr-only">Restaurants Tasty Food</h2>
          {tastyFoodRestaurants.map((restaurant) => (
            <RestaurantSection key={restaurant.id} restaurant={restaurant} />
          ))}
        </section>

        {/* ======================== */}
        {/* CROUSTY BY TASTY SECTION */}
        {/* ======================== */}
        <section id="crousty-section" className="max-w-3xl mx-auto scroll-mt-24">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-gradient-gold mb-2">
              🍗 Crousty By Tasty
            </h2>
            <p className="text-foreground/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              <strong>Crousty By Tasty</strong> est le concept spécialisé poulet croustillant et crousty-box de Tasty Food, 
              disponible sur plusieurs plateformes de livraison à Liège.
            </p>
          </div>

          <div className="space-y-4">
            {croustyLocations.map((location) => (
              <article
                key={location.id}
                id={location.id}
                className="rounded-2xl border p-4 md:p-6 bg-accent/5 border-accent/20"
              >
                <h3 className="font-display text-xl md:text-2xl text-accent mb-4">
                  {location.name}
                </h3>
                <nav className="space-y-2">
                  {location.platforms.map((platform, index) => (
                    <PlatformButton key={index} platform={platform} />
                  ))}
                </nav>
              </article>
            ))}
          </div>
        </section>

        {/* Disclaimer Banner */}
        <aside className="max-w-3xl mx-auto my-8 md:my-12">
          <div className="p-4 md:p-6 rounded-2xl bg-secondary/50 border border-border text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info size={18} className="text-muted-foreground" aria-hidden="true" />
              <p className="text-foreground font-medium text-sm md:text-base">
                Informations importantes
              </p>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              Les prix, frais de livraison et délais peuvent varier selon la plateforme choisie 
              (Uber Eats, Deliveroo, Takeaway.com). Toutes les commandes passent par les plateformes partenaires officielles.
            </p>
          </div>
        </aside>

        {/* CTA to restaurants */}
        <nav className="max-w-3xl mx-auto text-center">
          <Link 
            to="/restaurants" 
            className="btn-gold inline-flex items-center gap-2" 
            aria-label="Découvrir nos restaurants halal à Liège"
          >
            Voir tous nos restaurants
            <ExternalLink size={16} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
};

export default Order;
