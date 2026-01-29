import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Back to Top Button
 * Floating button that appears after scrolling down
 * Smoothly scrolls back to top on click
 */

interface BackToTopButtonProps {
  /** Scroll distance in pixels before button appears (default: 300) */
  threshold?: number;
}

const BackToTopButton = ({ threshold = 300 }: BackToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls past threshold
      setIsVisible(window.scrollY > threshold);
    };

    // Initial check
    toggleVisibility();

    // Listen to scroll with passive listener for performance
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-4 z-[60] p-3 rounded-full bg-gradient-to-br from-primary to-gold-dark text-background shadow-gold hover:shadow-gold-intense transition-all duration-300 touch-target group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Retour en haut"
      title="Retour en haut"
      type="button"
    >
      <ArrowUp 
        size={20} 
        className="transition-transform duration-300 group-hover:-translate-y-1" 
        strokeWidth={2.5}
      />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </button>
  );
};

export default BackToTopButton;
