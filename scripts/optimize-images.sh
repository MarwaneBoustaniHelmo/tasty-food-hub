#!/bin/bash

# ============================================================================
# Image Optimization Script for Tasty Food
# ============================================================================
# This script converts JPG/PNG images to WebP format for better performance
# Requires: imagemagick or webp tools
# ============================================================================

echo "🖼️  Tasty Food - Image Optimization Script"
echo "=========================================="

# Check if imagemagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    echo "Run: sudo apt-get install imagemagick"
    echo "Or: brew install imagemagick (macOS)"
    exit 1
fi

# Check if cwebp is installed (better WebP conversion)
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp not found. Using ImageMagick instead."
    echo "For better results, install: sudo apt-get install webp"
    USE_CWEBP=false
else
    USE_CWEBP=true
fi

# Navigate to assets directory
cd "$(dirname "$0")/../src/assets" || exit

echo ""
echo "📁 Current directory: $(pwd)"
echo ""

# Function to optimize and convert images
optimize_image() {
    local file="$1"
    local filename="${file%.*}"
    local extension="${file##*.}"
    local webp_file="${filename}.webp"
    
    echo "Processing: $file"
    
    # Get original size
    original_size=$(du -h "$file" | cut -f1)
    
    # Convert to WebP
    if [ "$USE_CWEBP" = true ]; then
        # Use cwebp for better compression
        cwebp -q 85 "$file" -o "$webp_file" 2>/dev/null
    else
        # Use ImageMagick
        convert "$file" -quality 85 "$webp_file" 2>/dev/null
    fi
    
    # Check if WebP was created successfully
    if [ -f "$webp_file" ]; then
        webp_size=$(du -h "$webp_file" | cut -f1)
        echo "  ✓ Created: $webp_file ($original_size → $webp_size)"
        
        # Optionally optimize original JPG/PNG (uncomment if needed)
        # if [ "$extension" = "jpg" ] || [ "$extension" = "jpeg" ]; then
        #     convert "$file" -strip -quality 85 -interlace Plane "$file" 2>/dev/null
        # elif [ "$extension" = "png" ]; then
        #     convert "$file" -strip "$file" 2>/dev/null
        # fi
    else
        echo "  ❌ Failed to create WebP for: $file"
    fi
    
    echo ""
}

# Count images
total=$(find . -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l)
echo "Found $total images to optimize"
echo ""

# Process all JPG, JPEG, and PNG files
for file in *.jpg *.jpeg *.png; do
    [ -f "$file" ] || continue
    optimize_image "$file"
done

echo "=========================================="
echo "✅ Optimization complete!"
echo ""
echo "📊 Summary:"
find . -maxdepth 1 -name "*.webp" -exec du -ch {} + | tail -1
echo ""
echo "Next steps:"
echo "1. Update image imports in your code to use .webp"
echo "2. Add fallback for browsers that don't support WebP"
echo "3. Deploy .htaccess to enable automatic WebP serving"
