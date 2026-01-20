#!/usr/bin/env node
import { refreshMenuCache } from '../src/services/menuAggregator';

console.log('🔄 Starting menu scraper...\n');

refreshMenuCache()
  .then((items) => {
    console.log(`\n✅ Menu refresh complete! Cached ${items.length} items.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Menu refresh failed:', err);
    process.exit(1);
  });
