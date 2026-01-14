import { useState } from "react";
import { MapPin, ExternalLink, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface OrderBottomSheetProps {
  children: React.ReactNode;
}

const orderLocations = [
  {
    name: "Seraing",
    address: "15 Rue Gustave Baivy, 4101 Seraing",
    featured: true,
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodseraing-seraing.be", color: "bg-primary" },
      { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Uber Eats – Crousty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
    ],
  },
  {
    name: "Angleur",
    address: "100 Rue Vaudrée, 4031 Angleur",
    featured: false,
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
      { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
      { name: "Uber Eats – Crousty", icon: "🍗", href: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
    ],
  },
  {
    name: "Saint-Gilles",
    address: "Rue Saint-Gilles 58, 4000 Liège",
    featured: false,
    platforms: [
      { name: "Uber Eats – Tasty Food", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
      { name: "Uber Eats – Crousty", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles", color: "bg-[#00CCBC]" },
    ],
  },
  {
    name: "Wandre",
    address: "Rue du Pont de Wandre 75, 4020 Liège",
    featured: false,
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Takeaway", icon: "📦", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
    ],
  },
];

const OrderBottomSheet = ({ children }: OrderBottomSheetProps) => {
  const [open, setOpen] = useState(false);
  const [expandedLocation, setExpandedLocation] = useState<string | null>("Seraing");

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
              Choisissez votre restaurant Tasty Food
            </p>
          </SheetHeader>

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
                    {location.platforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mobile-platform-btn ${platform.color}`}
                      >
                        <span className="text-xl">{platform.icon}</span>
                        <span className="flex-1 font-semibold">{platform.name}</span>
                        <ExternalLink size={18} className="opacity-70" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom safe area */}
          <div className="px-6 py-4 border-t border-border bg-card">
            <p className="text-xs text-muted-foreground text-center">
              👉 Commandes via plateformes officielles uniquement
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderBottomSheet;