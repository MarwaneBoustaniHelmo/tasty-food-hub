#!/bin/bash

# Tasty Food - Support System Setup Script
# This script helps set up the customer support system

echo "🍔 Tasty Food - Support System Setup"
echo "===================================="
echo ""

# Check if Supabase is running
echo "📊 Checking Supabase status..."
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    
    # Check if Supabase is started
    if supabase status &> /dev/null; then
        echo "✅ Supabase is running"
        
        # Apply migrations
        echo ""
        echo "📥 Applying support system migration..."
        supabase db push
        
        if [ $? -eq 0 ]; then
            echo "✅ Migration applied successfully!"
        else
            echo "⚠️  Migration failed. Trying alternative method..."
            
            # Try with psql
            if command -v psql &> /dev/null; then
                echo "Using psql to apply migration..."
                PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/20260120000000_create_support_system.sql
                
                if [ $? -eq 0 ]; then
                    echo "✅ Migration applied via psql!"
                else
                    echo "❌ Failed to apply migration"
                    exit 1
                fi
            else
                echo "❌ psql not found. Please install PostgreSQL client."
                exit 1
            fi
        fi
    else
        echo "⚠️  Supabase is not running"
        echo "Run: supabase start"
        exit 1
    fi
else
    echo "⚠️  Supabase CLI not found"
    echo ""
    echo "Option 1: Install Supabase CLI"
    echo "  npm install -g supabase"
    echo ""
    echo "Option 2: Use production Supabase"
    echo "  Apply migration via Supabase Dashboard > SQL Editor"
    echo ""
fi

echo ""
echo "📧 Edge Function Setup"
echo "====================="
echo ""
echo "To enable email notifications:"
echo "1. Get Resend API key from https://resend.com"
echo "2. Deploy the Edge Function:"
echo "   supabase functions deploy send-support-email"
echo "3. Set environment variables in Supabase Dashboard:"
echo "   - RESEND_API_KEY=your-key"
echo "   - CHAT_URL=https://tastyfood.be/support"
echo ""

echo "✅ Setup instructions complete!"
echo ""
echo "📚 Next steps:"
echo "1. Read README_SUPPORT.md for full documentation"
echo "2. Test the chatbot by opening the app"
echo "3. Try creating a support ticket"
echo ""
