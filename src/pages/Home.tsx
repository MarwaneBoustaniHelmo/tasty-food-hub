import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import tacos from "@/assets/tacos.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import OrderBottomSheet from "@/components/OrderBottomSheet";

const Home = () => {
  const restaurants = [
    {
      name: "Angleur",
      platforms: [
        { label: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { label: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Wandre",
      platforms: [
        { label: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { label: "Takeaway", icon: "🍔", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
    },
    {
      name: "Seraing",
      platforms: [
        { label: "Infos", icon: "ℹ️", href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667", color: "bg-secondary" },
      ],
    },
  ];

  return (
    <main>
      {/* Hero Section - Mobile optimized */}
      <section className="relative min-h-[60vh] md:min-h-screen flex items-end md:items-center justify-center overflow-hidden pt-28 md:pt-0">
        {/* Background Image with lazy loading */}
        <div className="absolute inset-0">
          <img
            src={heroBurger}
            alt="Smash Burger Tasty Food"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        {/* Content - Compact on mobile */}
        <div className="relative z-10 container pb-6 md:pb-16 md:pt-32 space-y-4 md:space-y-8 text-center">
          <div className="hidden md:block">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              🍔 Halal • Premium Street Food
            </span>
          </div>
          
          {/* Mobile: Single line slogan */}
          <h1 className="font-display text-3xl md:text-6xl lg:text-7xl leading-tight">
            <span className="text-gradient-gold">SMASH BURGERS HALAL</span>
            <br />
            <span className="text-foreground text-lg md:text-3xl lg:text-4xl">
              Commander en ligne maintenant
            </span>
          </h1>

          {/* Mobile Primary CTA - Full width */}
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

      {/* Quick Order Section - Full width buttons on mobile */}
      <section className="py-10 md:py-20 bg-card">
        <div className="container">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="section-title text-gradient-gold mb-2 md:mb-4">
              COMMANDEZ
            </h2>
            <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
              Choisissez votre restaurant
            </p>
          </div>

          {/* Mobile: Vertical full-width layout */}
          <div className="space-y-4 md:hidden">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className="rounded-2xl bg-secondary/50 border border-border p-4"
              >
                <h3 className="font-display text-xl text-primary mb-3 flex items-center gap-2">
                  📍 {restaurant.name}
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
                className="card-restaurant p-6 text-center space-y-4"
              >
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
        </div>
      </section>

      {/* Menu Preview - Compact on mobile */}
      <section className="py-10 md:py-20">
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
                    className="w-full h-full object-cover"
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

      {/* About Preview - Shorter text on mobile */}
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
            </p>
            <Link to="/concept" className="btn-gold inline-flex touch-target">
              Découvrir
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 md:py-20 bg-card text-center">
        <div className="container">
          <h2 className="section-title text-gradient-gold mb-4 md:mb-6">
            PRÊT À COMMANDER ?
          </h2>
          
          {/* Mobile: Bottom sheet trigger */}
          <div className="md:hidden">
            <OrderBottomSheet>
              <button className="btn-order w-full text-lg py-4 touch-target">
                COMMANDER MAINTENANT
              </button>
            </OrderBottomSheet>
          </div>

          {/* Desktop: Link to order page */}
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
