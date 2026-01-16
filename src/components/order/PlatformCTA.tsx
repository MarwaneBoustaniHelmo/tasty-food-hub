import { ExternalLink, Info } from "lucide-react";

interface Platform {
  name: string;
  icon: string;
  href: string | null;
  color: string;
}

interface PlatformCTAProps {
  platforms: Platform[];
  restaurantName: string;
}

const PlatformCTA = ({ platforms, restaurantName }: PlatformCTAProps) => {
  const availablePlatforms = platforms.filter(p => p.href);
  const unavailablePlatforms = platforms.filter(p => !p.href);

  return (
    <aside className="bg-card border-2 border-primary/30 rounded-2xl p-5 md:p-6">
      <h3 className="font-display text-xl md:text-2xl text-center text-gradient-gold mb-2">
        🛵 Commander Maintenant
      </h3>
      <p className="text-center text-sm text-muted-foreground mb-5">
        Finalisez votre commande chez <strong>Tasty Food {restaurantName}</strong> sur votre plateforme préférée.
      </p>

      {/* Available Platforms */}
      <div className="space-y-3">
        {availablePlatforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.href!}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-3 w-full px-5 py-4 rounded-xl font-bold text-foreground transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg ${platform.color}`}
            aria-label={`Commander sur ${platform.name}`}
          >
            <span className="text-2xl">{platform.icon}</span>
            <span className="text-base">Commander sur {platform.name}</span>
            <ExternalLink size={18} className="opacity-70" />
          </a>
        ))}
      </div>

      {/* Unavailable Platforms */}
      {unavailablePlatforms.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          {unavailablePlatforms.map((platform) => (
            <div
              key={platform.name}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-muted/30 text-muted-foreground opacity-60"
            >
              <span className="text-xl opacity-50">{platform.icon}</span>
              <span className="flex-1">{platform.name}</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">Non disponible</span>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-start gap-2 mt-5 pt-4 border-t border-border">
        <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Les prix et frais de livraison peuvent varier selon la plateforme. 
          Toutes les commandes sont traitées par les plateformes partenaires officielles.
        </p>
      </div>
    </aside>
  );
};

export default PlatformCTA;
