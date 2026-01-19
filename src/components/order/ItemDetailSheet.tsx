import { ExternalLink, X } from "lucide-react";
import { MenuItem } from "@/data/menuData";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface Platform {
  name: string;
  icon: string;
  href: string | null;
  color: string;
}

interface ItemDetailSheetProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  restaurantName: string;
}

const badgeStyles = {
  "best-seller": "bg-primary/20 text-primary",
  "spicy": "bg-red-500/20 text-red-400",
  "nouveau": "bg-green-500/20 text-green-400",
  "veggie": "bg-emerald-500/20 text-emerald-400",
};

const badgeLabels = {
  "best-seller": "⭐ Best-seller",
  "spicy": "🌶️ Épicé",
  "nouveau": "✨ Nouveau",
  "veggie": "🥬 Végétarien",
};

const ItemDetailSheet = ({ item, isOpen, onClose, platforms, restaurantName }: ItemDetailSheetProps) => {
  if (!item) return null;

  const availablePlatforms = platforms.filter(p => p.href);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="bottom" 
        className="max-h-[85vh] rounded-t-3xl bg-card border-t-2 border-primary/30"
      >
        <SheetHeader className="text-left pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              {item.badges && item.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${badgeStyles[badge]}`}
                    >
                      {badgeLabels[badge]}
                    </span>
                  ))}
                </div>
              )}
              <SheetTitle className="text-xl font-display text-foreground">
                {item.name}
              </SheetTitle>
              <p className="text-2xl font-bold text-gradient-gold mt-1">
                {item.price.toFixed(2)}€
              </p>
            </div>
            <SheetClose className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <X size={20} />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="py-4 space-y-4 overflow-y-auto">
          {/* Description */}
          {item.description && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-1">Description</h4>
              <p className="text-foreground">{item.description}</p>
            </div>
          )}

          {/* Options */}
          {item.options && item.options.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Options disponibles</h4>
              <ul className="space-y-1.5">
                {item.options.map((option, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Order CTA */}
          <div className="pt-4 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Pour commander ce produit, choisissez votre plateforme de livraison :
            </p>
            
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-3 w-full px-4 py-3.5 rounded-xl font-semibold text-foreground transition-all hover:opacity-90 active:scale-[0.98] ${platform.color}`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span>Commander sur {platform.name}</span>
                  <ExternalLink size={16} className="opacity-70" />
                </a>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Vous serez redirigé vers {availablePlatforms[0]?.name || 'la plateforme'} pour finaliser votre commande à <strong>Tasty Food {restaurantName}</strong>.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ItemDetailSheet;
