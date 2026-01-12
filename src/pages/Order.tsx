import { ExternalLink, MapPin, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Order = () => {
  // Seraing - Featured restaurant with all platforms
  const seraingData = {
    name: "Seraing",
    address: "15 Rue Gustave Baivy, 4101 Seraing",
    description: "Smash burgers, sandwiches, tex-mex & tenders",
    direct: {
      name: "Commander sur notre site",
      icon: "🌐",
      href: "https://www.tastyfoodseraing-seraing.be",
      color: "bg-primary border-2 border-primary/50",
    },
    delivery: [
      { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
      { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
    ],
  };

  // Angleur - 3 platforms
  const angleurData = {
    name: "Angleur",
    address: "100 Rue Vaudrée, 4031 Angleur",
    description: "Site officiel, Deliveroo & Uber Eats",
    platforms: [
      { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ", color: "bg-[#06C167]" },
      { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
    ],
  };

  // Wandre / Saint-Gilles - Uber Eats only
  const wandreData = {
    name: "Wandre / Saint-Gilles",
    address: "Liège (centre / Wandre)",
    description: "Uber Eats uniquement",
    platforms: [
      { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ", color: "bg-[#06C167]" },
    ],
  };

  return (
    <main className="pt-24 md:pt-28 pb-10 md:pb-20 min-h-screen">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="section-title mb-2 md:mb-4">
            <span className="text-gradient-gold">COMMANDER</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Commandez vos smash burgers, sandwiches et tenders préférés en quelques clics.
          </p>
        </div>

        {/* SERAING FEATURED SECTION */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border-2 border-primary/40 p-5 md:p-8">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="p-2 md:p-3 rounded-xl bg-primary/30">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl text-gradient-gold">
                  {seraingData.name}
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">{seraingData.description}</p>
              </div>
            </div>

            {/* Commander en direct */}
            <div className="mb-5 md:mb-6">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                🍔 Commander en direct
              </h3>
              <a
                href={seraingData.direct.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mobile-platform-btn ${seraingData.direct.color}`}
              >
                <span className="text-2xl">{seraingData.direct.icon}</span>
                <span className="flex-1 font-semibold text-base">{seraingData.direct.name}</span>
                <ExternalLink size={20} className="opacity-70" />
              </a>
            </div>

            {/* Commander en livraison */}
            <div className="mb-5 md:mb-6">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                🚴 Commander en livraison
              </h3>
              <div className="space-y-3">
                {seraingData.delivery.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mobile-platform-btn ${platform.color}`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="flex-1 font-semibold text-base">{platform.name}</span>
                    <ExternalLink size={20} className="opacity-70" />
                  </a>
                ))}
              </div>
            </div>

            {/* Adresse */}
            <div className="pt-4 border-t border-border/50 text-center">
              <p className="text-foreground font-medium text-sm md:text-base">
                📍 Tasty Food {seraingData.name}
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                {seraingData.address}
              </p>
            </div>
          </div>
        </div>

        {/* ANGLEUR SECTION */}
        <div className="max-w-3xl mx-auto mb-4 md:mb-6">
          <div className="rounded-2xl bg-card border border-border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20">
                <MapPin className="text-primary" size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl text-gradient-gold">
                  {angleurData.name}
                </h2>
                <p className="text-xs text-muted-foreground">{angleurData.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {angleurData.platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mobile-platform-btn ${platform.color}`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                  <ExternalLink size={18} className="opacity-70" />
                </a>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              📍 {angleurData.address}
            </p>
          </div>
        </div>

        {/* WANDRE SECTION */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12">
          <div className="rounded-2xl bg-card border border-border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/20">
                <MapPin className="text-primary" size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl md:text-2xl text-gradient-gold">
                  {wandreData.name}
                </h2>
                <p className="text-xs text-muted-foreground">{wandreData.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {wandreData.platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mobile-platform-btn ${platform.color}`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                  <ExternalLink size={18} className="opacity-70" />
                </a>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              📍 {wandreData.address}
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="p-4 md:p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Info size={18} className="text-accent" />
              <p className="text-foreground font-medium text-sm md:text-base">
                Commande en ligne uniquement
              </p>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm">
              Utilisez nos plateformes partenaires officielles pour commander.
            </p>
          </div>
        </div>

        {/* CTA to restaurants */}
        <div className="max-w-3xl mx-auto text-center">
          <Link to="/restaurants" className="btn-gold inline-flex items-center gap-2">
            Découvrir nos restaurants
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Order;
