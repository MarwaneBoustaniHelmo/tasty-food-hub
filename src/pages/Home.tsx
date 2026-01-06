import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroBurger from "@/assets/hero-burger.jpg";
import loadedFries from "@/assets/loaded-fries.jpg";
import tacos from "@/assets/tacos.jpg";
import restaurantInterior from "@/assets/restaurant-interior.jpg";

const Home = () => {
  const restaurants = [
    {
      name: "Angleur",
      links: [
        { label: "Site Officiel", href: "https://www.tastyfoodangleur.be" },
        { label: "Deliveroo", href: "https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur" },
      ],
    },
    {
      name: "Wandre",
      links: [
        { label: "Uber Eats", href: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ" },
        { label: "Takeaway", href: "https://www.takeaway.com/be-fr/menu/tasty-food-1" },
      ],
    },
    {
      name: "Seraing",
      links: [
        { label: "Infos", href: "https://www.findhalalfoodie.com/fr/halal-restaurant/tasty-food-r4606667" },
      ],
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBurger}
            alt="Smash Burger Tasty Food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container text-center pt-32 pb-16 space-y-8">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-6">
              🍔 Halal • Premium Street Food
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-tight animate-slide-up">
            <span className="text-gradient-gold">TASTY FOOD</span>
            <br />
            <span className="text-foreground text-3xl md:text-4xl lg:text-5xl">
              Smash Burgers Halal à Liège & Environs
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            De vrais smash burgers. Commandez en ligne sur nos plateformes officielles.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-slide-up">
            <Link to="/commander" className="btn-order text-lg px-8 py-4">
              Commander maintenant
              <ArrowRight size={20} />
            </Link>
            <Link to="/restaurants" className="btn-gold text-lg px-8 py-4">
              Voir nos restaurants
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="pt-12 animate-pulse-slow">
            <ChevronDown size={32} className="mx-auto text-primary" />
          </div>
        </div>
      </section>

      {/* Quick Order Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title text-gradient-gold mb-4">
              COMMANDEZ MAINTENANT
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Choisissez votre restaurant et commandez sur nos plateformes partenaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.name}
                className="card-restaurant p-6 text-center space-y-4"
              >
                <h3 className="font-display text-2xl text-primary">
                  {restaurant.name}
                </h3>
                <div className="flex flex-col gap-3">
                  {restaurant.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-platform justify-center"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="section-title text-foreground mb-4">
              DÉCOUVREZ NOS <span className="text-gradient-gold">SAVEURS</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Des burgers smashés, des frites gourmandes, et bien plus encore
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-restaurant group overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={heroBurger}
                  alt="Smash Burger"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-display text-2xl text-gradient-gold">
                    SMASH BURGERS
                  </h3>
                </div>
              </div>
            </div>

            <div className="card-restaurant group overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={loadedFries}
                  alt="Loaded Fries"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-display text-2xl text-gradient-gold">
                    LOADED FRIES
                  </h3>
                </div>
              </div>
            </div>

            <div className="card-restaurant group overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={tacos}
                  alt="Tex-Mex"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-display text-2xl text-gradient-gold">
                    TEX-MEX
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={restaurantInterior}
            alt="Intérieur restaurant"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl space-y-6">
            <h2 className="section-title text-foreground">
              L'EXPÉRIENCE <span className="text-gradient-gold">TASTY FOOD</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tasty Food, c'est l'alliance parfaite entre la qualité halal et l'authenticité 
              du street food américain. Nos smash burgers sont préparés avec des ingrédients 
              frais, des viandes certifiées halal et une passion pour les saveurs audacieuses.
            </p>
            <Link to="/concept" className="btn-gold inline-flex">
              Découvrir notre concept
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-card text-center">
        <div className="container">
          <h2 className="section-title text-gradient-gold mb-6">
            PRÊT À COMMANDER ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Rendez-vous sur nos plateformes partenaires pour commander votre repas Tasty Food
          </p>
          <Link to="/commander" className="btn-order text-lg px-10 py-4">
            Voir toutes les options de commande
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
