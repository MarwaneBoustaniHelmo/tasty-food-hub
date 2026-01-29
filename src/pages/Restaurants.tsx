import { MapPin, ExternalLink, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import tacos from "@/assets/tacos.jpg";
import wandreHero from "@/assets/restaurants/wandre-hero.jpg";
import SEOHead from "@/components/SEOHead";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

const Restaurants = () => {
  const restaurants = [
    {
      id: "seraing",
      name: "Tasty Food Seraing",
      location: "Seraing",
      address: "15 Rue Gustave Baivy, 4101 Seraing",
      postalCode: "4101",
      city: "Seraing",
      description: "Restaurant halal proposant smash burgers et concepts croustillants. Notre restaurant phare à Seraing.",
      image: restaurantInterior,
      featured: true,
      geo: { latitude: 50.6167, longitude: 5.5000 },
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      ],
      sameAs: [
        "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg",
        "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing"
      ],
    },
    {
      id: "angleur",
      name: "Tasty Food Angleur",
      location: "Angleur",
      address: "100 Rue Vaudrée, 4031 Angleur",
      postalCode: "4031",
      city: "Angleur",
      description: "Restaurant halal avec smash burgers et street food premium à Angleur, près de Liège.",
      image: heroBurger,
      featured: false,
      geo: { latitude: 50.6119, longitude: 5.6003 },
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
      sameAs: [
        "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ",
        "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur"
      ],
    },
    {
      id: "saint-gilles",
      name: "Tasty Food Saint-Gilles",
      location: "Saint-Gilles (Liège)",
      address: "Rue Saint-Gilles 58, 4000 Liège",
      postalCode: "4000",
      city: "Liège",
      description: "Restaurant halal au centre de Liège proposant smash burgers et concepts croustillants.",
      image: loadedFries,
      featured: false,
      geo: { latitude: 50.6326, longitude: 5.5797 },
      platforms: [
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      ],
      sameAs: [
        "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ",
        "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles"
      ],
    },
    {
      id: "wandre",
      name: "Tasty Food Wandre",
      location: "Wandre",
      address: "Rue du Pont de Wandre 75, 4020 Liège",
      postalCode: "4020",
      city: "Liège",
      description: "Restaurant halal Tasty Food à Wandre, disponible sur les principales plateformes de livraison.",
      image: wandreHero,
      featured: false,
      geo: { latitude: 50.6667, longitude: 5.6333 },
      platforms: [
        { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { name: "Takeaway", icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
      sameAs: [
        "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ",
        "https://www.takeaway.com/be-fr/menu/tasty-food-1"
      ],
    },
  ];

  return (
    <main className="pb-10 md:pb-20">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Nos Restaurants Halal à Liège – 4 Adresses"
        description="Découvrez nos 4 restaurants halal à Liège : Seraing, Angleur, Saint-Gilles, Wandre. Smash burgers, loaded fries. Ouvert 18h-02h. Livraison Uber Eats & Deliveroo."
        canonical="/restaurants"
        type="restaurant"
      />

      {/* Schema.org for each restaurant */}
      {restaurants.map((restaurant) => (
        <LocalBusinessSchema
          key={restaurant.id}
          restaurant={{
            name: restaurant.name,
            address: restaurant.address,
            postalCode: restaurant.postalCode,
            city: restaurant.city,
            description: restaurant.description,
            image: restaurant.image,
            sameAs: restaurant.sameAs,
            geo: restaurant.geo,
          }}
        />
      ))}

      <div className="container px-5 md:px-4">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14 space-y-4">
          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[48px] leading-tight mb-3 md:mb-4">
            NOS <span className="text-gradient-gold drop-shadow-lg">RESTAURANTS HALAL</span> À LIÈGE
          </h1>
          <p className="text-muted-foreground/90 text-[15px] md:text-lg max-w-2xl mx-auto leading-relaxed">
            4 adresses pour déguster les meilleurs smash burgers halal de la région liégeoise : Seraing, Angleur, Saint-Gilles, Wandre
          </p>
        </header>

        {/* Restaurant Cards */}
        <div className="space-y-6 md:space-y-10 max-w-4xl mx-auto">
          {restaurants.map((restaurant) => (
            <article
              key={restaurant.id}
              className={`rounded-2xl overflow-hidden border transition-all duration-400 group shadow-lg hover:shadow-2xl ${
                restaurant.featured 
                  ? "bg-gradient-to-br from-primary/12 via-primary/8 to-accent/6 border-primary/50 ring-2 ring-primary/30 hover:ring-primary/50" 
                  : "bg-card/95 backdrop-blur-sm border-border/60 hover:border-primary/50"
              }`}
              itemScope
              itemType="https://schema.org/Restaurant"
            >
              {/* Image with improved mobile height */}
              <div className="relative h-52 md:h-72 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={`${restaurant.name} - Restaurant halal à ${restaurant.location}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                  width={800}
                  height={400}
                  itemProp="image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300 group-hover:opacity-75" />
                
                {/* Featured badge */}
                {restaurant.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold transition-transform duration-300 group-hover:scale-105">
                    VEDETTE
                  </div>
                )}
                
                {/* Location badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
                  <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                    <MapPin size={16} className="text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-display text-xl text-foreground" itemProp="addressLocality">{restaurant.location}</span>
                </div>
              </div>

              {/* Content with enhanced mobile spacing */}
              <div className="p-5 md:p-7">
                <h2 
                  className={`font-display text-[22px] md:text-[28px] mb-3 transition-transform duration-400 group-hover:scale-[1.02] leading-tight ${restaurant.featured ? "text-gradient-gold drop-shadow-md" : "text-primary"}`}
                  itemProp="name"
                >
                  {restaurant.name}
                </h2>
                
                <p className="text-muted-foreground/90 text-[15px] md:text-base mb-4 leading-relaxed" itemProp="description">
                  {restaurant.description}
                </p>
                
                {/* Address with better spacing */}
                <address className="flex items-center gap-2.5 text-sm md:text-[15px] text-muted-foreground/80 mb-3.5 not-italic transition-colors duration-300 group-hover:text-foreground" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <MapPin size={16} className="text-primary transition-transform duration-300 group-hover:scale-110 flex-shrink-0" aria-hidden="true" />
                  <span itemProp="streetAddress">{restaurant.address}</span>
                </address>

                {/* Hours with improved icon animation */}
                <div className="flex items-center gap-2.5 text-sm md:text-[15px] text-muted-foreground/80 mb-5 transition-colors duration-300 group-hover:text-foreground">
                  <Clock size={16} className="text-primary transition-transform duration-400 group-hover:rotate-12 flex-shrink-0" aria-hidden="true" />
                  <time itemProp="openingHours" content="Mo-Su 18:00-02:00">Lundi - Dimanche: 18h00 - 02h00</time>
                </div>

                {/* Platforms with enhanced layout */}
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-bold text-foreground/90 uppercase tracking-wider">
                    Commander :
                  </p>
                  <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label={`Options de commande pour ${restaurant.name}`}>
                    {restaurant.platforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mobile-platform-btn ${platform.color} group/btn shadow-md hover:shadow-lg`}
                        aria-label={`Commander sur ${platform.name}`}
                        itemProp="sameAs"
                      >
                        <span className="text-lg" aria-hidden="true">{platform.icon}</span>
                        <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                        <ExternalLink size={16} className="opacity-70 transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true" />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <footer className="mt-8 md:mt-12 text-center">
          <div className="p-4 md:p-6 rounded-2xl bg-card border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm mb-4">
              👉 Commandez vos burgers halal exclusivement via nos plateformes partenaires officielles
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Sites officiels</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Uber Eats</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Deliveroo</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Takeaway</span>
            </div>
            <Link to="/commander" className="btn-order inline-flex items-center gap-2" aria-label="Voir toutes les options de commande">
              Voir toutes les options
              <ExternalLink size={16} aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Restaurants;
