import { useEffect, useState } from 'react';

/**
 * Scroll Progress Bar
 * Shows reading progress as user scrolls down the page
 * Fixed at top with premium gold gradient
 */
const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      // Calculate scroll percentage
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      
      setScrollProgress(Math.min(progress, 100));
    };

    // Initial calculation
    updateScrollProgress();

    // Update on scroll with passive listener for better performance
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    
    // Update on resize (content height might change)
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-red-cta to-primary transition-[width] duration-150 ease-out shadow-gold"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
