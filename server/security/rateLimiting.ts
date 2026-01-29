import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Store for tracking violations (in-memory - use Redis in production)
const violationStore = new Map<string, number>();

// ============================================================================
// GLOBAL API LIMITER (Generous for normal usage)
// ============================================================================

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 min per IP
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const ip = req.ip || "unknown";
    violationStore.set(ip, (violationStore.get(ip) || 0) + 1);
    
    console.warn(JSON.stringify({
      type: "RATE_LIMIT_EXCEEDED",
      ip,
      path: req.path,
      violations: violationStore.get(ip),
      timestamp: new Date().toISOString(),
    }));

    res.status(429).json({
      error: "Too many requests",
      retryAfter: res.get("Retry-After"),
      message: "You have exceeded the rate limit. Please try again later.",
    });
  },
});

// ============================================================================
// CHAT ENDPOINT LIMITER (Strict - expensive LLM calls)
// ============================================================================

export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: { 
    error: "Too many chat messages. Please slow down.",
    code: "RATE_LIMIT_CHAT"
  },
  skipSuccessfulRequests: false, // Count all requests
  keyGenerator: (req) => {
    // Use IP + User-Agent for better tracking
    return `${req.ip}-${req.get("user-agent")?.substring(0, 50)}`;
  },
  handler: (req: Request, res: Response) => {
    console.warn(JSON.stringify({
      type: "CHAT_RATE_LIMIT",
      ip: req.ip,
      userAgent: req.get("user-agent")?.substring(0, 100),
      timestamp: new Date().toISOString(),
    }));

    res.status(429).json({
      error: "Too many chat messages",
      message: "You're sending messages too quickly. Please wait a moment.",
      retryAfter: 60,
    });
  },
});

// ============================================================================
// GAME SCORE SUBMISSION LIMITER (Prevent spam)
// ============================================================================

export const gameScoreLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 scores per 5 minutes
  message: { 
    error: "Too many score submissions. Please try again later.",
    code: "RATE_LIMIT_GAME"
  },
  skipFailedRequests: true, // Don't count failed validation
  handler: (req: Request, res: Response) => {
    console.warn(JSON.stringify({
      type: "GAME_SCORE_RATE_LIMIT",
      ip: req.ip,
      timestamp: new Date().toISOString(),
    }));

    res.status(429).json({
      error: "Too many score submissions",
      message: "You're submitting scores too quickly. Take a break!",
      retryAfter: 300,
    });
  },
});

// ============================================================================
// MENU API LIMITER (Moderate - read-only but cached)
// ============================================================================

export const menuLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (generous for page loads)
  message: { error: "Too many menu requests. Please try again later." },
});

// ============================================================================
// STRICT LIMITER (For sensitive operations - admin, refresh, etc.)
// ============================================================================

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 requests per 15 minutes
  message: { 
    error: "Rate limit exceeded for this operation.",
    code: "RATE_LIMIT_STRICT"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================================================
// CLEANUP TASK (Run periodically to clear old violation records)
// ============================================================================

export function cleanupViolationStore() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  // Clear violation records older than 1 hour
  // (In production, use Redis with TTL instead)
  if (violationStore.size > 1000) {
    violationStore.clear();
    console.log("[RateLimit] Violation store cleared (size exceeded 1000)");
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupViolationStore, 30 * 60 * 1000);
