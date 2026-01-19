import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

/**
 * Scroll to top button - appears after 2 viewport heights of scroll
 * Mobile-friendly with proper touch target sizing
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show after scrolling 2 viewport heights
      const threshold = window.innerHeight * 2;
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 md:bottom-8 right-4 z-30 p-3 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg transition-all duration-300 hover:bg-primary/20 hover:border-primary/50 touch-target flex items-center justify-center"
      aria-label="Retour en haut"
      style={{ 
        minWidth: "48px", 
        minHeight: "48px",
        // On mobile, position above the sticky order button
        bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))"
      }}
    >
      <ChevronUp size={24} className="text-primary" />
    </button>
  );
};

export default ScrollToTop;
