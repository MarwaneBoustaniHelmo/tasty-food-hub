import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, MapPin, ShoppingBag, Lightbulb, Video, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
      {/* Mobile Compact Order Banner */}
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

      <div className="container px-4 flex items-center justify-between h-14 md:h-16">
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

        {/* Mobile Menu - Using shadcn Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden p-2 text-foreground touch-target flex items-center justify-center"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-[85vw] max-w-sm bg-card border-l border-border p-0"
          >
            {/* Accessibility: Title and Description for screen readers */}
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation principale du site Tasty Food
            </SheetDescription>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-display text-xl text-gradient-gold">TASTY FOOD</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-foreground touch-target"
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
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
            </nav>
            
            {/* Mobile menu order CTA */}
            <div className="p-4 border-t border-border">
              <OrderBottomSheet>
                <button 
                  className="btn-order w-full text-lg py-4 touch-target"
                  onClick={() => setIsOpen(false)}
                >
                  🍔 COMMANDER MAINTENANT
                </button>
              </OrderBottomSheet>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
