#!/bin/bash
# Game Setup Script - Run after first deployment
# Sets up Supabase database for arcade game

echo "🎮 Tasty Food Arcade Game - Database Setup"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found."
    echo "Install it with: npm install -g supabase"
    echo ""
    echo "Or run the migration manually in Supabase Dashboard:"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to SQL Editor"
    echo "  4. Paste contents of: supabase/migrations/20260129_create_game_scores.sql"
    echo "  5. Click 'Run'"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Link to project (if not already linked)
echo "📡 Linking to Supabase project..."
supabase link --project-ref your-project-ref

# Push migration
echo "📤 Pushing database migration..."
supabase db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. npm run dev"
echo "  2. Open http://localhost:8080"
echo "  3. Scroll to the game section"
echo "  4. Play and test score submission"
echo ""
echo "🏆 Monthly prizes: Top 3 scores win free menus!"
