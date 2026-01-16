import { forwardRef } from "react";
import { MenuCategory, MenuItem } from "@/data/menuData";
import MenuItemCard from "./MenuItemCard";

interface MenuSectionProps {
  category: MenuCategory;
  onItemSelect: (item: MenuItem) => void;
}

const MenuSection = forwardRef<HTMLElement, MenuSectionProps>(
  ({ category, onItemSelect }, ref) => {
    return (
      <section
        ref={ref}
        id={`category-${category.id}`}
        className="scroll-mt-32 mb-8"
        aria-labelledby={`heading-${category.id}`}
      >
        {/* Category Header */}
        <header className="flex items-center gap-3 mb-4">
          <span className="text-2xl" aria-hidden="true">{category.icon}</span>
          <h3 
            id={`heading-${category.id}`}
            className="font-display text-xl md:text-2xl text-foreground"
          >
            {category.name}
          </h3>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            {category.items.length} produit{category.items.length > 1 ? 's' : ''}
          </span>
        </header>

        {/* Items Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {category.items.map((item) => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onSelect={onItemSelect}
            />
          ))}
        </div>
      </section>
    );
  }
);

MenuSection.displayName = "MenuSection";

export default MenuSection;
