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
    <main className="pt-28 pb-20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title mb-4">
            NOS <span className="text-gradient-gold">RESTAURANTS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Retrouvez Tasty Food dans la région liégeoise. Chaque restaurant propose 
            la même qualité et les mêmes saveurs que vous adorez.
          </p>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.name} {...restaurant} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block p-6 rounded-2xl bg-card border border-border">
            <p className="text-muted-foreground mb-4">
              👉 Toutes les commandes se font via nos plateformes partenaires officielles
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-3 py-1 rounded-full bg-secondary text-primary">Takeaway</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-primary">Uber Eats</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-primary">Deliveroo</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Restaurants;
