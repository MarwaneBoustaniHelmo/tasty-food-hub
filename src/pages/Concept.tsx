import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroBurger from "@/assets/hero-burger.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";
import SEOHead from "@/components/SEOHead";

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
    <main className="pb-10 md:pb-20">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Notre Concept – Restaurant Halal & Smash Burgers"
        description="Découvrez le concept Tasty Food : smash burgers halal, produits frais, technique authentique. Restaurant fast food halal à Liège depuis 2020."
        canonical="/concept"
      />

      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] overflow-hidden">
        <img
          src={restaurantInterior}
          alt="Intérieur restaurant halal Tasty Food Liège"
          className="w-full h-full object-cover"
          loading="eager"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container px-4 pb-8 md:pb-12">
            <h1 className="section-title">
              NOTRE <span className="text-gradient-gold">CONCEPT</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-10 md:py-20" aria-label="Notre histoire">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">
                L'ART DU <span className="text-gradient-gold">SMASH BURGER HALAL</span>
              </h2>
              <div className="space-y-4 text-muted-foreground text-sm md:text-lg leading-relaxed">
                <p>
                  <strong>Tasty Food</strong> est le spécialiste du <strong>smash burger halal à Liège</strong>. 
                  Depuis 2020, nous proposons une <strong>street food halal</strong> préparée avec des 
                  ingrédients frais, des saveurs audacieuses et une vraie passion pour l'authenticité.
                </p>
                <p>
                  Notre technique du "smash" consiste à écraser la viande sur la 
                  plancha brûlante, créant cette croûte caramélisée caractéristique 
                  qui fait toute la différence. Chaque burger est préparé à la commande.
                </p>
                <p>
                  Implantés dans la région liégeoise avec <strong>4 restaurants halal</strong> (Seraing, Angleur, 
                  Saint-Gilles, Wandre), nous sommes fiers de servir une cuisine de qualité, 
                  accessible à tous et respectueuse des traditions halal.
                </p>
              </div>
            </div>

            <div className="relative">
              <figure className="card-restaurant overflow-hidden">
                <img
                  src={heroBurger}
                  alt="Smash Burger halal - Spécialité Tasty Food Liège"
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                  width={600}
                  height={400}
                />
              </figure>
              <div className="absolute -bottom-4 md:-bottom-6 -left-2 md:-left-6 p-4 md:p-6 rounded-xl bg-primary text-primary-foreground font-display text-xl md:text-2xl">
                DEPUIS 2020
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-10 md:py-20 bg-card" aria-label="Nos engagements qualité">
        <div className="container px-4">
          <header className="text-center mb-8 md:mb-12">
            <h2 className="section-title mb-4">
              NOS <span className="text-gradient-gold">ENGAGEMENTS</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Chez Tasty Food, la qualité halal et la fraîcheur sont nos priorités absolues
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {values.map((value, index) => (
              <article
                key={index}
                className="p-5 md:p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
              >
                <CheckCircle className="text-primary mb-3 md:mb-4" size={28} aria-hidden="true" />
                <h3 className="font-display text-lg md:text-xl text-primary mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-20" aria-label="Commander maintenant">
        <div className="container px-4 text-center">
          <h2 className="section-title text-gradient-gold mb-4 md:mb-6">
            ENVIE DE GOÛTER ?
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Retrouvez-nous dans l'un de nos 4 restaurants halal à Liège et environs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/commander" className="btn-order" aria-label="Commander des burgers halal maintenant">
              Commander maintenant
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/restaurants" className="btn-gold" aria-label="Voir nos restaurants halal à Liège">
              Voir nos restaurants
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Concept;
