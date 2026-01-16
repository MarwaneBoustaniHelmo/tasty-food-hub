import { useState, useRef, useEffect, useCallback } from "react";
import { AlertTriangle, MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import BranchSelector from "@/components/order/BranchSelector";
import CategoryNav from "@/components/order/CategoryNav";
import MenuSection from "@/components/order/MenuSection";
import ItemDetailSheet from "@/components/order/ItemDetailSheet";
import PlatformCTA from "@/components/order/PlatformCTA";
import CroustySection from "@/components/order/CroustySection";
import { restaurantsMenu, croustyLocations, MenuItem } from "@/data/menuData";

const Order = () => {
  // State
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemSheetOpen, setIsItemSheetOpen] = useState(false);

  // Refs for category sections
  const categoryRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Get selected restaurant data
  const restaurant = restaurantsMenu.find(r => r.id === selectedRestaurant);

  // Set default active category when restaurant changes
  useEffect(() => {
    if (restaurant && restaurant.categories.length > 0) {
      setActiveCategory(restaurant.categories[0].id);
    }
  }, [restaurant]);

  // Intersection Observer for active category
  useEffect(() => {
    if (!restaurant) return;

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
  }, [restaurant]);

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

  return (
    <main className="pt-20 md:pt-24 pb-32 md:pb-20 min-h-screen">
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

        {/* Important Banner */}
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

        {/* Branch Selector */}
        <BranchSelector
          restaurants={restaurantsMenu}
          selectedId={selectedRestaurant}
          onSelect={setSelectedRestaurant}
        />
      </section>

      {/* Menu Content - Only shown when restaurant is selected */}
      {restaurant ? (
        <>
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

          {/* Category Navigation */}
          <CategoryNav
            categories={restaurant.categories}
            activeCategory={activeCategory}
            onCategoryClick={scrollToCategory}
          />

          {/* Menu + Platform CTA Layout */}
          <div className="container px-4 py-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Menu Sections */}
                <div className="flex-1 order-2 lg:order-1">
                  {restaurant.categories.map((category) => (
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
        </>
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
                  onClick={() => setSelectedRestaurant(r.id)}
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
      <div className="container px-4 py-6">
        <div className="max-w-md mx-auto text-center">
          <Link 
            to="/restaurants" 
            className="btn-gold inline-flex items-center gap-2"
          >
            Voir nos restaurants
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Order;
