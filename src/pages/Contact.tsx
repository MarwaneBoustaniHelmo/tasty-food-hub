import { MapPin, Clock, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const Contact = () => {
  const locations = [
    {
      name: "Tasty Food Seraing",
      address: "15 Rue Gustave Baivy, 4101 Seraing",
      maps: "https://maps.google.com/?q=15+Rue+Gustave+Baivy+4101+Seraing+Belgium",
    },
    {
      name: "Tasty Food Angleur",
      address: "100 Rue Vaudrée, 4031 Angleur",
      maps: "https://maps.google.com/?q=100+Rue+Vaudree+4031+Angleur+Belgium",
    },
    {
      name: "Tasty Food Saint-Gilles",
      address: "Rue Saint-Gilles 58, 4000 Liège",
      maps: "https://maps.google.com/?q=Rue+Saint-Gilles+58+4000+Liege+Belgium",
    },
    {
      name: "Tasty Food Wandre",
      address: "Rue du Pont de Wandre 75, 4020 Liège",
      maps: "https://maps.google.com/?q=Rue+du+Pont+de+Wandre+75+4020+Liege+Belgium",
    },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      handle: "@tastyfoodliege",
      href: "https://www.instagram.com/tastyfoodliege",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      gradient: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    },
    {
      name: "TikTok",
      handle: "@tastyfoodliege",
      href: "https://www.tiktok.com/@tastyfoodliege",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      gradient: "bg-black border-2 border-[#00F2EA]",
    },
    {
      name: "Facebook",
      handle: "Tasty Food Liège",
      href: "https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61550609498498/",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      gradient: "bg-[#1877F2]",
    },
    {
      name: "Snapchat",
      handle: "@tastyfoodlg",
      href: "https://www.snapchat.com/add/tastyfoodlg",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black" aria-hidden="true">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      ),
      gradient: "bg-[#FFFC00]",
    },
  ];

  return (
    <main className="pb-10 md:pb-20 min-h-screen">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Contact – Restaurants Halal Liège, Adresses & Horaires"
        description="Contactez Tasty Food : 4 restaurants halal à Liège (Seraing, Angleur, Saint-Gilles, Wandre). Horaires : 18h-02h, 7j/7. Suivez-nous sur Instagram et TikTok."
        canonical="/contact"
      />

      <div className="container px-4">
        {/* Header */}
        <header className="text-center mb-8 md:mb-16">
          <h1 className="section-title mb-2 md:mb-4">
            <span className="text-gradient-gold">CONTACTEZ</span>-NOUS
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            Une question sur nos restaurants halal à Liège ? Retrouvez toutes nos adresses et suivez-nous sur les réseaux.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 max-w-5xl mx-auto">
          {/* Locations */}
          <section className="space-y-4 md:space-y-6" aria-label="Nos adresses">
            <h2 className="font-display text-2xl md:text-3xl text-primary">NOS ADRESSES À LIÈGE</h2>
            
            <div className="space-y-3 md:space-y-4">
              {locations.map((location) => (
                <a
                  key={location.name}
                  href={location.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 md:p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:translate-y-[-2px] group"
                  aria-label={`Voir ${location.name} sur Google Maps`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <MapPin className="text-primary" size={20} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg md:text-xl text-foreground">
                        {location.name}
                      </h3>
                      <address className="text-muted-foreground text-sm not-italic">
                        {location.address}
                      </address>
                    </div>
                    <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>

            {/* Hours */}
            <article className="p-4 md:p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="text-primary" size={20} aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg md:text-xl text-foreground">HORAIRES</h3>
              </div>
              <p className="text-foreground font-medium">Lundi à Dimanche : 18h00 - 02h00</p>
              <p className="text-muted-foreground text-sm mt-1">
                Ouvert tous les jours, même les jours fériés !
              </p>
            </article>
          </section>

          {/* Social & Info */}
          <section className="space-y-4 md:space-y-6" aria-label="Réseaux sociaux">
            <h2 className="font-display text-2xl md:text-3xl text-primary">RESTEZ CONNECTÉS</h2>

            <p className="text-muted-foreground text-sm">
              Suivez nos aventures gourmandes, découvrez nos nouveaux burgers halal et bénéficiez d'offres exclusives !
            </p>

            {/* Social Links - Grid */}
            <nav className="grid grid-cols-2 gap-3" aria-label="Réseaux sociaux Tasty Food">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-4 py-3 md:py-4 rounded-xl ${social.gradient} hover:scale-105 transition-all duration-200 touch-target`}
                  aria-label={`Suivez Tasty Food sur ${social.name}`}
                >
                  <span className={social.name === "Snapchat" ? "text-black" : "text-white"}>
                    {social.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium text-sm block ${social.name === "Snapchat" ? "text-black" : "text-white"}`}>
                      {social.name}
                    </span>
                    <span className={`text-xs truncate block ${social.name === "Snapchat" ? "text-black/70" : "text-white/70"}`}>
                      {social.handle}
                    </span>
                  </div>
                  <ExternalLink size={14} className={social.name === "Snapchat" ? "text-black/70" : "text-white/70"} aria-hidden="true" />
                </a>
              ))}
            </nav>

            {/* Order Reminder */}
            <article className="p-4 md:p-6 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-display text-lg md:text-xl text-accent mb-3">
                📍 POUR COMMANDER
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Les commandes de burgers halal se font exclusivement via nos plateformes partenaires :
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">
                  Sites officiels
                </span>
                <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">
                  Uber Eats
                </span>
                <span className="px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium">
                  Deliveroo
                </span>
              </div>
              <Link 
                to="/commander" 
                className="btn-order w-full mt-4 text-sm py-3"
                aria-label="Voir toutes les options de commande halal"
              >
                Voir toutes les options de commande
              </Link>
            </article>

            {/* Contact Note */}
            <article className="p-4 md:p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Mail className="text-primary" size={20} aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg md:text-xl text-foreground">BESOIN D'AIDE ?</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Pour toute question concernant une commande, veuillez contacter 
                directement la plateforme utilisée ou le restaurant concerné via les réseaux sociaux.
              </p>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Contact;
