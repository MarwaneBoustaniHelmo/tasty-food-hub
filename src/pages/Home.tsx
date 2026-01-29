import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink, Check, MapPin, Clock, Phone } from "lucide-react";
import heroMain from "@/assets/hero-tastyfood-burgers.jpg";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import tacos from "@/assets/tacos.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import OrderBottomSheet from "@/components/OrderBottomSheet";
import SEOHead from "@/components/SEOHead";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { FallingFoodGame } from "@/components/Game/FallingFoodGame";
import { MonthlyLeaderboard } from "@/components/Game/MonthlyLeaderboard";

const Home = () => {
  const { t } = useTranslation();
  
  const restaurants = [
    {
      name: "Seraing",
      featured: true,
      platforms: [
        { label: t("platforms.officialSite"), icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary" },
        { label: t("platforms.uberEats"), icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
        { label: t("platforms.deliveroo"), icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Angleur",
      featured: false,
      platforms: [
        { label: t("platforms.officialSite"), icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { label: t("platforms.uberEats"), icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
        { label: t("platforms.deliveroo"), icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Saint-Gilles",
      featured: false,
      platforms: [
        { label: t("platforms.uberEats"), icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
        { label: t("platforms.deliveroo"), icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Wandre",
      featured: false,
      platforms: [
        { label: t("platforms.uberEats"), icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { label: t("platforms.takeaway"), icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
    },
  ];

  const features = [
    { icon: "🥩", title: t("home.features.halal.title"), description: t("home.features.halal.description") },
    { icon: "🍔", title: t("home.features.smash.title"), description: t("home.features.smash.description") },
    { icon: "🍟", title: t("home.features.fries.title"), description: t("home.features.fries.description") },
    { icon: "🚴", title: t("home.features.delivery.title"), description: t("home.features.delivery.description") },
  ];

  return (
    <main>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Restaurant Halal Liège – Smash Burgers & Street Food"
        description="Tasty Food : restaurant halal à Liège proposant smash burgers, loaded fries, tacos. 4 adresses (Seraing, Angleur, Saint-Gilles, Wandre). Livraison Uber Eats & Deliveroo."
        canonical="/"
      />
      <LocalBusinessSchema isOrganization />

      {/* Hero Section - Cinematic with parallax, mobile optimized */}
      <section className="relative min-h-[50vh] sm:min-h-[55vh] md:min-h-[75vh] flex items-end justify-center overflow-hidden">
        {/* Background Image with parallax effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 animate-parallax-slow">
            <img
              src={heroMain}
              alt="Assortiment de burgers halal Tasty Food - smash burgers beef, chicken crispy et bacon sur table en bois"
              className="w-full h-full object-cover scale-105"
              loading="eager"
              fetchPriority="high"
              width={1920}
              height={1080}
            />
          </div>
          {/* Layered gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/20" />
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} />
          {/* Ambient gold glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-primary/5 blur-3xl" />
        </div>

        {/* Content with staggered animations */}
        <div className="relative z-10 container px-4 sm:px-5 md:px-4 pb-6 sm:pb-8 md:pb-20 space-y-3 sm:space-y-4 md:space-y-7 text-center">
          {/* Desktop badge - bouncy entrance */}
          <div className="hidden md:block opacity-0 animate-hero-badge">
            <span className="inline-block px-5 py-2.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary text-sm font-semibold tracking-wide shadow-lg hover:bg-primary/30 hover:border-primary/60 hover:shadow-xl transition-all duration-400">
              {t("home.heroBadge")}
            </span>
          </div>
          
          {/* Title - Cinematic entrance with delay */}
          <div className="space-y-2 sm:space-y-3 opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.15s' }}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
              <span className="text-gradient-gold inline-block drop-shadow-2xl">{t("home.heroTitle")}</span>
              <br className="md:hidden" />
              <span className="text-foreground/95 text-lg sm:text-xl md:text-3xl lg:text-4xl block mt-1 sm:mt-2 font-body font-medium">
                {t("home.heroSubtitle")}
              </span>
            </h1>
          </div>

          {/* Subtitle - Delayed entrance */}
          <p className="text-muted-foreground/90 text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed opacity-0 animate-hero-fade-in px-2" style={{ animationDelay: '0.35s' }}>
            {t("home.heroDescription")}
          </p>

          {/* Mobile Primary CTA - Above the fold with delay */}
          <div className="md:hidden pt-2 opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.5s' }}>
            <OrderBottomSheet>
              <button className="btn-order w-full text-base py-4 touch-target shadow-2xl" aria-label={t("home.orderButton")}>
                {t("header.orderNow")}
              </button>
            </OrderBottomSheet>
          </div>

          {/* Desktop CTAs - Delayed entrance */}
          <div className="hidden md:flex flex-row gap-5 justify-center items-center pt-6 opacity-0 animate-hero-fade-in" style={{ animationDelay: '0.5s' }}>
            <Link to="/commander" className="btn-order text-lg px-10 py-4 shadow-2xl" aria-label={t("home.orderButton")}>
              {t("home.orderButton")}
              <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/restaurants" className="btn-gold text-lg px-8 py-4" aria-label={t("home.viewRestaurants")}>
              {t("home.viewRestaurants")}
            </Link>
          </div>
        </div>
      </section>

      {/* Arcade Game Section - In Hero Area */}
      <section className="py-8 sm:py-10 md:py-20 bg-gradient-to-b from-card via-background to-card/30" aria-label={t("game.sectionTitle")}>
        <div className="container px-4 sm:px-5 md:px-4">
          <header className="text-center mb-6 sm:mb-8 md:mb-12 space-y-2 sm:space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gradient-gold drop-shadow-lg">
              {t("game.sectionTitle")}
            </h2>
            <p className="text-muted-foreground/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
              {t("game.sectionSubtitle")}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Game Canvas - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <FallingFoodGame />
            </div>

            {/* Leaderboard - Takes 1 column on desktop */}
            <div className="lg:col-span-1">
              <MonthlyLeaderboard />
            </div>
          </div>

          {/* Game Info Banner */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-card border border-gold/20 text-center max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <span className="text-gold font-semibold">{t("game.howItWorks")}</span><br />
              {t("game.howItWorksText")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile optimized with better spacing */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-card to-background border-y border-border/50" aria-label="Nos engagements qualité">
        <div className="container px-4 sm:px-5 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => (
              <article 
                key={feature.title} 
                className="text-center p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 transition-all duration-400 hover:transform hover:scale-105 hover:border-primary/30 hover:bg-card/80 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 block transition-transform duration-400 group-hover:scale-110" aria-hidden="true">{feature.icon}</span>
                <h2 className="font-display text-sm sm:text-base md:text-lg text-primary leading-tight mb-1 sm:mb-2 transition-colors duration-300 group-hover:text-gold">{feature.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-snug transition-colors duration-300 group-hover:text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-8 sm:py-10 md:py-16 bg-background">
        <div className="container px-4 sm:px-5 md:px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-5 md:space-y-6">
            <h2 className="font-display text-[28px] md:text-[40px] lg:text-[44px] text-foreground leading-tight">
              {t("home.seoTitle").split("Fast Food Halal")[0]}<span className="text-gradient-gold">Fast Food Halal</span>{t("home.seoTitle").split("Fast Food Halal")[1] || ""}
            </h2>
            <div className="text-muted-foreground/90 text-[15px] md:text-[17px] leading-relaxed space-y-4">
              <p>{t("home.seoContent1")}</p>
              <p>{t("home.seoContent2")}</p>
              <p>{t("home.seoContent3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Order Section */}
      <section className="py-8 sm:py-10 md:py-20 bg-gradient-to-b from-background to-card/30" aria-label={t("nav.order")}>
        <div className="container px-4 sm:px-5 md:px-4">
          <header className="text-center mb-6 sm:mb-8 md:mb-12 space-y-2 sm:space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-gradient-gold drop-shadow-lg">
              {t("home.orderOnline")}
            </h2>
            <p className="text-muted-foreground/90 text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed px-2">
              {t("home.chooseRestaurant")}
            </p>
          </header>

          {/* Mobile: Vertical cards with enhanced spacing */}
          <div className="space-y-3 sm:space-y-4 md:hidden">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.name}
                className={`rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-lg transition-all duration-400 hover:shadow-2xl ${
                  restaurant.featured 
                    ? "bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10 border-primary/50 ring-2 ring-primary/30" 
                    : "bg-card/95 backdrop-blur-sm border-border/50"
                }`}
              >
                <h3 className={`font-display text-xl mb-4 flex items-center gap-2 leading-tight ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                  <span className="text-2xl">📍</span>
                  <span>Tasty Food {restaurant.name}</span>
                  {restaurant.featured && <span className="text-[10px] bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-bold">{t("home.top")}</span>}
                </h3>
                <div className="space-y-2">
                  {restaurant.platforms.slice(0, 2).map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mobile-platform-btn ${platform.color}`}
                      aria-label={t("common.orderOn", { platform: platform.label })}
                    >
                      <span className="text-lg" aria-hidden="true">{platform.icon}</span>
                      <span className="flex-1 font-semibold text-sm">{platform.label}</span>
                      <ExternalLink size={16} className="opacity-70" aria-hidden="true" />
                    </a>
                  ))}
                  {restaurant.platforms.length > 2 && (
                    <Link 
                      to="/commander" 
                      className="block text-center text-xs text-primary py-2 hover:underline"
                    >
                      {t("home.moreOptions", { count: restaurant.platforms.length - 2 })}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.name}
                className={`card-restaurant p-6 text-center space-y-4 ${
                  restaurant.featured ? "ring-2 ring-primary/50" : ""
                }`}
              >
                {restaurant.featured && (
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {t("home.featured")}
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
                      aria-label={t("common.orderOn", { platform: platform.label })}
                    >
                      {platform.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* See all link */}
          <div className="text-center mt-6 md:mt-8">
            <Link to="/commander" className="btn-gold inline-flex items-center gap-2 text-sm md:text-base">
              {t("home.allOrderOptions")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Preview - 2 columns mobile */}
      <section className="py-6 sm:py-8 md:py-20 bg-card" aria-label={t("home.specialties")}>
        <div className="container px-4 sm:px-5 md:px-4">
          <header className="text-center mb-4 sm:mb-6 md:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
              {t("home.specialties").split(" ")[0]} <span className="text-gradient-gold">{t("home.specialties").split(" ").slice(1).join(" ")}</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base px-2">
              {t("home.specialtiesSubtitle")}
            </p>
          </header>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6">
            {[
              { img: heroBurger, title: t("home.smashBurgers"), alt: "Smash burger halal Tasty Food Liège" },
              { img: loadedFries, title: t("home.loadedFries"), alt: "Loaded fries halal - Frites garnies Tasty Food" },
              { img: tacos, title: t("home.texMex"), alt: "Tacos halal et spécialités tex-mex Liège" },
            ].map((item) => (
              <article key={item.title} className="card-restaurant group overflow-hidden p-0">
                <div className="relative aspect-square md:aspect-[4/5] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={400}
                    height={500}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-4 left-1.5 sm:left-2 md:left-4 right-1.5 sm:right-2">
                    <h3 className="font-display text-[10px] sm:text-xs md:text-xl text-gradient-gold leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Local Info Section - Important for Local SEO */}
      <section className="py-6 sm:py-8 md:py-16 bg-background" aria-label={t("home.practicalInfo")}>
        <div className="container px-4 sm:px-5 md:px-4">
          <header className="text-center mb-4 sm:mb-6 md:mb-10">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-2">
              <span className="text-gradient-gold">{t("home.practicalInfo")}</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {/* Hours */}
            <article className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border text-center">
              <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" aria-hidden="true" />
              <h3 className="font-display text-base sm:text-lg text-primary mb-1.5 sm:mb-2">{t("home.hours")}</h3>
              <p className="text-foreground font-medium text-sm sm:text-base">{t("home.hoursValue")}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">{t("home.daysOpen")}</p>
            </article>

            {/* Locations */}
            <article className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border text-center">
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" aria-hidden="true" />
              <h3 className="font-display text-base sm:text-lg text-primary mb-1.5 sm:mb-2">{t("home.addresses")}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Seraing • Angleur<br />Saint-Gilles • Wandre
              </p>
            </article>

            {/* Delivery */}
            <article className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-card border border-border text-center">
              <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" aria-hidden="true" />
              <h3 className="font-display text-base sm:text-lg text-primary mb-1.5 sm:mb-2">{t("home.delivery")}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Uber Eats • Deliveroo<br />Takeaway • {t("platforms.officialSite")}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* About Preview - More compact */}
      <section className="py-6 sm:py-8 md:py-20 relative overflow-hidden" aria-label={t("nav.concept")}>
        <div className="absolute inset-0">
          <img
            src={restaurantInterior}
            alt="Intérieur restaurant halal Tasty Food Liège"
            className="w-full h-full object-cover opacity-20"
            loading="lazy"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container px-4 sm:px-5 md:px-4 relative z-10">
          <div className="max-w-xl space-y-3 sm:space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground">
              {t("home.experienceTitle").split("TASTY FOOD")[0]}<span className="text-gradient-gold">TASTY FOOD</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
              {t("home.experienceText")}
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[t("home.features.halal.title"), t("home.features.fries.description"), t("home.addresses")].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/20 text-primary text-xs sm:text-sm">
                  <Check size={12} className="flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{tag}</span>
                </span>
              ))}
            </div>
            <Link to="/concept" className="btn-gold inline-flex touch-target text-sm sm:text-base" aria-label={t("home.discoverConcept")}>
              {t("home.discoverConcept")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Section - Compact */}
      <section className="py-6 sm:py-8 md:py-16 bg-card" aria-label={t("footer.followUs")}>
        <div className="container px-4 sm:px-5 md:px-4 text-center">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-primary mb-3 sm:mb-4 md:mb-6">
            {t("footer.followUs").toUpperCase()}
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto">
            <a
              href="https://www.instagram.com/tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xl sm:text-2xl hover:scale-105 transition-transform touch-target"
              aria-label={t("common.followOn", { platform: "Instagram" })}
            >
              📸
            </a>
            <a
              href="https://www.tiktok.com/@tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-black border border-[#00F2EA] text-white text-xl sm:text-2xl hover:scale-105 transition-transform touch-target"
              aria-label={t("common.followOn", { platform: "TikTok" })}
            >
              🎵
            </a>
            <a
              href="https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61553406575906/?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-[#1877F2] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label={t("common.followOn", { platform: "Facebook" })}
            >
              👍
            </a>
            <a
              href="https://www.snapchat.com/add/tastyfoodlg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-[#FFFC00] text-black text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label={t("common.followOn", { platform: "Snapchat" })}
            >
              👻
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA - Desktop only (mobile has sticky button) */}
      <section className="hidden md:block py-20 text-center" aria-label={t("home.orderButton")}>
        <div className="container px-4">
          <h2 className="font-display text-4xl text-gradient-gold mb-6">
            {t("home.readyToOrder", "PRÊT À COMMANDER ?")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("home.deliveryPromise", "Faites-vous livrer les meilleurs burgers halal de Liège")}
          </p>
          <Link to="/commander" className="btn-order text-lg px-10 py-4" aria-label={t("home.orderButton")}>
            {t("home.allOrderOptions")}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Info banner - Mobile reminder above sticky button */}
      <div className="md:hidden py-4 px-4 text-center bg-card border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t("footer.orderReminder")}
        </p>
      </div>
    </main>
  );
};

export default Home;
