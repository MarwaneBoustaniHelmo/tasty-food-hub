import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, ExternalLink, Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";

const SNAP_USERNAME = "@tastyfoodlg";

const ORDER_LINKS = {
  seraing: {
    site: "https://www.tastyfoodseraing-seraing.be",
    uber: "https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg",
    crousty: "https://www.ubereats.com/be/store/crousty-by-tasty-seraing/33RMV2JdXTm0Q5b64r7-Hw",
    deliveroo: "https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing",
  },
  angleur: {
    site: "https://www.tastyfoodangleur.be",
    uber: "https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ",
    crousty: "https://www.ubereats.com/be-en/store/crousty-by-tasty-angleur/XXAamr3eU2mAD46r4vscdg",
    deliveroo: "https://deliveroo.fr/fr/menu/Liege/liege-angleur/tasty-food-angleur",
  },
  saintGilles: {
    uber: "https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ",
    crousty: "https://www.ubereats.com/be/store/crousty-by-tasty-saint-gilles/fERWmj65UQCyUbmpsmDT1w",
    deliveroo: "https://deliveroo.be/fr/menu/Liege/saint-paul/tasty-food-saint-gilles",
  },
  wandre: {
    uber: "https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ",
    takeaway: "https://www.takeaway.com/be-fr/menu/tasty-food-1",
  },
};

const Footer = () => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const socialLinks = useMemo(
    () => [
      {
        name: "Instagram",
        href: "https://www.instagram.com/tastyfoodliege",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
        gradient: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
        textColor: "text-white",
      },
      {
        name: "TikTok",
        href: "https://www.tiktok.com/@tastyfoodliege",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        ),
        gradient: "bg-black border border-[#00F2EA]",
        textColor: "text-white",
      },
      {
        name: "Facebook",
        href: "https://www.facebook.com/p/Tasty-Food-Li%C3%A8ge-61553406575906/?locale=fr_FR",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
        gradient: "bg-[#1877F2]",
        textColor: "text-white",
      },
      {
        name: "Snapchat",
        href: "https://www.snapchat.com/add/tastyfoodlg",
        icon: (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
          </svg>
        ),
        gradient: "bg-[#FFFC00]",
        textColor: "text-black",
      },
    ],
    []
  );

  const locations = useMemo(
    () => [
      {
        name: "Seraing",
        address: "15 Rue Gustave Baivy, 4101 Seraing",
        maps: "https://maps.google.com/?q=15+Rue+Gustave+Baivy+4101+Seraing+Belgium",
      },
      {
        name: "Angleur",
        address: "100 Rue Vaudrée, 4031 Angleur",
        maps: "https://maps.google.com/?q=100+Rue+Vaudree+4031+Angleur+Belgium",
      },
      {
        name: "Saint-Gilles",
        address: "Rue Saint-Gilles 58, 4000 Liège",
        maps: "https://maps.google.com/?q=Rue+Saint-Gilles+58+4000+Liege+Belgium",
      },
      {
        name: "Wandre",
        address: "Rue du Pont de Wandre 75, 4020 Liège",
        maps: "https://maps.google.com/?q=Rue+du+Pont+de+Wandre+75+4020+Liege+Belgium",
      },
    ],
    []
  );

  const copySnap = async () => {
    try {
      await navigator.clipboard.writeText(SNAP_USERNAME);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <footer className="bg-gradient-to-t from-card to-background border-t border-border/50 safe-area-bottom backdrop-blur-sm" role="contentinfo">
      {/* Mobile order reminder with gradient */}
      <div className="md:hidden py-3.5 px-5 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border-b border-border/50 text-center">
        <p className="text-xs text-muted-foreground/90 font-medium">
          {t("footer.orderReminder")}
        </p>
      </div>

      <div className="container py-10 md:py-14 px-5 md:px-4">
        {/* Mobile: Enhanced single column */}
        <div className="md:hidden space-y-7">
          <div className="text-center space-y-3">
            <h3 className="font-display text-[28px] text-gradient-gold drop-shadow-lg">TASTY FOOD</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xs mx-auto">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick links - improved mobile grid */}
          <nav className="grid grid-cols-2 gap-3 text-center max-w-sm mx-auto" aria-label="Navigation rapide">
            <Link to="/" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.home")}</Link>
            <Link to="/restaurants" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.restaurants")}</Link>
            <Link to="/commander" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.order")}</Link>
            <Link to="/concept" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.concept")}</Link>
            <Link to="/videos" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.videos")}</Link>
            <Link to="/contact" className="py-2.5 px-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105">{t("nav.contact")}</Link>
          </nav>

          {/* Social - Enhanced 4 icons with premium hover */}
          <div className="flex justify-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-full ${social.gradient} shadow-lg hover:shadow-2xl touch-target flex items-center justify-center transition-all duration-400 hover:scale-110 hover:rotate-6 active:scale-95 border border-white/20`}
                aria-label={t("common.followOn", { platform: social.name })}
              >
                <span className={social.textColor}>{social.icon}</span>
              </a>
            ))}
          </div>

          {/* Snapchat username with enhanced copy button */}
          <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground/90">
              Snapchat: <span className="text-primary font-semibold">{SNAP_USERNAME}</span>
            </p>
            <button
              onClick={copySnap}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent/20 rounded-lg hover:bg-accent/40 transition-all duration-300 text-foreground hover:scale-105 active:scale-95 border border-accent/30 font-medium"
              aria-label={t("footer.copy")}
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? t("footer.copied") : t("footer.copy")}
            </button>
          </div>
        </div>

        {/* Desktop: Enhanced grid layout */}
        <div className="hidden md:grid grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-[28px] text-gradient-gold drop-shadow-lg transition-transform duration-300 hover:scale-105 inline-block cursor-pointer">TASTY FOOD</h3>
            <p className="text-muted-foreground/90 text-[15px] leading-relaxed">
              {t("footer.taglineDesktop")}
            </p>
            <p className="text-sm text-muted-foreground/80 font-medium">
              {t("footer.hours")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-[22px] text-primary">{t("footer.navigation")}</h4>
            <nav className="flex flex-col gap-2.5" aria-label="Navigation secondaire">
              <Link to="/" className="text-muted-foreground/90 hover:text-primary transition-all duration-300 text-[15px] hover:translate-x-2 hover:font-semibold">{t("nav.home")}</Link>
              <Link to="/restaurants" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.restaurants")}</Link>
              <Link to="/commander" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.order")}</Link>
              <Link to="/concept" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.concept")}</Link>
              <Link to="/videos" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.videos")}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">{t("nav.contact")}</Link>
            </nav>
          </div>

          {/* Locations with address element for SEO */}
          <div className="space-y-4">
            <h4 className="font-display text-xl text-primary">{t("footer.ourAddresses")}</h4>
            <address className="not-italic space-y-3">
              {locations.map((loc) => (
                <a
                  key={loc.name}
                  href={loc.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{loc.name}</span>
                    <p className="text-xs">{loc.address}</p>
                  </div>
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </a>
              ))}
            </address>
          </div>

          {/* Commander + Social */}
          <div className="space-y-4">
            <h4 className="font-display text-xl text-primary">{t("footer.orderSection")}</h4>
            
            {/* Quick order links for Seraing */}
            <div className="space-y-2">
              <a
                href={ORDER_LINKS.seraing.uber}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#06C167]/20 hover:bg-[#06C167]/30 transition-colors text-sm text-foreground"
              >
                <span>🛵</span>
                <span>Seraing — {t("platforms.uberEats")}</span>
              </a>
              <a
                href={ORDER_LINKS.seraing.deliveroo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00CCBC]/20 hover:bg-[#00CCBC]/30 transition-colors text-sm text-foreground"
              >
                <span>🚴</span>
                <span>Seraing — {t("platforms.deliveroo")}</span>
              </a>
            </div>

            {/* Social links */}
            <div className="pt-2">
              <h5 className="font-medium text-sm text-muted-foreground mb-2">{t("footer.followUs")}</h5>
              <div className="grid grid-cols-2 gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${social.gradient} hover:scale-105 transition-all duration-200`}
                    aria-label={t("common.followOn", { platform: social.name })}
                  >
                    <span className={social.textColor}>{social.icon}</span>
                    <span className={`text-xs font-medium ${social.textColor}`}>{social.name}</span>
                  </a>
                ))}
              </div>

              {/* Snapchat copy */}
              <div className="flex items-center gap-2 mt-3">
                <p className="text-xs text-muted-foreground">
                  Snapchat: <span className="text-primary font-medium">{SNAP_USERNAME}</span>
                </p>
                <button
                  onClick={copySnap}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 rounded-md hover:bg-accent/40 transition-colors text-muted-foreground"
                  aria-label={t("footer.copy")}
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t("footer.copied") : t("footer.copy")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 md:mt-12 pt-4 md:pt-6 border-t border-border text-center md:flex md:justify-between md:items-center">
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex justify-center gap-4 mt-2 md:mt-0">
            <Link to="/mentions-legales" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t("footer.legalNotice")}
            </Link>
            <Link to="/confidentialite" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t("footer.privacyPolicy")}
            </Link>
          </div>
        </div>

        {/* Final reminder + Site credit */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            {t("footer.orderOnlyVia")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.madeBy")}{" "}
            <a
              href="https://www.linkedin.com/in/marwane-boustani"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-2 transition-colors"
            >
              Marwane Boustani
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
