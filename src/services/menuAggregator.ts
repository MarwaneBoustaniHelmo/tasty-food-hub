import { fetchUberEatsMenuFor } from './scrapers/ubereats.js';
import { UBEREATS_BRANCHES } from '../types/menu-aggregation.js';
import type { MenuItem, ScraperResult } from '../types/menu-aggregation.js';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'menu-cache.json');
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface CachedData {
  items: MenuItem[];
  timestamp: number;
  errors?: string[];
}

/**
 * Get aggregated menu from cache or fetch fresh
 */
export async function getAggregatedMenu(forceRefresh = false): Promise<MenuItem[]> {
  // Check cache
  if (!forceRefresh && fs.existsSync(CACHE_FILE)) {
    try {
      const cached: CachedData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      const age = Date.now() - cached.timestamp;
      
      if (age < CACHE_TTL_MS) {
        console.log(`Using cached menu (age: ${Math.round(age / 1000 / 60)} minutes)`);
        return cached.items;
      }
    } catch (err) {
      console.warn('Cache read error, fetching fresh data');
    }
  }

  // Fetch fresh data
  console.log('Fetching fresh menu data...');
  const items = await refreshMenuCache();
  return items;
}

/**
 * Refresh menu cache by scraping all platforms
 */
export async function refreshMenuCache(): Promise<MenuItem[]> {
  const allItems: MenuItem[] = [];
  const allErrors: string[] = [];

  // Fetch from Uber Eats
  console.log('Fetching from Uber Eats...');
  for (const branch of UBEREATS_BRANCHES) {
    try {
      const result = await fetchUberEatsMenuFor(branch);
      
      // Merge items
      for (const newItem of result.items) {
        const existingItem = allItems.find(item => item.id === newItem.id);
        if (existingItem) {
          existingItem.platforms.push(...newItem.platforms);
        } else {
          allItems.push(newItem);
        }
      }

      if (result.errors) {
        allErrors.push(...result.errors);
      }
    } catch (err: any) {
      allErrors.push(`Failed to fetch ${branch.name}: ${err.message}`);
    }
  }

  // TODO: Add Deliveroo and Takeaway scrapers

  // Save to cache
  const cacheData: CachedData = {
    items: allItems,
    timestamp: Date.now(),
    errors: allErrors.length > 0 ? allErrors : undefined
  };

  // Ensure data directory exists
  const dataDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
  console.log(`✓ Cached ${allItems.length} items`);

  if (allErrors.length > 0) {
    console.warn('Errors during scraping:', allErrors);
  }

  return allItems;
}

/**
 * Normalize item name for matching across platforms
 */
function normalizeItemName(name: string): string {
  return name.toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Merge items from different platforms if they match
 */
export function mergeMenuItems(items: MenuItem[]): MenuItem[] {
  const merged: MenuItem[] = [];

  for (const item of items) {
    const normalizedName = normalizeItemName(item.name);
    
    // Find potential match
    const match = merged.find(m => {
      const matchName = normalizeItemName(m.name);
      const nameMatch = matchName === normalizedName;
      const categoryMatch = m.category.toLowerCase() === item.category.toLowerCase();
      
      // Price proximity check (within 1€)
      const avgPrice1 = m.platforms.reduce((sum, p) => sum + p.price, 0) / m.platforms.length;
      const avgPrice2 = item.platforms.reduce((sum, p) => sum + p.price, 0) / item.platforms.length;
      const priceMatch = Math.abs(avgPrice1 - avgPrice2) < 1;

      return nameMatch && categoryMatch && priceMatch;
    });

    if (match) {
      // Merge platform info
      match.platforms.push(...item.platforms);
    } else {
      merged.push(item);
    }
  }

  return merged;
}
