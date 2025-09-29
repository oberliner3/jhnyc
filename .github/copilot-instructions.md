# AI Agent Instructions for Neo Stories Origins Codebase

## Project Overview
This is a Next.js e-commerce application using the App Router pattern with TypeScript. The project emphasizes performance, accessibility, and a modular architecture.

## Key Architecture Patterns

### 1. App Router Structure
- Routes are in `app/(routes)/` using Next.js 14+ conventions
- API routes are in `app/api/` with RESTful endpoints
- Server components are default, client components marked with "use client"

### 2. State Management
- Global state managed through React Context:
  - `contexts/auth-context.tsx` - Authentication state
  - `contexts/cart-context.tsx` - Shopping cart
  - `contexts/product-context.tsx` - Product data

### 3. Data Flow
- Server actions for form submissions
- API routes for data fetching
- Zod for schema validation
- React Query for client-side data management

## Critical Workflows

### Development
```bash
pnpm dev     # Start development server
pnpm build   # Production build
pnpm start   # Start production server
```



## Component Guidelines

### Form Handling
- Use `hooks/use-form-validation.ts` for form validation
- Implement Zod schemas in `lib/validations.ts`
- Example: `app/(routes)/checkout/page.tsx`

### UI Components
- Base components in `components/ui/`
- Follow shadcn/ui patterns
- Use Tailwind CSS for styling
- Maintain mobile-first responsive design

## API Integration

### Products API
- Base configuration in `lib/constants.ts`
- API client functions in `lib/api.ts`
- Products endpoints:
  - GET `/api/products` - List products
  - GET `/api/products/[id]` - Get product
  - GET `/api/products/by-handle/[handle]` - Get by handle

### Authentication
- JWT-based auth
- Protected routes require `AuthProvider`
- Use `useAuth()` hook for auth state

## Key Files
- `app/providers.tsx`: Global providers setup
- `lib/types.ts`: TypeScript interfaces
- `lib/utils.ts`: Shared utilities
- `components/common/`: Reusable components
- `middleware.ts`: Request middleware

## Performance Considerations
- Use Next.js Image component with proper optimization
- Implement proper caching headers for API routes
- Lazy load below-the-fold content
- Follow existing code splitting patterns

## Common Gotchas
- Always use TypeScript strict mode
- Handle loading and error states
- Validate API responses with Zod
- Check mobile responsiveness
- Consider offline support (PWA ready)

## Before Making Changes
1. Review existing patterns in similar files
2. Check TypeScript types and validations
3. Test on multiple devices/browsers
4. Consider performance implications
5. Update relevant tests
