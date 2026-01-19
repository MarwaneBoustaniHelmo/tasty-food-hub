import { useEffect } from 'react';

/**
 * Safari iOS viewport height fix
 * Safari mobile dynamically shows/hides the address bar, causing 100vh to change.
 * This hook sets a CSS custom property --vh that represents 1% of the actual viewport height.
 * 
 * Usage in CSS:
 * height: calc(var(--vh, 1vh) * 100);
 * 
 * Or use the .full-viewport-height utility class
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      // Calculate 1% of the viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setViewportHeight();

    // Update on resize
    window.addEventListener('resize', setViewportHeight);
    
    // Update on orientation change (with delay for iOS)
    const handleOrientationChange = () => {
      setTimeout(setViewportHeight, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
};

export default useViewportHeight;
