/home/odin/Documents/Vaults/spyd3r/neo-stories-origins/originz/plan.md
```
Phase 1: Foundation & State Management
   1. Consolidate State Management: I will start by reviewing contexts/cart-context.tsx and hooks/use-cart.ts. The context provider approach is more 
      scalable, so I will remove hooks/use-cart.ts and ensure the CartProvider from contexts/cart-context.tsx is used correctly in the root layout.
   2. Install and Configure TanStack Query: I will then install and set up @tanstack/react-query and a QueryClientProvider. This will be used for 
      fetching data from the API endpoints, replacing any simple fetch calls in the components.
   3. Providers Setup: I will create a providers.tsx file to wrap all client-side providers (QueryClientProvider, CartProvider, etc.) and then wrap the 
      children in app/layout.tsx with this new Providers component.

  Phase 2: Core E-commerce Features
   4. Product Data & SSR/ISG: The /api/products route uses static data, which I will keep for now. I will implement data fetching on the product pages 
      using React Query. For the product detail page (/products/[slug]), I will use React Query to fetch the product data and implement 
      generateStaticParams to pre-render pages for existing products at build time (ISG).
   5. Product Variants: I will populate the variants and options data for at least one product to demonstrate variant selection. On the product detail 
      page, I will add UI elements to select product variants and update the "Add to Cart" button logic to include the selected variant.
   6. Cart Functionality: I will enhance cart-context.tsx by simplifying the addItem function and integrating the CartDrawer component into the Header. 
      The Header will display the correct cartItemCount from the useCart hook, and the cart page (/cart) will be updated to use the useCart hook to 
      display items and allow quantity updates and removal.

  Phase 3: Checkout & UI/UX Polish
   7. Checkout Page: I will create a basic checkout page at /checkout that displays a summary of the cart items and includes a form for shipping 
      information, using zod for validation.
   8. UI/UX and Animations: I will install and integrate framer-motion to add page transition animations and subtle animations to UI elements. I will 
      also review the existing UI and apply shadcn/ui components where appropriate for consistency.


Codebase Analysis Findings:
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

## �� Performance Issues

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
