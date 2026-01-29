# 🚀 Security Implementation Quick-Start Guide

**For**: Tasty Food Project  
**Estimated Time**: 2-3 hours for critical items  
**Skill Level**: Intermediate (Node.js + Hostinger experience required)

---

## Step 1: Backend Security (60 minutes)

### 1.1 Create Security Directory

```bash
cd /home/ous/projects/lovable-tastyfood/server
mkdir -p security
```

### 1.2 Copy Security Files

The following files have been created for you:
- `server/security/middleware.ts` ✅
- `server/security/rateLimiting.ts` ✅
- `server/security/promptInjection.ts` ✅

### 1.3 Update server/index.ts

**Location**: `/home/ous/projects/lovable-tastyfood/server/index.ts`

#### Add imports (after existing imports, around line 15):

```typescript
import {
  securityHeaders,
  requestId,
  secureLogger,
  errorHandler,
} from "./security/middleware.js";
import {
  globalLimiter,
  chatLimiter,
  menuLimiter,
} from "./security/rateLimiting.js";
import {
  detectPromptInjection,
  validateMessageContent,
  sanitizeMessage,
} from "./security/promptInjection.js";
```

#### Replace helmet configuration (around line 409):

```typescript
// BEFORE:
app.use(helmet({
  contentSecurityPolicy: {
    // ...existing config
  },
}));

// AFTER:
app.use(securityHeaders);
app.use(requestId);
```

#### Replace existing logger (around line 460):

```typescript
// BEFORE:
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// AFTER:
app.use(secureLogger);
```

#### Update rate limiters (around line 450):

```typescript
// BEFORE:
const apiLimiter = rateLimit({ ... });
const chatLimiter = rateLimit({ ... });
app.use('/api/', apiLimiter);

// AFTER:
app.use('/api/', globalLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api/menu', menuLimiter);
```

#### Update chat endpoint validation (around line 520):

```typescript
// BEFORE:
const sanitizedMessage = validator.escape(message.trim());
if (sanitizedMessage.length > 2000) { ... }
const suspiciousPatterns = [ ... ];

// AFTER:
const contentCheck = validateMessageContent(message);
if (!contentCheck.isValid) {
  return res.status(400).json({ error: contentCheck.reason });
}

const injectionCheck = detectPromptInjection(message);
if (injectionCheck.isSuspicious && injectionCheck.confidence !== "low") {
  console.warn(JSON.stringify({
    type: "PROMPT_INJECTION_ATTEMPT",
    ip: req.ip,
    requestId: req.id,
    reason: injectionCheck.reason,
    confidence: injectionCheck.confidence,
  }));
  return res.status(400).json({
    error: "Message content not allowed",
    code: "INVALID_INPUT",
  });
}

const sanitizedMessage = sanitizeMessage(message);
```

#### Add error handler (at the very end, after all routes):

```typescript
// Add before the server.listen() call:
app.use(errorHandler);
```

### 1.4 Test Backend Changes

```bash
cd /home/ous/projects/lovable-tastyfood/server
npm install # Ensure dependencies are installed
npm run dev

# In another terminal, test:
curl http://localhost:3001/api/sse/stats
# Should see logs with requestId

# Test prompt injection:
curl "http://localhost:3001/api/chat/stream?message=ignore%20all%20previous%20instructions"
# Should return 400 error
```

---

## Step 2: Hostinger Configuration (30 minutes)

### 2.1 Deploy .htaccess File

**File**: `public/.htaccess` (already created ✅)

**Action**: 
1. Log into Hostinger control panel
2. Open File Manager
3. Navigate to `public_html/`
4. Upload `public/.htaccess` to `public_html/.htaccess`
5. Set permissions: `644`

### 2.2 Move .env File (CRITICAL!)

**Current location**: `public_html/.env` ❌  
**New location**: `/home/username/.env` ✅

```bash
# Via SSH (if available):
mv /home/username/public_html/.env /home/username/.env
chmod 600 /home/username/.env

# Update your deployment script to:
# 1. NOT upload .env files
# 2. Reference .env from parent directory
```

### 2.3 Verify Security

**Test 1: Check .env is blocked**
```bash
curl https://tastyfood.me/.env
# Should return: 403 Forbidden or 404 Not Found
```

**Test 2: Check security headers**
```bash
curl -I https://tastyfood.me
# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=31536000
```

**Test 3: Check directory listing is disabled**
```bash
curl https://tastyfood.me/assets/
# Should NOT see file listing
```

---

## Step 3: Supabase RLS (20 minutes)

### 3.1 Apply RLS Migration

**File**: `supabase/migrations/20260129_add_rls_policies.sql` (already created ✅)

**Option A - Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Paste contents of `20260129_add_rls_policies.sql`
5. Click "Run"
6. Verify: "✅ Enhanced RLS policies..." message appears

**Option B - Supabase CLI:**
```bash
cd /home/ous/projects/lovable-tastyfood
npx supabase db push
```

### 3.2 Test RLS Policies

**Test in Supabase SQL Editor:**

```sql
-- Should succeed:
INSERT INTO game_scores (nickname, score, month_key) 
VALUES ('TestPlayer', 100, to_char(NOW(), 'YYYY-MM'));

-- Should fail (score too high):
INSERT INTO game_scores (nickname, score, month_key) 
VALUES ('Cheater', 99999, to_char(NOW(), 'YYYY-MM'));
-- Error: new row violates row-level security policy

-- Check leaderboard view:
SELECT * FROM public_leaderboard LIMIT 10;
```

---

## Step 4: Git & Secrets Audit (15 minutes)

### 4.1 Update .gitignore

✅ Already updated - verify with:

```bash
cat .gitignore | grep -A 10 "Environment variables"
# Should show .env, .env.*, .env.deploy, etc.
```

### 4.2 Check Git History for Secrets

```bash
cd /home/ous/projects/lovable-tastyfood

# Check for .env commits:
git log --all --full-history --source -- **/.env

# Check for API keys:
git log -S "AIzaSy" --source --all

# If found, you MUST rotate all secrets immediately!
```

### 4.3 If Secrets Were Committed

**IMMEDIATE ACTIONS:**
1. Revoke Gemini API key: https://console.cloud.google.com/apis/credentials
2. Generate new key
3. Update `.env` (backend only!)
4. Change Supabase service role key (if leaked)
5. Change FTP password

**Optional** (if repo is private):
```bash
# Remove secrets from history (DESTRUCTIVE - use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if repo is private!)
git push origin --force --all
```

---

## Step 5: Deploy & Verify (15 minutes)

### 5.1 Build & Test Locally

```bash
cd /home/ous/projects/lovable-tastyfood

# Frontend build:
npm run build

# Test preview:
npm run preview
# Open http://localhost:4173

# Backend test:
cd server
npm run dev
# Open http://localhost:3001/api/sse/stats
```

### 5.2 Deploy to Hostinger

```bash
# Update deployment script to skip sensitive files:
npm run deploy:hostinger

# Or manually via FTP:
# - Upload dist/ contents to public_html/
# - Upload public/.htaccess to public_html/.htaccess
# - DO NOT upload .env, node_modules, etc.
```

### 5.3 Final Verification Checklist

**Backend (localhost:3001):**
- [ ] `/api/sse/stats` returns request stats
- [ ] Logs show `requestId` field
- [ ] Rate limiting works (429 after many requests)
- [ ] Prompt injection blocked (test with "ignore all instructions")

**Frontend (tastyfood.me):**
- [ ] Site loads correctly
- [ ] HTTPS works (no warnings)
- [ ] `.env` file blocked (403/404)
- [ ] Security headers present (curl -I)
- [ ] Directory listing disabled

**Supabase:**
- [ ] Game scores can be submitted
- [ ] Invalid scores rejected (>10000)
- [ ] Leaderboard view works
- [ ] Cannot update/delete scores

---

## 🆘 Troubleshooting

### Issue: Server won't start after security changes

**Solution**:
```bash
cd /home/ous/projects/lovable-tastyfood/server
npm install # Re-install dependencies
npx tsc # Check for TypeScript errors
npm run dev 2>&1 | tee error.log
# Check error.log for specific issues
```

### Issue: .htaccess not working

**Check 1**: Is mod_rewrite enabled?
```bash
# Contact Hostinger support if not working
```

**Check 2**: File permissions
```bash
chmod 644 public_html/.htaccess
```

**Check 3**: Syntax errors
```bash
# Use online .htaccess validator
# Or check Hostinger error logs
```

### Issue: Rate limiting too strict

**Temporary solution** (for development):
```typescript
// server/security/rateLimiting.ts
// Increase limits temporarily:
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50, // Increased from 10
  // ...
});
```

### Issue: Game scores not submitting

**Check 1**: RLS policies applied?
```sql
-- In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'game_scores';
-- Should show 4 policies
```

**Check 2**: Score validation
```typescript
// Frontend console should show error:
// "new row violates row-level security policy"
// Check score is between 0-10000
```

---

## 📊 Success Metrics

After implementation, you should see:

**Security Improvements:**
- ✅ No secrets in Git history
- ✅ No `.env` accessible via browser
- ✅ Security headers on all responses
- ✅ Rate limiting active
- ✅ Prompt injection detected & blocked
- ✅ Game scores validated
- ✅ Request IDs in logs

**Performance Maintained:**
- Page load time: <2 seconds
- API response time: <500ms
- Build size: <500KB (gzipped)

**Monitoring:**
- Check logs daily for rate limit violations
- Review Gemini API usage weekly
- Run `npm audit` weekly
- Update dependencies monthly

---

## 📚 Next Steps

1. **Review SECURITY-AUDIT.md** for detailed explanations
2. **Follow SECURITY-CHECKLIST.md** for ongoing tasks
3. **Set up GitHub Actions** (`.github/workflows/security-audit.yml`)
4. **Schedule weekly security reviews**
5. **Document any custom changes**

---

**Estimated Total Time**: 2-3 hours  
**Difficulty**: ⭐⭐⭐☆☆ (Intermediate)  
**Priority**: 🔴 CRITICAL

**Questions?** Review `SECURITY-AUDIT.md` or contact your security engineer.
