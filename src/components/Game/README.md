# 🎮 Tasty Food Arcade Game

> **Falling Food Catcher** - A hyper-casual browser arcade game with monthly leaderboards and prizes!

---

## 🎯 Game Overview

**Catch the good food, avoid the bad!** Control a branded food tray and collect delicious Tasty Food items while avoiding burnt food and trash. The top 3 players each month win a **FREE MENU** 🏆

### 🎪 Game Type
- **Genre:** Falling Objects Catcher / Avoid & Collect
- **Platform:** Browser (Desktop + Mobile)
- **Duration:** 30-90 seconds per session
- **Difficulty:** Progressive (speed increases over time)

---

## ✨ Features

### 🎮 Core Gameplay
- **Horizontal Movement:** Arrow keys (desktop) or touch buttons (mobile)
- **Good Objects:** 🍔 Burgers, 🍟 Fries, 🥤 Drinks, 🌯 Wraps, 🍗 Chicken (+points)
- **Bad Objects:** 🔥 Burnt Food, 🗑️ Trash, 🦠 Bad Food, 💀 Poison (-lives)
- **Lives System:** 3 lives to start (lose all = game over)
- **Progressive Difficulty:** Speed & spawn rate increase every ~15 seconds
- **Score Multipliers:** Consecutive catches trigger combo bonuses

### 🏆 Leaderboard & Prizes
- **Monthly Rankings:** Top 3 players displayed on homepage
- **Prize Distribution:** Free menu for winners at month's end
- **Anti-Cheat:** Score validation, session tracking, max score caps

### 📱 Responsive Design
- **Mobile-First:** Touch controls with haptic feedback simulation
- **Desktop Support:** Keyboard controls (Arrow keys or A/D)
- **Canvas Rendering:** 60 FPS smooth gameplay with Canvas2D API

---

## 🚀 Quick Start

### 1️⃣ Setup Supabase Database

Run the migration to create the `game_scores` table:

```bash
# Option A: Using Supabase CLI
cd /home/ous/projects/lovable-tastyfood
supabase db push

# Option B: Manual SQL execution
# Copy SQL from: supabase/migrations/20260129_create_game_scores.sql
# Paste into Supabase Dashboard → SQL Editor → Run
```

### 2️⃣ Verify Installation

The game is already integrated into the Home page. Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:8080` and scroll to the **"Play & Win"** section 🎮

---

## 🎨 Visual Preview

```
┌─────────────────────────────────────┐
│  🎮  TASTY FOOD ARCADE CHALLENGE   │
├─────────────────────────────────────┤
│                                     │
│    🍔  🍟     🔥         🌯        │
│         ↓      ↓          ↓        │
│           🥤       🗑️             │
│              ↓       ↓             │
│                                     │
│                                     │
│            [ 🏀 TRAY ]             │
│                                     │
├─────────────────────────────────────┤
│  ❤️❤️❤️  Lives: 3   Score: 1,250  │
│  ⬅️  [   MOVE   ]  ➡️              │
└─────────────────────────────────────┘
```

---

## 📂 File Structure

```
src/components/Game/
├── FallingFoodGame.tsx      # Main game component with Canvas2D
├── MonthlyLeaderboard.tsx   # Top 3 scores display
├── types.ts                 # TypeScript interfaces
├── index.ts                 # Barrel exports
└── README.md                # This file

src/lib/
└── gameScores.ts            # Supabase integration

supabase/migrations/
└── 20260129_create_game_scores.sql  # Database schema
```

---

## 🎮 Game Controls

### 🖥️ Desktop
| Key | Action |
|-----|--------|
| `←` / `A` | Move Left |
| `→` / `D` | Move Right |
| `Space` | Pause Game |
| `Enter` | Start/Restart |

### 📱 Mobile
- **Left Button:** Move tray left
- **Right Button:** Move tray right
- **Drag:** Swipe left/right to move tray
- **Tap "Start":** Begin game

---

## 🏆 Scoring System

### Good Objects (Collect These!)
| Item | Emoji | Points |
|------|-------|--------|
| Smash Burger | 🍔 | **+100** |
| Crousty Chicken | 🍗 | **+120** |
| Wrap | 🌯 | **+80** |
| Fries | 🍟 | **+50** |
| Drink | 🥤 | **+30** |
| Juice | 🧃 | **+40** |

### Bad Objects (Avoid These!)
| Item | Emoji | Penalty |
|------|-------|---------|
| Burnt Food | 🔥 | **-50 points** |
| Trash | 🗑️ | **-1 life** |
| Bad Food | 🦠 | **-75 points** |
| Poison | 💀 | **-1 life** |

### 🎯 Combo System
- **2+ catches in a row:** +10% bonus
- **5+ catches:** +25% bonus
- **10+ catches:** +50% bonus ("ON FIRE! 🔥")

---

## 🔧 Technical Details

### Architecture
- **Rendering:** HTML5 Canvas2D (60 FPS)
- **Physics:** Delta-time based movement
- **Collision:** AABB (Axis-Aligned Bounding Box)
- **State Management:** React hooks (useState, useEffect, useRef)
- **Backend:** Supabase for score persistence

### Performance
- **Target FPS:** 60
- **Max Objects:** 15 simultaneous
- **Canvas Size:** 400x600px (scales responsively)
- **Memory:** Efficient object pooling

### Anti-Cheat Measures
1. **Score Cap:** Max 10,000 points per session
2. **Session Tracking:** One score per browser session (debounced)
3. **Server Validation:** Reject impossible scores
4. **Rate Limiting:** Max 5 submissions per minute

---

## 🎨 Customization

### Change Game Difficulty

Edit `src/components/Game/types.ts`:

```typescript
export const DEFAULT_CONFIG: GameConfig = {
  playerSpeed: 8,              // Tray movement speed (pixels/frame)
  initialObjectSpeed: 2,        // Starting fall speed
  spawnInterval: 1200,          // Time between spawns (ms)
  startingLives: 3,             // Lives at game start
  speedIncreaseRate: 0.3,       // Speed boost per level
};
```

### Add New Food Items

Edit `GOOD_OBJECTS` or `BAD_OBJECTS` in `types.ts`:

```typescript
export const GOOD_OBJECTS = [
  { emoji: '🍕', name: 'Pizza', points: 90 },  // Add new item
  // ... existing items
] as const;
```

### Modify Canvas Size

Edit `FallingFoodGame.tsx`:

```typescript
const [config] = useState<GameConfig>({
  ...DEFAULT_CONFIG,
  canvasWidth: 500,   // Change width
  canvasHeight: 700,  // Change height
});
```

---

## 📊 Database Schema

```sql
CREATE TABLE game_scores (
  id UUID PRIMARY KEY,
  nickname TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 10000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  month_key TEXT NOT NULL,           -- Format: "2026-01"
  session_id TEXT,
  
  INDEX idx_month_score (month_key, score DESC)
);
```

### Query Examples

```typescript
// Get current month's top 3
const scores = await getMonthlyTopScores(3);

// Submit a new score
await submitScore({
  score: 1250,
  nickname: "PlayerOne"
});

// Get player's rank
const rank = await getPlayerRank(1250);
```

---

## 🐛 Troubleshooting

### Game not rendering?
**Check:** Canvas element exists in DOM
```bash
# Inspect element in browser DevTools
# Look for: <canvas id="game-canvas"></canvas>
```

### Scores not saving?
**Check:** Supabase connection and table exists
```bash
# Test connection
curl -X GET "YOUR_SUPABASE_URL/rest/v1/game_scores" \
  -H "apikey: YOUR_API_KEY"
```

### Low FPS / Laggy?
**Solutions:**
- Reduce `maxObjects` in config (default: 15)
- Clear browser cache
- Check CPU usage (close other apps)

### Touch controls not working?
**Check:** Mobile viewport meta tag in `index.html`
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Hostinger
```bash
export FTP_PASSWORD="your-password"
npm run deploy:hostinger
```

### Environment Variables
No additional env vars needed! The game uses existing Supabase config from `src/lib/supabase.ts`.

---

## 🎉 Monthly Prize System

### How It Works
1. **Automatic Tracking:** Scores stored with `month_key` (e.g., "2026-01")
2. **Leaderboard Display:** Top 3 updated in real-time on homepage
3. **Winner Notification:** At month's end, contact top 3 via email/nickname
4. **Prize Claim:** Winners redeem free menu at any Tasty Food location

### Prize Distribution Checklist
- [ ] Query top 3 scores: `SELECT * FROM game_scores WHERE month_key = '2026-01' ORDER BY score DESC LIMIT 3`
- [ ] Contact winners via nickname/email
- [ ] Generate voucher codes or in-store redemption instructions
- [ ] Archive previous month's leaderboard
- [ ] Announce new month's competition

---

## 📈 Analytics & Metrics

Track game engagement:

```sql
-- Total games played this month
SELECT COUNT(*) FROM game_scores WHERE month_key = '2026-01';

-- Average score
SELECT AVG(score) FROM game_scores WHERE month_key = '2026-01';

-- Top performer
SELECT nickname, MAX(score) FROM game_scores WHERE month_key = '2026-01';

-- Daily game sessions
SELECT DATE(created_at), COUNT(*) 
FROM game_scores 
WHERE month_key = '2026-01'
GROUP BY DATE(created_at);
```

---

## 🎨 Branding Guidelines

### Color Palette
- **Primary:** Gold gradient (`#FFD700` → `#FFA500`)
- **Background:** Dark theme (`#1a1a1a`)
- **Accent:** Red CTA (`#ef4444`)
- **Text:** White (`#ffffff`)

### Typography
- **Headings:** Bebas Neue (display font)
- **Body:** Inter (sans-serif)
- **Game UI:** Monospace for scores

---

## 🤝 Contributing

Want to improve the game? Here's how:

1. **Fork the repo:** `git clone https://github.com/MarwaneBoustaniHelmo/tasty-food-hub`
2. **Create branch:** `git checkout -b feature/new-game-mode`
3. **Make changes:** Add features, fix bugs, improve UX
4. **Test locally:** `npm run dev` and play-test thoroughly
5. **Submit PR:** Push and create pull request with description

---

## 📝 License

This game is part of the Tasty Food website project. All rights reserved.

---

## 🆘 Support

Need help? Contact the development team:

- **Issues:** GitHub Issues tab
- **Email:** support@tastyfood.me
- **Discord:** [Join our community](#)

---

## 🎮 Have Fun!

**Pro Tips:**
- 🎯 Focus on high-value items (burgers, chicken)
- ⚡ Build combos for bonus multipliers
- 🧠 Memorize falling patterns
- 🏃 Position tray early (predict object paths)
- 💎 Prioritize staying alive over max score

**Good luck and enjoy!** 🍔🎉

---

Made with ❤️ by the Tasty Food team | January 2026
