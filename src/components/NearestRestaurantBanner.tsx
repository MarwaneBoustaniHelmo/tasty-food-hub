import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { restaurantsMenu } from "@/data/menuData";
import { useNavigate } from "react-router-dom";

/**
 * Reusable component for geolocation-based restaurant discovery.
 * Shows a call-to-action to locate the nearest restaurant, displays the result,
 * and allows the user to proceed to ordering.
 * 
 * Used on: Order page, Videos page, and potentially other marketing pages.
 * 
 * Spacing: Controlled by the parent container.
 * - To adjust vertical spacing: add `mt-X` or `mb-X` classes when importing.
 * - To adjust max-width: wrap in a container with custom max-w-* classes.
 */
const NearestRestaurantBanner = () => {
  const navigate = useNavigate();
  
  const {
    loading,
    error,
    nearestRestaurant,
    distances,
    permissionDenied,
    requestLocation,
  } = useGeolocation();

  const nearestInfo = nearestRestaurant 
    ? restaurantsMenu.find(r => r.id === nearestRestaurant)
    : null;
  const distance = nearestRestaurant ? distances[nearestRestaurant] : null;

  // Handler to navigate to order page with selected restaurant
  const handleOrderNow = () => {
    if (nearestRestaurant) {
      // Save preference
      localStorage.setItem("tasty-preferred-restaurant", nearestRestaurant);
      // Navigate to order page
      navigate("/commander");
    }
  };

  // Initial state - offer to locate
  if (!loading && !error && !nearestRestaurant && !permissionDenied) {
    return (
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/40"
          role="region"
          aria-label="Détection de localisation"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/30 mb-4">
              <Navigation size={32} className="text-primary" />
            </div>
            
            <h3 className="font-display text-xl md:text-2xl text-foreground mb-2">
              Trouver le restaurant le plus proche
            </h3>
            
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md mx-auto">
              Activez la géolocalisation pour découvrir quel Tasty Food est le plus proche de vous.
            </p>
            
            <Button
              onClick={requestLocation}
              size="lg"
              className="bg-primary hover:bg-primary/90"
              aria-label="Activer la géolocalisation"
            >
              <MapPin size={20} className="mr-2" />
              Me localiser
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-6 md:p-8 rounded-2xl bg-secondary/50 border border-border"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 size={32} className="text-primary animate-spin" />
            <div>
              <p className="text-base md:text-lg font-semibold text-foreground mb-1">
                Détection en cours...
              </p>
              <p className="text-sm text-muted-foreground">
                Nous recherchons le restaurant le plus proche de vous
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or permission denied
  if (error || permissionDenied) {
    return (
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-6 md:p-8 rounded-2xl bg-muted/50 border border-border"
          role="alert"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <AlertCircle size={32} className="text-muted-foreground" />
            <div>
              <p className="text-base md:text-lg font-semibold text-foreground mb-2">
                {permissionDenied 
                  ? "Géolocalisation désactivée" 
                  : "Position non disponible"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Pas de problème ! Vous pouvez sélectionner manuellement votre restaurant préféré.
              </p>
              <Button
                onClick={() => navigate("/commander")}
                variant="outline"
                size="lg"
              >
                Choisir mon restaurant
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant detected - Success state
  if (nearestInfo && distance !== null) {
    return (
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-green-500/20 to-primary/10 border border-green-500/40"
          role="region"
          aria-label="Restaurant détecté"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-green-500/30 mb-4">
              <MapPin size={32} className="text-green-400" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-1">
              Restaurant le plus proche • {distance.toFixed(1)} km
            </p>
            
            <h3 className="font-display text-2xl md:text-3xl text-foreground mb-2">
              Tasty Food <span className="text-primary">{nearestInfo.shortName}</span>
            </h3>
            
            <p className="text-sm text-muted-foreground mb-6">
              {nearestInfo.address}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleOrderNow}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Commander maintenant
              </Button>
              
              <Button
                onClick={() => navigate("/restaurants")}
                variant="outline"
                size="lg"
              >
                Voir tous les restaurants
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default NearestRestaurantBanner;
