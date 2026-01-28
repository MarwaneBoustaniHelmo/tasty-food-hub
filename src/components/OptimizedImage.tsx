import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /**
   * Image source (will automatically check for .webp version)
   */
  src: string;
  
  /**
   * Alt text (required for accessibility)
   */
  alt: string;
  
  /**
   * Enable lazy loading (default: true)
   */
  lazy?: boolean;
  
  /**
   * WebP source override (auto-detected by default)
   */
  webpSrc?: string;
  
  /**
   * Placeholder color while loading
   */
  placeholderColor?: string;
  
  /**
   * Aspect ratio to prevent layout shift (e.g., "16/9", "4/3", "1/1")
   */
  aspectRatio?: string;
}

/**
 * OptimizedImage - Performance-optimized image component
 * 
 * Features:
 * - Automatic WebP with fallback
 * - Lazy loading by default
 * - Blur-up placeholder
 * - Aspect ratio preservation
 * - Modern browser optimizations
 * 
 * @example
 * <OptimizedImage 
 *   src="/assets/hero.jpg" 
 *   alt="Hero image" 
 *   aspectRatio="16/9"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  lazy = true,
  webpSrc,
  placeholderColor = '#e5e7eb',
  aspectRatio,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(src);

  // Auto-detect WebP version
  useEffect(() => {
    if (webpSrc) {
      setImgSrc(webpSrc);
      return;
    }

    // Check if browser supports WebP
    const supportsWebP = () => {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    };

    if (supportsWebP()) {
      // Try to use WebP version
      const webpPath = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Check if WebP exists
      const img = new Image();
      img.onload = () => setImgSrc(webpPath);
      img.onerror = () => setImgSrc(src); // Fallback to original
      img.src = webpPath;
    } else {
      setImgSrc(src);
    }
  }, [src, webpSrc]);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={
        aspectRatio
          ? {
              aspectRatio,
              backgroundColor: isLoaded ? 'transparent' : placeholderColor,
            }
          : undefined
      }
    >
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        // Modern browser hints
        fetchPriority={lazy ? 'low' : 'high'}
      />
      
      {/* Placeholder/skeleton while loading */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ backgroundColor: placeholderColor }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Hero image variant with priority loading
 */
export function HeroImage(props: Omit<OptimizedImageProps, 'lazy'>) {
  return <OptimizedImage {...props} lazy={false} />;
}

/**
 * Background image variant
 */
export function BackgroundImage({
  children,
  ...props
}: OptimizedImageProps & { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <OptimizedImage {...props} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
