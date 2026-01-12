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
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
        { label: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Wandre / Saint-Gilles",
      featured: false,
      platforms: [
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
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
      {/* Hero Section - Mobile optimized */}
      <section className="relative min-h-[60vh] md:min-h-screen flex items-end md:items-center justify-center overflow-hidden pt-28 md:pt-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroMain}
            alt="Smash Burger Tasty Food Liège - Menu complet avec tacos et frites"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 container pb-6 md:pb-16 md:pt-32 space-y-4 md:space-y-8 text-center">
          <div className="hidden md:block">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              🍔 Halal • Premium Street Food
            </span>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-3xl md:text-6xl lg:text-7xl leading-tight">
            <span className="text-gradient-gold">SMASH BURGERS HALAL</span>
            <br />
            <span className="text-foreground text-lg md:text-3xl lg:text-4xl">
              Liège & Environs
            </span>
          </h1>

          {/* Mobile Primary CTAs */}
          <div className="md:hidden space-y-3 pt-2">
            <OrderBottomSheet>
              <button className="btn-order w-full text-lg py-4 touch-target">
                🍔 COMMANDER MAINTENANT
              </button>
            </OrderBottomSheet>
            <Link to="/restaurants" className="btn-gold w-full py-4 touch-target">
              Voir nos restaurants
            </Link>
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

      {/* Features Section */}
      <section className="py-8 md:py-12 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-3 md:p-4">
                <span className="text-3xl md:text-4xl mb-2 block">{feature.icon}</span>
                <h3 className="font-display text-sm md:text-lg text-primary">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Order Section */}
      <section className="py-10 md:py-20">
        <div className="container">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="section-title text-gradient-gold mb-2 md:mb-4">
              COMMANDEZ EN 3 CLICS
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
              Choisissez votre restaurant et votre plateforme préférée
            </p>
          </div>

          {/* Mobile: Vertical full-width layout */}
          <div className="space-y-4 md:hidden">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className={`rounded-2xl border p-4 ${
                  restaurant.featured 
                    ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/40" 
                    : "bg-secondary/50 border-border"
                }`}
              >
                <h3 className={`font-display text-xl mb-3 flex items-center gap-2 ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                  📍 {restaurant.name}
                  {restaurant.featured && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">VEDETTE</span>}
                </h3>
                <div className="space-y-2">
                  {restaurant.platforms.map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mobile-platform-btn ${platform.color}`}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="flex-1 font-semibold">{platform.label}</span>
                      <ExternalLink size={18} className="opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-3 gap-6 max-w-4xl mx-auto">
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
            <Link to="/commander" className="btn-gold inline-flex items-center gap-2">
              Voir toutes les options
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="py-10 md:py-20 bg-card">
        <div className="container">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="section-title text-foreground mb-2 md:mb-4">
              NOS <span className="text-gradient-gold">SAVEURS</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {[
              { img: heroBurger, title: "SMASH BURGERS" },
              { img: loadedFries, title: "LOADED FRIES" },
              { img: tacos, title: "TEX-MEX" },
            ].map((item) => (
              <div key={item.title} className="card-restaurant group overflow-hidden">
                <div className="relative h-32 md:h-64 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                    <h3 className="font-display text-sm md:text-2xl text-gradient-gold">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={restaurantInterior}
            alt="Intérieur restaurant"
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            <h2 className="section-title text-foreground">
              L'EXPÉRIENCE <span className="text-gradient-gold">TASTY</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed">
              Smash burgers halal, ingrédients frais, saveurs audacieuses. 
              Découvrez notre technique unique et notre passion pour la street food premium.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {["100% Halal", "Produits frais", "Smash technique", "3 restaurants"].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs md:text-sm">
                  <Check size={14} />
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/concept" className="btn-gold inline-flex touch-target">
              Découvrir notre concept
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="py-10 md:py-16 bg-card">
        <div className="container text-center">
          <h2 className="font-display text-xl md:text-3xl text-primary mb-4 md:mb-6">
            SUIVEZ NOS AVENTURES
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <a
              href="https://www.instagram.com/tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-medium hover:scale-105 transition-transform"
            >
              📸 Instagram
            </a>
            <a
              href="https://www.tiktok.com/@tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-black border border-[#00F2EA] text-white font-medium hover:scale-105 transition-transform"
            >
              🎵 TikTok
            </a>
            <a
              href="https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61550609498498/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-[#1877F2] text-white font-medium hover:scale-105 transition-transform"
            >
              👍 Facebook
            </a>
            <a
              href="https://www.snapchat.com/add/tastyfoodlg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-[#FFFC00] text-black font-medium hover:scale-105 transition-transform"
            >
              👻 Snapchat
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 md:py-20 text-center">
        <div className="container">
          <h2 className="section-title text-gradient-gold mb-4 md:mb-6">
            PRÊT À COMMANDER ?
          </h2>
          
          {/* Mobile */}
          <div className="md:hidden">
            <OrderBottomSheet>
              <button className="btn-order w-full text-lg py-4 touch-target">
                COMMANDER MAINTENANT
              </button>
            </OrderBottomSheet>
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <Link to="/commander" className="btn-order text-lg px-10 py-4">
              Voir toutes les options
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Order Reminder */}
      <div className="mobile-order-reminder md:hidden">
        <p className="text-xs text-muted-foreground">
          👉 Commandes exclusivement via nos plateformes officielles
        </p>
      </div>
    </main>
  );
};

export default Home;
