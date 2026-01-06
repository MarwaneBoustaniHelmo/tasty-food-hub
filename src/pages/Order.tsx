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
    {
      name: "Seraing",
      description: "Informations du restaurant",
      platforms: [
        { name: "Informations", icon: "ℹ️", href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667", color: "bg-secondary" },
      ],
    },
  ];

  return (
    <main className="pt-24 md:pt-28 pb-10 md:pb-20 min-h-screen">
      <div className="container px-4">
        {/* Header - Compact on mobile */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="section-title mb-2 md:mb-4">
            <span className="text-gradient-gold">COMMANDER</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Choisissez votre restaurant et plateforme
          </p>
        </div>

        {/* Order Sections - Full width on mobile */}
        <div className="space-y-4 md:space-y-8 max-w-3xl mx-auto">
          {orderLocations.map((location) => (
            <div
              key={location.name}
              className="rounded-2xl bg-card border border-border p-4 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 rounded-xl bg-primary/20">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-gradient-gold">
                    {location.name}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">{location.description}</p>
                </div>
              </div>

              {/* Full-width platform buttons */}
              <div className="space-y-3">
                {location.platforms.map((platform) => (
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
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-8 md:mt-16 max-w-3xl mx-auto">
          <div className="p-4 md:p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-foreground font-medium text-sm md:text-base mb-1 md:mb-2">
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
