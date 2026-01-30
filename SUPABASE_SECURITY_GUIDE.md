# Supabase RLS Security Setup - Complete Guide

## 🎯 Access Model Overview

Your Tasty Food marketing site uses a **public read, admin write** model:

| Table | Anonymous Users | Authenticated Users | Service Role (Backend) |
|-------|----------------|---------------------|----------------------|
| `categories` | ✅ Read-only | ✅ Read-only | ✅ Full CRUD |
| `menu_items` | ✅ Read-only | ✅ Read-only | ✅ Full CRUD |

## 🔒 RLS Policies Applied

### 1. Categories Table
- ✅ RLS Enabled
- ✅ Public SELECT policy (anyone can browse)
- ✅ Explicit INSERT/UPDATE/DELETE denial (only service_role can write)

### 2. Menu Items Table
- ✅ RLS Enabled
- ✅ Public SELECT policy (anyone can browse menu)
- ✅ Explicit INSERT/UPDATE/DELETE denial (only service_role can write)

## 📋 Migration Files

Apply these in order in Supabase SQL Editor:

1. **Categories RLS Fix**
   - File: `supabase/migrations/fix_categories_rls.sql`
   - Purpose: Secure categories table with explicit policies

2. **Menu Items RLS Fix**
   - File: `supabase/migrations/fix_menu_items_rls.sql`
   - Purpose: Secure menu_items table with explicit policies

## 🚀 How to Apply

### Option A: Supabase Dashboard (Recommended)
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Copy contents of each migration file
4. Run them one by one
5. Verify no errors

### Option B: Supabase CLI
```bash
# If you have Supabase CLI configured
supabase db push
```

## ✅ Verification

After applying migrations, verify the security:

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'menu_items');
```

Expected result: Both should show `rowsecurity = true`

### List All Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('categories', 'menu_items')
ORDER BY tablename, policyname;
```

Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

### Test Read Access (Should Work)
```sql
-- As anonymous user (or in Supabase API requests)
SELECT * FROM categories;
SELECT * FROM menu_items WHERE is_available = true;
```

### Test Write Access (Should Fail)
```sql
-- As anonymous user - these should be rejected
INSERT INTO categories (name) VALUES ('Test Category');
-- Expected: ERROR: new row violates row-level security policy

UPDATE menu_items SET price = 999.99 WHERE id = '...';
-- Expected: ERROR: new row violates row-level security policy
```

## 🔐 Frontend Usage (Already Secure)

Your frontend code is **already correct**:

### Frontend Supabase Client
```typescript
// src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

✅ Uses `anon` key - perfect for read-only operations

### Current Frontend Queries
- ✅ `src/hooks/useMenuData.ts` - SELECT only
- ✅ `src/pages/TestDatabase.tsx` - SELECT only
- ✅ No write operations from frontend

## 🛠️ Backend Admin Operations

For managing menu content, use the service role from your Node backend:

### Setup Service Role Client
```typescript
// server/lib/supabaseAdmin.ts (already created)
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ NEVER expose to frontend
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

### Environment Variables
```bash
# server/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # From Supabase Dashboard > Settings > API
```

### Admin Operations
```typescript
// server/lib/menuService.ts (already created)
import { supabaseAdmin } from './supabaseAdmin';

// Add category
await supabaseAdmin.from('categories').insert({ name: 'Desserts', ... });

// Update menu item
await supabaseAdmin.from('menu_items').update({ price: 12.99 }).eq('id', itemId);

// Delete menu item
await supabaseAdmin.from('menu_items').delete().eq('id', itemId);
```

## 🎯 Why This Approach?

### Benefits
1. **Defense in Depth**: Database enforces access rules, not just app logic
2. **Public Browsing**: Anonymous users can view menu without authentication
3. **Centralized Management**: Only backend can modify menu content
4. **Audit Trail**: All writes go through authenticated backend
5. **No Exposure Risk**: Frontend can't accidentally expose write endpoints

### Security Guarantees
- ✅ Anon key **cannot** write to categories or menu_items
- ✅ Even if anon key is compromised, RLS prevents writes
- ✅ Service role bypasses RLS (admin access only)
- ✅ JWT-based authentication ready for future user features

## 🚨 Security Advisor Status

After applying migrations, Supabase Security Advisor should show:
- ✅ `public.categories`: RLS enabled with policies ✓
- ✅ `public.menu_items`: RLS enabled with policies ✓
- ✅ No warnings about missing RLS

## 📚 Next Steps (Optional)

If you want to add more tables in the future:

1. **Orders table** (if you build checkout):
   ```sql
   -- User ownership model
   CREATE POLICY "Users can view own orders" ON orders
     FOR SELECT USING (auth.uid() = user_id);
   ```

2. **Reviews table** (if you add reviews):
   ```sql
   -- Public read, authenticated write
   CREATE POLICY "Public can read reviews" ON reviews
     FOR SELECT USING (true);
   CREATE POLICY "Authenticated can create reviews" ON reviews
     FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
   ```

3. **Admin users table** (if you need admin panel):
   ```sql
   -- Check custom JWT claims
   CREATE POLICY "Only admins can access" ON admin_users
     FOR ALL USING (
       (auth.jwt() ->> 'role')::text = 'admin'
     );
   ```

## 🔗 Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Last Updated**: January 30, 2026  
**Status**: ✅ Ready to Apply
