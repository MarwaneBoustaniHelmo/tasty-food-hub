import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// TYPE EXTENSIONS
// ============================================================================

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

// ============================================================================
// 1. ENHANCED HELMET CONFIGURATION
// ============================================================================

export const securityHeaders = helmet({
  // Content Security Policy (strict)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // Remove 'unsafe-inline' in production - use nonce-based CSP
        ...(process.env.NODE_ENV === "development" ? ["'unsafe-inline'"] : []),
        "https://www.googletagmanager.com",
        "https://www.clarity.ms",
        "https://www.tiktok.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind/styled-components
        "https://fonts.googleapis.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://djvhxspxisxwwcebvsys.supabase.co",
        "https://www.google-analytics.com",
        "https://generativelanguage.googleapis.com", // Gemini API
        process.env.NODE_ENV === "production"
          ? "https://api.tastyfood.me"
          : "http://localhost:3001",
        process.env.NODE_ENV === "production"
          ? "https://api.tastyfood.me"
          : "http://localhost:8080",
      ],
      frameSrc: ["'self'", "https://www.tiktok.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
  },

  // Strict Transport Security (1 year)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking
  frameguard: {
    action: "deny",
  },

  // Prevent MIME sniffing
  noSniff: true,

  // Referrer policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // XSS filter (legacy browsers)
  xssFilter: true,
});

// ============================================================================
// 2. REQUEST ID MIDDLEWARE
// ============================================================================

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  res.setHeader("X-Request-ID", req.id);
  next();
};

// ============================================================================
// 3. SECURE LOGGING (No PII/Secrets)
// ============================================================================

export const secureLogger = (req: Request, res: Response, next: NextFunction) => {
  const sanitizedPath = req.path.replace(/\b\d{3,}\b/g, "[REDACTED]"); // Hide IDs
  const sanitizedQuery = { ...req.query };
  
  // Remove sensitive parameters
  ["apikey", "api_key", "token", "password", "secret", "key"].forEach(key => {
    if (sanitizedQuery[key]) sanitizedQuery[key] = "[REDACTED]";
  });

  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    path: sanitizedPath,
    ip: req.ip,
    userAgent: req.get("user-agent")?.substring(0, 100),
    query: Object.keys(sanitizedQuery).length > 0 ? sanitizedQuery : undefined,
  };

  console.log(JSON.stringify(logEntry));
  next();
};

// ============================================================================
// 4. PRODUCTION ERROR HANDLER (No Stack Traces)
// ============================================================================

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  };

  console.error(JSON.stringify(errorLog));

  // Never expose stack traces in production
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({
      error: "Internal server error",
      requestId: req.id,
      message: "An unexpected error occurred. Please try again later.",
    });
  }

  res.status(500).json({
    error: err.message,
    stack: err.stack,
    requestId: req.id,
  });
};

// ============================================================================
// 5. INPUT SANITIZATION HELPERS
// ============================================================================

export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (typeof input !== "string") return "";
  
  // Remove null bytes
  const clean = input.replace(/\0/g, "");
  
  // Trim and enforce length
  return clean.trim().substring(0, maxLength);
}

export function validateEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  if (typeof phone !== "string") return false;
  // Belgian phone: +32 XXX XX XX XX or 04XX XX XX XX
  const phoneRegex = /^(\+32|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

export function validateNickname(nickname: string): boolean {
  if (typeof nickname !== "string") return false;
  
  // 1-50 characters, alphanumeric + basic punctuation
  const nicknameRegex = /^[a-zA-Z0-9\s\-_]{1,50}$/;
  return nicknameRegex.test(nickname);
}
