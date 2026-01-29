# Falling Food Arcade Game - Implementation Guide

## 📋 Overview

A browser-based arcade game integrated into the Tasty Food homepage where players catch falling food items for points. Monthly top 3 scores win free menus.

**Game Type:** Falling Objects Catcher (Avoid & Collect)  
**Technology:** React + TypeScript + Canvas2D + Supabase  
**Location:** Home page, between "Order Online" and "Menu Preview" sections

---

## 🎮 Game Mechanics

### Core Gameplay
- **Objective:** Catch good food items (🍔🍟🥤) while avoiding bad objects (🔥🗑️)
- **Controls:**
  - Desktop: Arrow keys (←→) or A/D keys
  - Mobile: Touch/drag on canvas OR on-screen buttons
- **Scoring:**
  - Good items: +30 to +120 points each
  - Bad items: -50 to -150 points + lose 1 life
- **Lives:** Start with 3 lives; game over at 0
- **Difficulty:** Increases every 500 points (faster speed, more frequent spawns)
- **Session Duration:** Typically 30-90 seconds

### Game Objects

#### Good Objects (70% spawn rate)
```typescript
🍔 Smash Burger    +100 pts
🍟 Crousty Fries   +50 pts
🥤 Drink           +30 pts
🌯 Wrap            +80 pts
🧃 Juice           +40 pts
🍗 Crousty Chicken +120 pts
```

#### Bad Objects (30% spawn rate)
```typescript
🔥 Burnt Food      -50 pts, -1 life
🗑️ Trash           -100 pts, -1 life
🦠 Bad Food        -75 pts, -1 life
💀 Poison          -150 pts, -1 life
```

---

## 🏗️ Architecture

### File Structure
```
src/
├── components/
│   └── Game/
│       ├── FallingFoodGame.tsx      # Main game component
│       ├── MonthlyLeaderboard.tsx   # Top 3 scores display
│       ├── types.ts                 # TypeScript interfaces
│       └── index.ts                 # Barrel exports
├── lib/
│   └── gameScores.ts                # Supabase integration
├── pages/
│   └── Home.tsx                     # Game integration
└── supabase/
    └── migrations/
        └── 20260129_create_game_scores.sql
```

### Technical Stack
- **Rendering:** HTML5 Canvas 2D API (60 FPS target)
- **Game Loop:** requestAnimationFrame with delta-time physics
- **Collision Detection:** AABB (Axis-Aligned Bounding Box)
- **State Management:** React useState + useRef for performance
- **Backend:** Supabase (PostgreSQL) with RLS policies
- **Styling:** Tailwind CSS + shadcn/ui components

---

## 💾 Database Schema

### Table: `game_scores`

```sql
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT,                          -- Player name (optional)
  score INTEGER NOT NULL,                 -- Final score
  created_at TIMESTAMPTZ DEFAULT NOW(),   -- Timestamp
  month_key TEXT NOT NULL,                -- YYYY-MM format
  session_id TEXT,                        -- Browser session ID
  
  -- Anti-cheat constraints
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 10000),
  CONSTRAINT valid_month_key CHECK (month_key ~ '^\d{4}-\d{2}$')
);

-- Indexes for performance
CREATE INDEX idx_game_scores_month_score ON game_scores(month_key, score DESC);
CREATE INDEX idx_game_scores_created ON game_scores(created_at DESC);
```

### Row Level Security (RLS)
- **Read:** Anyone can view scores
- **Insert:** Anyone can submit scores with validation (max 10,000 pts, current month only)
- **Update/Delete:** Disabled (no modifications allowed)

---

## 🔌 API Integration

### Supabase Functions

#### `submitScore(params)`
Submits a game score to the database.

```typescript
await submitScore({
  score: 1234,
  nickname: "Player1", // optional
  sessionId: "auto-generated" // optional
});
```

**Anti-Cheat Measures:**
- Score validation: 0 ≤ score ≤ 10,000
- Integer values only
- Auto-generated session ID (localStorage)
- Server-side month_key validation

#### `getMonthlyTopScores(limit)`
Fetches top N scores for current month.

```typescript
const topScores = await getMonthlyTopScores(3); // Top 3
```

#### `getPlayerRank(score)`
Calculates player's rank for current month.

```typescript
const rank = await getPlayerRank(1234); // Returns: 5
```

---

## 🎨 UI Components

### FallingFoodGame Component

**Props:** None (self-contained)

**States:**
- `gameState`: 'idle' | 'playing' | 'paused' | 'gameover'
- `stats`: score, lives, level, duration, etc.
- `nickname`: Player's chosen name for leaderboard

**Key Features:**
- Canvas rendering at 400x600px (responsive)
- Keyboard + touch input handling
- Real-time score/life updates
- Game over modal with save functionality
- Mobile on-screen directional buttons

### MonthlyLeaderboard Component

**Props:** None (auto-fetches data)

**Features:**
- Displays top 3 monthly scores
- Trophy icons (🏆 gold, 🥈 silver, 🥉 bronze)
- Auto-refresh every 30 seconds
- Prize information display
- Responsive design (stacks on mobile)

---

## 🚀 Deployment Checklist

### 1. Database Setup (Supabase)

```bash
# Run migration
npx supabase db push

# Or execute SQL manually in Supabase dashboard
# File: supabase/migrations/20260129_create_game_scores.sql
```

### 2. Verify Supabase Client

Ensure `src/lib/supabase.ts` exists and is configured:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

### 3. Environment Variables

Add to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Build and Test

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Test game at http://localhost:8080
# - Play a full game
# - Submit a score
# - Check leaderboard updates
# - Test on mobile (responsive design)

# Build for production
npm run build
```

### 5. Verify Game Integration

**On Home Page:**
- [ ] Game section appears between "Order Online" and "Menu Preview"
- [ ] Canvas renders at 400x600px with gold border
- [ ] Start/Restart buttons work
- [ ] Keyboard controls (←→ or A/D) work on desktop
- [ ] Touch controls work on mobile
- [ ] Score submission works (check Supabase dashboard)
- [ ] Leaderboard displays top 3 scores
- [ ] Responsive layout: game stacks on mobile, side-by-side on desktop

---

## 🧪 Testing Guide

### Manual Testing Scenarios

#### 1. Desktop Gameplay
```
1. Click "Start Game"
2. Use arrow keys to move left/right
3. Catch 10+ good food items
4. Intentionally catch a bad item (verify life loss)
5. Play until game over
6. Enter nickname and save score
7. Verify score appears in leaderboard
```

#### 2. Mobile Gameplay
```
1. Open on mobile device (or Chrome DevTools mobile view)
2. Start game
3. Test touch controls:
   - Drag on canvas
   - Tap left/right buttons
4. Complete game and save score
```

#### 3. Leaderboard
```
1. Submit 3+ scores with different values
2. Verify top 3 appear in correct order (highest first)
3. Check trophy icons (🏆 🥈 🥉)
4. Wait 30s and verify auto-refresh
```

#### 4. Anti-Cheat
```
1. Try submitting score > 10,000 (should fail)
2. Try submitting negative score (should fail)
3. Check Supabase logs for validation errors
```

### Performance Testing

```
1. Play game for 60+ seconds
2. Monitor FPS (should stay ~60 FPS)
3. Check memory usage (no leaks after multiple games)
4. Test with 15+ objects on screen simultaneously
```

---

## 🐛 Troubleshooting

### Game not appearing
```
Issue: Import errors or component not rendering
Fix:
  - Check console for errors
  - Verify imports in Home.tsx
  - Ensure all Game components exist
```

### Score submission fails
```
Issue: Supabase connection or RLS policy
Fix:
  - Check environment variables (VITE_SUPABASE_*)
  - Verify migration ran successfully
  - Check Supabase logs for errors
  - Ensure RLS policies allow inserts
```

### Canvas not rendering
```
Issue: Canvas context or ref issues
Fix:
  - Check browser console for errors
  - Verify canvasRef.current is not null
  - Test in different browser
```

### Poor performance
```
Issue: Low FPS or laggy gameplay
Fix:
  - Reduce maxObjects in DEFAULT_CONFIG
  - Check for memory leaks (unmount cleanup)
  - Verify requestAnimationFrame cleanup on unmount
```

---

## 🎯 Future Enhancements

### Planned Features
1. **Sound Effects:** Add audio for catches, misses, game over
2. **Power-Ups:** Speed boost, shield, magnet, slow-mo
3. **Combo System:** Consecutive catches multiply score
4. **Daily Challenges:** Special objectives for bonus points
5. **Achievements:** Badges for milestones (100 catches, 5000 pts, etc.)
6. **Difficulty Modes:** Easy / Normal / Hard presets
7. **Multiplayer:** Real-time 1v1 competition
8. **Mobile App:** Standalone PWA version

### Code Improvements
1. **Object Pooling:** Reuse GameObject instances for performance
2. **Sprite Sheets:** Replace emojis with custom graphics
3. **Web Workers:** Offload game logic for better FPS
4. **Analytics:** Track player behavior (avg score, play time, etc.)
5. **A/B Testing:** Test different difficulty curves

---

## 📚 Additional Resources

### Game Design References
- **Mechanics:** Inspired by Fruit Ninja, Doodle Jump, Flappy Bird
- **Difficulty Curve:** Gradual increase every 500 pts (0.3 speed + 0.9x spawn rate)
- **Mobile-First:** Touch controls prioritized over keyboard

### Code References
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **requestAnimationFrame:** https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **React Performance:** https://react.dev/learn/render-and-commit

### Business Rules
- **Prize Distribution:** Monthly top 3 win 1 free menu each
- **Contact Method:** Email via Supabase admin (check created_at + nickname)
- **Validity:** Prizes valid 30 days, any Tasty Food location

---

## 📞 Support

For questions or issues:
- **Technical:** Check Supabase logs + browser console
- **Game Balance:** Adjust values in `types.ts` (DEFAULT_CONFIG)
- **Business Rules:** Modify prize logic in MonthlyLeaderboard.tsx

**Author:** AI Game Design System  
**Date:** January 29, 2026  
**Version:** 1.0.0
