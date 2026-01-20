# Menu Price Aggregation System

This document explains how to run the menu aggregation system locally, where the cache lives, and how to add new branches or platforms.

## Overview

The menu aggregation system scrapes menu data from delivery platforms (Uber Eats, Deliveroo, Takeaway) and compares prices across different branches of Tasty Food restaurants in Liège.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Scrapers   │ ───> │  Aggregator  │ ───> │ Cache (JSON)│
│ (Playwright)│      │   Service    │      │    File     │
└─────────────┘      └──────────────┘      └─────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  Express API │
                     │  (port 3001) │
                     └──────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  React App   │
                     │  /menu page  │
                     └──────────────┘
```

## Running Locally

### 1. Start Both Servers (Recommended)

Start both the Vite dev server and the Express API server concurrently:

```bash
npm run dev:all
```

This will:
- Start Vite on `http://localhost:8080`
- Start the API on `http://localhost:3001`
- Automatically use cached menu data if available

Access the menu comparison page at: `http://localhost:8080/menu`

### 2. Start Servers Separately

If you prefer to run them separately:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend API
npm run dev:api
```

### 3. Refresh Menu Cache

To scrape fresh menu data from all platforms:

```bash
npm run refresh:menu
```

**Note**: This launches Playwright browsers and can take 2-5 minutes depending on network speed and platform responsiveness.

### 4. Debug Scraper

For verbose scraper debugging:

```bash
npm run menu:debug
```

## Cache Management

### Cache Location

The menu cache is stored in:
```
data/menu-cache.json
```

### Cache Structure

```json
{
  "timestamp": 1768923149330,
  "ttl": 43200000,
  "items": [
    {
      "id": "classic-burger",
      "name": "Classic Burger",
      "description": "...",
      "category": "Burgers",
      "tags": ["burger", "classic"],
      "platforms": [
        {
          "platform": "ubereats",
          "branch": "Saint-Gilles",
          "price": 8.50,
          "available": true,
          "url": "https://..."
        }
      ]
    }
  ]
}
```

### Cache TTL

- **Default**: 12 hours (43,200,000 ms)
- Configured in: `src/services/menuAggregator.ts`
- To change: modify `CACHE_TTL_MS` constant

### Force Refresh

Bypass the cache via API:

```bash
curl -X POST http://localhost:3001/api/menu/refresh
```

Or via frontend: Click the "Actualiser" button on `/menu` page.

## API Endpoints

### GET /api/menu

Get cached or fresh menu data:

```bash
curl http://localhost:3001/api/menu
```

Response:
```json
{
  "items": [...],
  "count": 5,
  "cached": true,
  "timestamp": 1768923149330
}
```

### GET /api/menu/status

Check cache status:

```bash
curl http://localhost:3001/api/menu/status
```

Response:
```json
{
  "cached": true,
  "itemCount": 5,
  "timestamp": 1768923149330,
  "age": 15,
  "ageFormatted": "15 minutes ago",
  "errors": []
}
```

### POST /api/menu/refresh

Manually refresh cache:

```bash
curl -X POST http://localhost:3001/api/menu/refresh
```

### GET /health

Health check endpoint:

```bash
curl http://localhost:3001/health
```

## Adding New Branches

### For Uber Eats

1. Open `src/types/menu-aggregation.ts`
2. Add branch to `UBEREATS_BRANCHES` array:

```typescript
export const UBEREATS_BRANCHES: BranchConfig[] = [
  {
    name: 'Saint-Gilles',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be/store/tasty-food-saint-gilles/...'
  },
  // Add new branch here:
  {
    name: 'NEW_BRANCH_NAME',
    platform: 'ubereats',
    url: 'https://www.ubereats.com/be/store/tasty-food-new-branch/...'
  }
];
```

3. Run `npm run refresh:menu` to fetch data for the new branch

### For Deliveroo

1. Open `src/types/menu-aggregation.ts`
2. Add branch to `DELIVEROO_BRANCHES` array:

```typescript
export const DELIVEROO_BRANCHES: BranchConfig[] = [
  {
    name: 'Angleur',
    platform: 'deliveroo',
    url: 'https://deliveroo.be/fr/menu/liege/liege-angleur/tasty-food-angleur'
  },
  // Add new branch here:
  {
    name: 'NEW_BRANCH_NAME',
    platform: 'deliveroo',
    url: 'https://deliveroo.be/fr/menu/...'
  }
];
```

3. Run `npm run refresh:menu`

**Note**: The Deliveroo scraper is currently a placeholder. You'll need to implement `src/services/scrapers/deliveroo.ts` following the same pattern as `ubereats.ts`.

## Adding a New Platform

To add a new delivery platform (e.g., Takeaway.com):

### 1. Update Type Definitions

In `src/types/menu-aggregation.ts`:

```typescript
// Add platform name to union type
export type PlatformName = 'ubereats' | 'deliveroo' | 'takeaway'; // Add 'takeaway'

// Add branch configurations
export const TAKEAWAY_BRANCHES: BranchConfig[] = [
  {
    name: 'Liège Centre',
    platform: 'takeaway',
    url: 'https://www.takeaway.com/...'
  }
];
```

### 2. Create Scraper

Create `src/services/scrapers/takeaway.ts`:

```typescript
import { chromium } from 'playwright';
import type { MenuItem, BranchConfig, ScraperResult } from '@/types/menu-aggregation';

export async function fetchTakeawayMenuFor(config: BranchConfig): Promise<ScraperResult> {
  const items: MenuItem[] = [];
  const errors: string[] = [];
  
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(config.url, { waitUntil: 'networkidle' });
    
    // Add platform-specific scraping logic here
    // See ubereats.ts for reference
    
    await browser.close();
  } catch (err: any) {
    errors.push(`Takeaway scraping failed: ${err.message}`);
  }
  
  return { items, errors: errors.length > 0 ? errors : undefined };
}

export async function fetchTakeawayMenu(): Promise<ScraperResult> {
  const allItems: MenuItem[] = [];
  const allErrors: string[] = [];
  
  for (const branch of TAKEAWAY_BRANCHES) {
    const result = await fetchTakeawayMenuFor(branch);
    // Merge results...
  }
  
  return { items: allItems, errors: allErrors };
}
```

### 3. Integrate into Aggregator

In `src/services/menuAggregator.ts`:

```typescript
import { fetchTakeawayMenu } from './scrapers/takeaway.js';

export async function refreshMenuCache(): Promise<MenuItem[]> {
  const allItems: MenuItem[] = [];
  
  // Existing scrapers...
  const uberEatsResult = await fetchUberEatsMenu();
  
  // Add new scraper
  const takeawayResult = await fetchTakeawayMenu();
  allItems.push(...takeawayResult.items);
  
  // Merge and deduplicate...
  return mergeMenuItems(allItems);
}
```

### 4. Update Frontend

In `src/pages/Menu.tsx`, the platform filter and colors will automatically include the new platform if you add it to the `platformColors` object:

```typescript
const platformColors: Record<PlatformName, string> = {
  ubereats: 'bg-[#06C167]',
  deliveroo: 'bg-[#00CCBC]',
  takeaway: 'bg-[#FF8000]' // Add platform color
};
```

### 5. Test

```bash
npm run refresh:menu
npm run dev:all
# Visit http://localhost:8080/menu
```

## Troubleshooting

### Scraper Fails

**Symptom**: `page.goto: Target page, context or browser has been closed`

**Cause**: Platform may have anti-bot protection or CSS selectors have changed.

**Solution**:
1. Run with `headless: false` to see what's happening:
   ```typescript
   const browser = await chromium.launch({ headless: false });
   ```
2. Check if selectors in scraper match current HTML
3. Add delays: `await page.waitForTimeout(3000);`
4. Use different user agent or browser context options

### API Returns Empty Data

**Symptom**: API returns `{"items": [], "count": 0}`

**Cause**: Cache file doesn't exist or is corrupted.

**Solution**:
```bash
# Check cache exists
ls -lh data/menu-cache.json

# Regenerate cache
npm run refresh:menu
```

### Frontend Shows Loading Forever

**Symptom**: Menu page stuck on loading state.

**Cause**: API server not running or CORS issue.

**Solution**:
```bash
# Check API is running
curl http://localhost:3001/health

# Check CORS headers
curl -H "Origin: http://localhost:8080" -I http://localhost:3001/api/menu

# Restart servers
npm run dev:all
```

### Cache Not Refreshing

**Symptom**: Old prices showing despite running refresh.

**Cause**: Browser or React Query cache.

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R` (Linux/Windows) or `Cmd+Shift+R` (Mac)
2. Clear React Query cache: Click "Actualiser" button on frontend
3. Delete cache file and regenerate:
   ```bash
   rm data/menu-cache.json
   npm run refresh:menu
   ```

## Development Tips

### Mock Data for Testing

To test the frontend without scraping:

1. Create or edit `data/menu-cache.json` with sample data
2. Update timestamp to recent value:
   ```bash
   node -e "console.log(Date.now())"
   # Copy output to timestamp field in cache
   ```
3. Start servers: `npm run dev:all`

### Debugging Scrapers

Use Playwright Inspector:

```typescript
// Add to scraper code:
await page.pause(); // Opens inspector
```

Then run:
```bash
PWDEBUG=1 npm run refresh:menu
```

### Monitoring Scraper Performance

Add timing logs:

```typescript
console.time('Scrape Uber Eats');
const result = await fetchUberEatsMenu();
console.timeEnd('Scrape Uber Eats');
```

## File Structure

```
src/
├── types/
│   └── menu-aggregation.ts    # Types and branch configs
├── services/
│   ├── menuAggregator.ts      # Main aggregation logic
│   └── scrapers/
│       ├── ubereats.ts        # Uber Eats scraper
│       └── deliveroo.ts       # Deliveroo scraper (placeholder)
├── hooks/
│   └── useMenuApi.ts          # React Query hooks
└── pages/
    └── Menu.tsx               # Price comparison UI

server/
└── index.ts                   # Express API server

scripts/
└── refresh-menu.ts            # CLI scraper tool

data/
└── menu-cache.json            # Cache file (generated)
```

## Environment Variables

Create `.env.local` to override defaults:

```env
# API server port (default: 3001)
API_PORT=3001

# Frontend API URL (default: http://localhost:3001)
VITE_API_URL=http://localhost:3001
```

## Production Deployment

For production:

1. **Schedule scraper**: Set up cron job or scheduled task:
   ```bash
   # Run every 6 hours
   0 */6 * * * cd /path/to/app && npm run refresh:menu
   ```

2. **Serve API**: Use PM2 or systemd:
   ```bash
   pm2 start npm --name "menu-api" -- run dev:api
   ```

3. **Build frontend**: 
   ```bash
   npm run build
   # Serve dist/ folder with nginx/caddy
   ```

4. **Monitoring**: Add error tracking (Sentry) and uptime monitoring.

## License

Part of Tasty Food website. All rights reserved.
