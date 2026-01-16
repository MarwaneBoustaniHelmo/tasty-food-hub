import { useRef, useEffect } from "react";
import { MenuCategory } from "@/data/menuData";

interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const CategoryNav = ({ categories, activeCategory, onCategoryClick }: CategoryNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active button into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  return (
    <nav 
      className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border py-3"
      aria-label="Catégories du menu"
    >
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 -mx-4 md:mx-0 md:justify-center md:flex-wrap"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeRef : null}
              onClick={() => onCategoryClick(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary/60 text-foreground hover:bg-secondary"
              }`}
              aria-pressed={isActive}
            >
              <span className="text-base" aria-hidden="true">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
