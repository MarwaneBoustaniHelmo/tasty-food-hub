/**
 * Animation Constants & Configuration
 * Centralized animation rules for consistent motion design
 */

export const ANIMATION_CONFIG = {
  // Durations (in seconds)
  durations: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.9,
    verySlow: 1.2,
  },

  // Easing functions
  easing: {
    // Smooth, Apple-like easing
    smooth: [0.25, 0.1, 0.25, 1] as const,
    // Bounce-in effect
    bounceIn: [0.68, -0.55, 0.265, 1.55] as const,
    // Snappy
    snappy: [0.4, 0, 0.2, 1] as const,
    // Gentle
    gentle: [0.33, 1, 0.68, 1] as const,
  },

  // Movement distances
  distances: {
    small: 20,
    medium: 40,
    large: 60,
  },

  // Stagger delays
  stagger: {
    tight: 0.05,
    normal: 0.1,
    relaxed: 0.15,
    loose: 0.2,
  },

  // Intersection Observer thresholds
  thresholds: {
    immediate: 0,
    early: 0.1,
    normal: 0.2,
    late: 0.4,
  },
} as const;

/**
 * Framer Motion variants library
 */
export const MOTION_VARIANTS = {
  // Fade + slide up (default reveal)
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },

  // Fade + slide down
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },

  // Fade + slide left
  fadeLeft: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },

  // Fade + slide right
  fadeRight: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },

  // Scale + fade in
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },

  // Card hover effect
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.03,
      y: -8,
      transition: {
        duration: ANIMATION_CONFIG.durations.fast,
        ease: ANIMATION_CONFIG.easing.snappy,
      },
    },
  },

  // Button hover effect
  buttonHover: {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: ANIMATION_CONFIG.durations.fast,
        ease: ANIMATION_CONFIG.easing.snappy,
      },
    },
    tap: {
      scale: 0.95,
    },
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: ANIMATION_CONFIG.stagger.normal,
      },
    },
  },

  // Stagger item
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: ANIMATION_CONFIG.durations.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    },
  },
} as const;

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get safe animation variants (respects reduced motion)
 */
export const getSafeVariants = (variants: typeof MOTION_VARIANTS.fadeUp) => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.01 },
      },
    };
  }
  return variants;
};
