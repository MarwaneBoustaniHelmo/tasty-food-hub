/**
 * Security utilities for frontend protection
 * Following OWASP best practices for XSS prevention and input validation
 */

/**
 * Sanitizes a string by escaping HTML entities
 * Use this for any user-generated content that will be displayed
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Validates and sanitizes URL to prevent javascript: and data: protocol attacks
 * Returns null if URL is potentially malicious
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      console.warn('Blocked potentially dangerous URL');
      return null;
    }
  }

  // Allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const urlLower = url.trim().toLowerCase();
  
  // If it starts with a safe protocol or is a relative URL, allow it
  const hasSafeProtocol = safeProtocols.some(p => urlLower.startsWith(p));
  const isRelative = url.startsWith('/') || url.startsWith('#') || url.startsWith('.');
  
  if (hasSafeProtocol || isRelative) {
    return url;
  }

  // For URLs without protocol, assume https
  if (!url.includes('://')) {
    return `https://${url}`;
  }

  return null;
};

/**
 * Validates email format using a strict regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (Belgian format)
 */
export const isValidPhone = (phone: string): boolean => {
  // Belgian phone format: +32 or 0 followed by digits
  const phoneRegex = /^(\+32|0)[1-9][0-9]{7,8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Rate limiter for client-side actions
 * Prevents rapid repeated actions (e.g., button spam)
 */
export class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    
    this.timestamps.push(now);
    return true;
  }

  reset(): void {
    this.timestamps = [];
  }
}

/**
 * Generates a cryptographically secure random string
 * Useful for CSRF tokens, nonces, etc.
 */
export const generateSecureId = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates that a string doesn't contain potential injection patterns
 */
export const isSafeInput = (input: string): boolean => {
  // Check for common injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Truncates text safely while preserving word boundaries
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
};

/**
 * Security headers that should be set via server configuration
 * This is a reference for deployment configuration
 */
export const RECOMMENDED_SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
  'X-XSS-Protection': '1; mode=block',
} as const;
