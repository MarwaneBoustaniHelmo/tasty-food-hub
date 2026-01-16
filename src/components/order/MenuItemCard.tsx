import { MenuItem } from "@/data/menuData";

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
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

const MenuItemCard = ({ item, onSelect }: MenuItemCardProps) => {
  return (
    <article
      className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-all cursor-pointer"
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(item)}
      aria-label={`${item.name} - ${item.price.toFixed(2)}€`}
    >
      <div className="flex justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          {item.badges && item.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {item.badges.map((badge) => (
                <span
                  key={badge}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeStyles[badge]}`}
                >
                  {badgeLabels[badge]}
                </span>
              ))}
            </div>
          )}

          {/* Name */}
          <h4 className="font-semibold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
            {item.name}
          </h4>

          {/* Description */}
          {item.description && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
              {item.description}
            </p>
          )}

          {/* Options preview */}
          {item.options && item.options.length > 0 && (
            <p className="text-xs text-muted-foreground/70 italic">
              {item.options.length} option{item.options.length > 1 ? 's' : ''} disponible{item.options.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col items-end justify-between shrink-0">
          <span className="text-lg font-bold text-gradient-gold">
            {item.price.toFixed(2)}€
          </span>
          <span className="mt-auto text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Voir →
          </span>
        </div>
      </div>
    </article>
  );
};

export default MenuItemCard;
