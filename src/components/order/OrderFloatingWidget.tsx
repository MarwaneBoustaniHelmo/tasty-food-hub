import { useState, useRef, useEffect } from "react";
import { ShoppingBag, MapPin, ChevronUp, ExternalLink, X } from "lucide-react";
import { restaurantsMenu } from "@/data/menuData";
import { cn } from "@/lib/utils";

interface OrderFloatingWidgetProps {
  selectedRestaurant: string | null;
  onSelectRestaurant: (id: string) => void;
}

const OrderFloatingWidget = ({ 
  selectedRestaurant, 
  onSelectRestaurant 
}: OrderFloatingWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Get current restaurant info
  const currentRestaurant = selectedRestaurant 
    ? restaurantsMenu.find(r => r.id === selectedRestaurant)
    : null;

  // Get primary platform link
  const primaryPlatform = currentRestaurant?.platforms.find(p => p.href);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setShowCitySelector(false);
      }
    };

    if (isExpanded || showCitySelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, showCitySelector]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
        setShowCitySelector(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleCitySelect = (restaurantId: string) => {
    onSelectRestaurant(restaurantId);
    setShowCitySelector(false);
    setIsExpanded(false);
    
    // Save to localStorage for persistence
    localStorage.setItem("tasty-preferred-restaurant", restaurantId);
  };

  // Main action based on state
  const handleMainAction = () => {
    if (!selectedRestaurant) {
      setShowCitySelector(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      ref={widgetRef}
      className={cn(
        "fixed z-50 transition-all duration-300",
        // Mobile: bottom bar
        "bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6",
        // Desktop: floating button
        "md:rounded-2xl"
      )}
    >
      {/* City Selector Modal */}
      {showCitySelector && (
        <div 
          className="absolute bottom-full mb-2 left-0 right-0 md:right-0 md:left-auto md:w-80 p-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in"
          role="dialog"
          aria-label="Sélection du restaurant"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-foreground">
              Choisir un restaurant
            </h3>
            <button
              onClick={() => setShowCitySelector(false)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Fermer"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
          
          <div className="space-y-2">
            {restaurantsMenu.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleCitySelect(restaurant.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  selectedRestaurant === restaurant.id
                    ? "bg-primary/20 border border-primary/40"
                    : "bg-secondary/50 hover:bg-secondary border border-transparent"
                )}
              >
                <div className="p-2 rounded-lg bg-primary/20">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {restaurant.shortName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {restaurant.address}
                  </p>
                </div>
                {selectedRestaurant === restaurant.id && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Platform Options */}
      {isExpanded && currentRestaurant && (
        <div 
          className="absolute bottom-full mb-2 left-0 right-0 md:right-0 md:left-auto md:w-80 p-4 bg-card border border-border rounded-2xl shadow-2xl animate-fade-in"
          role="dialog"
          aria-label="Options de commande"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Commander à</p>
              <h3 className="font-display text-lg text-primary">
                Tasty Food {currentRestaurant.shortName}
              </h3>
            </div>
            <button
              onClick={() => setShowCitySelector(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MapPin size={12} />
              Changer
            </button>
          </div>
          
          <div className="space-y-2">
            {currentRestaurant.platforms
              .filter(p => p.href)
              .map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-foreground transition-all hover:opacity-90 hover:-translate-y-0.5",
                    platform.color
                  )}
                  aria-label={`Commander sur ${platform.name} – ouvre un nouvel onglet`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="flex-1">{platform.name}</span>
                  <ExternalLink size={16} className="opacity-70" />
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Main Widget Button / Bar */}
      <div className={cn(
        "bg-card border-t md:border border-border md:rounded-2xl shadow-2xl",
        "safe-area-bottom"
      )}>
        <button
          onClick={handleMainAction}
          className={cn(
            "w-full flex items-center justify-center gap-3 p-4 md:px-6 md:py-4",
            "font-display text-lg transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            selectedRestaurant 
              ? "text-foreground" 
              : "bg-primary text-white md:bg-card md:text-foreground"
          )}
          aria-expanded={isExpanded || showCitySelector}
          aria-haspopup="dialog"
          aria-label={
            selectedRestaurant
              ? `Commander à ${currentRestaurant?.shortName}`
              : "Sélectionner un restaurant pour commander"
          }
        >
          <ShoppingBag size={22} className={cn(
            selectedRestaurant ? "text-primary" : "text-current md:text-primary"
          )} />
          
          <span className="flex-1 text-left md:flex-none">
            {selectedRestaurant ? (
              <>
                Commander à{" "}
                <span className="text-primary font-bold">
                  {currentRestaurant?.shortName}
                </span>
              </>
            ) : (
              "Où commander ?"
            )}
          </span>
          
          <ChevronUp 
            size={20} 
            className={cn(
              "transition-transform duration-300",
              (isExpanded || showCitySelector) ? "rotate-180" : ""
            )}
          />
        </button>
      </div>
    </div>
  );
};

export default OrderFloatingWidget;
