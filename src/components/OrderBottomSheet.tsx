import { useState } from "react";
import { X, MapPin, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface OrderBottomSheetProps {
  children: React.ReactNode;
}

const orderLocations = [
  {
    name: "Angleur",
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
    ],
  },
  {
    name: "Wandre",
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
      { name: "Takeaway", icon: "🍔", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
    ],
  },
  {
    name: "Seraing",
    platforms: [
      { name: "Informations", icon: "ℹ️", href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667", color: "bg-secondary" },
    ],
  },
];

const OrderBottomSheet = ({ children }: OrderBottomSheetProps) => {
  const [open, setOpen] = useState(false);

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
              COMMANDER TASTY FOOD
            </SheetTitle>
            <p className="text-sm text-muted-foreground text-center">
              Choisissez votre restaurant
            </p>
          </SheetHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {orderLocations.map((location) => (
              <div key={location.name} className="rounded-2xl bg-secondary/50 border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-primary" />
                  <h3 className="font-display text-xl text-primary">{location.name}</h3>
                </div>
                
                <div className="space-y-2">
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
