import { MapPin, ExternalLink, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import tacos from "@/assets/tacos.jpg";

const Restaurants = () => {
  const restaurants = [
    {
      id: "seraing",
      name: "Tasty Food Seraing",
      location: "Seraing",
      address: "15 Rue Gustave Baivy, 4101 Seraing",
      description: "Smash burgers halal et concepts croustillants. Notre restaurant phare.",
      image: restaurantInterior,
      featured: true,
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      ],
    },
    {
      id: "angleur",
      name: "Tasty Food Angleur",
      location: "Angleur",
      address: "100 Rue Vaudrée, 4031 Angleur",
      description: "Smash burgers halal et street food premium à Angleur.",
      image: heroBurger,
      featured: false,
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      id: "saint-gilles",
      name: "Tasty Food Saint-Gilles",
      location: "Saint-Gilles (Liège)",
      address: "Rue Saint-Gilles 58, 4000 Liège",
      description: "Smash burgers halal et concepts croustillants à Liège centre.",
      image: loadedFries,
      featured: false,
      platforms: [
        { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
        { name: "Uber Eats – Crousty by Tasty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      ],
    },
    {
      id: "wandre",
      name: "Tasty Food Wandre",
      location: "Wandre",
      address: "Rue du Pont de Wandre 75, 4020 Liège",
      description: "Tasty Food à Wandre, disponible sur les principales plateformes de livraison.",
      image: tacos,
      featured: false,
      platforms: [
        { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { name: "Takeaway", icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
    },
  ];

  return (
    <main className="pt-24 md:pt-28 pb-10 md:pb-20">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="section-title mb-2 md:mb-4">
            NOS <span className="text-gradient-gold">RESTAURANTS</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            4 adresses à Liège et environs – Seraing, Angleur, Saint-Gilles, Wandre
          </p>
        </div>

        {/* Restaurant Cards */}
        <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                restaurant.featured 
                  ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/40" 
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {/* Image */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                
                {/* Featured badge */}
                {restaurant.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    VEDETTE
                  </div>
                )}
                
                {/* Location badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <span className="font-display text-xl text-foreground">{restaurant.location}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <h2 className={`font-display text-xl md:text-2xl mb-2 ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                  {restaurant.name}
                </h2>
                
                <p className="text-muted-foreground text-sm mb-3">
                  {restaurant.description}
                </p>
                
                {/* Address */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin size={14} className="text-primary" />
                  <span>{restaurant.address}</span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock size={14} className="text-primary" />
                  <span>Lundi - Dimanche: 18h00 - 02h00</span>
                </div>

                {/* Platforms */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                    Commander :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {restaurant.platforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mobile-platform-btn ${platform.color}`}
                      >
                        <span className="text-lg">{platform.icon}</span>
                        <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                        <ExternalLink size={16} className="opacity-70" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="p-4 md:p-6 rounded-2xl bg-card border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground text-sm mb-4">
              👉 Commandes exclusivement via nos plateformes partenaires officielles
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Sites officiels</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Uber Eats</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Deliveroo</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">Takeaway</span>
            </div>
            <Link to="/commander" className="btn-order inline-flex items-center gap-2">
              Voir toutes les options
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Restaurants;