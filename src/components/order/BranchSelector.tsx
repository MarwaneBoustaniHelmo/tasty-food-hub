import { MapPin, ChevronDown } from "lucide-react";
import { RestaurantMenu } from "@/data/menuData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchSelectorProps {
  restaurants: RestaurantMenu[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const BranchSelector = ({ restaurants, selectedId, onSelect }: BranchSelectorProps) => {
  const selected = restaurants.find(r => r.id === selectedId);

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-muted-foreground mb-2 text-center">
        Choisissez votre restaurant
      </label>
      
      <Select value={selectedId || ""} onValueChange={onSelect}>
        <SelectTrigger 
          className="w-full h-14 px-4 rounded-xl bg-card border-2 border-primary/30 hover:border-primary transition-colors text-base"
          aria-label="Sélectionner un restaurant"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <MapPin size={18} className="text-primary" />
            </div>
            <SelectValue placeholder="Sélectionnez une succursale..." />
          </div>
        </SelectTrigger>
        
        <SelectContent className="bg-card border-border">
          {restaurants.map((restaurant) => (
            <SelectItem 
              key={restaurant.id} 
              value={restaurant.id}
              className="py-3 px-4 cursor-pointer focus:bg-primary/10"
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold text-foreground">
                  Tasty Food {restaurant.shortName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {restaurant.address}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Quick selection buttons for mobile */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 md:hidden">
        {restaurants.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedId === r.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/80 text-foreground hover:bg-secondary"
            }`}
            aria-pressed={selectedId === r.id}
          >
            {r.shortName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BranchSelector;
