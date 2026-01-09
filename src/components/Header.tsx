import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, MapPin, ShoppingBag, Lightbulb, Video, Phone } from "lucide-react";
import OrderBottomSheet from "./OrderBottomSheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Accueil", icon: Home },
    { path: "/restaurants", label: "Restaurants", icon: MapPin },
    { path: "/commander", label: "Commander", icon: ShoppingBag },
    { path: "/concept", label: "Concept", icon: Lightbulb },
    { path: "/videos", label: "Nos Vidéos", icon: Video },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Mobile Sticky Order Banner - 64px total with order button */}
      <div className="md:hidden bg-card/95 backdrop-blur-sm py-2 px-4 flex items-center justify-between gap-2 border-b border-border">
        <span className="text-xs text-muted-foreground flex-1 truncate">
          👉 Commander sur nos plateformes
        </span>
        <OrderBottomSheet>
          <button className="btn-order-mobile touch-target">
            COMMANDER
          </button>
        </OrderBottomSheet>
      </div>

      {/* Desktop Top banner */}
      <div className="hidden md:block bg-primary/10 py-2 text-center">
        <p className="text-sm font-medium text-primary">
          👉 Commandez Tasty Food sur nos plateformes officielles
        </p>
      </div>

      <div className="container flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-xl md:text-3xl text-gradient-gold transition-transform duration-300 group-hover:scale-105">
            TASTY FOOD
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium transition-all duration-300 relative py-1 ${
                isActive(link.path)
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <Link to="/commander" className="hidden md:block btn-order">
          Commander
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground touch-target flex items-center justify-center"
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - Full screen slide-in */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <nav className="fixed top-[104px] left-0 right-0 bottom-0 bg-card z-50 md:hidden animate-slide-up overflow-y-auto">
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 py-4 px-4 rounded-xl font-medium transition-all duration-200 touch-target ${
                      isActive(link.path)
                        ? "text-primary bg-primary/10 border-l-4 border-primary"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary"
                    }`}
                  >
                    <Icon size={24} className={isActive(link.path) ? "text-primary" : "text-muted-foreground"} />
                    <span className="text-lg">{link.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile menu order CTA */}
              <div className="pt-4 mt-4 border-t border-border">
                <OrderBottomSheet>
                  <button 
                    className="btn-order w-full text-lg py-4 touch-target"
                    onClick={() => setIsOpen(false)}
                  >
                    🍔 COMMANDER MAINTENANT
                  </button>
                </OrderBottomSheet>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
