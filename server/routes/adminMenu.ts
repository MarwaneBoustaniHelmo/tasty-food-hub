/**
 * Admin Menu Management Routes (Example)
 * 
 * These routes would be used by an admin panel to manage
 * categories and menu items. 
 * 
 * ⚠️ TODO: Add authentication middleware before deploying!
 * ⚠️ Only authenticated admins should access these routes.
 */

import { Router, Request, Response } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getAllCategories,
  getAllMenuItems,
  bulkUpdateMenuItemPrices
} from '../lib/menuService';

const router = Router();

// ==========================================
// MIDDLEWARE: Admin Authentication
// ==========================================
// TODO: Implement proper admin authentication
// Example using a simple API key (replace with JWT/session)
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-admin-api-key'];
  
  // TODO: Replace with proper authentication
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// ==========================================
// CATEGORIES ROUTES
// ==========================================

// GET /api/admin/categories - List all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/categories - Create new category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, name_en, name_nl, icon, sort_order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const category = await createCategory({
      name,
      name_en,
      name_nl,
      icon,
      sort_order
    });
    
    res.status(201).json({ category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/categories/:id - Update category
router.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, name_en, name_nl, icon, sort_order } = req.body;
    
    const category = await updateCategory(id, {
      name,
      name_en,
      name_nl,
      icon,
      sort_order
    });
    
    res.json({ category });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/categories/:id - Delete category
router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteCategory(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// MENU ITEMS ROUTES
// ==========================================

// GET /api/admin/menu-items - List all menu items
router.get('/menu-items', async (req: Request, res: Response) => {
  try {
    const { category_id } = req.query;
    const menuItems = await getAllMenuItems(category_id as string);
    res.json({ menuItems });
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/menu-items - Create new menu item
router.post('/menu-items', async (req: Request, res: Response) => {
  try {
    const {
      category_id,
      name,
      name_en,
      name_nl,
      description,
      description_en,
      description_nl,
      price,
      image_url,
      is_available,
      is_best_seller,
      is_new,
      is_spicy,
      nutritional_info,
      extras,
      sort_order
    } = req.body;
    
    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ 
        error: 'category_id, name, and price are required' 
      });
    }
    
    const menuItem = await createMenuItem({
      category_id,
      name,
      name_en,
      name_nl,
      description,
      description_en,
      description_nl,
      price: parseFloat(price),
      image_url,
      is_available,
      is_best_seller,
      is_new,
      is_spicy,
      nutritional_info,
      extras,
      sort_order
    });
    
    res.status(201).json({ menuItem });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/menu-items/:id - Update menu item
router.put('/menu-items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convert price to number if provided
    if (updates.price !== undefined) {
      updates.price = parseFloat(updates.price);
    }
    
    const menuItem = await updateMenuItem(id, updates);
    res.json({ menuItem });
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/menu-items/:id/availability - Toggle availability
router.patch('/menu-items/:id/availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;
    
    if (typeof is_available !== 'boolean') {
      return res.status(400).json({ error: 'is_available must be a boolean' });
    }
    
    const menuItem = await toggleMenuItemAvailability(id, is_available);
    res.json({ menuItem });
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/menu-items/:id - Delete menu item
router.delete('/menu-items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteMenuItem(id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/menu-items/bulk-update-prices - Bulk price update
router.post('/menu-items/bulk-update-prices', async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }
    
    // Validate structure
    for (const update of updates) {
      if (!update.id || update.price === undefined) {
        return res.status(400).json({ 
          error: 'Each update must have id and price' 
        });
      }
      update.price = parseFloat(update.price);
    }
    
    const result = await bulkUpdateMenuItemPrices(updates);
    res.json(result);
  } catch (error: any) {
    console.error('Error bulk updating prices:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

/**
 * USAGE IN server/index.ts:
 * 
 * import adminMenuRoutes from './routes/adminMenu';
 * app.use('/api/admin', adminMenuRoutes);
 * 
 * Then you can make requests like:
 * 
 * POST /api/admin/categories
 * POST /api/admin/menu-items
 * PUT /api/admin/menu-items/:id
 * DELETE /api/admin/menu-items/:id
 * 
 * All with X-Admin-API-Key header for authentication.
 */
