import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink, Check, MapPin, Clock, Phone } from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import heroMainMobile from "@/assets/hero-main-mobile.jpg";
import heroMainTablet from "@/assets/hero-main-tablet.jpg";
import heroMainDesktop from "@/assets/hero-main-desktop.jpg";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import tacos from "@/assets/tacos.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import OrderBottomSheet from "@/components/OrderBottomSheet";
import SEOHead from "@/components/SEOHead";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

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

      {/* Hero Section - Mobile optimized: 40vh mobile, 70vh desktop */}
      <section className="relative min-h-[40vh] md:min-h-[70vh] flex items-end justify-center overflow-hidden pt-24 md:pt-0">
        {/* Background Image with responsive srcset for optimal performance */}
        <div className="absolute inset-0">
          <img
            srcSet={`
              ${heroMainMobile} 768w,
              ${heroMainTablet} 1280w,
              ${heroMainDesktop} 1920w
            `}
            sizes="(max-width: 768px) 768px, (max-width: 1280px) 1280px, 1920px"
            src={heroMain}
            alt="Smash Burger halal Tasty Food Liège - Burgers variés beef, chicken, bacon"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 container px-4 pb-6 md:pb-16 space-y-3 md:space-y-6 text-center">
          {/* Desktop badge */}
          <div className="hidden md:block">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-4">
              {t("home.heroBadge")}
            </span>
          </div>
          
          {/* Title - Mobile: 32px, Desktop: 56px */}
          <h1 className="font-display text-[32px] md:text-[56px] lg:text-[64px] leading-[1.1]">
            <span className="text-gradient-gold">{t("home.heroTitle")}</span>
            <br className="md:hidden" />
            <span className="text-foreground text-lg md:text-2xl lg:text-3xl block mt-1">
              {t("home.heroSubtitle")}
            </span>
          </h1>

          {/* Subtitle - Short and clear */}
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed">
            {t("home.heroDescription")}
          </p>

          {/* Mobile Primary CTA - Above the fold */}
          <div className="md:hidden pt-2">
            <OrderBottomSheet>
              <button className="btn-order w-full text-base py-4 touch-target" aria-label={t("home.orderButton")}>
                {t("header.orderNow")}
              </button>
            </OrderBottomSheet>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex flex-row gap-4 justify-center items-center pt-4">
            <Link to="/commander" className="btn-order text-lg px-8 py-4" aria-label={t("home.orderButton")}>
              {t("home.orderButton")}
              <ArrowRight size={20} />
            </Link>
            <Link to="/restaurants" className="btn-gold text-lg px-8 py-4" aria-label={t("home.viewRestaurants")}>
              {t("home.viewRestaurants")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Compact on mobile */}
      <section className="py-6 md:py-12 bg-card border-y border-border" aria-label="Nos engagements qualité">
        <div className="container px-4">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            {features.map((feature) => (
              <article key={feature.title} className="text-center p-2 md:p-4">
                <span className="text-2xl md:text-4xl mb-1 md:mb-2 block" aria-hidden="true">{feature.icon}</span>
                <h2 className="font-display text-xs md:text-lg text-primary leading-tight">{feature.title}</h2>
                <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section - Hidden visually but accessible */}
      <section className="py-8 md:py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              {t("home.seoTitle").split("Fast Food Halal")[0]}<span className="text-gradient-gold">Fast Food Halal</span>{t("home.seoTitle").split("Fast Food Halal")[1] || ""}
            </h2>
            <div className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-3">
              <p>{t("home.seoContent1")}</p>
              <p>{t("home.seoContent2")}</p>
              <p>{t("home.seoContent3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Order Section */}
      <section className="py-8 md:py-20" aria-label={t("nav.order")}>
        <div className="container px-4">
          <header className="text-center mb-6 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl text-gradient-gold mb-2">
              {t("home.orderOnline")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              {t("home.chooseRestaurant")}
            </p>
          </header>

          {/* Mobile: Vertical cards */}
          <div className="space-y-3 md:hidden">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.name}
                className={`rounded-2xl border p-4 ${
                  restaurant.featured 
                    ? "bg-gradient-to-br from-primary/15 to-accent/10 border-primary/40" 
                    : "bg-card border-border"
                }`}
              >
                <h3 className={`font-display text-lg mb-3 flex items-center gap-2 ${restaurant.featured ? "text-gradient-gold" : "text-primary"}`}>
                  📍 Tasty Food {restaurant.name}
                  {restaurant.featured && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{t("home.top")}</span>}
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
      <section className="py-8 md:py-20 bg-card" aria-label={t("home.specialties")}>
        <div className="container px-4">
          <header className="text-center mb-6 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl text-foreground mb-2">
              {t("home.specialties").split(" ")[0]} <span className="text-gradient-gold">{t("home.specialties").split(" ").slice(1).join(" ")}</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("home.specialtiesSubtitle")}
            </p>
          </header>

          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { img: heroBurger, title: t("home.smashBurgers"), alt: "Smash burger halal Tasty Food Liège" },
              { img: loadedFries, title: t("home.loadedFries"), alt: "Loaded fries halal - Frites garnies Tasty Food" },
              { img: tacos, title: t("home.texMex"), alt: "Tacos halal et spécialités tex-mex Liège" },
            ].map((item) => (
              <article key={item.title} className="card-restaurant group overflow-hidden">
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
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2">
                    <h3 className="font-display text-xs md:text-xl text-gradient-gold leading-tight">
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
      <section className="py-8 md:py-16 bg-background" aria-label={t("home.practicalInfo")}>
        <div className="container px-4">
          <header className="text-center mb-6 md:mb-10">
            <h2 className="font-display text-2xl md:text-4xl text-foreground mb-2">
              <span className="text-gradient-gold">{t("home.practicalInfo")}</span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Hours */}
            <article className="p-4 md:p-6 rounded-2xl bg-card border border-border text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-display text-lg text-primary mb-2">{t("home.hours")}</h3>
              <p className="text-foreground font-medium">{t("home.hoursValue")}</p>
              <p className="text-muted-foreground text-sm">{t("home.daysOpen")}</p>
            </article>

            {/* Locations */}
            <article className="p-4 md:p-6 rounded-2xl bg-card border border-border text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-display text-lg text-primary mb-2">{t("home.addresses")}</h3>
              <p className="text-muted-foreground text-sm">
                Seraing • Angleur<br />Saint-Gilles • Wandre
              </p>
            </article>

            {/* Delivery */}
            <article className="p-4 md:p-6 rounded-2xl bg-card border border-border text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-display text-lg text-primary mb-2">{t("home.delivery")}</h3>
              <p className="text-muted-foreground text-sm">
                Uber Eats • Deliveroo<br />Takeaway • {t("platforms.officialSite")}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* About Preview - More compact */}
      <section className="py-8 md:py-20 relative overflow-hidden" aria-label={t("nav.concept")}>
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

        <div className="container px-4 relative z-10">
          <div className="max-w-xl space-y-4">
            <h2 className="font-display text-2xl md:text-4xl text-foreground">
              {t("home.experienceTitle").split("TASTY FOOD")[0]}<span className="text-gradient-gold">TASTY FOOD</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {t("home.experienceText")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[t("home.features.halal.title"), t("home.features.fries.description"), t("home.addresses")].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs md:text-sm">
                  <Check size={12} aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
            <Link to="/concept" className="btn-gold inline-flex touch-target text-sm" aria-label={t("home.discoverConcept")}>
              {t("home.discoverConcept")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Section - Compact */}
      <section className="py-8 md:py-16 bg-card" aria-label={t("footer.followUs")}>
        <div className="container px-4 text-center">
          <h2 className="font-display text-xl md:text-3xl text-primary mb-4 md:mb-6">
            {t("footer.followUs").toUpperCase()}
          </h2>
          <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-lg mx-auto">
            <a
              href="https://www.instagram.com/tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
              aria-label={t("common.followOn", { platform: "Instagram" })}
            >
              📸
            </a>
            <a
              href="https://www.tiktok.com/@tastyfoodliege"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 md:p-4 rounded-xl bg-black border border-[#00F2EA] text-white text-lg md:text-xl hover:scale-105 transition-transform touch-target"
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
