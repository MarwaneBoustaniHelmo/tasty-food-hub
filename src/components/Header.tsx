import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Home, MapPin, ShoppingBag, Lightbulb, Video, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import OrderBottomSheet from "./OrderBottomSheet";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { path: "/", labelKey: "nav.home", icon: Home },
    { path: "/restaurants", labelKey: "nav.restaurants", icon: MapPin },
    { path: "/commander", labelKey: "nav.order", icon: ShoppingBag },
    { path: "/concept", labelKey: "nav.concept", icon: Lightbulb },
    { path: "/videos", labelKey: "nav.videos", icon: Video },
    { path: "/contact", labelKey: "nav.contact", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/50 safe-area-top shadow-lg"
      role="banner"
    >
      {/* Mobile Compact Order Banner */}
      <div className="md:hidden bg-gradient-to-r from-card/98 to-card/95 backdrop-blur-md py-2 px-4 flex items-center justify-between gap-2 border-b border-border/50 shadow-sm" role="complementary" aria-label={t("header.orderBanner")}>
        <span className="text-xs text-muted-foreground flex-1 truncate">
          {t("header.orderBanner")}
        </span>
        <OrderBottomSheet>
          <button className="btn-order-mobile touch-target">
            {t("header.orderButton")}
          </button>
        </OrderBottomSheet>
      </div>

      {/* Desktop Top banner */}
      <div className="hidden md:block bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 py-2.5 text-center shadow-inner">
        <p className="text-sm font-semibold text-primary tracking-wide">
          {t("header.orderBanner")}
        </p>
      </div>

      <div className="container px-4 flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl md:text-3xl text-gradient-gold transition-all duration-400 ease-out group-hover:scale-110 group-active:scale-105 drop-shadow-lg">
            TASTY FOOD
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" role="navigation" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-medium transition-all duration-300 ease-out relative py-1 group ${
                isActive(link.path)
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {t(link.labelKey)}
              {isActive(link.path) ? (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-300" />
              ) : (
                <span className="absolute -bottom-1 left-1/2 right-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:left-0 group-hover:right-0 opacity-0 group-hover:opacity-100" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA & Language */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector />
          <Link to="/commander" className="btn-order">
            {t("nav.order")}
          </Link>
        </div>

        {/* Mobile: Language + Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          
          {/* Mobile Menu - Using shadcn Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                className="p-2 text-foreground touch-target flex items-center justify-center"
                aria-label={t("header.openMenu")}
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] max-w-sm bg-gradient-to-br from-card to-background border-l border-primary/20 p-0 shadow-2xl"
            >
              {/* Accessibility: Title and Description for screen readers */}
              <SheetTitle className="sr-only">{t("header.menuTitle")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("header.menuDescription")}
              </SheetDescription>

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-display text-xl text-gradient-gold">TASTY FOOD</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-foreground touch-target"
                  aria-label={t("header.closeMenu")}
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
                      <span className="text-lg">{t(link.labelKey)}</span>
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
                    {t("header.orderNow")}
                  </button>
                </OrderBottomSheet>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
