# Code Cleanup Log

Phase: 2 — Code Cleanup & Optimization
Date: 2025-10-07

This log records what was changed during P2.1 (Lint/type-check baseline) to establish a clean baseline before removals in P2.2.

## Summary
- Type checks (tsc --noemit): PASS
- ESLint (eslint . --fix): PASS (0 errors, 4 warnings)
- No files deleted in this batch. Focus was on fixing baseline issues and unblocking lint/type-checks.

## Changes by file
- components/blocks/cta11.tsx
  - Added `import Image from "next/image"`
  - Switched `<Image>` to use `fill` and `sizes="128px"` inside a `relative` container
- components/blocks/feature166.tsx
  - Added `import Image from "next/image"`
  - Added `width`/`height` to four `<Image>` instances
- components/blocks/feature73.tsx
  - Added `import Image from "next/image"`
  - Added `width={1600}`/`height={900}` to two `<Image>` instances
- components/blocks/hero3.tsx
  - Added `import Image from "next/image"`
  - Added `width={1200}`/`height={800}` to hero `<Image>`
- components/blocks/logos8.tsx
  - Added `import Image from "next/image"`
- components/product/product-card.tsx
  - Fixed undefined variable in meta tag: replace `g ?` with `isDescriptionTruncated ?`
- components/shadcnblocks/logo.tsx (NEW)
  - Added minimal `Logo`, `LogoImage`, `LogoText` placeholders to satisfy `Footer2` import
- components/aceternity/background-lines.tsx (NEW)
  - Added minimal `BackgroundLines` wrapper to satisfy `Waitlist1` import

## Notes
- Remaining ESLint warnings relate to `<img>` usage in bespoke logo components (`@next/next/no-img-element`). These are safe for now and will be addressed when we standardize image handling in Phase 5.
- We did not remove any files yet; P2.2 will proceed with safe, reference-checked deletions. We will only remove code that is demonstrably unused and keep this log updated.


## P2.2 (setup) – Automated dead code detection tooling
- Attempted install: ts-prune@0.11.2 → Not available on npm (latest is 0.10.3). Requested your approval to use ts-prune@0.10.3 instead.
- Installed: depcheck@1.4.7

### depcheck findings (initial, requires human review)
- Unused dependencies (candidates):
  - @hookform/resolvers
  - @shopify/polaris-tokens
  - @uidotdev/usehooks
  - js-cookie
  - jsdom
  - react-hook-form
  - redis
- Unused devDependencies (candidates):
  - @next/eslint-plugin-next
  - @types/js-cookie
  - @types/node
  - autoprefixer
  - depcheck
  - eslint-config-next
  - eslint-config-prettier
  - eslint-plugin-react-hooks
  - postcss

Notes:
- depcheck can report false-positives (dynamic imports, plugins, config-based usage). We will verify each item before proposing removal.
- Next step (pending your approval): install ts-prune@0.10.3 and run it to produce an unused exports report, then synthesize a candidate deletion list (no deletions yet).

### Tools executed
- Installed: ts-prune@0.10.3
- Ran: `pnpm exec ts-prune -p tsconfig.json` (saved full report to docs/TS_PRUNE_REPORT.txt)
- Re-ran: `pnpm exec depcheck`

### Methodology
1) Cross-reference ts-prune (unused exports) with depcheck (unused deps)
2) Manually verify each item with repo-wide searches, and inspect config-based usages (eslint.config.mjs, tailwind.config.js, postcss.config.mjs)
3) Exclude Next.js reserved/framework exports (e.g., default in page/layout/route files, GET/POST handlers, dynamic, revalidate, metadata, generateStaticParams/Metadata) from consideration
4) Be conservative around checkout/payment/order flows

### Candidate deletion list (no deletions performed)

- Dependencies (prod)
  1. redis — No references found; using @upstash/redis in lib/redis.ts
     - Evidence: grep found no `from "redis"`; lib/redis.ts imports `@upstash/redis`
     - Risk: Low
     - Action: Safe to delete
  2. jsdom — No references; typically test-only and we have no tests
     - Risk: Low
     - Action: Safe to delete
  3. js-cookie — No references
     - Risk: Low (future browser cookie use possible)
     - Action: Safe to delete (or keep if planned)
  4. react-hook-form — No references
     - Risk: Medium (forms exist but use custom hooks)
     - Action: Safe to delete
  5. @hookform/resolvers — No references; tied to react-hook-form
     - Risk: Low
     - Action: Safe to delete
  6. @uidotdev/usehooks — No references
     - Risk: Low
     - Action: Safe to delete
  7. @shopify/polaris-tokens — No references; Tailwind uses CSS variables, not the package
     - Risk: Low
     - Action: Safe to delete

- DevDependencies (depcheck false-positives; keep)
  - @next/eslint-plugin-next, eslint-config-next, eslint-config-prettier, eslint-plugin-react-hooks
  - postcss, autoprefixer
  - @types/node (used by TypeScript)
  - depcheck, ts-prune (used for analysis now)
  - @types/js-cookie: remove only if `js-cookie` is removed

- Files
  1. components/examples/api-example.tsx — Not imported by any route or module
     - Risk: Low
     - Action: Safe to delete
  2. components/examples/form-example.tsx — Not imported by any route or module
     - Risk: Low
     - Action: Safe to delete
  3. components/common/debug-track.tsx — No imports found; likely developer utility
     - Risk: Low
     - Action: Needs review; likely safe to delete if not planned for use
  4. components/common/loading-spinner.tsx — No imports found (generic UI)
     - Risk: Low/Medium (might be used later)
     - Action: Needs review; prefer keep or move to ui/ if adopting

- Exports (ts-prune)
  - Many items flagged are either Next.js reserved exports or "used in module" (internal). No export deletions recommended now. Consider demoting internal-only `export const` to `const` during P2.4 component simplifications.
