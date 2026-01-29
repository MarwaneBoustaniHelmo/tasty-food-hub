import { useState, useRef, useEffect, useCallback } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import BranchSelector from "@/components/order/BranchSelector";
import CategoryNav from "@/components/order/CategoryNav";
import MenuSection from "@/components/order/MenuSection";
import ItemDetailSheet from "@/components/order/ItemDetailSheet";
import PlatformCTA from "@/components/order/PlatformCTA";
import CroustySection from "@/components/order/CroustySection";
import GeolocationBanner from "@/components/order/GeolocationBanner";
import PromotionsBanner from "@/components/order/PromotionsBanner";
import OrderFloatingWidget from "@/components/order/OrderFloatingWidget";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useMenuData } from "@/hooks/useMenuData";
import { restaurantsMenu, croustyLocations, MenuItem } from "@/data/menuData";

const Order = () => {
  // Menu data from database
  const { categories: dbCategories, loading: menuLoading, error: menuError } = useMenuData();

  // Geolocation hook
  const {
    loading: geoLoading,
    error: geoError,
    nearestRestaurant,
    distances,
    permissionDenied,
    requestLocation,
    clearLocation
  } = useGeolocation();

  // State
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(() => {
    // Check localStorage for saved preference
    if (typeof window !== "undefined") {
      return localStorage.getItem("tasty-preferred-restaurant") || null;
    }
    return null;
  });
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);
  const [showGeoBanner, setShowGeoBanner] = useState(true);

  // Refs for category sections
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Get selected restaurant data
  const restaurant = restaurantsMenu.find(r => r.id === selectedRestaurant);

  // Use database categories if available, fallback to static
  const categories = dbCategories.length > 0 ? dbCategories : (restaurant?.categories || []);

  // Set default active category when categories change
  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  // Intersection Observer for active category
  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.id.replace("category-", "");
            setActiveCategory(categoryId);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    categoryRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  // Handle restaurant selection (with localStorage persistence)
  const handleSelectRestaurant = useCallback((id: string) => {
    setSelectedRestaurant(id);
    localStorage.setItem("tasty-preferred-restaurant", id);
    setShowGeoBanner(false);
    
    // Scroll to menu section
    setTimeout(() => {
      const menuSection = document.getElementById("menu-content");
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  // Scroll to category
  const scrollToCategory = useCallback((categoryId: string) => {
    const element = categoryRefs.current.get(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Handle item selection
  const handleItemSelect = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemSheetOpen(true);
  };

  // Dismiss geolocation banner
  const handleDismissGeo = useCallback(() => {
    setShowGeoBanner(false);
    clearLocation();
  }, [clearLocation]);

  return (
    <main className="pb-32 md:pb-20 min-h-screen">
      {/* SEO */}
      <SEOHead
        title="Commander Halal à Liège – Livraison Uber Eats, Deliveroo, Takeaway"
        description="Commandez vos burgers halal en ligne à Liège. Menu complet avec photos. Livraison via Uber Eats, Deliveroo, Takeaway. 4 restaurants : Seraing, Angleur, Saint-Gilles, Wandre."
        canonical="/commander"
      />

      {/* Header Section */}
      <section className="container px-4 mb-6">
        <header className="text-center mb-6">
          <h1 className="section-title mb-2">
            <span className="text-gradient-gold">COMMANDER</span> EN LIGNE
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Parcourez notre menu, choisissez vos plats préférés, puis commandez sur votre plateforme de livraison.
          </p>
        </header>

        {/* Geolocation Banner */}
        {showGeoBanner && !selectedRestaurant && (
          <GeolocationBanner
            loading={geoLoading}
            error={geoError}
            nearestRestaurant={nearestRestaurant}
            distances={distances}
            permissionDenied={permissionDenied}
            onRequestLocation={requestLocation}
            onSelectRestaurant={handleSelectRestaurant}
            onDismiss={handleDismissGeo}
          />
        )}

        {/* Important Banner - Show only if no geolocation action */}
        {(!showGeoBanner || selectedRestaurant) && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-semibold text-sm md:text-base mb-1">
                    💡 Livraison plus rapide
                  </p>
                  <p className="text-foreground/80 text-xs md:text-sm">
                    Choisissez le restaurant <strong>le plus proche de chez vous</strong> pour une livraison optimale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branch Selector */}
        <BranchSelector
          restaurants={restaurantsMenu}
          selectedId={selectedRestaurant}
          onSelect={handleSelectRestaurant}
        />
      </section>

      {/* Menu Content - Only shown when restaurant is selected */}
      {restaurant ? (
        <div id="menu-content">
          {/* Welcome Message */}
          <div className="container px-4 mb-4">
            <div className="max-w-3xl mx-auto text-center p-4 rounded-xl bg-secondary/50">
              <p className="text-foreground font-medium">
                {restaurant.welcomeMessage}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <MapPin size={12} />
                {restaurant.address}
              </p>
            </div>
          </div>

          {/* Promotions Banner */}
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <PromotionsBanner restaurantId={selectedRestaurant!} />
            </div>
          </div>

          {/* Category Navigation */}
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={scrollToCategory}
          />

          {/* Menu + Platform CTA Layout */}
          <div className="container px-4 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Menu Sections */}
                <div className="flex-1 order-2 lg:order-1">
                  {menuLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Chargement du menu...</p>
                    </div>
                  ) : menuError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600">Erreur: {menuError}</p>
                      <p className="text-sm text-muted-foreground mt-2">Menu statique utilisé comme solution de secours.</p>
                    </div>
                  ) : null}
                  {categories.map((category) => (
                    <MenuSection
                      key={category.id}
                      ref={(el) => {
                        if (el) categoryRefs.current.set(category.id, el);
                      }}
                      category={category}
                      onItemSelect={handleItemSelect}
                    />
                  ))}
                </div>

                {/* Sticky Platform CTA - Desktop */}
                <aside className="lg:w-80 order-1 lg:order-2">
                  <div className="lg:sticky lg:top-32">
                    <PlatformCTA
                      platforms={restaurant.platforms}
                      restaurantName={restaurant.shortName}
                    />
                  </div>
                </aside>
              </div>
            </div>
          </div>

          {/* Item Detail Sheet */}
          <ItemDetailSheet
            item={selectedItem}
            isOpen={isItemSheetOpen}
            onClose={() => setIsItemSheetOpen(false)}
            platforms={restaurant.platforms}
            restaurantName={restaurant.shortName}
          />
        </div>
      ) : (
        /* Empty State */
        <div className="container px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="text-4xl">🍔</span>
            </div>
            <h2 className="font-display text-xl text-foreground mb-2">
              Sélectionnez un restaurant
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choisissez une succursale Tasty Food ci-dessus pour découvrir notre menu complet.
            </p>
            
            {/* Quick Links */}
            <div className="flex flex-col gap-2">
              {restaurantsMenu.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRestaurant(r.id)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-primary/20">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Tasty Food {r.shortName}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crousty By Tasty Section */}
      <div className="container px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <CroustySection locations={croustyLocations} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="container px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-md mx-auto text-center">
          <Link 
            to="/restaurants" 
            className="btn-gold inline-flex items-center gap-2"
          >
            Voir nos restaurants
          </Link>
        </div>
      </div>

      {/* Floating Order Widget */}
      <OrderFloatingWidget
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
      />
    </main>
  );
};

export default Order;
