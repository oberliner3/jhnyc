# Codebase Inventory and Dependency Snapshot (2025-09-30)

Branch: chore/prod-prep
Node: v22.19.0
pnpm: 10.17.1
Next.js: 15.5.4
React: 19.1.1
TypeScript: ^5.9.2

Diagnosis results
- Type-check: PASS (pnpm exec tsc --noEmit)
- Lint: PASS (eslint app components contexts hooks lib utils middleware.ts next.config.ts)
- Build: PASS (pnpm build) — non-fatal ETIMEDOUT logs during sitemap generation

Scripts
- dev: next dev --turbopack
- build: next build --turbopack
- start: next start
- lint: eslint app components contexts hooks lib utils middleware.ts next.config.ts
- lint:fix: eslint --fix app components contexts hooks lib utils middleware.ts next.config.ts

Dependency snapshot
- dependencies:
  - @hookform/resolvers: ^5.2.2
  - @radix-ui/react-accordion: ^1.2.12
  - @radix-ui/react-avatar: ^1.1.10
  - @radix-ui/react-dialog: ^1.1.15
  - @radix-ui/react-dropdown-menu: ^2.1.16
  - @radix-ui/react-label: ^2.1.7
  - @radix-ui/react-navigation-menu: ^1.2.14
  - @radix-ui/react-popover: ^1.1.15
  - @radix-ui/react-scroll-area: ^1.2.10
  - @radix-ui/react-select: ^2.2.6
  - @radix-ui/react-separator: ^1.1.7
  - @radix-ui/react-slot: ^1.2.3
  - @radix-ui/react-tabs: ^1.1.13
  - @shopify/admin-api-client: ^1.1.1
  - @shopify/polaris-tokens: ^9.4.2
  - @supabase/ssr: ^0.7.0
  - @supabase/supabase-js: ^2.58.0
  - @tanstack/react-query: ^5.90.2
  - @uidotdev/usehooks: ^2.4.1
  - @vercel/analytics: ^1.5.0
  - @vercel/speed-insights: ^1.2.0
  - class-variance-authority: ^0.7.1
  - clsx: ^2.1.1
  - cmdk: ^1.1.1
  - devtools-detect: ^4.0.2
  - framer-motion: ^12.23.22
  - geist: ^1.5.1
  - isomorphic-dompurify: ^2.28.0
  - js-cookie: ^3.0.5
  - jsdom: ^27.0.0
  - libphonenumber-js: ^1.12.23
  - lucide-react: ^0.544.0
  - next: 15.5.4
  - next-themes: ^0.4.6
  - react: 19.1.1
  - react-cookie-consent: ^9.0.0
  - react-dom: 19.1.1
  - react-hook-form: ^7.63.0
  - schema-dts: ^1.1.5
  - sonner: ^2.0.7
  - tailwind-merge: ^3.3.1
  - zod: ^4.1.11
- devDependencies:
  - @eslint/eslintrc: ^3.3.1
  - @types/js-cookie: ^3.0.6
  - @types/node: ^20.19.18
  - @types/react: ^19.1.16
  - @types/react-dom: ^19.1.9
  - autoprefixer: ^10.4.21
  - eslint: ^9.36.0
  - eslint-config-next: 15.5.4
  - eslint-config-prettier: ^10.1.8
  - postcss: ^8.5.6
  - tailwindcss: ^3.4.17
  - tailwindcss-animate: ^1.0.7
  - typescript: ^5.9.2

Outdated summary
- @types/node: 20.19.18 -> 24.6.0 (major; optional to update now)
- tailwindcss: 3.4.17 -> 4.1.13 (major; migration recommended as a separate task)

Structure and counts
- TS/TSX files in source: 151
- Pages (page.tsx): 24
- API routes (route.ts): 14
- Route groups under app/(routes):
  - about, account, admin, cart, checkout, collections, contact, legal, offline, privacy-policy, products, refund-policy, returns-exchange, rewards-terms, search, shipping-delivery, terms-of-service

Notes
- Build includes non-fatal "fetch failed: ETIMEDOUT" logs during sitemap generation; output is otherwise healthy.

---

Previous analysis retained below for reference.

# E-commerce App Codebase Analysis - Issues & Recommendations

## 🔴 Critical Issues

### 1. **Data Mapping Inconsistencies**
- **Location**: `app/(routes)/account/addresses/page.tsx:61-63`
- **Issue**: Template displays `{addr.full_name}` but the database schema likely has `first_name`/`last_name` fields
- **Impact**: Runtime errors, broken address display
- **Fix**: Use `{addr.first_name} {addr.last_name}` or ensure proper data mapping

### 2. **Missing Error Boundaries**
- **Issue**: No error boundaries implemented across the application
- **Impact**: Single component errors can crash the entire page
- **Fix**: Implement error boundaries at route and component levels

### 3. **Client-Side Data Fetching in Server Components**
- **Location**: `app/(routes)/products/[slug]/product-details-server.tsx`
- **Issue**: Server component calling API that should be handled server-side
- **Impact**: Unnecessary client-server roundtrips, hydration issues
- **Fix**: Move API calls to proper server-side data fetching

## 🟡 Performance Issues

### 4. **Inefficient Image Loading**
- **Location**: Multiple components using Next.js Image
- **Issues**: 
  - No image optimization strategy
  - Missing priority flags on above-the-fold images
  - No lazy loading configuration
- **Fix**: Implement proper image optimization, add priority flags, configure lazy loading

### 5. **Missing Database Indexes**
- **Issue**: No indication of proper database indexing for frequently queried fields
- **Impact**: Slow query performance on user_id, product searches
- **Fix**: Add indexes on `user_id`, `product_id`, `handle`, `title` fields

### 6. **Unoptimized API Routes**
- **Location**: `app/api/products/route.ts`
- **Issues**:
  - No caching headers
  - No pagination limits validation
  - Potential N+1 queries
- **Fix**: Add response caching, validate pagination, optimize queries

## 🟠 Security Concerns

### 7. **Insufficient Input Validation**
- **Location**: Multiple API routes and form handlers
- **Issues**:
  - Missing server-side validation in many routes
  - No rate limiting on API endpoints
  - Potential SQL injection risks in search functionality
- **Fix**: Implement Zod validation schemas, add rate limiting, sanitize inputs

### 8. **Missing CSRF Protection**
- **Issue**: No CSRF tokens in forms
- **Impact**: Cross-site request forgery vulnerabilities
- **Fix**: Implement CSRF protection for all state-changing operations

### 9. **Inadequate Error Handling**
- **Location**: Multiple API routes
- **Issue**: Error messages expose internal system details
- **Impact**: Information disclosure vulnerabilities
- **Fix**: Implement proper error sanitization

## 🔵 Code Quality Issues

### 10. **Inconsistent Error Handling Patterns**
- **Locations**: Various API routes and components
- **Issues**:
  - Some components use try-catch, others don't
  - Inconsistent error message formats
  - No centralized error logging
- **Fix**: Implement consistent error handling patterns and centralized logging

### 11. **Missing TypeScript Strict Mode**
- **Issue**: Type safety could be improved
- **Impact**: Potential runtime errors from type mismatches
- **Fix**: Enable strict TypeScript settings, add proper type definitions

### 12. **Inconsistent State Management**
- **Issue**: Mixed patterns of state management across components
- **Impact**: Difficult to maintain and debug state-related issues
- **Fix**: Standardize on consistent state management patterns

## 🟢 Architectural Improvements

### 13. **API Layer Architecture**
- **Issue**: Direct database calls mixed with external API calls
- **Recommendation**: Implement a proper service layer to abstract data sources

### 14. **Component Organization**
- **Issue**: Some components are doing too much (violation of single responsibility)
- **Fix**: Break down large components into smaller, focused components

### 15. **Missing Request/Response Caching**
- **Issue**: No caching strategy for API responses
- **Impact**: Unnecessary API calls and slow user experience
- **Fix**: Implement Redis/memory caching for frequently accessed data

## 🛠️ Technical Debt

### 16. **Unused Dependencies**
- **Issue**: Potential unused imports and dependencies
- **Fix**: Audit and remove unused dependencies

### 17. **Missing Documentation**
- **Issue**: No inline documentation for complex business logic
- **Fix**: Add JSDoc comments for complex functions and business rules

### 18. **Inconsistent Naming Conventions**
- **Issue**: Mixed camelCase/snake_case in different parts of the codebase
- **Fix**: Establish and enforce consistent naming conventions

## 🔧 Testing Issues

### 19. **No Test Coverage**
- **Issue**: No visible test files in the codebase
- **Impact**: High risk of regressions, difficult to refactor safely
- **Fix**: Implement unit, integration, and E2E tests

### 20. **No Type Testing**
- **Issue**: No validation that TypeScript types match runtime data
- **Fix**: Implement runtime type validation with libraries like Zod

## 📈 Scalability Concerns

### 21. **No Database Connection Pooling**
- **Issue**: Supabase client creation without proper connection management
- **Impact**: Connection exhaustion under load
- **Fix**: Implement proper connection pooling

### 22. **Missing CDN Strategy**
- **Issue**: No indication of CDN usage for static assets
- **Impact**: Slow loading times for global users
- **Fix**: Implement CDN for images and static assets

## 🎯 Immediate Action Items

### High Priority (Fix First)
1. Fix data mapping inconsistency in address display
2. Add error boundaries to prevent crashes
3. Implement proper input validation
4. Add database indexes for performance

### Medium Priority
1. Implement caching strategy
2. Add comprehensive error handling
3. Set up monitoring and logging
4. Improve image optimization

### Low Priority (Technical Debt)
1. Refactor large components
2. Standardize naming conventions

## 🏆 Positive Aspects

- Good use of Next.js App Router
- Proper TypeScript integration
- Clean component structure in most places
- Good separation of concerns in many areas
- Proper use of Tailwind CSS
- Good SEO implementation with metadata

## 📋 Recommendations Summary

1. **Immediate**: Fix critical data mapping and add error boundaries
2. **Short-term**: Implement validation, caching, and performance optimizations
3. **Long-term**: Refactor for better scalability and maintainability

This analysis provides a roadmap for improving the codebase systematically while maintaining functionality.
