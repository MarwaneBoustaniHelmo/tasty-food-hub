# Scroll Animation Implementation Guide

## ✅ COMPLETED COMPONENTS

### 1. **Animation Utilities** (`src/components/animations/`)
- `RevealOnScroll.tsx` - Fade + slide reveals
- `ParallaxSection.tsx` - Scroll-linked parallax & floating elements
- `index.ts` - Central export

### 2. **Animation Constants** (`src/lib/animations.ts`)
- Durations, easing functions, motion variants
- Reduced motion support via `getSafeVariants()`

### 3. **Enhanced Components**
- ✅ `Header.tsx` - Scroll-based opacity & shadow transitions
- ✅ `Home.tsx` - Comprehensive animations (hero, game, features, restaurants)

---

## 📦 INSTALLATION REQUIRED

```bash
npm install framer-motion
```

---

## 🎨 ANIMATION PATTERNS IMPLEMENTED

### **Hero Section**
```tsx
<ParallaxSection speed={0.5} scale> // Background parallax
  <img src={heroBg} />
</ParallaxSection>

<FloatingElement amplitude={30} duration={8}> // Decorative floaters
  🍔
</FloatingElement>

<motion.div // Staggered content entrance
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.3 }}
>
```

### **Sections & Cards**
```tsx
<RevealOnScroll direction="up" delay={0.2}>
  <Section />
</RevealOnScroll>

<StaggerChildren staggerDelay={0.1}>
  {items.map(item => (
    <StaggerItem>
      <Card />
    </StaggerItem>
  ))}
</StaggerChildren>
```

### **Interactive Elements**
```tsx
<motion.article
  whileHover={{ scale: 1.05, y: -8 }}
  transition={{ duration: 0.3 }}
>
```

### **Header Scroll Effect**
```tsx
const { scrollY } = useScroll();
const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98]);

<motion.header style={{ opacity: headerOpacity }}>
```

---

## 🚀 REMAINING WORK (Optional Enhancements)

### **Home.tsx Sections to Animate** (apply same patterns):

1. **Restaurant Cards (Desktop Grid)** - Around line 360-410
   ```tsx
   // Current: <div className="hidden md:grid...">
   // Update: <StaggerChildren className="hidden md:grid...">
   ```

2. **Menu Preview Grid** - Around line 380-430
   ```tsx
   // Wrap each card in <StaggerItem> + add whileHover scale
   ```

3. **Concept Section** - Around line 440-490
   ```tsx
   <RevealOnScroll direction="up">
     <section className="py-6 sm:py-8 md:py-20...">
   ```

4. **Footer** - Bottom of page
   ```tsx
   <RevealOnScroll direction="up" distance={20}>
     <Footer />
   </RevealOnScroll>
   ```

### **Other Pages to Animate**:

1. **`Restaurants.tsx`** - Apply `StaggerChildren` to restaurant grid
2. **`Videos.tsx`** - Add `RevealOnScroll` to TikTok embed & video grid
3. **`Concept.tsx`** - Hero parallax + section reveals
4. **`Contact.tsx`** - Form entrance animations

---

## 🎯 QUICK IMPLEMENTATION EXAMPLE

### **Add to Any Section**:
```tsx
import { RevealOnScroll } from '@/components/animations';

// Before:
<section className="py-20">
  <h2>My Section</h2>
  <div className="grid grid-cols-3">
    {items.map(item => <Card key={item.id} {...item} />)}
  </div>
</section>

// After:
<RevealOnScroll direction="up">
  <section className="py-20">
    <RevealOnScroll direction="down" delay={0.2}>
      <h2>My Section</h2>
    </RevealOnScroll>
    
    <StaggerChildren className="grid grid-cols-3" staggerDelay={0.1}>
      {items.map(item => (
        <StaggerItem key={item.id}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card {...item} />
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerChildren>
  </section>
</RevealOnScroll>
```

---

## ⚡ PERFORMANCE CHECKLIST

- ✅ GPU-accelerated properties only (`transform`, `opacity`)
- ✅ `once={true}` on all RevealOnScroll (animate once, not repeated)
- ✅ Reduced motion support via `prefersReducedMotion()`
- ✅ Intersection observer thresholds set to `0.2` (20% visible)
- ✅ Stagger delays kept under `0.2s` for snappy feel
- ✅ Parallax effects use `useTransform` (optimized Framer Motion hook)

---

## 🐛 TESTING

1. **Desktop**: Scroll through homepage - all sections should fade in smoothly
2. **Mobile**: Verify smooth performance on 360px viewport
3. **Reduced Motion**: Enable in OS settings - animations should become instant fades
4. **Header**: Scroll down - header should get more opaque + stronger shadow
5. **Hover**: Cards & buttons should scale/glow on hover
6. **Hero**: Background should move slower than scroll (parallax)

---

## 📚 DOCUMENTATION

See `ANIMATION_SYSTEM.md` for:
- All animation constants & rules
- Component API reference
- Usage examples
- Performance guidelines
- Accessibility notes

---

## 💡 TIPS

1. **Keep it consistent**: Use same durations/easing across similar elements
2. **Stagger sparingly**: Only for lists/grids with 3+ items
3. **Delay wisely**: Max delay 0.5s, otherwise feels sluggish
4. **Test on mobile**: Animations must feel instant (<0.6s)
5. **Respect reduced motion**: Critical for accessibility

---

**Current Status**: ✅ Core system complete, Hero + Game sections animated
**Next**: Apply same patterns to remaining sections (10-15 min work)
