import { useState } from "react";
import { MapPin, ExternalLink, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface OrderBottomSheetProps {
  children: React.ReactNode;
}

// Platform type
interface Platform {
  name: string;
  icon: string;
  href: string | null;
  color: string;
}

// Location type
interface OrderLocation {
  name: string;
  address: string;
  featured: boolean;
  platforms: Platform[];
}

// Updated data with all correct links
const orderLocations: OrderLocation[] = [
  {
    name: "Seraing / Jemeppe",
    address: "Rue Gustave Baivy 15, 4101 Jemeppe-sur-Meuse",
    featured: true,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-seraing", color: "bg-[#FF8000]" },
    ],
  },
  {
    name: "Angleur",
    address: "100 Rue Vaudrée, 4031 Angleur",
    featured: false,
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be/", color: "bg-primary" },
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/en/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-angleur", color: "bg-[#FF8000]" },
    ],
  },
  {
    name: "Wandre",
    address: "Rue du Pont de Wandre 75, 4020 Wandre",
    featured: false,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-1", color: "bg-[#FF8000]" },
    ],
  },
  {
    name: "Saint-Gilles (Liège)",
    address: "58 Rue Saint-Gilles, 4000 Liège",
    featured: false,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/en/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
      { name: "Takeaway.com", icon: "🍔", href: "https://www.takeaway.com/be/menu/tasty-food-liege-1", color: "bg-[#FF8000]" },
    ],
  },
];

// Platform button for bottom sheet
const SheetPlatformButton = ({ platform }: { platform: Platform }) => {
  if (!platform.href) {
    return null;
  }

  return (
    <a
      href={platform.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`mobile-platform-btn ${platform.color}`}
    >
      <span className="text-xl">{platform.icon}</span>
      <span className="flex-1 font-semibold">{platform.name}</span>
      <ExternalLink size={18} className="opacity-70" />
    </a>
  );
};

const OrderBottomSheet = ({ children }: OrderBottomSheetProps) => {
  const [open, setOpen] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState<string | null>("Seraing / Jemeppe");

  const toggleLocation = (name: string) => {
    setExpandedLocation(expandedLocation === name ? null : name);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card border-t border-border p-0">
        <div className="flex flex-col h-full">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </div>
          
          <SheetHeader className="px-6 pb-4 border-b border-border">
            <SheetTitle className="font-display text-2xl text-gradient-gold text-center">
              OÙ COMMANDER ?
            </SheetTitle>
            <p className="text-sm text-muted-foreground text-center">
              Choisissez le restaurant le plus proche de chez vous
            </p>
          </SheetHeader>

          {/* Tip banner */}
          <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
            <p className="text-xs text-center text-foreground/80">
              💡 <strong>Conseil :</strong> Pour une livraison plus rapide, choisissez toujours le restaurant le plus proche.
            </p>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {orderLocations.map((location) => (
              <div 
                key={location.name} 
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  location.featured 
                    ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/40" 
                    : "bg-secondary/50 border-border"
                }`}
              >
                {/* Location Header - Clickable */}
                <button
                  onClick={() => toggleLocation(location.name)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left touch-target"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${location.featured ? "bg-primary/30" : "bg-primary/20"}`}>
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className={`font-display text-xl ${location.featured ? "text-gradient-gold" : "text-primary"}`}>
                        {location.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{location.address}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-muted-foreground transition-transform duration-300 ${
                      expandedLocation === location.name ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {/* Platforms - Expandable */}
                {expandedLocation === location.name && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in">
                    <p className="text-xs text-muted-foreground mb-2">Choisissez votre plateforme :</p>
                    {location.platforms.map((platform) => (
                      <SheetPlatformButton key={platform.name} platform={platform} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom safe area */}
          <div className="px-6 py-4 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground text-center">
              Les prix et délais peuvent varier selon la plateforme choisie.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderBottomSheet;
