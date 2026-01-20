-- ============================================================================
-- TASTY FOOD DATABASE SCHEMA
-- Critical tables for menu, categories, and orders
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- RESTAURANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT true,
  opening_hours JSONB DEFAULT '{}',
  delivery_platforms JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_nl VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_nl VARCHAR(255),
  description TEXT,
  description_en TEXT,
  description_nl TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_best_seller BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  is_halal BOOLEAN DEFAULT true,
  is_gluten_free BOOLEAN DEFAULT false,
  allergens JSONB DEFAULT '[]',
  extras JSONB DEFAULT '{}',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA - RESTAURANTS
-- ============================================================================
INSERT INTO public.restaurants (id, name, slug, address, city, postal_code, phone, latitude, longitude, delivery_platforms)
VALUES 
  (
    'e7b5c4d3-2a1f-4e8d-9c6b-3f2a1e8d7c6b',
    'Tasty Food Seraing',
    'seraing',
    '15 Rue Gustave Bailly',
    'Seraing',
    '4101',
    '+32 4 XXX XX XX',
    50.5892,
    5.5014,
    '["uber_eats", "deliveroo", "takeaway"]'::jsonb
  ),
  (
    'f8c6d5e4-3b2g-5f9e-0d7c-4g3b2f9e8d7c',
    'Tasty Food Angleur',
    'angleur',
    '100 Rue Vaudrée',
    'Angleur',
    '4031',
    '+32 4 XXX XX XX',
    50.6167,
    5.6019,
    '["uber_eats", "deliveroo", "takeaway"]'::jsonb
  ),
  (
    'a9d7e6f5-4c3h-6g0f-1e8d-5h4c3g0f9e8d',
    'Tasty Food Saint-Gilles',
    'saint-gilles',
    'Rue Saint-Gilles 58',
    'Liège',
    '4000',
    '+32 4 XXX XX XX',
    50.6333,
    5.5833,
    '["uber_eats", "deliveroo"]'::jsonb
  ),
  (
    'b0e8f7g6-5d4i-7h1g-2f9e-6i5d4h1g0f9e',
    'Tasty Food Wandre',
    'wandre',
    'Rue du Pont de Wandre 75',
    'Liège',
    '4020',
    '+32 4 XXX XX XX',
    50.6500,
    5.6500,
    '["uber_eats", "takeaway"]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - CATEGORIES
-- ============================================================================
INSERT INTO public.categories (id, name, name_en, name_nl, icon, sort_order)
VALUES 
  (uuid_generate_v4(), 'SMASH BURGERS', 'SMASH BURGERS', 'SMASH BURGERS', '🍔', 1),
  (uuid_generate_v4(), 'LOADED FRIES', 'LOADED FRIES', 'LOADED FRIES', '🍟', 2),
  (uuid_generate_v4(), 'TEX-MEX', 'TEX-MEX', 'TEX-MEX', '🌮', 3),
  (uuid_generate_v4(), 'BOISSONS', 'BEVERAGES', 'DRANKEN', '🥤', 4),
  (uuid_generate_v4(), 'DESSERTS', 'DESSERTS', 'DESSERTS', '🍰', 5),
  (uuid_generate_v4(), 'EXTRAS', 'EXTRAS', 'EXTRAS', '🧂', 6)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA - MENU ITEMS (Popular Items)
-- ============================================================================
DO $$
DECLARE
  cat_smash_id UUID;
  cat_fries_id UUID;
  cat_texmex_id UUID;
  cat_drinks_id UUID;
  cat_desserts_id UUID;
  cat_extras_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_smash_id FROM categories WHERE name = 'SMASH BURGERS' LIMIT 1;
  SELECT id INTO cat_fries_id FROM categories WHERE name = 'LOADED FRIES' LIMIT 1;
  SELECT id INTO cat_texmex_id FROM categories WHERE name = 'TEX-MEX' LIMIT 1;
  SELECT id INTO cat_drinks_id FROM categories WHERE name = 'BOISSONS' LIMIT 1;
  SELECT id INTO cat_desserts_id FROM categories WHERE name = 'DESSERTS' LIMIT 1;
  SELECT id INTO cat_extras_id FROM categories WHERE name = 'EXTRAS' LIMIT 1;

  -- Insert SMASH BURGERS
  INSERT INTO menu_items (category_id, name, description, price, is_best_seller, is_available, sort_order)
  VALUES
    (cat_smash_id, 'BEST SELLER SMASH', '2 steaks smashés, cheddar fondu, sauce maison secrète, frites fraîches', 13.90, true, true, 1),
    (cat_smash_id, 'MINI TRIPLE SMASH', '3 steaks smashés pour les gros appétits, triple cheddar, sauce BBQ', 15.90, true, true, 2),
    (cat_smash_id, 'MINI CHICKEN BURGER', 'Filet de poulet croustillant, salade iceberg, sauce blanche, frites', 12.90, false, true, 3),
    (cat_smash_id, 'MINI SPICY BURGER', 'Steak épicé, jalapeños, sauce piquante, cheddar, frites', 13.50, false, true, 4),
    (cat_smash_id, 'CLASSIC SMASH', 'Steak smasé, salade, tomate, oignon, cornichons, sauce maison', 11.90, false, true, 5);

  -- Insert LOADED FRIES
  INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
  VALUES
    (cat_fries_id, 'LOADED FRIES CLASSIC', 'Frites fraîches, cheddar fondu, bacon croustillant, sauce BBQ', 8.90, true, 1),
    (cat_fries_id, 'LOADED FRIES PULLED', 'Frites, pulled pork, fromage, oignons frits, sauce moutarde miel', 9.90, true, 2),
    (cat_fries_id, 'LOADED FRIES VEGAN', 'Frites, guacamole, jalapeños, sauce vegan', 8.50, true, 3);

  -- Insert TEX-MEX
  INSERT INTO menu_items (category_id, name, description, price, is_spicy, is_available, sort_order)
  VALUES
    (cat_texmex_id, 'TACOS BEEF', 'Tacos bœuf haché, salade, tomate, cheddar, sauce épicée', 7.90, true, true, 1),
    (cat_texmex_id, 'TACOS CHICKEN', 'Tacos poulet mariné, légumes grillés, sauce blanche', 7.50, false, true, 2),
    (cat_texmex_id, 'BURRITO XL', 'Tortilla géante, riz, haricots, viande au choix, fromage', 10.90, false, true, 3);

  -- Insert BOISSONS
  INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
  VALUES
    (cat_drinks_id, 'Coca-Cola 33cl', 'Coca-Cola canette', 2.50, true, 1),
    (cat_drinks_id, 'Coca-Cola Zéro 33cl', 'Coca-Cola Zéro canette', 2.50, true, 2),
    (cat_drinks_id, 'Fanta Orange 33cl', 'Fanta Orange canette', 2.50, true, 3),
    (cat_drinks_id, 'Sprite 33cl', 'Sprite canette', 2.50, true, 4),
    (cat_drinks_id, 'Ice Tea Peach 33cl', 'Ice Tea Pêche', 2.50, true, 5),
    (cat_drinks_id, 'Eau Minérale 50cl', 'Eau plate', 1.90, true, 6);

  -- Insert DESSERTS
  INSERT INTO menu_items (category_id, name, description, price, is_new, is_available, sort_order)
  VALUES
    (cat_desserts_id, 'Brownie Chocolat', 'Brownie maison au chocolat belge, servie tiède', 4.90, true, true, 1),
    (cat_desserts_id, 'Cookies Maison x3', '3 cookies au chocolat faits maison', 3.90, false, true, 2),
    (cat_desserts_id, 'Milkshake Vanille', 'Milkshake onctueux à la vanille', 5.50, false, true, 3),
    (cat_desserts_id, 'Milkshake Chocolat', 'Milkshake onctueux au chocolat', 5.50, false, true, 4);

  -- Insert EXTRAS
  INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
  VALUES
    (cat_extras_id, 'Sauce supplémentaire', 'Sauce au choix (BBQ, blanche, épicée, curry)', 0.50, true, 1),
    (cat_extras_id, 'Portion de frites', 'Frites fraîches croustillantes', 3.50, true, 2),
    (cat_extras_id, 'Supplément cheddar', 'Tranche de cheddar fondu', 1.00, true, 3),
    (cat_extras_id, 'Supplément bacon', 'Bacon croustillant', 1.50, true, 4);
END $$;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Public read access
-- ============================================================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to restaurants" 
  ON restaurants FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to categories" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to menu_items" 
  ON menu_items FOR SELECT 
  USING (is_available = true);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETED!
-- ============================================================================
-- Run this migration with:
-- psql -h <host> -U <user> -d <database> -f 20260120_init_menu_tables.sql
-- 
-- Or through Supabase Dashboard:
-- SQL Editor → New Query → Paste this content → Run
-- ============================================================================
