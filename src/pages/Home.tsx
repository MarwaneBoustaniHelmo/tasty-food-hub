import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import tacos from "@/assets/tacos.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import OrderBottomSheet from "@/components/OrderBottomSheet";

const Home = () => {
  const restaurants = [
    {
      name: "Seraing",
      featured: true,
      platforms: [
        { label: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary" },
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
        { label: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Angleur",
      featured: false,
      platforms: [
        { label: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
        { label: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Saint-Gilles",
      featured: false,
      platforms: [
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
        { label: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Wandre",
      featured: false,
      platforms: [
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { label: "Takeaway", icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
    },
  ];

  const features = [
    { icon: "🥩", title: "100% Halal", description: "Viande certifiée" },
    { icon: "🍔", title: "Smash Technique", description: "Croûte croustillante" },
    { icon: "🍟", title: "Frites Maison", description: "Fraîches et croustillantes" },
    { icon: "🚴", title: "Livraison Rapide", description: "30-40 min" },
  ];

  return (
    <main>
      {/* Hero Section - Mobile optimized: 40vh mobile, 70vh desktop */}
      <section className="relative min-h-[40vh] md:min-h-[70vh] flex items-end justify-center overflow-hidden pt-24 md:pt-0">
        {/* Background Image with aspect ratio for CLS prevention */}
        <div className="absolute inset-0">
          <img
            src={heroMain}
            alt="Smash Burger Tasty Food Liège"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container px-4 pb-6 md:pb-16 space-y-3 md:space-y-6 text-center">
          {/* Desktop badge */}
          <div className="hidden md:block">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-4">
              🍔 Halal • Premium Street Food
            </span>
          </div>
          
          {/* Title - Mobile: 32px, Desktop: 56px */}
          <h1 className="font-display text-[32px] md:text-[56px] lg:text-[64px] leading-[1.1]">
            <span className="text-gradient-gold">SMASH BURGERS</span>
            <br className="md:hidden" />
            <span className="text-foreground text-lg md:text-2xl lg:text-3xl block mt-1">
              Halal • Liège & Environs
            </span>
          </h1>

          {/* Subtitle - Short and clear */}
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
            👉 Commandez sur nos plateformes officielles
          </p>

          {/* Mobile Primary CTA - Above the fold */}
          <div className="md:hidden pt-2">
            <OrderBottomSheet>
              <button className="btn-order w-full text-base py-4 touch-target">
                🍔 COMMANDER
              </button>
            </OrderBottomSheet>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex flex-row gap-4 justify-center items-center pt-4">
            <Link to="/commander" className="btn-order text-lg px-8 py-4">
              Commander maintenant
              <ArrowRight size={20} />
            </Link>
            <Link to="/restaurants" className="btn-gold text-lg px-8 py-4">
              Voir nos restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Compact on mobile */}
      <section className="py-6 md:py-12 bg-card border-y border-border">
        <div className="container px-4">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-2 md:p-4">
                <span className="text-2xl md:text-4xl mb-1 md:mb-2 block">{feature.icon}</span>
                <h3 className="font-display text-xs md:text-lg text-primary leading-tight">{feature.title}</h3>
                <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Order Section */}
      <section className="py-8 md:py-20">
        <div className="container px-4">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl text-gradient-gold mb-2">
              COMMANDEZ EN 3 CLICS
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              Choisissez votre restaurant préféré
            </p>
          </div>

          {/* Mobile: Vertical cards */}
          <div className="space-y-3 md:hidden">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className={`rounded-2xl border p-4 ${
                  restaurant.featured 
                    ? "bg-gradient-to-br from-primary/15 to-accent/10 border-primary/40" 
                    : "bg-card border-border"
                }`}
              >
                <h3 className={`font-display text-lg mb-3 flex items-center gap-2 ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                  📍 {restaurant.name}
                  {restaurant.featured && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">TOP</span>}
                </h3>
                <div className="space-y-2">
                  {restaurant.platforms.slice(0, 2).map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mobile-platform-btn ${platform.color}`}
                    >
                      <span className="text-lg">{platform.icon}</span>
                      <span className="flex-1 font-semibold text-sm">{platform.label}</span>
                      <ExternalLink size={16} className="opacity-70" />
                    </a>
                  ))}
                  {restaurant.platforms.length > 2 && (
                    <Link 
                      to="/commander" 
                      className="block text-center text-xs text-primary py-2 hover:underline"
                    >
                      + {restaurant.platforms.length - 2} autres options
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className={`card-restaurant p-6 text-center space-y-4 ${
                  restaurant.featured ? "ring-2 ring-primary/50" : ""
                }`}
              >
                {restaurant.featured && (
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    VEDETTE
                  </span>
                )}
                <h3 className="font-display text-2xl text-primary">
                  {restaurant.name}
                </h3>
                <div className="flex flex-col gap-3">
                  {restaurant.platforms.map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-platform justify-center"
                    >
                      {platform.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* See all link */}
          <div className="text-center mt-6 md:mt-8">
            <Link to="/commander" className="btn-gold inline-flex items-center gap-2 text-sm md:text-base">
              Toutes les options
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Preview - 2 columns mobile */}
      <section className="py-8 md:py-20 bg-card">
        <div className="container px-4">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl text-foreground mb-2">
              NOS <span className="text-gradient-gold">SAVEURS</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { img: heroBurger, title: "SMASH BURGERS" },
              { img: loadedFries, title: "LOADED FRIES" },
              { img: tacos, title: "TEX-MEX" },
            ].map((item) => (
              <div key={item.title} className="card-restaurant group overflow-hidden">
                <div className="relative aspect-square md:aspect-[4/5] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2">
                    <h3 className="font-display text-xs md:text-xl text-gradient-gold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview - More compact */}
      <section className="py-8 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={restaurantInterior}
            alt="Intérieur restaurant Tasty Food"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container px-4 relative z-10">
          <div className="max-w-xl space-y-4">
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              L'EXPÉRIENCE <span className="text-gradient-gold">TASTY</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Smash burgers halal et street food croustillante. Ingrédients frais, saveurs audacieuses.
            </p>
            <div className="flex flex-wrap gap-2">
              {["100% Halal", "Produits frais", "4 restaurants"].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs md:text-sm">
                  <Check size={12} />
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/concept" className="btn-gold inline-flex touch-target text-sm">
              Découvrir notre concept
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Section - Compact */}
      <section className="py-8 md:py-16 bg-card">
        <div className="container px-4 text-center">
          <h2 className="font-display text-xl md:text-3xl text-primary mb-4 md:mb-6">
            SUIVEZ-NOUS
          </h2>
          <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-lg mx-auto">
            <a
              href="https://www.instagram.com/tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label="Instagram"
            >
              📸
            </a>
            <a
              href="https://www.tiktok.com/@tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-black border border-[#00F2EA] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label="TikTok"
            >
              🎵
            </a>
            <a
              href="https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61553406575906/?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-[#1877F2] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label="Facebook"
            >
              👍
            </a>
            <a
              href="https://www.snapchat.com/add/tastyfoodlg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-[#FFFC00] text-black text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label="Snapchat"
            >
              👻
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA - Desktop only (mobile has sticky button) */}
      <section className="hidden md:block py-20 text-center">
        <div className="container px-4">
          <h2 className="font-display text-4xl text-gradient-gold mb-6">
            PRÊT À COMMANDER ?
          </h2>
          <Link to="/commander" className="btn-order text-lg px-10 py-4">
            Voir toutes les options
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Info banner - Mobile reminder above sticky button */}
      <div className="md:hidden py-4 px-4 text-center bg-card border-t border-border">
        <p className="text-xs text-muted-foreground">
          👉 Commandes via plateformes officielles uniquement
        </p>
      </div>
    </main>
  );
};

export default Home;
