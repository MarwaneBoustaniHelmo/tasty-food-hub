import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/restaurants", label: "Nos Restaurants" },
    { path: "/commander", label: "Commander" },
    { path: "/concept", label: "Concept" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top banner */}
      <div className="bg-primary/10 py-2 text-center">
        <p className="text-sm font-medium text-primary">
          👉 Commandez Tasty Food sur nos plateformes officielles
        </p>
      </div>

      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl md:text-3xl text-gradient-gold">
            TASTY FOOD
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium transition-colors duration-300 ${
                isActive(link.path)
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <Link to="/commander" className="hidden md:block btn-order">
          Commander
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-card border-t border-border animate-slide-up">
          <div className="container py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/commander"
              onClick={() => setIsOpen(false)}
              className="btn-order w-full text-center"
            >
              Commander
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
