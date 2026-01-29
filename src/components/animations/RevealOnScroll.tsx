/**
 * RevealOnScroll - Intersection Observer based reveal animation
 * Fades in content with upward slide when entering viewport
 */

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
  amount?: number; // Intersection threshold (0-1)
}

const ANIMATION_CONSTANTS = {
  duration: 0.6,
  distance: 40,
  ease: [0.25, 0.1, 0.25, 1] as const, // Smooth ease-out-cubic
};

export const RevealOnScroll = ({
  children,
  direction = 'up',
  delay = 0,
  duration = ANIMATION_CONSTANTS.duration,
  distance = ANIMATION_CONSTANTS.distance,
  once = true,
  className = '',
  amount = 0.2, // Trigger when 20% visible
}: RevealOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  // Calculate initial position based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      case 'none':
        return {};
      default:
        return { y: distance };
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: ANIMATION_CONSTANTS.ease,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerChildren - Container for staggered child animations
 */
interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

export const StaggerChildren = ({
  children,
  staggerDelay = 0.1,
  className = '',
  once = true,
}: StaggerChildrenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * StaggerItem - Individual item in stagger container
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: ANIMATION_CONSTANTS.ease,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
