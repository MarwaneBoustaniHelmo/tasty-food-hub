# ⚡ Performance Optimization - Quick Reference

## 🎯 Goal: 86 → 95+ Score

---

## 🤖 Chatbot Backend (Gemini API – FREE)

The chatbot uses **Google Gemini** instead of Anthropic. Set this for the server:

**Server** (`server/.env`):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free key: [Google AI Studio](https://aistudio.google.com/apikey). Model: `gemini-2.5-flash`.

---

## ✅ What Was Done

### 1. Vite Config ([vite.config.ts](../vite.config.ts))
```typescript
✓ Terser minification (removes console.log)
✓ Code splitting (React, UI, Query separate)
✓ CSS code splitting
✓ Asset inlining (<4KB)
✓ Cache-friendly filenames
```

### 2. .htaccess ([dist/.htaccess](../dist/.htaccess))
```apache
✓ Cache: 1 year for CSS/JS/images
✓ GZIP compression
✓ Automatic WebP serving
✓ HTTPS redirect
✓ Security headers
```

### 3. ChatBot ([src/App.tsx](../src/App.tsx))
```typescript
✓ Lazy loaded with React.lazy()
✓ Wrapped in <Suspense>
✓ -9.41 KB from initial bundle
```

### 4. Images
```
✓ OptimizedImage component created
⚠️ Need to convert to WebP (manual step)
```

---

## 🚀 Deploy NOW (3 Steps)

### Step 1: Build
```bash
cd /home/ous/projects/lovable-tastyfood
npm run build
```

### Step 2: Upload to Hostinger
```
Upload dist/ contents to public_html/
✓ Include .htaccess file
```

### Step 3: Test
```
Visit: https://pagespeed.web.dev/
Enter: https://tastyfood.me
Target: 95+ score
```

---

## 🖼️ Optional: Optimize Images (Bonus +5-10 points)

### Install Tools (One-time)
```bash
# Ubuntu/Debian:
sudo apt-get install imagemagick webp

# macOS:
brew install imagemagick webp
```

### Convert Images
```bash
./scripts/optimize-images.sh
npm run build
# Then redeploy
```

**Savings:** 2.14 MB → 715 KB (66% reduction)

---

## 📊 Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Performance | 86 | **95+** |
| Cache | 50 | **100** |
| Bundle | Large | **-40%** |
| Images | 2.1MB | **715KB** |

---

## 🔧 Verify Cache Headers Work

```bash
curl -I https://tastyfood.me/assets/css/index-*.css
```

**Should show:**
```
Cache-Control: max-age=31536000, immutable
```

---

## 📖 Full Docs

- [PERFORMANCE_SUMMARY.md](../PERFORMANCE_SUMMARY.md) - Complete overview
- [docs/PERFORMANCE_OPTIMIZATION.md](../docs/PERFORMANCE_OPTIMIZATION.md) - Detailed guide

---

## ✨ Quick Build Script

```bash
./scripts/build-optimized.sh
```

Does everything: installs deps, builds, shows sizes, verifies files.

---

---

## 📌 Continue Development

| Task | Doc / Command |
|------|----------------|
| **Fix Git push** (remote not found) | [GIT_PUSH_FIX.md](GIT_PUSH_FIX.md) |
| **Image optimization** | Install ImageMagick + webp, then `./scripts/optimize-images.sh` |
| **Deploy to Hostinger** | Build → upload `dist/` + `dist/.htaccess` → clear cache |

**Status:** ✅ Ready to deploy!
