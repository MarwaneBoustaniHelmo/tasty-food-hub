import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/data/menuData';

export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, name_en, name_nl, icon, sort_order')
          .order('sort_order');

        if (categoriesError) throw categoriesError;

        // Fetch menu items for each category
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('sort_order');

        if (itemsError) throw itemsError;

        // Transform database data to MenuCategory format
        const menuCategories: MenuCategory[] = (categoriesData || []).map(cat => {
          const categoryItems = (itemsData || [])
            .filter(item => item.category_id === cat.id)
            .map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: parseFloat(item.price),
              image: item.image_url,
              badges: [
                ...(item.is_best_seller ? ['best-seller' as const] : []),
                ...(item.is_spicy ? ['spicy' as const] : []),
                ...(item.is_new ? ['nouveau' as const] : [])
              ],
              options: item.extras ? Object.keys(item.extras) : []
            }));

          return {
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '🍔',
            items: categoryItems
          };
        });

        setCategories(menuCategories);
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return { categories, loading, error };
}