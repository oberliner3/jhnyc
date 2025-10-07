# Originz – Architecture Review and Refactor Plan (Phase 1)

Status: Draft for approval
Owner: Augment Agent
Date: 2025-10-07

---

## 0) Executive Summary
- The codebase follows App Router best practices, with existing Suspense and cache controls for product data. A clear directory structure and utility layer are present.
- Primary improvements:
  1) Standardize data fetching (single API client, consistent cache/ISR semantics),
  2) Consolidate and simplify components into `components/blocks` (preserve `components/ui`),
  3) Adopt consistent Suspense/streaming patterns,
  4) Establish design tokens inspired by provided references,
  5) Prepare MDX for legal pages using `content/policies` (approved in principle),
  6) Implement paginated Merchant Center feed,
  7) Add path aliases and tighten lint/type checks.
- No code changes proposed in this document; this is a plan for your approval.

---

## 1) Project Snapshot
- Next.js 15 (App Router), React 19, TailwindCSS, shadcn/ui, Radix, Supabase, Upstash Redis.
- Route groups: `app/(store)`, `app/(checkout)`, plus `app/api/*`, sitemaps, share, upload.
- Components: `components/ui` (shadcn) + domain components under `components/*` with skeletons present.
- Data layer: `lib/data/products.ts` delegates to `lib/api/cosmos-client.ts`; reusable fetch wrappers in `lib/utils/api-client.ts` and `lib/external-api-errors.ts`.
- Content: MDX files already exist at `content/policies/*.mdx` (privacy-policy, terms-of-service, shipping-delivery, refunds, returns, cookie).
- Feeds: `app/api/feed/google-merchant/route.ts` (and Bing) currently generate full feed using `fetchAllProducts`.

---

## 2) Findings – Design/Architecture
- Strengths
  - Solid App Router adoption; Suspense used on PDP, collections, cart, account.
  - Data layer encapsulates product operations with cache/revalidate.
  - ESLint rules to avoid server imports in client components; logging utility present; next.config removes console in prod.
- Gaps / Risks
  - Inconsistent data fetching: mixed direct `fetch("/api/*")` from client pages and server-side utilities; duplication across `api-client`, `resilientFetch`, and ad-hoc calls.
  - Some long files/handlers (e.g., draft-orders route) likely violate SRP; should be split into service utilities.
  - Components scattered across many folders; duplication of skeleton/fallback patterns.
  - No unit tests configured; refactors risk regressions without a safety net.
  - Merchant feed generates a full XML in one request; risky for large catalogs.

---

## 3) Principles Check (DRY, KISS, YAGNI, SOLID)
- DRY
  - Multiple fetch wrappers and direct uses; propose a single typed API client for internal HTTP calls + direct server SDK usage in RSC where safe.
  - Repeated skeleton patterns; standardize primitives and feature-level fallbacks.
- KISS
  - Trim oversized components and route handlers; isolate formatting, mapping, and IO.
- YAGNI
  - Remove unused utils/components and over-abstracted layers where not needed.
- SOLID
  - SRP: split route handlers/services; separate presentation from data-fetching glue.
  - DIP: depend on interfaces (types) in `lib/types.ts`, not concrete implementations in UI.

---

## 4) Refactor Plan – Phases & Deliverables

### Phase 1 (HIGH): Analysis & Architecture Review
Deliverables:
- This document
- Inventory of data-fetching pages and APIs
- Component audit (shadcn vs custom, migration plan)
- Violations list with remedies and priority

### Phase 2 (HIGH): Code Cleanup & Optimization
Actions:
- Run eslint/tsc; autofix and prune dead code; log deletions
- Merge fetch logic into a single client (`lib/utils/api-client.ts`) and resilient fetch util
- Extract large handlers into `lib/utils/*-server-utils.ts` service modules
- Simplify complex components; split presentation vs container where needed
Validation:
- `pnpm run lint` and type-check pass; `next build` smoke build passes

### Phase 3 (MEDIUM): Component Organization (blocks)
Actions:
- Add `components/blocks` groups: account, admin, cart, checkout, product, layout, sections, pwa, chat, common, icons, examples
- Keep `components/ui` intact; add path aliases `@blocks/*`, `@ui/*` (approved)
- Move custom components; update imports via codemod; consolidate skeleton usage
Validation:
- Type-check/build; manual smoke of key pages

### Phase 4 (MEDIUM): Data Fetching & Loading States
Actions:
- Catalogue all data-fetching pages; add Suspense where beneficial
- Adopt streaming at route-segment level for slow sections
- Normalize caching: use `force-cache` + `revalidate` for stable product endpoints; `no-store` for bulk ops
Validation:
- Throttled-network QA; confirm fallbacks and progressive hydration

### Phase 5 (MEDIUM-LOW): UI/UX Revamp
Actions:
- Derive design tokens from references (colors, type scale, spacing, radius, shadows, motion)
- Implement tokens via Tailwind theme and CSS variables; align shadcn/ui
- Harden layouts/section wrappers; harmonize paddings/radii/interactions
- Add Next/Image blur placeholders where impactful
Validation:
- Visual regression review; a11y pass

### Phase 6 (MEDIUM): Routing & Structure + MDX
Actions:
- Review route groups; adjust ((marketing), (account), (admin)) as helpful
- Optimize `app/layout.tsx` and providers placement
- MDX: set up `@next/mdx` pipeline and migrate legal pages from `content/policies` to MDX routes
Validation:
- Build and route QA; MDX pages render with metadata

### Phase 7 (LOW): Performance
Actions:
- Add prefetch for key navigations (PLP→PDP, cart/checkout)
- Merchant feed: implement pagination (`page`, `limit`) and caching/ISR
- Analyze bundles; apply code-splitting where needed
Validation:
- Before/after metrics; feed ingest smoke tests

---

## 5) Design Tokens – Initial Proposal (for iteration)
- Color
  - Neutral: `#0B0B0C` (fg), `#111315`, `#1A1D1F`, `#2A2E31`, `#E6E8EA`, `#F3F5F7`, `#FFFFFF`
  - Accent: `#0EA5E9` (sky), `#6366F1` (indigo), `#14B8A6` (teal) – use sparingly
  - Support: success `#16A34A`, warn `#F59E0B`, error `#EF4444`
- Typography (Geist/Radix scale aligned)
  - Display: 54/64/72, H1: 40, H2: 32, H3: 28, H4: 24, Body: 16/18, Small: 14, XS: 12
  - Tracking: tight for headings; normal for body; leading 1.3–1.5
- Spacing (4/8 system)
  - 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- Radius & Shadows
  - Radius: 0, 6, 10, 16, 24; Shadows: subtle elevation on hover/focus
- Motion
  - Durations: 150–200ms (micro), 300–450ms (UI), 500–700ms (page)
  - Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out expo), `cubic-bezier(0.4, 0, 0.2, 1)` (standard)
  - Patterns: fade-in-up, scale-and-fade, masked reveals; respect `prefers-reduced-motion`

Implementation Plan:
- Extend Tailwind theme + CSS vars in `globals.css` for colors, radius, spacing; align shadcn/ui config
- Build shared motion utilities (Framer Motion variants) and transitions tokens

---

## 6) MDX – Legal Pages Migration Plan
- Use `@next/mdx` with App Router; configure in `next.config.ts` (MDX loader) and add `mdx` to page extensions
- Organize routes under `app/(store)/legal/*` or `(marketing)/policies/*` mapping to `content/policies/*.mdx`
- Create an MDX renderer (RSC) with a consistent article layout and metadata extraction
- Preserve URLs of current legal pages via route files that import corresponding MDX content
- Testing: build + manual QA of each policy page

---

## 7) Merchant Center Feed – Pagination Plan
- Extend current route (`app/api/feed/google-merchant/route.ts`) to accept `?page=1&limit=500`
- Fetch products via existing data layer with `no-store` for bulk operations
- Generate partial XML per page; include headers (`Cache-Control`, `X-Feed-Errors`) and a `<lastBuildDate>`
- Optionally expose an index endpoint returning available page count
- Keep default (no query) behavior for compatibility while documentation updates are made

---

## 8) Risks & Mitigations
- Import path breakage during component moves → codemod + path aliases + smoke build
- Feed ingestion nuances → keep backward-compatible default and document pagination usage
- Design regressions → token-driven approach with small, reviewable PRs
- Lack of tests → add minimal unit tests in later phase to guard utilities and route handlers

---

## 9) Approvals Requested
- Confirm the design token direction aligns with references (colors/motion/scale)
- Confirm MDX approach (@next/mdx) and legal pages migration priority/order
- Confirm feed pagination strategy and default behavior remains full feed unless `page` param provided

---

## 10) Next Actions (upon approval)
1. Phase 2 start: lint/type baseline; dead code pass; unify fetch utilities
2. Phase 3: create `components/blocks` and plan migration; add path aliases
3. Phase 4: add Suspense boundaries to remaining pages; standardize skeletons
4. Phase 6: set up MDX pipeline and migrate legal pages
5. Phase 7: implement feed pagination and caching

