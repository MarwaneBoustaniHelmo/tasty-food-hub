import RestaurantCard from "@/components/RestaurantCard";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const Restaurants = () => {
  const restaurants = [
    {
      name: "Tasty Food Angleur",
      location: "Angleur",
      description:
        "Smash burgers halal à Angleur. Produits frais, qualité street food.",
      image: heroBurger,
      links: [
        {
          platform: "website" as const,
          href: "https://www.tastyfoodangleur.be",
          label: "Commander à Angleur – Site Officiel",
        },
        {
          platform: "deliveroo" as const,
          href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur",
          label: "Commander à Angleur sur Deliveroo",
        },
      ],
    },
    {
      name: "Tasty Food Wandre",
      location: "Wandre",
      description:
        "Votre Tasty Food à Wandre, disponible sur les principales plateformes de livraison.",
      image: loadedFries,
      links: [
        {
          platform: "ubereats" as const,
          href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ",
          label: "Commander à Wandre sur Uber Eats",
        },
        {
          platform: "takeaway" as const,
          href: "https://www.takeaway.com/be-fr/menu/tasty-food-1",
          label: "Commander à Wandre sur Takeaway",
        },
      ],
    },
    {
      name: "Tasty Food Seraing",
      location: "Seraing",
      description:
        "Restaurant Tasty Food à Seraing – informations et contact.",
      image: restaurantInterior,
      links: [
        {
          platform: "info" as const,
          href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667",
          label: "Voir les informations du restaurant",
        },
      ],
    },
  ];

  return (
    <main className="pt-24 md:pt-28 pb-10 md:pb-20">
      <div className="container px-4">
        {/* Header - Compact on mobile */}
        <div className="text-center mb-8 md:mb-16">
          <h1 className="section-title mb-2 md:mb-4">
            NOS <span className="text-gradient-gold">RESTAURANTS</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Retrouvez Tasty Food dans la région liégeoise
          </p>
        </div>

        {/* Restaurant Grid - Stack on mobile */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.name} {...restaurant} />
          ))}
        </div>

        {/* Bottom CTA - Simplified on mobile */}
        <div className="mt-8 md:mt-16 text-center">
          <div className="p-4 md:p-6 rounded-2xl bg-card border border-border">
            <p className="text-muted-foreground text-sm mb-3">
              👉 Commandes via plateformes officielles
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm">
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary">Takeaway</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary">Uber Eats</span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-primary">Deliveroo</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Restaurants;
