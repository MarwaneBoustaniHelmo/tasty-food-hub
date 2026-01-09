import { ExternalLink, MapPin } from "lucide-react";

const Order = () => {
  const orderLocations = [
    {
      name: "Angleur",
      description: "Site officiel ou Deliveroo",
      platforms: [
        { name: "Site Officiel", icon: "🌐", href: "https://www.tastyfoodangleur.be", color: "bg-primary" },
        { name: "Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur", color: "bg-[#00CCBC]" },
      ],
    },
    {
      name: "Wandre",
      description: "Uber Eats ou Takeaway",
      platforms: [
        { name: "Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ", color: "bg-[#06C167]" },
        { name: "Takeaway", icon: "🍔", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1", color: "bg-[#FF8000]" },
      ],
    },
  ];

  const seraingDirect = {
    name: "Commander sur notre site",
    icon: "🌐",
    href: "https://www.tastyfoodseraing-seraing.be",
    color: "bg-primary",
  };

  const seraingDelivery = [
    { name: "Commander sur Uber Eats", icon: "🛵", href: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg", color: "bg-[#06C167]" },
    { name: "Commander sur Deliveroo", icon: "🚴", href: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing", color: "bg-[#00CCBC]" },
    { name: "Crousty by Tasty (Tenders)", icon: "🍗", href: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw", color: "bg-[#FF8000]" },
  ];

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
                  Seraing
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground">Smash burgers, sandwiches, tex-mex & tenders</p>
              </div>
            </div>

            {/* Commander en direct */}
            <div className="mb-5 md:mb-6">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                🍔 Commander en direct
              </h3>
              <a
                href={seraingDirect.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mobile-platform-btn ${seraingDirect.color} border-2 border-primary/50`}
              >
                <span className="text-2xl">{seraingDirect.icon}</span>
                <span className="flex-1 font-semibold text-base">{seraingDirect.name}</span>
                <ExternalLink size={20} className="opacity-70" />
              </a>
            </div>

            {/* Commander en livraison */}
            <div className="mb-5 md:mb-6">
              <h3 className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                🚴 Commander en livraison
              </h3>
              <div className="space-y-3">
                {seraingDelivery.map((platform) => (
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
                📍 Tasty Food Seraing
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                15 Rue Gustave Baivy, 4101 Seraing
              </p>
            </div>
          </div>
        </div>

        {/* OTHER LOCATIONS */}
        <div className="space-y-4 md:space-y-6 max-w-3xl mx-auto">
          <h3 className="text-center text-muted-foreground text-sm font-medium uppercase tracking-wide">
            Autres restaurants
          </h3>
          {orderLocations.map((location) => (
            <div
              key={location.name}
              className="rounded-2xl bg-card border border-border p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/20">
                  <MapPin className="text-primary" size={18} />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl text-gradient-gold">
                    {location.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">{location.description}</p>
                </div>
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
                    <span className="flex-1 font-semibold text-sm">{platform.name}</span>
                    <ExternalLink size={18} className="opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-8 md:mt-12 max-w-3xl mx-auto">
          <div className="p-4 md:p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-foreground font-medium text-sm md:text-base mb-1">
              ⚠️ Commande en ligne uniquement
            </p>
            <p className="text-muted-foreground text-xs md:text-sm">
              Utilisez nos plateformes partenaires officielles
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Order;
