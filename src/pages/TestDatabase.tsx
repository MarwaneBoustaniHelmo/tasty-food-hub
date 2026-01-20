import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  name_en: string | null;
  name_nl: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  is_best_seller: boolean;
}

export default function TestDatabase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: cats, error: catsError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order');

        if (catsError) throw catsError;
        setCategories(cats || []);

        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, price, is_best_seller')
          .eq('is_available', true)
          .order('sort_order');

        if (itemsError) throw itemsError;
        setMenuItems(items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading database test...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Test</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Categories ({categories.length})</h2>
        <div className="grid gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="p-4 border rounded-lg">
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-gray-600">EN: {cat.name_en} | NL: {cat.name_nl}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Menu Items ({menuItems.length})</h2>
        <div className="grid gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.is_best_seller && <span className="text-xs text-gold">⭐ Best Seller</span>}
              </div>
              <p className="text-lg font-bold">€{item.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}