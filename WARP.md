# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Next.js (App Router) + TypeScript + Tailwind CSS
Canonical package manager: pnpm (pnpm-lock.yaml present)

Commands
- Install dependencies: pnpm install
- Start dev server (Turbopack): pnpm dev  → http://localhost:3000
- Production build: pnpm build
- Start production server: pnpm start
- Lint: pnpm lint
- Auto-fix lint issues: pnpm lint:fix
- Type-check (no emit): pnpm exec tsc --noEmit
- Tests: no test runner is configured in package.json (add one if needed; none currently present)

High-level architecture
- App Router and routing
  - Pages and route groups live in app/(routes)/... with nested and dynamic segments, e.g.:
    - app/(routes)/products/[handle] for product details (server/client components split across product-details-*.tsx)
    - app/(routes)/collections/[slug]
    - app/(routes)/account/* for auth-protected user flows
  - API routes are colocated under app/api/** with REST-style handlers (route.ts) for cart, checkout, products, orders, newsletter, feeds, share, upload, and multiple sitemaps.
  - Cross-cutting pages like sitemap-*.xml, manifest.ts, robots.ts are under app/ for SEO/crawling.

- Data, domain, and integrations
  - lib/shopify-api.ts encapsulates Shopify store interactions.
  - utils/supabase/{client,server}.ts provides Supabase integration for auth/session handling.
  - lib/api.ts centralizes fetch/client helpers; lib/constants.ts holds app-wide constants.
  - Validation via Zod with schemas/utilities in lib/validations.ts.
  - Domain types live in lib/types.ts; misc helpers in lib/utils.ts; SEO helpers in lib/seo.ts.

- State management and server actions
  - Global state via React Contexts in contexts/: auth-context.tsx, cart-context.tsx, product-context.tsx.
  - Server Actions are colocated with routes as actions.ts files (e.g., checkout, products, account).
  - React Query is used on the client where needed for client-side data management.

- UI and presentation
  - Reusable UI primitives in components/ui/ (shadcn-style), layout in components/layout/, and feature sections in components/sections/.
  - Skeleton UIs in components/skeletons/ for loading states.
  - PWA support via components/pwa/ and public/sw.js.
  - Schema/SEO components in components/common/ (e.g., product-schema.tsx, website-schema.tsx).
  - Tailwind CSS configured (tailwind.config.js); design tokens and utilities (e.g., class-variance-authority) are used across components.

- App composition and middleware
  - app/providers.tsx wires global providers (e.g., React Query, themes) and shared context.
  - middleware.ts handles request-time logic (e.g., auth/protection, rewrites if applicable).
  - next.config.ts holds framework configuration; tsconfig.json sets strict TS, bundler resolution, and @/* path aliasing.

Important repository guidance (summarized from existing docs)
- From README.md
  - Use the dev server to iterate at http://localhost:3000; project was bootstrapped with create-next-app and uses the Next.js App Router.
- From .github/copilot-instructions.md
  - App Router conventions: server components by default; client components opt-in with "use client".
  - State via React Context (auth, cart, product); use existing contexts/providers.
  - Data flow: server actions for mutations; API routes for fetching; Zod for validation; React Query for client data needs.
  - Key files to be aware of: app/providers.tsx, lib/types.ts, lib/utils.ts, middleware.ts, components/common/, components/ui/.

Notes for future automation in Warp
- Use pnpm scripts as the source of truth for build/dev/lint.
- There is currently no test script; before adding tests or CI tasks, ensure a test runner (e.g., Vitest/Jest) and scripts are defined in package.json.