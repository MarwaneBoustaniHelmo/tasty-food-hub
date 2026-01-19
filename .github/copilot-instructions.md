# Copilot instructions for Lovable - Tasty Food

This file gives AI agents the minimum, actionable knowledge to be productive in this repository.

## Big picture
- Frontend single-page app for Tasty Food, a Belgian fast-food chain specializing in halal burgers using "smash technique" for crispy crusts, fresh fries, and quick delivery (30-40 min).
- Built with Vite + React + TypeScript for a marketing website with restaurant locations, ordering integration, and brand content.
- Entrypoint: `src/main.tsx` and app shell `src/App.tsx` (client-side routing with `react-router-dom`).
- Data fetching state is managed with `@tanstack/react-query` (`QueryClient` in `App.tsx`), though currently used minimally as it's a static site.
- UI primitives live under `src/components/ui/` (shadcn-style components built on Radix + Tailwind).
- Mobile-first design with dedicated mobile order banner and OrderBottomSheet for seamless ordering on platforms like Uber Eats and Deliveroo.

## Build & dev commands
- Install: `npm i`
- Dev server: `npm run dev` (Vite, server host `::`, port `8080`).
- Build: `npm run build` (production build). Preview: `npm run preview`.
- Lint: `npm run lint` (ESLint with TypeScript and React rules).

## Important project conventions
- Path alias: `@` -> `src` (see `vite.config.ts`). Import using `@/...`.
- Styling: Tailwind with custom design tokens in `tailwind.config.ts` (e.g., gold gradients for branding, red-cta for calls-to-action, platform-specific colors).
- Fonts: Bebas Neue for display headings, Inter for body text (imported in `src/index.css`).
- Component primitives: `src/components/ui/*` expose standardized components (e.g., `Button` uses CVA patterns in `button.tsx`). Prefer updating primitives here for visual/behavior changes.
- Class merging: use `cn(...)` from `src/lib/utils.ts` and `class-variance-authority` (`cva`) for variant-driven styles.
- Icons: Lucide React icons throughout (e.g., `ArrowRight`, `Check`).
- Images/assets: imported from `src/assets/*` and treated as ES modules (e.g., `src/pages/Home.tsx`).
- Mobile responsiveness: Use `useIsMobile()` hook from `src/hooks/use-mobile.tsx` for mobile-specific logic.

## Architecture & patterns to follow
- Routing: routes are defined in `src/App.tsx` with page components under `src/pages/` (Home, Restaurants, Order `/commander`, Concept, Videos, Contact, NotFound).
- State & side-effects: use React Query for server data; local UI state inside components/hooks (example: `src/hooks/use-mobile.tsx`).
- Mobile-first UI: many components include mobile-specific markup (see `Header.tsx` mobile Order banner and `OrderBottomSheet` for platform ordering).
- Ordering integration: Static links to external platforms (Uber Eats, Deliveroo, official sites) rather than internal cart/checkout.
- Third-party UI: Radix primitives + shadcn-style wrappers live under `src/components/ui` — change here to affect the whole app.

## Integration points & notable deps
- `lovable-tagger` plugin present in `vite.config.ts` — runs only in development mode (used for Lovable integrations).
- `@tanstack/react-query` for data (minimal use currently).
- `react-router-dom` for routing; `lucide-react` for icons; `tailwindcss` + plugins for styling.
- Form handling: `react-hook-form` with `@hookform/resolvers` and `zod` available but not heavily used yet.

## Helpful implementation notes / examples
- To add a new route: create `src/pages/MyPage.tsx` and add `<Route path="/mypage" element={<MyPage/>} />` in `src/App.tsx`.
- To add a new UI primitive or modify a variant: edit `src/components/ui/button.tsx` (CVA pattern) and use `cn(...)` to combine classes.
- To use the alias import: `import Header from "@/components/Header"` (works because of `vite.config.ts` resolve.alias).
- For mobile-specific features: Check `useIsMobile()` and see `OrderBottomSheet.tsx` for bottom sheet implementation.
- Branding: Use gold color variants (`text-gold`, `bg-gold`) for headings; red-cta for action buttons.

## Testing, CI, and debugging
- No tests found in the repo. Linting via `npm run lint` is provided.
- Dev server logs available from Vite; production preview via `npm run preview`.

## When making PRs / commits
- Keep UI primitive changes isolated to `src/components/ui/*` where possible.
- Update tokens in `tailwind.config.ts` only when changing design system values (e.g., adding new brand colors).
- For ordering features: Focus on linking to external platforms rather than building internal e-commerce.

---
If anything above is unclear or you'd like deeper guidance (e.g., adding tests, CI pipelines, or conventions for API integrations), tell me which section to expand.
