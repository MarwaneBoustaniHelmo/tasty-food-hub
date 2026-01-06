import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroBurger from "@/assets/hero-burger.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const Concept = () => {
  const values = [
    {
      title: "100% Halal",
      description: "Toutes nos viandes sont certifiées halal, sans compromis sur la qualité.",
    },
    {
      title: "Produits Frais",
      description: "Ingrédients sélectionnés quotidiennement pour une fraîcheur optimale.",
    },
    {
      title: "Smash Technique",
      description: "Nos burgers sont smashés à la commande pour une croûte parfaite.",
    },
    {
      title: "Saveurs Authentiques",
      description: "Des recettes inspirées du street food américain avec notre touche unique.",
    },
  ];

  return (
    <main className="pt-28 pb-20">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={restaurantInterior}
          alt="Concept Tasty Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-12">
            <h1 className="section-title">
              NOTRE <span className="text-gradient-gold">CONCEPT</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                L'ART DU <span className="text-gradient-gold">SMASH BURGER</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Tasty Food propose des smash burgers halal préparés avec des 
                  ingrédients frais, des saveurs audacieuses et une vraie passion 
                  pour le street food authentique.
                </p>
                <p>
                  Notre technique du "smash" consiste à écraser la viande sur la 
                  plancha brûlante, créant cette croûte caramélisée caractéristique 
                  qui fait toute la différence.
                </p>
                <p>
                  Implantés dans la région liégeoise, nous sommes fiers de servir 
                  une cuisine de qualité, accessible à tous et respectueuse des 
                  traditions halal.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="card-restaurant overflow-hidden">
                <img
                  src={heroBurger}
                  alt="Smash Burger Tasty Food"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 rounded-xl bg-primary text-primary-foreground font-display text-2xl">
                DEPUIS 2020
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">
              NOS <span className="text-gradient-gold">ENGAGEMENTS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
              >
                <CheckCircle className="text-primary mb-4" size={32} />
                <h3 className="font-display text-xl text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="section-title text-gradient-gold mb-6">
            ENVIE DE GOÛTER ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Retrouvez-nous dans l'un de nos restaurants à Liège et environs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/commander" className="btn-order">
              Commander maintenant
              <ArrowRight size={18} />
            </Link>
            <Link to="/restaurants" className="btn-gold">
              Voir nos restaurants
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Concept;
