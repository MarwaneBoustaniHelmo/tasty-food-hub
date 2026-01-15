import { ExternalLink, MapPin, Info } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const Order = () => {
  // All restaurant data with complete platform links
  const restaurants = [
    {
      id: "seraing",
      name: "Seraing",
      address: "15 Rue Gustave Baivy, 4101 Seraing",
      description: "Smash burgers halal et concepts croustillants",
      featured: true,
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary", category: "direct" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]", category: "delivery" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]", category: "delivery" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]", category: "delivery" },
      ],
    },
    {
      id: "angleur",
      name: "Angleur",
      address: "100 Rue Vaudrée, 4031 Angleur",
      description: "Smash burgers halal et street food premium",
      featured: false,
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary", category: "direct" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]", category: "delivery" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]", category: "delivery" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]", category: "delivery" },
      ],
    },
    {
      id: "saint-gilles",
      name: "Saint-Gilles",
      address: "Rue Saint-Gilles 58, 4000 Liège",
      description: "Smash burgers halal et concepts croustillants à Liège centre",
      featured: false,
      platforms: [
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]", category: "delivery" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]", category: "delivery" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]", category: "delivery" },
      ],
    },
    {
      id: "wandre",
      name: "Wandre",
      address: "Rue du Pont de Wandre 75, 4020 Liège",
      description: "Tasty Food à Wandre, disponible sur les principales plateformes",
      featured: false,
      platforms: [
        { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]", category: "delivery" },
        { name: "Takeaway", icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]", category: "delivery" },
      ],
    },
  ];

  return (
    <main className="pt-24 md:pt-28 pb-10 md:pb-20 min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Commander Halal à Liège – Livraison Uber Eats, Deliveroo"
        description="Commandez vos burgers halal en ligne à Liège. Livraison via Uber Eats, Deliveroo, Takeaway. 4 restaurants : Seraing, Angleur, Saint-Gilles, Wandre. 18h-02h."
        canonical="/commander"
      />

      <div className="container px-4">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="section-title mb-2 md:mb-4">
            <span className="text-gradient-gold">COMMANDER</span> HALAL À LIÈGE
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Faites-vous livrer les meilleurs smash burgers halal de Liège via nos plateformes partenaires officielles.
          </p>
        </header>

        {/* Restaurant Sections */}
        <div className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className={`rounded-2xl border p-5 md:p-8 ${
                restaurant.featured
                  ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/40"
                  : "bg-card border-border"
              }`}
            >
              {/* Header */}
              <header className="flex items-center gap-3 mb-5 md:mb-6">
                <div className={`p-2 md:p-3 rounded-xl ${restaurant.featured ? "bg-primary/30" : "bg-primary/20"}`}>
                  <MapPin className="text-primary" size={24} aria-hidden="true" />
                </div>
                <div>
                  <h2 className={`font-display text-2xl md:text-3xl ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                    Tasty Food {restaurant.name}
                    {restaurant.featured && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full align-middle">
                        VEDETTE
                      </span>
                    )}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">{restaurant.description}</p>
                </div>
              </header>

              {/* Direct ordering (if available) */}
              {restaurant.platforms.some(p => p.category === "direct") && (
                <section className="mb-5 md:mb-6" aria-label="Commander en direct">
                  <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                    🍔 Commander en direct
                  </h3>
                  <div className="space-y-2">
                    {restaurant.platforms
                      .filter(p => p.category === "direct")
                      .map((platform) => (
                        <a
                          key={platform.name}
                          href={platform.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`mobile-platform-btn ${platform.color} border-2 border-primary/50`}
                          aria-label={`Commander sur ${platform.name} - ${restaurant.name}`}
                        >
                          <span className="text-2xl" aria-hidden="true">{platform.icon}</span>
                          <span className="flex-1 font-semibold text-base">{platform.name}</span>
                          <ExternalLink size={20} className="opacity-70" aria-hidden="true" />
                        </a>
                      ))}
                  </div>
                </section>
              )}

              {/* Delivery platforms */}
              <section className="mb-5 md:mb-6" aria-label="Commander en livraison">
                <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                  🚴 Commander en livraison
                </h3>
                <nav className="space-y-2">
                  {restaurant.platforms
                    .filter(p => p.category === "delivery")
                    .map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mobile-platform-btn ${platform.color}`}
                        aria-label={`Commander sur ${platform.name} - Livraison ${restaurant.name}`}
                      >
                        <span className="text-xl" aria-hidden="true">{platform.icon}</span>
                        <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                        <ExternalLink size={18} className="opacity-70" aria-hidden="true" />
                      </a>
                    ))}
                </nav>
              </section>

              {/* Address */}
              <footer className="pt-4 border-t border-border/50 text-center">
                <p className="text-foreground font-medium text-sm md:text-base">
                  📍 Tasty Food {restaurant.name}
                </p>
                <address className="text-muted-foreground text-xs md:text-sm not-italic">
                  {restaurant.address}
                </address>
              </footer>
            </article>
          ))}
        </div>

        {/* Info Banner */}
        <aside className="max-w-3xl mx-auto my-8">
          <div className="p-4 md:p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info size={18} className="text-accent" aria-hidden="true" />
              <p className="text-foreground font-medium text-sm md:text-base">
                Livraison halal à Liège
              </p>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              Toutes nos commandes passent par nos plateformes partenaires officielles (Uber Eats, Deliveroo, Takeaway ou sites officiels). Livraison rapide 30-40 min.
            </p>
          </div>
        </aside>

        {/* CTA to restaurants */}
        <nav className="max-w-3xl mx-auto text-center">
          <Link to="/restaurants" className="btn-gold inline-flex items-center gap-2" aria-label="Découvrir nos restaurants halal à Liège">
            Découvrir nos restaurants
            <ExternalLink size={16} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
};

export default Order;
