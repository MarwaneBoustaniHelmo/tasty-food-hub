import { ExternalLink, MapPin } from "lucide-react";

const Order = () => {
  const orderLocations = [
    {
      name: "Angleur",
      description: "Commandez sur notre site officiel ou via Deliveroo",
      platforms: [
        {
          name: "Site Officiel",
          icon: "🌐",
          href: "https://www.tastyfoodangleur.be",
          color: "bg-primary hover:bg-primary/80",
        },
        {
          name: "Deliveroo",
          icon: "🚴",
          href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur",
          color: "bg-[#00CCBC] hover:bg-[#00CCBC]/80",
        },
      ],
    },
    {
      name: "Wandre",
      description: "Disponible sur Uber Eats et Takeaway",
      platforms: [
        {
          name: "Uber Eats",
          icon: "🛵",
          href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ",
          color: "bg-[#06C167] hover:bg-[#06C167]/80",
        },
        {
          name: "Takeaway",
          icon: "🍔",
          href: "https://www.takeaway.com/be-fr/menu/tasty-food-1",
          color: "bg-[#FF8000] hover:bg-[#FF8000]/80",
        },
      ],
    },
    {
      name: "Seraing",
      description: "Consultez les informations du restaurant",
      platforms: [
        {
          name: "Informations",
          icon: "ℹ️",
          href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667",
          color: "bg-secondary hover:bg-secondary/80",
        },
      ],
    },
  ];

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent text-sm font-medium mb-6">
            👉 Commander Tasty Food
          </span>
          <h1 className="section-title mb-4">
            OÙ <span className="text-gradient-gold">COMMANDER</span> ?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Toutes les commandes se font via nos plateformes partenaires officielles. 
            Choisissez votre restaurant et votre plateforme préférée.
          </p>
        </div>

        {/* Order Sections */}
        <div className="space-y-8 max-w-3xl mx-auto">
          {orderLocations.map((location) => (
            <div
              key={location.name}
              className="card-restaurant p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/20">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-gradient-gold mb-1">
                    {location.name}
                  </h2>
                  <p className="text-muted-foreground">{location.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {location.platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-foreground transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg ${platform.color}`}
                  >
                    <span className="text-2xl">{platform.icon}</span>
                    <span>{platform.name}</span>
                    <ExternalLink size={18} className="opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-foreground font-medium mb-2">
              ⚠️ Commande en ligne uniquement
            </p>
            <p className="text-muted-foreground text-sm">
              Tasty Food ne propose pas de commande directe sur ce site. 
              Utilisez nos plateformes partenaires officielles pour passer commande.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Order;
