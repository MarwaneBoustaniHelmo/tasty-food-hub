import { Link } from "react-router-dom";
import { Instagram, Facebook, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Mobile order reminder */}
      <div className="md:hidden py-3 px-4 bg-accent/10 border-b border-border text-center">
        <p className="text-xs text-muted-foreground">
          👉 Commandes via Takeaway, Uber Eats, Deliveroo ou sites officiels
        </p>
      </div>

      <div className="container py-8 md:py-12 px-4">
        {/* Mobile: Simplified single column */}
        <div className="md:hidden space-y-6">
          <div className="text-center">
            <h3 className="font-display text-2xl text-gradient-gold mb-2">TASTY FOOD</h3>
            <p className="text-xs text-muted-foreground">
              Smash Burgers Halal • Liège & environs
            </p>
          </div>

          {/* Quick links - horizontal on mobile */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link>
            <Link to="/restaurants" className="text-muted-foreground hover:text-primary transition-colors">Restaurants</Link>
            <Link to="/commander" className="text-muted-foreground hover:text-primary transition-colors">Commander</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Social */}
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary touch-target flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram size={20} className="text-primary" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-secondary touch-target flex items-center justify-center"
              aria-label="Facebook"
            >
              <Facebook size={20} className="text-primary" />
            </a>
          </div>
        </div>

        {/* Desktop: Full grid layout */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-gradient-gold">TASTY FOOD</h3>
            <p className="text-muted-foreground text-sm">
              Smash Burgers Halal à Liège & environs. 
              Qualité premium, saveurs authentiques.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-xl text-primary">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link>
              <Link to="/restaurants" className="text-muted-foreground hover:text-primary transition-colors">Nos Restaurants</Link>
              <Link to="/commander" className="text-muted-foreground hover:text-primary transition-colors">Commander</Link>
              <Link to="/concept" className="text-muted-foreground hover:text-primary transition-colors">Concept</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h4 className="font-display text-xl text-primary">Nos Adresses</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Angleur
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Wandre
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Seraing
              </p>
            </div>
          </div>

          {/* Social & Order */}
          <div className="space-y-4">
            <h4 className="font-display text-xl text-primary">Suivez-nous</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-primary" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-primary" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Commandes disponibles via Takeaway, Uber Eats, Deliveroo ou sites officiels.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 md:mt-12 pt-4 md:pt-6 border-t border-border text-center md:flex md:justify-between md:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tasty Food – Liège
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0">
            Mentions légales
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
