import { MapPin, Navigation, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurantsMenu } from "@/data/menuData";

interface GeolocationBannerProps {
  loading: boolean;
  error: string | null;
  nearestRestaurant: string | null;
  distances: Record<string, number>;
  permissionDenied: boolean;
  onRequestLocation: () => void;
  onSelectRestaurant: (id: string) => void;
  onDismiss: () => void;
}

const GeolocationBanner = ({
  loading,
  error,
  nearestRestaurant,
  distances,
  permissionDenied,
  onRequestLocation,
  onSelectRestaurant,
  onDismiss
}: GeolocationBannerProps) => {
  const nearestInfo = nearestRestaurant 
    ? restaurantsMenu.find(r => r.id === nearestRestaurant)
    : null;
  const distance = nearestRestaurant ? distances[nearestRestaurant] : null;

  // Initial state - offer to locate
  if (!loading && !error && !nearestRestaurant && !permissionDenied) {
    return (
      <div className="max-w-2xl mx-auto mb-6">
        <div 
          className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/40"
          role="region"
          aria-label="Détection de localisation"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/30">
                <Navigation size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm md:text-base">
                  Trouver le restaurant le plus proche
                </p>
                <p className="text-xs text-muted-foreground">
                  Activez la géolocalisation pour une livraison plus rapide
                </p>
              </div>
            </div>
            
            <Button
              onClick={onRequestLocation}
              size="sm"
              className="shrink-0 bg-primary hover:bg-primary/90"
              aria-label="Activer la géolocalisation"
            >
              <MapPin size={16} className="mr-1" />
              <span className="hidden sm:inline">Me localiser</span>
              <span className="sm:hidden">📍</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mb-6">
        <div 
          className="p-4 rounded-2xl bg-secondary/50 border border-border"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-3">
            <Loader2 size={20} className="text-primary animate-spin" />
            <p className="text-sm text-foreground">
              Détection de votre position en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error or permission denied
  if (error || permissionDenied) {
    return (
      <div className="max-w-2xl mx-auto mb-6">
        <div 
          className="p-4 rounded-2xl bg-muted/50 border border-border"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground mb-1">
                  {permissionDenied 
                    ? "Géolocalisation désactivée" 
                    : "Position non disponible"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sélectionnez manuellement votre restaurant ci-dessous.
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Fermer"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Restaurant detected
  if (nearestInfo && distance !== null) {
    return (
      <div className="max-w-2xl mx-auto mb-6">
        <div 
          className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-primary/10 border border-green-500/40"
          role="region"
          aria-label="Restaurant détecté"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/30">
                <MapPin size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Restaurant le plus proche ({distance} km)
                </p>
                <p className="font-display text-lg text-foreground">
                  Tasty Food <span className="text-primary">{nearestInfo.shortName}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onSelectRestaurant(nearestRestaurant)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Commander ici
              </Button>
              <button
                onClick={onDismiss}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Choisir un autre restaurant"
                title="Choisir un autre restaurant"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GeolocationBanner;
