# 🛡️ Security Audit & Implementation Guide - Tasty Food

**Date**: January 29, 2026  
**Auditor**: Senior Security Engineer  
**Stack**: Vite + React + TypeScript + Node.js/Express + Hostinger Shared Hosting

---

## 📋 Executive Summary

**Current Security Posture**: ⚠️ **MODERATE RISK**

### Critical Issues Found:
1. ❌ **API keys exposed in .env file** (GEMINI_API_KEY in plain text)
2. ❌ **Supabase public key exposed in frontend** (acceptable but needs RLS)
3. ⚠️ **Weak CSP configuration** (allows unsafe-inline)
4. ⚠️ **No input sanitization** on chat messages before storage
5. ⚠️ **Missing anti-CSRF tokens**
6. ⚠️ **No game score validation** (client can submit arbitrary scores)
7. ⚠️ **FTP credentials in deploy scripts** (.env.deploy)
8. ℹ️ **Chart component uses dangerouslySetInnerHTML** (low risk - static CSS)

### Assets to Protect:
- Gemini API key ($300/month value if abused)
- User conversations & PII (names, phones for reservations)
- Game leaderboard integrity
- Backend infrastructure availability
- Brand reputation

---

## 1️⃣ THREAT MODEL

### Attack Scenarios (Ranked by Risk)

| # | Threat | Impact | Likelihood | Priority |
|---|--------|--------|------------|----------|
| 1 | API Key Theft → Gemini abuse | **HIGH** | Medium | 🔴 CRITICAL |
| 2 | Game score manipulation | **MEDIUM** | High | 🟠 HIGH |
| 3 | Chat endpoint DDoS | **MEDIUM** | Medium | 🟠 HIGH |
| 4 | XSS via chat response | **MEDIUM** | Low | 🟡 MEDIUM |
| 5 | Prompt injection in chatbot | **LOW** | Medium | 🟡 MEDIUM |
| 6 | FTP credential leak | **HIGH** | Low | 🟠 HIGH |
| 7 | Directory traversal | **LOW** | Low | 🟢 LOW |
| 8 | Supply chain attack | **HIGH** | Low | 🟡 MEDIUM |

### Attacker Profiles:
1. **Script Kiddie**: Automated scans, XSS attempts, basic abuse
2. **Competitor**: Game score manipulation, DDoS on chat
3. **Opportunist**: API key theft for resale, crypto mining
4. **Malicious User**: Spam chat, fake reservations, leaderboard cheating

---

## 2️⃣ BACKEND HARDENING (Node + Express)

### Current State Analysis:
✅ **Good**: Helmet enabled, rate limiting, CORS with origin checking, input validation  
⚠️ **Weak**: CSP too permissive, no request IDs, stack traces in errors, no CSRF protection

### Implementation: Enhanced Security Middleware

**File**: `server/security/middleware.ts` (NEW FILE - see below)

```typescript
import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

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
        // Remove 'unsafe-inline' - use nonce-based CSP instead
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
        process.env.NODE_ENV === "production"
          ? "https://api.tastyfood.me"
          : "http://localhost:3001",
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
    action: "deny", // or 'sameorigin' if you need iframes
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

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

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
  ["apikey", "token", "password", "secret"].forEach(key => {
    if (sanitizedQuery[key]) sanitizedQuery[key] = "[REDACTED]";
  });

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    path: sanitizedPath,
    ip: req.ip,
    userAgent: req.get("user-agent")?.substring(0, 100),
    query: Object.keys(sanitizedQuery).length > 0 ? sanitizedQuery : undefined,
  }));

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
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId: req.id,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  }));

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
// 5. ANTI-CSRF MIDDLEWARE (For state-changing operations)
// ============================================================================

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip for GET requests (safe methods)
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"];
  const storedToken = req.session?.csrfToken; // Requires express-session

  if (!csrfToken || csrfToken !== storedToken) {
    return res.status(403).json({
      error: "CSRF token validation failed",
      code: "CSRF_ERROR",
    });
  }

  next();
};

// ============================================================================
// 6. INPUT SANITIZATION HELPERS
// ============================================================================

export function sanitizeInput(input: string, maxLength: number = 2000): string {
  // Remove null bytes
  const clean = input.replace(/\0/g, "");
  
  // Trim and enforce length
  return clean.trim().substring(0, maxLength);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  // Belgian phone: +32 XXX XX XX XX or 04XX XX XX XX
  const phoneRegex = /^(\+32|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
```

### Implementation: Enhanced Rate Limiting

**File**: `server/security/rateLimiting.ts` (NEW FILE)

```typescript
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
    }));

    res.status(429).json({
      error: "Too many requests",
      retryAfter: res.get("Retry-After"),
    });
  },
});

// ============================================================================
// CHAT ENDPOINT LIMITER (Strict - expensive LLM calls)
// ============================================================================

export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: { error: "Too many chat messages. Please slow down." },
  skipSuccessfulRequests: false, // Count all requests
  keyGenerator: (req) => {
    // Use IP + User-Agent for better tracking
    return `${req.ip}-${req.get("user-agent")?.substring(0, 50)}`;
  },
});

// ============================================================================
// GAME SCORE SUBMISSION LIMITER (Prevent spam)
// ============================================================================

export const gameScoreLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 scores per 5 minutes
  message: { error: "Too many score submissions. Please try again later." },
  skipFailedRequests: true, // Don't count failed validation
});

// ============================================================================
// MENU API LIMITER (Moderate - read-only but cached)
// ============================================================================

export const menuLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (generous for page loads)
});
```

---

## 3️⃣ FRONTEND SECURITY (React + Vite)

### Current Issues:
1. ⚠️ **chart.tsx uses dangerouslySetInnerHTML** - LOW RISK (static CSS only)
2. ❌ **Supabase keys in frontend** - ACCEPTABLE (public anon key with RLS)
3. ✅ **No other XSS vectors found**

### Fixes Required:

#### Fix #1: Remove dangerouslySetInnerHTML (Optional - Low Priority)

**File**: `src/components/ui/chart.tsx`

```typescript
// BEFORE (lines 69-84):
<style
  dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES).map(...).join("\n"),
  }}
/>

// AFTER (safer alternative using CSS-in-JS):
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => 
    config.theme || config.color
  );

  if (!colorConfig.length) return null;

  // Generate CSS rules safely
  const cssRules = Object.entries(THEMES).flatMap(([theme, prefix]) => 
    colorConfig.map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
      if (!color) return null;
      
      return {
        selector: `${prefix} [data-chart="${id}"]`,
        property: `--color-${key}`,
        value: color,
      };
    }).filter(Boolean)
  );

  return (
    <>
      {cssRules.map((rule, idx) => (
        <style key={idx}>
          {`${rule.selector} { ${rule.property}: ${rule.value}; }`}
        </style>
      ))}
    </>
  );
};
```

**Priority**: 🟢 **LOW** (Current implementation is safe - only static CSS)

#### Fix #2: Content Security Policy for Frontend

**File**: `public/_headers` (NEW FILE - for Hostinger)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), microphone=(), camera=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://www.tiktok.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://djvhxspxisxwwcebvsys.supabase.co https://www.google-analytics.com http://localhost:3001 https://api.tastyfood.me; frame-src 'self' https://www.tiktok.com; object-src 'none'; base-uri 'self'; form-action 'self';
```

---

## 4️⃣ SECRETS MANAGEMENT

### Current Issues:
❌ **Critical**: `.env` file contains secrets in plain text  
❌ **High**: `.env` could be exposed on Hostinger if misconfigured  
✅ **Good**: Supabase anon key is public-safe (RLS enforced)

### Implementation: Secrets Strategy

**File**: `.env.example` (Update)

```bash
# ============================================================================
# FRONTEND ENVIRONMENT VARIABLES (PUBLIC - embedded in build)
# ============================================================================
# These are exposed in the browser - NEVER put secrets here!

VITE_API_URL="http://localhost:3001"
VITE_SUPABASE_URL="https://djvhxspxisxwwcebvsys.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."  # Public anon key - safe to expose

# ============================================================================
# BACKEND ENVIRONMENT VARIABLES (PRIVATE - never exposed)
# ============================================================================
# These are ONLY used by server/index.ts - never sent to frontend

GEMINI_API_KEY="your-gemini-api-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"  # NEVER expose this!

# ============================================================================
# DEPLOYMENT CONFIGURATION
# ============================================================================

ALLOWED_ORIGINS="https://tastyfood.me,https://www.tastyfood.me"
NODE_ENV="production"
API_PORT="3001"

# ============================================================================
# FTP DEPLOYMENT (Keep in separate .env.deploy file - DO NOT COMMIT)
# ============================================================================
# See .env.deploy.example for FTP credentials
```

**File**: `.env.deploy.example` (NEW FILE)

```bash
# FTP Deployment Credentials
# IMPORTANT: Copy this to .env.deploy and fill in real credentials
# NEVER commit .env.deploy to Git!

FTP_HOST="ftp.yourdomain.com"
FTP_USER="your-username"
FTP_PASSWORD="your-secure-password"
FTP_REMOTE_PATH="/public_html"
```

**File**: `.gitignore` (Update - ensure these lines exist)

```
# Environment variables
.env
.env.local
.env.*.local
.env.deploy
.env.production

# FTP deployment state
.ftp-deploy-sync-state.json

# Deployment reports with potential secrets
deployment-report-*.json
```

### Backend Secret Access Pattern:

```typescript
// ✅ CORRECT: Backend only
const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey) {
  throw new Error("GEMINI_API_KEY not configured");
}

// ❌ WRONG: Never do this
// window.GEMINI_KEY = process.env.GEMINI_API_KEY; // Exposed to browser!
```

---

## 5️⃣ HOSTINGER SECURITY CONFIGURATION

### .htaccess Rules (Apache)

**File**: `public/.htaccess` (NEW FILE)

```apache
# ============================================================================
# TASTY FOOD - Apache Security Configuration
# ============================================================================

# Enable RewriteEngine
RewriteEngine On

# ============================================================================
# 1. HTTPS ENFORCEMENT
# ============================================================================

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# ============================================================================
# 2. BLOCK ACCESS TO SENSITIVE FILES
# ============================================================================

# Block .env files
<FilesMatch "^\.env">
  Order allow,deny
  Deny from all
</FilesMatch>

# Block .git directory
RedirectMatch 404 /\.git

# Block node_modules
RedirectMatch 404 /node_modules

# Block package files
<FilesMatch "(package\.json|package-lock\.json|tsconfig\.json)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Block deployment files
<FilesMatch "(deploy.*\.js|\.ftp-deploy-sync-state\.json|deployment-report.*\.json)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Block markdown files (except README if you want it public)
<FilesMatch "\.(md|MD)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Block SQL files
<FilesMatch "\.(sql|SQL)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# ============================================================================
# 3. DISABLE DIRECTORY LISTING
# ============================================================================

Options -Indexes

# ============================================================================
# 4. SECURITY HEADERS
# ============================================================================

<IfModule mod_headers.c>
  # Prevent clickjacking
  Header always set X-Frame-Options "DENY"
  
  # Prevent MIME sniffing
  Header always set X-Content-Type-Options "nosniff"
  
  # XSS Protection (legacy browsers)
  Header always set X-XSS-Protection "1; mode=block"
  
  # Referrer Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # HSTS (1 year)
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  
  # Remove Server header (hide Apache version)
  Header unset Server
  
  # Content Security Policy (adjust as needed)
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://djvhxspxisxwwcebvsys.supabase.co;"
</IfModule>

# ============================================================================
# 5. FILE PERMISSIONS
# ============================================================================

# Recommended:
# Directories: 755 (rwxr-xr-x)
# Files: 644 (rw-r--r--)
# .htaccess: 644
# .env files should NOT exist in public_html - keep them in parent directory

# ============================================================================
# 6. PREVENT PHP EXECUTION (if not needed)
# ============================================================================

<FilesMatch "\.php$">
  Order allow,deny
  Deny from all
</FilesMatch>

# ============================================================================
# 7. CACHE CONTROL (Performance + Security)
# ============================================================================

<IfModule mod_expires.c>
  ExpiresActive On
  
  # Images
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  
  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  
  # Fonts
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  
  # HTML (no cache - for SPA routing)
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# ============================================================================
# 8. SPA ROUTING (React Router)
# ============================================================================

# Redirect all routes to index.html (except actual files)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

### File Permissions Checklist:

```bash
# On Hostinger via SSH/FTP:
chmod 755 public_html/                    # Directory
chmod 644 public_html/index.html          # HTML files
chmod 644 public_html/.htaccess           # htaccess
chmod 644 public_html/assets/*            # Assets

# CRITICAL: .env files should NOT be in public_html!
# Keep them one directory above:
chmod 600 ../.env                         # Only owner can read
chmod 600 ../.env.deploy                  # FTP credentials
```

---

## 6️⃣ GAME + SUPABASE + CHATBOT SECURITY

### Game Score Anti-Cheat Implementation

**Current Vulnerability**: Client can submit ANY score to Supabase directly.

**Fix**: Server-side validation + suspicious score detection

**File**: `server/routes/gameScores.ts` (NEW FILE)

```typescript
import express, { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { gameScoreLimiter } from "../security/rateLimiting";

const router = express.Router();

// Supabase client (use service role key for backend)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Backend only!
);

// ============================================================================
// POST /api/game/submit-score - Submit game score with validation
// ============================================================================

interface ScoreSubmission {
  nickname?: string;
  score: number;
  sessionId?: string;
  gameData?: {
    duration: number;
    mistakes: number;
    caught: number;
  };
}

router.post(
  "/submit-score",
  gameScoreLimiter,
  async (req: Request, res: Response) => {
    try {
      const { nickname, score, sessionId, gameData }: ScoreSubmission = req.body;

      // ============================================
      // 1. INPUT VALIDATION
      // ============================================

      if (typeof score !== "number" || !Number.isInteger(score)) {
        return res.status(400).json({ error: "Invalid score format" });
      }

      if (score < 0 || score > 10000) {
        return res.status(400).json({
          error: "Score out of valid range (0-10000)",
        });
      }

      if (nickname && (typeof nickname !== "string" || nickname.length > 50)) {
        return res.status(400).json({
          error: "Nickname must be a string (max 50 characters)",
        });
      }

      // ============================================
      // 2. ANTI-CHEAT HEURISTICS
      // ============================================

      const suspiciousScore = detectSuspiciousScore(score, gameData);

      if (suspiciousScore.isSuspicious) {
        console.warn(JSON.stringify({
          type: "SUSPICIOUS_SCORE",
          ip: req.ip,
          score,
          reason: suspiciousScore.reason,
          gameData,
        }));

        // Still accept but flag for review
        // return res.status(400).json({
        //   error: "Score validation failed",
        //   code: "SUSPICIOUS_SCORE",
        // });
      }

      // ============================================
      // 3. RATE LIMITING (Session-based)
      // ============================================

      if (sessionId) {
        const recentScores = await supabase
          .from("game_scores")
          .select("created_at")
          .eq("session_id", sessionId)
          .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .limit(20);

        if (recentScores.data && recentScores.data.length >= 20) {
          return res.status(429).json({
            error: "Too many submissions from this session",
          });
        }
      }

      // ============================================
      // 4. INSERT TO DATABASE
      // ============================================

      const monthKey = new Date().toISOString().substring(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from("game_scores")
        .insert({
          nickname: nickname || "Anonymous",
          score,
          month_key: monthKey,
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to save score" });
      }

      res.json({
        success: true,
        data,
        message: "Score submitted successfully",
      });
    } catch (error: any) {
      console.error("Submit score error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ============================================================================
// ANTI-CHEAT HELPER
// ============================================================================

function detectSuspiciousScore(
  score: number,
  gameData?: { duration: number; mistakes: number; caught: number }
): { isSuspicious: boolean; reason?: string } {
  // Rule 1: Unrealistically high score
  if (score > 5000) {
    return { isSuspicious: true, reason: "Score exceeds reasonable maximum" };
  }

  // Rule 2: Perfect score with no game data
  if (score > 3000 && !gameData) {
    return { isSuspicious: true, reason: "High score without game metadata" };
  }

  // Rule 3: Score vs time ratio (too fast)
  if (gameData && gameData.duration > 0) {
    const pointsPerSecond = score / gameData.duration;
    if (pointsPerSecond > 50) {
      return {
        isSuspicious: true,
        reason: "Unrealistic points-per-second ratio",
      };
    }
  }

  // Rule 4: Perfect catch ratio (no mistakes, high score)
  if (
    gameData &&
    gameData.mistakes === 0 &&
    gameData.caught > 100 &&
    score > 2000
  ) {
    return {
      isSuspicious: true,
      reason: "Perfect game with high score (unlikely)",
    };
  }

  return { isSuspicious: false };
}

export default router;
```

### Supabase Row Level Security (RLS)

**File**: `supabase/migrations/20260129_add_rls_policies.sql` (NEW FILE)

```sql
-- ============================================================================
-- Enhanced RLS for game_scores table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view game scores" ON game_scores;
DROP POLICY IF EXISTS "Anyone can submit scores" ON game_scores;

-- New read policy (anyone can read)
CREATE POLICY "Public read access"
  ON game_scores
  FOR SELECT
  USING (true);

-- New insert policy (strict validation)
CREATE POLICY "Validated score submission"
  ON game_scores
  FOR INSERT
  WITH CHECK (
    -- Must have valid score range
    score >= 0 AND score <= 10000
    -- Must be for current month
    AND month_key = to_char(NOW(), 'YYYY-MM')
    -- Nickname length limit
    AND (nickname IS NULL OR length(nickname) <= 50)
    -- Prevent future timestamps (clock tampering)
    AND created_at <= NOW() + interval '1 minute'
  );

-- Prevent updates and deletes (scores are immutable)
CREATE POLICY "No updates allowed"
  ON game_scores
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON game_scores
  FOR DELETE
  USING (false);

-- ============================================================================
-- Add indexes for performance
-- ============================================================================

-- Index for leaderboard queries (month + score DESC)
CREATE INDEX IF NOT EXISTS idx_game_scores_month_score_desc
  ON game_scores(month_key, score DESC, created_at DESC);

-- Index for session-based rate limiting
CREATE INDEX IF NOT EXISTS idx_game_scores_session_time
  ON game_scores(session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- ============================================================================
-- Create a view for public leaderboard (top 100 per month)
-- ============================================================================

CREATE OR REPLACE VIEW public_leaderboard AS
SELECT
  rank() OVER (PARTITION BY month_key ORDER BY score DESC, created_at ASC) as rank,
  nickname,
  score,
  month_key,
  created_at
FROM game_scores
WHERE nickname IS NOT NULL
  AND score > 0
ORDER BY month_key DESC, score DESC
LIMIT 100;

-- Grant public access to view
GRANT SELECT ON public_leaderboard TO anon, authenticated;
```

### Chatbot Prompt Injection Protection

**Current Status**: ✅ Basic protection exists (lines 519-530 in server/index.ts)

**Enhancement**: Add more sophisticated detection

**File**: `server/security/promptInjection.ts` (NEW FILE)

```typescript
// ============================================================================
// PROMPT INJECTION DETECTION
// ============================================================================

interface InjectionCheck {
  isSuspicious: boolean;
  reason?: string;
  confidence: "low" | "medium" | "high";
}

export function detectPromptInjection(message: string): InjectionCheck {
  const lowerMessage = message.toLowerCase();

  // HIGH CONFIDENCE PATTERNS
  const highConfidencePatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
    /disregard\s+(all\s+)?(previous|prior)\s+instructions?/i,
    /forget\s+(all\s+)?(previous|prior)\s+instructions?/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /you\s+are\s+now\s+a/i,
    /<\s*script/i,
    /javascript\s*:/i,
    /\{\{.*\}\}/i, // Template injection
    /<\s*iframe/i,
  ];

  for (const pattern of highConfidencePatterns) {
    if (pattern.test(message)) {
      return {
        isSuspicious: true,
        reason: `High-confidence injection pattern detected: ${pattern.source}`,
        confidence: "high",
      };
    }
  }

  // MEDIUM CONFIDENCE PATTERNS
  const mediumConfidencePatterns = [
    /act\s+as\s+if/i,
    /pretend\s+(you|to)\s+are/i,
    /role.*play/i,
    /(show|reveal|tell)\s+me\s+(the|your)\s+(system\s+)?prompt/i,
    /what\s+(are|is)\s+your\s+instructions?/i,
  ];

  for (const pattern of mediumConfidencePatterns) {
    if (pattern.test(message)) {
      return {
        isSuspicious: true,
        reason: `Medium-confidence injection pattern detected: ${pattern.source}`,
        confidence: "medium",
      };
    }
  }

  // SUSPICIOUS ENCODING (Base64, URL encoding abuse)
  if (message.match(/[A-Za-z0-9+\/]{40,}={0,2}/)) {
    return {
      isSuspicious: true,
      reason: "Suspicious Base64-like encoding detected",
      confidence: "medium",
    };
  }

  // EXCESSIVE REPETITION (common in injection attempts)
  const words = message.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
    return {
      isSuspicious: true,
      reason: "Excessive word repetition detected",
      confidence: "low",
    };
  }

  return { isSuspicious: false, confidence: "low" };
}
```

**Update server/index.ts** (line 520):

```typescript
// Replace existing suspicious patterns check with:
const injectionCheck = detectPromptInjection(message);

if (injectionCheck.isSuspicious && injectionCheck.confidence !== "low") {
  console.warn(JSON.stringify({
    type: "PROMPT_INJECTION_ATTEMPT",
    ip: req.ip,
    reason: injectionCheck.reason,
    confidence: injectionCheck.confidence,
    message: message.substring(0, 200),
  }));

  return res.status(400).json({
    error: "Message content not allowed",
    code: "INVALID_INPUT",
  });
}
```

---

## 7️⃣ DEPENDENCY & BUILD SECURITY

### npm audit Strategy

**File**: `.github/workflows/security-audit.yml` (NEW FILE)

```yaml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly on Mondays at 9 AM
    - cron: "0 9 * * 1"

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run build test
        run: npm run build

      - name: Check for secrets in code
        run: |
          # Check for potential API keys
          if grep -r "AIzaSy" --include="*.ts" --include="*.tsx" --include="*.js" src/; then
            echo "❌ Potential API key found in source code!"
            exit 1
          fi
          
          # Check for hardcoded passwords
          if grep -ri "password.*=.*['\"]" --include="*.ts" --include="*.tsx" src/; then
            echo "❌ Hardcoded password found!"
            exit 1
          fi
          
          echo "✅ No hardcoded secrets detected"

      - name: Check TypeScript types
        run: npx tsc --noEmit

      - name: Lint code
        run: npm run lint || true  # Don't fail on lint errors
```

### Package.json Scripts

**Add to package.json**:

```json
{
  "scripts": {
    "audit:fix": "npm audit fix",
    "audit:check": "npm audit --audit-level=high",
    "security:check": "npm run audit:check && npm run build",
    "postinstall": "npm audit || true"
  }
}
```

### Dependency Update Strategy:

```bash
# 1. Review vulnerabilities
npm audit

# 2. Fix automatically (if safe)
npm audit fix

# 3. Fix breaking changes manually
npm audit fix --force  # CAUTION: May break app

# 4. Update specific package
npm update package-name

# 5. Check outdated packages
npm outdated
```

---

## 8️⃣ PRIORITY CHECKLIST

### 🔴 CRITICAL (Implement Immediately)

- [ ] **Move .env file outside public_html** on Hostinger
- [ ] **Create public/.htaccess** with sensitive file blocking
- [ ] **Add server-side game score validation** (prevent arbitrary scores)
- [ ] **Update .gitignore** to exclude .env.deploy and deployment reports
- [ ] **Enable HTTPS** on Hostinger (should be already done)
- [ ] **Add production error handler** (no stack traces)

### 🟠 HIGH (Implement Within 1 Week)

- [ ] **Implement enhanced rate limiting** per endpoint
- [ ] **Add request ID middleware** for debugging
- [ ] **Create Supabase RLS policies** for game_scores
- [ ] **Add prompt injection detection** to chatbot
- [ ] **Set up npm audit in CI/CD**
- [ ] **Review and restrict CORS origins**

### 🟡 MEDIUM (Implement Within 1 Month)

- [ ] **Implement CSRF protection** for state-changing operations
- [ ] **Add secure logging** (sanitize PII)
- [ ] **Create separate .env.deploy** file for FTP credentials
- [ ] **Set up security headers** (_headers file for static hosting)
- [ ] **Add anti-cheat heuristics** (suspicious score detection)
- [ ] **Implement session-based rate limiting** for game scores

### 🟢 NICE-TO-HAVE (Ongoing)

- [ ] **Replace dangerouslySetInnerHTML** in chart.tsx (low risk)
- [ ] **Set up weekly dependency audits**
- [ ] **Add honeypot fields** to reservation forms (anti-bot)
- [ ] **Implement CSP reporting** endpoint
- [ ] **Add security.txt** file (public/security.txt)
- [ ] **Set up monitoring/alerting** for rate limit violations

---

## 📞 INCIDENT RESPONSE PLAN

### If API Key is Compromised:

1. **Immediately revoke** Gemini API key in Google Cloud Console
2. **Generate new key** and update .env (backend only)
3. **Check usage logs** for unauthorized access
4. **Rotate all other secrets** (Supabase, FTP)
5. **Review git history** for accidental commits

### If Website is Defaced:

1. **Take site offline** (Hostinger control panel)
2. **Restore from backup** (latest clean version)
3. **Change all FTP/cPanel passwords**
4. **Check for malicious files** (webshells, backdoors)
5. **Review access logs** (who accessed when)
6. **Scan with security tools** (Sucuri, Wordfence)

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [npm Security Best Practices](https://docs.npmjs.com/about-security)

---

**End of Security Audit**  
**Next Steps**: Review checklist, implement critical items first, then schedule high-priority items.
