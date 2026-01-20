import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAggregatedMenu, refreshMenuCache } from '../src/services/menuAggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;
const CACHE_FILE = path.join(__dirname, '..', 'data', 'menu-cache.json');

app.use(cors());
app.use(express.json());

/**
 * GET /api/menu - Get cached menu data
 */
app.get('/api/menu', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const items = await getAggregatedMenu(forceRefresh);
    
    res.json({
      items,
      count: items.length,
      cached: !forceRefresh,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Error serving menu:', error);
    res.status(500).json({
      error: 'Failed to load menu data',
      message: error.message
    });
  }
});

/**
 * POST /api/menu/refresh - Manually refresh menu cache
 */
app.post('/api/menu/refresh', async (req, res) => {
  try {
    console.log('Manual refresh requested...');
    const items = await refreshMenuCache();
    
    res.json({
      success: true,
      items,
      count: items.length,
      timestamp: Date.now(),
      message: 'Menu cache refreshed successfully'
    });
  } catch (error: any) {
    console.error('Error refreshing menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh menu cache',
      message: error.message
    });
  }
});

/**
 * GET /api/menu/status - Get cache status
 */
app.get('/api/menu/status', (req, res) => {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return res.json({
        cached: false,
        message: 'No cache available'
      });
    }

    const stats = fs.statSync(CACHE_FILE);
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const age = Date.now() - data.timestamp;
    const ageMinutes = Math.round(age / 1000 / 60);

    res.json({
      cached: true,
      itemCount: data.items?.length || 0,
      timestamp: data.timestamp,
      age: ageMinutes,
      ageFormatted: `${ageMinutes} minutes ago`,
      errors: data.errors || []
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to read cache status',
      message: error.message
    });
  }
});

/**
 * GET / - API info and available endpoints
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Tasty Food Menu Aggregation API',
    version: '1.0.0',
    endpoints: {
      menu: {
        path: '/api/menu',
        method: 'GET',
        description: 'Get cached or fresh menu data from all platforms'
      },
      refresh: {
        path: '/api/menu/refresh',
        method: 'POST',
        description: 'Manually refresh the menu cache'
      },
      status: {
        path: '/api/menu/status',
        method: 'GET',
        description: 'Check cache status and age'
      },
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    },
    documentation: 'See README_MENU.md for full documentation'
  });
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`🚀 Menu API server running on http://localhost:${PORT}`);
  console.log(`📋 Menu endpoint: http://localhost:${PORT}/api/menu`);
  console.log(`🔄 Refresh endpoint: http://localhost:${PORT}/api/menu/refresh`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/api/menu/status`);
});
