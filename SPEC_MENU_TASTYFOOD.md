# 🧩 TastyFood – "Menu" Tab Specification (Deliveroo / Uber Eats / Takeaway Aggregation)

## 🎯 Goal

Implement a new **"Menu"** tab/page in the TastyFood website that:

- Aggregates menu items available for **Tasty Food** on **Deliveroo, Uber Eats and (optionally) Takeaway/Just Eat**, for the different locations (Angleur, Saint‑Gilles, Wandre, Seraing, etc.).
- Shows, for each dish, the **price per platform**, plus:  
  - **delivery fee** (when available)  
  - **minimum order amount** (when available)
- Allows the user to **compare platforms** and choose the most advantageous option (dish price + delivery).

You will implement everything in VS Code (Node/TS/React/Next/etc.), no external AI tooling.

***

## 1. Data sources (URLs to use)

You must pull menu and pricing data from the official Tasty Food pages on delivery platforms.

### 1.1 Uber Eats – Tasty Food

Use these URLs as primary sources:

- **Tasty Food Saint‑Gilles (Liège)** – menu, prices, delivery info:  
  - `https://www.ubereats.com/be/store/tasty-food-saint-gilles/zWuPWDrJX1WeeHcEdno3FQ`
- **Tasty Food Angleur** – menu & prices:  
  - `https://www.ubereats.com/be-en/store/tasty-food-angleur/uObTfxymWn2x53kZNuo8NQ`
- **Tasty Food Wandre** – menu & prices:  
  - `https://www.ubereats.com/be/store/tasty-food-wandre/9BB6rSrVVKS9UR_2fyAYoQ`
- **Tasty Food Seraing / Jemeppe** – menu & prices:  
  - `https://www.ubereats.com/be/store/tasty-food-seraing/NpA7eB6mS6mam_TwsTcigg`

From each page, extract:  
- Menu sections / categories (e.g. "Menus burgers", "Menus sandwiches", "Burgers", "Sandwiches", "Fajitas", "Tex‑Mex", "Fries", "Drinks").
- Item: name, description, price.
- Delivery fee and minimum order, if displayed ("Delivery fee 4.99 €", "Minimum order 15 €", etc.).

### 1.2 Deliveroo – Tasty Food

Primary Deliveroo URLs:

- **Tasty Food Angleur – full menu**:  
  - `https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur`
- **Tasty Food Seraing / Jemeppe**:  
  - `https://deliveroo.be/fr/menu/Liege/jemeppe-sur-meuse/tasty-food-seraing`

Extract:  
- Menu structure: sections, categories, items.
- Prices for each item.
- Delivery info if visible: delivery fee, minimum order, promos.

### 1.3 Takeaway / Just Eat and Tasty Food website

- Try to locate the Takeaway/Just Eat pages for Tasty Food (Liège / Angleur / Seraing / Wandre).  
- Optional cross‑check: Tasty Food Angleur site:  
  - `https://www.tastyfoodangleur.be`

If Takeaway is protected (captchas, heavy anti‑scraping):

- Document this limitation in comments / README.  
- Proceed with **Deliveroo + Uber Eats** as the primary sources.

***

## 2. Backend / service architecture

Create a backend/service layer in your project (Node / Next.js API routes / Express / NestJS, etc.) dedicated to menu aggregation.

### 2.1 Aggregator service

Implement a `menuAggregator` service that:

1. Fetches HTML (or JSON, if exposed) from the URLs listed above.  
2. Parses data using a tool like `cheerio`, `playwright` (script mode) or similar.  
3. Builds a **unified data model** (see 2.2).  
4. Stores the result in a **cache** (JSON file, Redis, or KV storage) with a configurable TTL (e.g. 12–24h).

### 2.2 Unified data model (TypeScript example)

```ts
export type PlatformName = 'ubereats' | 'deliveroo' | 'takeaway';

export interface PlatformPriceInfo {
  platform: PlatformName;
  branch: string;              // "Angleur", "Saint-Gilles", "Wandre", "Seraing", ...
  url: string;                 // Source URL on the platform
  price: number;               // Item price (tax included)
  currency: string;            // e.g. "EUR"
  deliveryFee?: number | null; // Delivery fee if known
  minOrder?: number | null;    // Min order amount if known
  promoLabel?: string | null;  // e.g. "Free delivery over 20 €"
}

export interface MenuItem {
  id: string;                      // Internal stable ID (slug + hash)
  name: string;                    // Unified product name
  description?: string;
  category: string;                // e.g. "Menus burgers", "Sandwiches", ...
  tags: string[];                  // e.g. ["burger","menu","cheese"]
  imageUrl?: string | null;
  platforms: PlatformPriceInfo[];  // One entry per platform/branch
}
```

### 2.3 Cross‑platform item matching

In the aggregator logic:

- Try to merge items that represent the **same dish** across platforms using:  
  - Normalized name (lowercase, accents removed).  
  - Category.  
  - Price proximity (e.g. difference < 1 €).  
- If you're not confident it's the same dish → keep them as separate `MenuItem` entries.

***

## 3. Frontend – "Menu" tab implementation

### 3.1 Route and navigation

- Add a new navigation entry: **"Menu"**.  
- Create a route/page, e.g. `/menu` (or `/tasty-menu`).  
- This page should consume the aggregated JSON (`MenuItem[]`) from your API/service.

### 3.2 UI / UX requirements

On the `/menu` page:

**Filters:**

- Platform filter: `All | Uber Eats | Deliveroo | Takeaway`.  
- Branch filter: `All | Angleur | Saint‑Gilles | Wandre | Seraing`.  
- Category filter: `Menus burgers`, `Burgers`, `Sandwiches`, `Fajitas`, `Tex‑Mex`, `Fries`, `Drinks`, etc.
- Free‑text search by item name.

**Item card / row:**

For each `MenuItem`:

- Show:  
  - Name  
  - Category  
  - Short description (if available)
- Show a comparison table of platform prices:

  | Platform | Branch     | Price | Delivery | Min order | Link          |
  |----------|-----------|-------|----------|-----------|---------------|

  Use `platforms: PlatformPriceInfo[]` data to fill this table:  
  - Platform: Uber Eats / Deliveroo / Takeaway.  
  - Branch: Angleur / Saint‑Gilles / Wandre / Seraing.
  - Price: `price` + `currency`.
  - Delivery: `deliveryFee` if available.
  - Min order: `minOrder` if available.
  - Link: "Order on X" button linking to the platform URL (open in new tab).

**Price comparison logic:**

- When a dish exists on multiple platforms, compute:  
  - The **cheapest platform** (consider at least the dish price; optionally dish price + delivery).  
- Highlight that row with a badge like **"Best price"**.

### 3.3 UI states

- **Loading state**: skeletons or spinner while menu data is being fetched.  
- **Error state**: per‑platform error messages like "Uber Eats data currently unavailable", while still showing other platforms.  
- **Empty state**: "No dishes found for these filters".

***

## 4. Data fetching & refresh logic

### 4.1 Scraping / fetching functions

Implement dedicated fetchers (organize them under `src/services/scrapers/` or similar):

```ts
export async function fetchUberEatsMenuFor(branchUrl: string): Promise<MenuItem[]> {
  // fetch branchUrl HTML/JSON
  // parse categories, items, prices, delivery info
}

export async function fetchDeliverooMenuFor(branchUrl: string): Promise<MenuItem[]> {
  // same logic for Deliveroo
}

// Optionally:
export async function fetchTakeawayMenuFor(branchUrl: string): Promise<MenuItem[]> {
  // handle limitations; document if not possible
}
```

Parsing steps:

- Use `cheerio` or similar to:  
  - Extract category titles (h2/h3 or structured JSON if available).
  - Extract each menu item (name, description, price).
  - Extract delivery fee and min order if shown in header/sidebar areas.

### 4.2 Caching

- Aggregate all branches/platforms into a single `MenuItem[]` array.  
- Store in a cache (e.g. `data/menu-cache.json`, Redis, KV store) with a TTL (e.g. 12–24h).  
- API endpoint (example if using Next.js):

```ts
// pages/api/menu.ts (or src/app/api/menu/route.ts)
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAggregatedMenu } from '@/services/menuAggregator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const data = await getAggregatedMenu();
  res.status(200).json(data);
}
```

### 4.3 Refresh triggers

- Scheduled refresh (outside VS Code, via hosting platform cron or external scheduler):  
  - e.g. `GET /api/menu/refresh` every 12–24h.  
- Optional: admin‑only endpoint or script:

```bash
# Example script from VS Code terminal
npm run refresh:menu
```

Which calls the aggregator and updates the cache.

***

## 5. Constraints & best practices

- **Do not scrape on every request.** Always go through the cached data.  
- Be resilient to failures: if a platform blocks or fails:  
  - Log the error.  
  - Keep serving last known data or show partial data for other platforms.  
- Keep the aggregator logic isolated:  
  - `src/services/menuAggregator.ts`  
  - `src/services/scrapers/ubereats.ts`  
  - `src/services/scrapers/deliveroo.ts`  
  - `src/services/scrapers/takeaway.ts` (if viable)  
- For development in VS Code:  
  - Add convenient npm scripts like `npm run menu:debug` to run only the scraping/aggregation.  
  - Use environment variables for URLs if needed.

***

## 6. Expected deliverables

By the end of implementation, you should have:

1. A fully working **`/menu`** page/tab in the TastyFood site.  
2. A backend/service that aggregates menu data from **Deliveroo + Uber Eats (+ Takeaway if possible)** into a unified `MenuItem[]` JSON.
3. A UI that:  
   - Shows dishes grouped by category.  
   - Displays **per‑platform prices**, **delivery fee**, and **minimum order** when available.
   - Highlights the best price among platforms for each dish.  
4. A small internal documentation file, e.g. `README_MENU.md`, explaining:  
   - How to run the aggregator locally (npm commands).  
   - Where the cache lives.  
   - How to add new branches or a new platform.

***

## Implementation Status

- [ ] Backend aggregator service setup
- [ ] Uber Eats scraper implementation
- [ ] Deliveroo scraper implementation
- [ ] Takeaway scraper (optional)
- [ ] Unified data model & caching
- [ ] Frontend /menu page with filters
- [ ] Price comparison UI
- [ ] Documentation (README_MENU.md)

You can now implement this specification step‑by‑step in VS Code.
