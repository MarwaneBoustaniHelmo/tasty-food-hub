# Animation System Setup

## Installation

```bash
npm install framer-motion
```

## Animation Rules & Guidelines

### **Durations**
- Fast interactions (hovers, micro): `0.3s`
- Normal reveals: `0.6s`
- Slow, dramatic entrances: `0.9s - 1.2s`

### **Easing**
- Default (smooth, Apple-like): `cubic-bezier(0.25, 0.1, 0.25, 1)`
- Snappy (buttons, quick UI): `cubic-bezier(0.4, 0, 0.2, 1)`

### **Movement Distances**
- Small reveals: `20px`
- Normal reveals: `40px`
- Large, dramatic: `60px`

### **Stagger Delays**
- Tight (fast lists): `0.05s`
- Normal (cards): `0.1s`
- Relaxed (sections): `0.15s`

### **Intersection Thresholds**
- Immediate trigger: `0` (as soon as visible)
- Early trigger: `0.1` (10% visible)
- Normal trigger: `0.2` (20% visible) - **DEFAULT**
- Late trigger: `0.4` (40% visible)

### **Performance Rules**
✅ **Use**:
- `transform` (translate, scale, rotate)
- `opacity`
- GPU-accelerated properties

❌ **Avoid**:
- `width`, `height`, `top`, `left`
- Heavy filters on large elements
- Animating layout properties

### **Accessibility**
- Always respect `prefers-reduced-motion`
- Use `getSafeVariants()` helper for critical animations
- Ensure content is readable without animations

## Usage Examples

### Basic Reveal
```tsx
import { RevealOnScroll } from '@/components/animations';

<RevealOnScroll direction="up" delay={0.2}>
  <h1>My Content</h1>
</RevealOnScroll>
```

### Staggered Cards
```tsx
import { StaggerChildren, StaggerItem } from '@/components/animations';

<StaggerChildren staggerDelay={0.1}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card {...item} />
    </StaggerItem>
  ))}
</StaggerChildren>
```

### Parallax Background
```tsx
import { ParallaxSection } from '@/components/animations';

<ParallaxSection speed={0.5} scale>
  <img src="hero-bg.jpg" />
</ParallaxSection>
```

### Floating Decoration
```tsx
import { FloatingElement } from '@/components/animations';

<FloatingElement amplitude={30} duration={6}>
  <span className="text-6xl opacity-10">🍔</span>
</FloatingElement>
```

## Components Reference

### `<RevealOnScroll>`
Fade + slide content into view when scrolled.

**Props:**
- `direction`: `'up' | 'down' | 'left' | 'right' | 'none'` (default: `'up'`)
- `delay`: number (seconds)
- `duration`: number (default: `0.6`)
- `distance`: number (pixels, default: `40`)
- `once`: boolean (animate only once, default: `true`)
- `amount`: number (intersection threshold, default: `0.2`)

### `<StaggerChildren>` + `<StaggerItem>`
Container for staggered animations (cards, lists).

**StaggerChildren Props:**
- `staggerDelay`: number (default: `0.1`)
- `once`: boolean (default: `true`)

### `<ParallaxSection>`
Scroll-linked parallax effect (depth illusion).

**Props:**
- `speed`: number (multiplier, default: `0.5`)
- `direction`: `'up' | 'down'` (default: `'up'`)
- `scale`: boolean (add scale effect, default: `false`)

### `<FloatingElement>`
Gentle floating animation + scroll influence.

**Props:**
- `amplitude`: number (float distance, default: `20`)
- `duration`: number (cycle time, default: `4`)
- `scrollInfluence`: boolean (default: `true`)

### `<ScaleOnScroll>`
Scale element as it enters viewport.

**Props:**
- `scaleRange`: `[number, number]` (default: `[0.8, 1]`)

## Constants

Import from `@/lib/animations`:

```tsx
import { ANIMATION_CONFIG, MOTION_VARIANTS, getSafeVariants } from '@/lib/animations';
```

Use predefined variants:
```tsx
<motion.div variants={MOTION_VARIANTS.fadeUp} />
```
