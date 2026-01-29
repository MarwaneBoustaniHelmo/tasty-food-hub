/**
 * ParallaxSection - Scroll-linked parallax effects
 * Creates depth by moving elements at different speeds
 */

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // Multiplier for parallax effect (0.5 = half speed)
  direction?: 'up' | 'down';
  className?: string;
  scale?: boolean; // Add subtle scale effect
}

export const ParallaxSection = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  scale = false,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // Track from when element enters to when it leaves
  });

  // Calculate parallax offset
  const multiplier = direction === 'up' ? -100 : 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, multiplier * speed]
  );

  // Optional scale effect (1.1 to 1 as you scroll past)
  const scaleValue = scale
    ? useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.05, 1])
    : undefined;

  return (
    <motion.div
      ref={ref}
      style={{ y, scale: scaleValue }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * FloatingElement - Gentle floating animation with scroll influence
 * Perfect for decorative background elements
 */
interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  amplitude?: number; // Float distance in pixels
  duration?: number; // Animation cycle duration in seconds
  className?: string;
  scrollInfluence?: boolean;
}

export const FloatingElement = ({
  children,
  delay = 0,
  amplitude = 20,
  duration = 4,
  className = '',
  scrollInfluence = true,
}: FloatingElementProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Gentle Y parallax based on scroll
  const scrollY = scrollInfluence
    ? useTransform(scrollYProgress, [0, 1], [0, -50])
    : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: scrollY }}
      animate={{
        y: [0, -amplitude, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleOnScroll - Scale element based on scroll progress
 */
interface ScaleOnScrollProps {
  children: ReactNode;
  className?: string;
  scaleRange?: [number, number]; // [start, end] scale values
}

export const ScaleOnScroll = ({
  children,
  className = '',
  scaleRange = [0.8, 1],
}: ScaleOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 1]);

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
};
