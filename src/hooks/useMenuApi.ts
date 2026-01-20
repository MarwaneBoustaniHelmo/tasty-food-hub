import { useQuery } from '@tanstack/react-query';
import type { MenuItem } from '@/types/menu-aggregation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface MenuResponse {
  items: MenuItem[];
  count: number;
  cached: boolean;
  timestamp: number;
}

/**
 * Hook to fetch menu data from API
 */
export function useMenuData() {
  return useQuery<MenuItem[], Error>({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/menu`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu data');
      }
      const data: MenuResponse = await response.json();
      return data.items;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
}

/**
 * Hook to get cache status
 */
export function useMenuStatus() {
  return useQuery({
    queryKey: ['menu-status'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/menu/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu status');
      }
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });
}

/**
 * Manually refresh menu cache
 */
export async function refreshMenuData(): Promise<void> {
  const response = await fetch(`${API_URL}/api/menu/refresh`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to refresh menu');
  }
}
