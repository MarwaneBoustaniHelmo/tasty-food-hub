import { ExternalLink } from "lucide-react";
import { CroustyLocation } from "@/data/menuData";

interface CroustySectionProps {
  locations: CroustyLocation[];
}

const CroustySection = ({ locations }: CroustySectionProps) => {
  return (
    <section id="crousty-section" className="scroll-mt-24 mt-12">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl md:text-3xl text-gradient-gold mb-2">
          🍗 Crousty By Tasty
        </h2>
        <p className="text-foreground/80 text-sm md:text-base max-w-xl mx-auto">
          Concept spécialisé <strong>poulet croustillant</strong> et <strong>crousty-box</strong> de Tasty Food, 
          disponible sur plusieurs plateformes à Liège.
        </p>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <article
            key={location.id}
            className="rounded-2xl border p-4 bg-accent/5 border-accent/20 hover:border-accent/40 transition-colors"
          >
            <h3 className="font-display text-lg text-accent mb-3">
              {location.name}
            </h3>
            <div className="space-y-2">
              {location.platforms.map((platform) => (
                platform.href ? (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm text-foreground transition-all hover:opacity-90 active:scale-[0.98] ${platform.color}`}
                  >
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                    <ExternalLink size={14} className="opacity-70" />
                  </a>
                ) : (
                  <div
                    key={platform.name}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-muted/30 text-muted-foreground opacity-50 text-sm"
                  >
                    <span>{platform.icon}</span>
                    <span>{platform.name}</span>
                    <span className="ml-auto text-xs">Non disponible</span>
                  </div>
                )
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CroustySection;
