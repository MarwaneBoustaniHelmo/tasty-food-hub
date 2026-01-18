import { getPromotionsForRestaurant, getPromoIcon, getPlatformName, Promotion } from "@/data/promotionsData";

interface PromotionsBannerProps {
  restaurantId: string;
}

const PromotionsBanner = ({ restaurantId }: PromotionsBannerProps) => {
  const promotions = getPromotionsForRestaurant(restaurantId);

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 border border-primary/30">
        <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          Bons Plans du Moment
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {promotions.map((promo) => (
            <PromoTag key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PromoTag = ({ promo }: { promo: Promotion }) => {
  const icon = getPromoIcon(promo.type);
  const platformName = getPlatformName(promo.platform);

  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm"
      role="status"
      aria-label={`Promotion ${platformName}: ${promo.text}`}
    >
      <span className="text-base" aria-hidden="true">{icon}</span>
      <span className="text-foreground/90">
        <strong className="text-primary">{platformName}</strong>
        {" – "}
        {promo.text}
      </span>
    </div>
  );
};

export default PromotionsBanner;
