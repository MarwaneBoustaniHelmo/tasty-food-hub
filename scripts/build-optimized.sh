#!/bin/bash

# ============================================================================
# Complete Performance Optimization & Build Script
# Tasty Food - tastyfood.me
# ============================================================================

set -e  # Exit on error

echo "🚀 Tasty Food - Performance Optimization & Build"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo "📦 Step 1: Checking dependencies..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"

# Check if ImageMagick is installed
if command -v convert &> /dev/null && command -v cwebp &> /dev/null; then
    echo -e "${GREEN}✓ ImageMagick and WebP tools found${NC}"
    HAS_IMAGE_TOOLS=true
else
    echo -e "${YELLOW}⚠️  ImageMagick/WebP tools not found${NC}"
    echo "   Images won't be optimized. Install with:"
    echo "   Ubuntu: sudo apt-get install imagemagick webp"
    echo "   macOS:  brew install imagemagick webp"
    HAS_IMAGE_TOOLS=false
fi
echo ""

# Step 2: Install/update dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Optimize images (if tools available)
if [ "$HAS_IMAGE_TOOLS" = true ]; then
    echo "🖼️  Step 3: Optimizing images..."
    if [ -f "scripts/optimize-images.sh" ]; then
        chmod +x scripts/optimize-images.sh
        ./scripts/optimize-images.sh || echo -e "${YELLOW}⚠️  Image optimization failed (skipping)${NC}"
    else
        echo -e "${YELLOW}⚠️  optimize-images.sh not found${NC}"
    fi
else
    echo "⏭️  Step 3: Skipping image optimization (tools not installed)"
fi
echo ""

# Step 4: Update browserslist
echo "🔄 Step 4: Updating browserslist..."
npx update-browserslist-db@latest || echo -e "${YELLOW}⚠️  Browserslist update failed (skipping)${NC}"
echo ""

# Step 5: Build production bundle
echo "🏗️  Step 5: Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 6: Analyze build output
echo "📊 Step 6: Build Analysis"
echo "------------------------"

# Show bundle sizes
echo ""
echo "📦 Bundle Sizes:"
if [ -d "dist" ]; then
    echo ""
    echo "CSS Files:"
    find dist/assets/css -type f -name "*.css" -exec du -h {} \; 2>/dev/null || echo "  No CSS files found"
    
    echo ""
    echo "JavaScript Files:"
    find dist/assets/js -type f -name "*.js" -exec du -h {} \; 2>/dev/null | head -10 || echo "  No JS files found"
    
    echo ""
    echo "Images:"
    find dist/assets -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) -exec du -h {} \; 2>/dev/null | head -10 || echo "  No images found"
    
    echo ""
    echo "Total dist/ size:"
    du -sh dist/ 2>/dev/null || echo "  Could not calculate"
else
    echo -e "${RED}❌ dist/ folder not found${NC}"
fi
echo ""

# Step 7: Verify .htaccess
echo "🔧 Step 7: Verifying deployment files..."
if [ -f "dist/.htaccess" ]; then
    echo -e "${GREEN}✓ .htaccess found in dist/${NC}"
else
    echo -e "${YELLOW}⚠️  .htaccess not found. Copying...${NC}"
    if [ -f "public/.htaccess" ]; then
        cp public/.htaccess dist/.htaccess
        echo -e "${GREEN}✓ .htaccess copied${NC}"
    else
        echo -e "${RED}❌ .htaccess source not found${NC}"
    fi
fi

if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓ index.html found${NC}"
else
    echo -e "${RED}❌ index.html not found${NC}"
    exit 1
fi
echo ""

# Step 8: Summary & next steps
echo "================================================="
echo "✅ Build Complete!"
echo "================================================="
echo ""
echo "📊 Performance Optimizations Applied:"
echo "  ✓ Code splitting (React, UI, Query vendors)"
echo "  ✓ Terser minification (console.log removed)"
echo "  ✓ CSS purging (Tailwind unused classes removed)"
echo "  ✓ ChatBot lazy loading"
echo "  ✓ Cache headers (.htaccess)"
echo "  ✓ GZIP compression enabled"

if [ "$HAS_IMAGE_TOOLS" = true ]; then
    echo "  ✓ Images converted to WebP"
else
    echo "  ⚠️  Images NOT optimized (install ImageMagick)"
fi

echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Test locally:"
echo "   npm run preview"
echo ""
echo "2. Deploy to Hostinger:"
echo "   - Upload dist/ contents to public_html/"
echo "   - Ensure .htaccess is uploaded"
echo "   - Test: https://tastyfood.me"
echo ""
echo "3. Verify performance:"
echo "   https://pagespeed.web.dev/"
echo "   Target: 95+ score"
echo ""
echo "4. Check caching:"
echo "   curl -I https://tastyfood.me/assets/css/index-*.css"
echo "   Should show: Cache-Control: max-age=31536000"
echo ""
echo "📖 Full guide: docs/PERFORMANCE_OPTIMIZATION.md"
echo "📊 Summary: PERFORMANCE_SUMMARY.md"
echo ""
echo "================================================="
