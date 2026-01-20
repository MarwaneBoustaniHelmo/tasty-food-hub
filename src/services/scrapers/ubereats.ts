import { chromium } from 'playwright';
import type { MenuItem, PlatformPriceInfo, ScraperResult, BranchConfig } from '@/types/menu-aggregation';

/**
 * Utility to create a stable ID from item name and category
 */
function createItemId(name: string, category: string): string {
  const normalized = `${category}-${name}`.toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  return normalized;
}

/**
 * Extract tags from item name and description
 */
function extractTags(name: string, description?: string): string[] {
  const text = `${name} ${description || ''}`.toLowerCase();
  const tags: string[] = [];

  const tagPatterns = {
    burger: /burger|smash/i,
    menu: /menu/i,
    cheese: /cheese|cheddar|fromage/i,
    spicy: /spicy|piquant|jalape/i,
    chicken: /chicken|poulet/i,
    fries: /frites|fries/i,
    drink: /boisson|drink|coca|fanta|sprite/i,
    dessert: /dessert|tiramisu|cookie|brownie/i,
    sauce: /sauce|mayo|ketchup|bbq/i,
    tacos: /tacos|fajitas/i
  };

  for (const [tag, pattern] of Object.entries(tagPatterns)) {
    if (pattern.test(text)) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Fetch and parse Uber Eats menu for a specific branch
 */
export async function fetchUberEatsMenuFor(config: BranchConfig): Promise<ScraperResult> {
  const errors: string[] = [];
  const items: MenuItem[] = [];
  let deliveryFee: number | null = null;
  let minOrder: number | null = null;

  try {
    console.log(`Fetching Uber Eats menu for ${config.name}: ${config.url}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Navigate and wait for content
    await page.goto(config.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000); // Allow dynamic content to load

    // Extract delivery info from header/sidebar
    try {
      const deliveryText = await page.textContent('[data-testid="store-info"]');
      if (deliveryText) {
        const feeMatch = deliveryText.match(/(\d+[.,]\d+)\s*€/);
        if (feeMatch) {
          deliveryFee = parseFloat(feeMatch[1].replace(',', '.'));
        }
        const minMatch = deliveryText.match(/minimum.*?(\d+[.,]\d+)\s*€/i);
        if (minMatch) {
          minOrder = parseFloat(minMatch[1].replace(',', '.'));
        }
      }
    } catch (err) {
      console.warn('Could not extract delivery info:', err);
    }

    // Extract menu sections and items
    const sections = await page.$$('[data-testid^="store-menu-category-"]');
    
    for (const section of sections) {
      try {
        // Extract category name
        const categoryElement = await section.$('h2, h3');
        const categoryName = categoryElement 
          ? await categoryElement.textContent() 
          : 'Unknown Category';

        // Extract items in this category
        const itemElements = await section.$$('[data-testid^="menu-item-"]');

        for (const itemEl of itemElements) {
          try {
            const nameEl = await itemEl.$('[data-testid="rich-text"]');
            const priceEl = await itemEl.$('[data-testid="price"]');
            const descEl = await itemEl.$('[data-testid="item-description"]');

            const name = nameEl ? (await nameEl.textContent())?.trim() : null;
            const priceText = priceEl ? (await priceEl.textContent())?.trim() : null;
            const description = descEl ? (await descEl.textContent())?.trim() : undefined;

            if (!name || !priceText) continue;

            // Parse price (format: "€ 9,90" or "9.90 €")
            const priceMatch = priceText.match(/(\d+[.,]\d+)/);
            if (!priceMatch) continue;

            const price = parseFloat(priceMatch[1].replace(',', '.'));
            const itemId = createItemId(name, categoryName || 'unknown');
            const tags = extractTags(name, description);

            const platformInfo: PlatformPriceInfo = {
              platform: 'ubereats',
              branch: config.name,
              url: config.url,
              price,
              currency: 'EUR',
              deliveryFee,
              minOrder
            };

            // Check if item already exists (across categories)
            const existingItem = items.find(item => item.id === itemId);
            if (existingItem) {
              existingItem.platforms.push(platformInfo);
            } else {
              items.push({
                id: itemId,
                name,
                description,
                category: categoryName || 'Unknown',
                tags,
                imageUrl: null,
                platforms: [platformInfo]
              });
            }
          } catch (itemErr: any) {
            console.error('Error parsing item:', itemErr.message);
          }
        }
      } catch (sectionErr: any) {
        errors.push(`Section parse error: ${sectionErr.message}`);
      }
    }

    await browser.close();

    console.log(`✓ Fetched ${items.length} items from Uber Eats ${config.name}`);

  } catch (err: any) {
    errors.push(`Uber Eats scraping failed for ${config.name}: ${err.message}`);
    console.error(errors[errors.length - 1]);
  }

  return { items, deliveryFee, minOrder, errors: errors.length > 0 ? errors : undefined };
}

/**
 * Fetch all Uber Eats branches and merge results
 */
export async function fetchAllUberEatsMenus(branches: BranchConfig[]): Promise<ScraperResult> {
  const allItems: MenuItem[] = [];
  const allErrors: string[] = [];

  for (const branch of branches) {
    const result = await fetchUberEatsMenuFor(branch);
    
    // Merge items
    for (const newItem of result.items) {
      const existingItem = allItems.find(item => item.id === newItem.id);
      if (existingItem) {
        // Merge platform info
        existingItem.platforms.push(...newItem.platforms);
      } else {
        allItems.push(newItem);
      }
    }

    if (result.errors) {
      allErrors.push(...result.errors);
    }
  }

  return {
    items: allItems,
    errors: allErrors.length > 0 ? allErrors : undefined
  };
}
