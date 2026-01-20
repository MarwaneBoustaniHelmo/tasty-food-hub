-- Seed complete menu from menuData.ts into database
-- Clear existing test data first
TRUNCATE TABLE public.menu_items CASCADE;
TRUNCATE TABLE public.categories CASCADE;

-- Insert categories
INSERT INTO public.categories (name, name_en, name_nl, icon, sort_order) VALUES
('Menus Burgers', 'Burger Menus', 'Burger Menu''s', '🍔', 1),
('Burgers', 'Burgers', 'Hamburgers', '🍔', 2),
('Tacos & Fajitas', 'Tacos & Fajitas', 'Tacos & Fajitas', '🌮', 3),
('Tex-Mex', 'Tex-Mex', 'Tex-Mex', '🧀', 4),
('Frites & Sides', 'Fries & Sides', 'Frietjes & Bijgerechten', '🍟', 5),
('Boissons', 'Drinks', 'Dranken', '🥤', 6),
('Desserts', 'Desserts', 'Desserts', '🍰', 7),
('Extras & Sauces', 'Extras & Sauces', 'Extra''s & Sauzen', '🧴', 8);

-- Insert menu items with category mapping
-- Menus Burgers
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Menus Burgers')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_best_seller, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Menu Double Smash', 'Double Smash Menu', 'Dubbele Smash Menu', '2 steaks smashés, cheddar fondu, sauce maison + frites + boisson', '2 smashed patties, melted cheddar, house sauce + fries + drink', '2 smashed patties, gesmolten cheddar, huissaus + frietjes + drankje', 13.90, true, true, 1),
((SELECT id FROM cat), 'Menu Triple Smash', 'Triple Smash Menu', 'Triple Smash Menu', '3 steaks smashés pour les gros appétits + frites + boisson', '3 smashed patties for big appetites + fries + drink', '3 smashed patties voor grote trek + frietjes + drankje', 15.90, false, true, 2),
((SELECT id FROM cat), 'Menu Chicken Burger', 'Chicken Burger Menu', 'Chicken Burger Menu', 'Filet de poulet croustillant, salade, sauce + frites + boisson', 'Crispy chicken fillet, salad, sauce + fries + drink', 'Krokant kipfilet, sla, saus + frietjes + drankje', 12.90, false, true, 3),
((SELECT id FROM cat), 'Menu Spicy Burger', 'Spicy Burger Menu', 'Pittige Burger Menu', 'Steak smashé, jalapeños, sauce piquante + frites + boisson', 'Smashed patty, jalapeños, spicy sauce + fries + drink', 'Smashed patty, jalapeños, pittige saus + frietjes + drankje', 13.50, false, true, 4);

-- Burgers
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Burgers')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_best_seller, is_new, is_spicy, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Double Smash Burger', 'Double Smash Burger', 'Dubbele Smash Burger', '2 steaks smashés 100% bœuf halal, cheddar fondu, oignons caramélisés, sauce signature', '2 smashed 100% halal beef patties, melted cheddar, caramelized onions, signature sauce', '2 smashed 100% halal rundvlees patties, gesmolten cheddar, gekarameliseerde uien, signature saus', 9.90, true, false, false, true, 1),
((SELECT id FROM cat), 'Triple Smash Burger', 'Triple Smash Burger', 'Triple Smash Burger', '3 steaks smashés, triple cheddar, sauce maison généreuse', '3 smashed patties, triple cheddar, generous house sauce', '3 smashed patties, drievoudige cheddar, royale huissaus', 11.90, false, false, false, true, 2),
((SELECT id FROM cat), 'Chicken Burger', 'Chicken Burger', 'Chicken Burger', 'Filet de poulet pané croustillant, salade fraîche, tomate, sauce mayo maison', 'Crispy breaded chicken fillet, fresh salad, tomato, homemade mayo sauce', 'Krokant gepaneerd kipfilet, verse sla, tomaat, huisgemaakte mayosaus', 8.90, false, false, false, true, 3),
((SELECT id FROM cat), 'Spicy Burger', 'Spicy Burger', 'Pittige Burger', 'Steak smashé épicé, jalapeños, sauce piquante maison, cheddar', 'Spicy smashed patty, jalapeños, homemade spicy sauce, cheddar', 'Pittige smashed patty, jalapeños, huisgemaakte pittige saus, cheddar', 9.50, false, false, true, true, 4),
((SELECT id FROM cat), 'Cheese & Bacon Burger', 'Cheese & Bacon Burger', 'Cheese & Bacon Burger', 'Double steak, cheddar, bacon de dinde halal croustillant, sauce BBQ', 'Double patty, cheddar, crispy halal turkey bacon, BBQ sauce', 'Dubbele patty, cheddar, krokante halal kalkoenspek, BBQ saus', 10.90, false, true, false, true, 5);

-- Tacos & Fajitas
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Tacos & Fajitas')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_best_seller, is_spicy, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Tacos Classique', 'Classic Tacos', 'Klassieke Tacos', 'Tortilla grillée, viande au choix, sauce fromagère, frites maison', 'Grilled tortilla, choice of meat, cheese sauce, house fries', 'Gegrilde tortilla, vlees naar keuze, kaassaus, huisfrietjes', 8.50, true, false, true, 1),
((SELECT id FROM cat), 'Tacos XL', 'XL Tacos', 'XL Tacos', 'Double portion de viande, double fromage, frites généreuses', 'Double meat portion, double cheese, generous fries', 'Dubbele vleesportie, dubbele kaas, royale frietjes', 11.50, false, false, true, 2),
((SELECT id FROM cat), 'Tacos Spicy', 'Spicy Tacos', 'Pittige Tacos', 'Viande épicée, jalapeños, sauce piquante et fromagère', 'Spicy meat, jalapeños, spicy and cheese sauce', 'Pittig vlees, jalapeños, pittige en kaassaus', 9.50, false, true, true, 3),
((SELECT id FROM cat), 'Fajitas Maison', 'House Fajitas', 'Huis Fajitas', 'Tortillas souples, viande marinée, poivrons, oignons, crème fraîche', 'Soft tortillas, marinated meat, peppers, onions, sour cream', 'Zachte tortillas, gemarineerd vlees, paprika''s, uien, zure room', 10.90, false, false, true, 4);

-- Tex-Mex
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Tex-Mex')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Nachos Maison', 'House Nachos', 'Huis Nachos', 'Chips tortilla, cheddar fondu, jalapeños, guacamole, crème fraîche', 'Tortilla chips, melted cheddar, jalapeños, guacamole, sour cream', 'Tortillachips, gesmolten cheddar, jalapeños, guacamole, zure room', 7.90, true, 1),
((SELECT id FROM cat), 'Quesadillas', 'Quesadillas', 'Quesadillas', 'Tortilla croustillante, fromage fondu, viande au choix', 'Crispy tortilla, melted cheese, choice of meat', 'Krokante tortilla, gesmolten kaas, vlees naar keuze', 8.50, true, 2),
((SELECT id FROM cat), 'Chicken Nuggets (x10)', 'Chicken Nuggets (x10)', 'Chicken Nuggets (x10)', 'Nuggets de poulet croustillants avec sauce au choix', 'Crispy chicken nuggets with choice of sauce', 'Krokante kipnuggets met saus naar keuze', 6.90, true, 3);

-- Frites & Sides
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Frites & Sides')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_best_seller, is_new, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Frites Maison', 'House Fries', 'Huisfrietjes', 'Frites fraîches croustillantes à l''extérieur, fondantes à l''intérieur', 'Fresh fries crispy outside, soft inside', 'Verse frietjes krokant buiten, zacht binnen', 3.50, true, false, true, 1),
((SELECT id FROM cat), 'Loaded Frites', 'Loaded Fries', 'Geladen Frietjes', 'Frites garnies de cheddar fondu, bacon de dinde, sauce', 'Fries topped with melted cheddar, turkey bacon, sauce', 'Frietjes gegarneerd met gesmolten cheddar, kalkoenspek, saus', 6.90, false, true, true, 2),
((SELECT id FROM cat), 'Cheese Frites', 'Cheese Fries', 'Kaas Frietjes', 'Frites avec sauce cheddar crémeuse', 'Fries with creamy cheddar sauce', 'Frietjes met romige cheddarsaus', 4.90, false, false, true, 3),
((SELECT id FROM cat), 'Onion Rings', 'Onion Rings', 'Uienringen', 'Rondelles d''oignon panées et croustillantes', 'Breaded and crispy onion rings', 'Gepaneerde en krokante uienringen', 4.50, false, false, true, 4);

-- Boissons
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Boissons')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_new, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Coca-Cola', 'Coca-Cola', 'Coca-Cola', '33cl', '33cl', '33cl', 2.50, false, true, 1),
((SELECT id FROM cat), 'Coca-Cola Zero', 'Coca-Cola Zero', 'Coca-Cola Zero', '33cl', '33cl', '33cl', 2.50, false, true, 2),
((SELECT id FROM cat), 'Fanta Orange', 'Fanta Orange', 'Fanta Sinaasappel', '33cl', '33cl', '33cl', 2.50, false, true, 3),
((SELECT id FROM cat), 'Sprite', 'Sprite', 'Sprite', '33cl', '33cl', '33cl', 2.50, false, true, 4),
((SELECT id FROM cat), 'Ice Tea Pêche', 'Peach Ice Tea', 'Perzik Ice Tea', '33cl', '33cl', '33cl', 2.50, false, true, 5),
((SELECT id FROM cat), 'Eau Minérale', 'Mineral Water', 'Mineraalwater', '50cl', '50cl', '50cl', 2.00, false, true, 6),
((SELECT id FROM cat), 'Mojito Sans Alcool', 'Virgin Mojito', 'Mojito Zonder Alcohol', 'Menthe fraîche, citron vert, sucre de canne', 'Fresh mint, lime, cane sugar', 'Verse munt, limoen, rietsuiker', 4.50, true, true, 7);

-- Desserts
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Desserts')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_best_seller, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Tiramisu Maison', 'House Tiramisu', 'Huis Tiramisu', 'Crémeux au mascarpone et café, saupoudré de cacao', 'Creamy mascarpone and coffee, dusted with cocoa', 'Romige mascarpone en koffie, bestrooid met cacao', 5.00, true, true, 1),
((SELECT id FROM cat), 'Cookie Géant', 'Giant Cookie', 'Reuze Cookie', 'Cookie aux pépites de chocolat, tiède sur demande', 'Chocolate chip cookie, warm on request', 'Chocoladechip cookie, warm op verzoek', 3.50, false, true, 2),
((SELECT id FROM cat), 'Brownie Chocolat', 'Chocolate Brownie', 'Chocolade Brownie', 'Brownie fondant au chocolat noir intense', 'Fudgy intense dark chocolate brownie', 'Smeltende intense pure chocolade brownie', 4.00, false, true, 3);

-- Extras & Sauces
WITH cat AS (SELECT id FROM public.categories WHERE name = 'Extras & Sauces')
INSERT INTO public.menu_items (category_id, name, name_en, name_nl, description, description_en, description_nl, price, is_available, sort_order) VALUES
((SELECT id FROM cat), 'Sauce BBQ', 'BBQ Sauce', 'BBQ Saus', 'Pot individuel', 'Individual pot', 'Individuele pot', 0.50, true, 1),
((SELECT id FROM cat), 'Sauce Samurai', 'Samurai Sauce', 'Samurai Saus', 'Pot individuel', 'Individual pot', 'Individuele pot', 0.50, true, 2),
((SELECT id FROM cat), 'Sauce Algérienne', 'Algerian Sauce', 'Algerijnse Saus', 'Pot individuel', 'Individual pot', 'Individuele pot', 0.50, true, 3),
((SELECT id FROM cat), 'Mayonnaise', 'Mayonnaise', 'Mayonaise', 'Pot individuel', 'Individual pot', 'Individuele pot', 0.50, true, 4),
((SELECT id FROM cat), 'Ketchup', 'Ketchup', 'Ketchup', 'Pot individuel', 'Individual pot', 'Individuele pot', 0.50, true, 5),
((SELECT id FROM cat), 'Extra Fromage', 'Extra Cheese', 'Extra Kaas', 'Tranche de cheddar', 'Cheddar slice', 'Cheddar plak', 1.00, true, 6),
((SELECT id FROM cat), 'Extra Viande', 'Extra Meat', 'Extra Vlees', 'Portion supplémentaire', 'Additional portion', 'Extra portie', 2.00, true, 7);

-- Verification
SELECT 
  c.name as category, 
  COUNT(m.id) as item_count 
FROM public.categories c 
LEFT JOIN public.menu_items m ON c.id = m.category_id 
GROUP BY c.name 
ORDER BY c.sort_order;

SELECT COUNT(*) as total_items FROM public.menu_items;
