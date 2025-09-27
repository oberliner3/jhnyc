# OriGenZ E-commerce Codebase Index

## Project Overview

**OriGenZ** is a modern e-commerce storefront built with Next.js 15, React 19, TypeScript, and Supabase. The project follows a comprehensive architecture with server-side rendering, client-side state management, and a robust API layer.

### Key Technologies
- **Framework**: Next.js 15.5.4 with App Router
- **Frontend**: React 19.1.0, TypeScript 5
- **Styling**: Tailwind CSS 4.1.13, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Context + TanStack Query
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod validation
- **Package Manager**: pnpm

## Project Structure

```
originz/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   ├── about/               # About page
│   │   ├── account/             # User account management
│   │   │   ├── addresses/       # Address management
│   │   │   ├── login/           # Login page
│   │   │   ├── orders/          # Order history
│   │   │   ├── profile/         # User profile
│   │   │   └── register/        # Registration
│   │   ├── cart/                # Shopping cart
│   │   ├── checkout/            # Checkout process
│   │   ├── contact/             # Contact page
│   │   ├── legal/               # Legal pages
│   │   ├── products/            # Product catalog
│   │   │   └── [slug]/          # Dynamic product pages
│   │   └── search/              # Product search
│   ├── api/                     # API routes
│   │   ├── cart/                # Cart management
│   │   ├── newsletter/          # Newsletter subscription
│   │   ├── orders/              # Order processing
│   │   ├── products/            # Product data
│   │   └── profile/             # User profiles
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── providers.tsx            # Context providers
│   └── manifest.ts              # PWA manifest
├── components/                   # React components
│   ├── account/                 # Account-related components
│   ├── cart/                    # Shopping cart components
│   ├── common/                  # Shared components
│   ├── icons/                   # Icon components
│   ├── layout/                  # Layout components
│   ├── product/                 # Product-related components
│   ├── sections/                # Page sections
│   └── ui/                      # shadcn/ui components
├── contexts/                     # React contexts
│   ├── auth-context.tsx         # Authentication state
│   └── cart-context.tsx         # Shopping cart state
├── hooks/                        # Custom React hooks
│   ├── use-local-storage.ts     # Local storage hook
│   └── use-search.ts            # Search functionality
├── lib/                          # Utility libraries
│   ├── data/                    # Static data
│   ├── actions.ts               # Server actions
│   ├── api.ts                   # API client
│   ├── constants.ts             # App constants
│   ├── seo.ts                   # SEO utilities
│   ├── types.ts                 # TypeScript types
│   ├── utils.ts                 # Utility functions
│   ├── validations.ts           # Zod schemas
│   └── worker.ts                # Web worker
├── utils/                        # Utility functions
│   └── supabase/                # Supabase client setup
├── db/                          # Database schema
│   └── schema.sql               # PostgreSQL schema
├── public/                      # Static assets
└── middleware.ts                # Next.js middleware
```

## Core Features

### 1. Authentication System
- **Provider**: `contexts/auth-context.tsx`
- **Features**: Login, registration, session management
- **Backend**: Supabase Auth with RLS (Row Level Security)
- **Components**: Account dropdown, login/register forms

### 2. Shopping Cart
- **Provider**: `contexts/cart-context.tsx`
- **Features**: Add/remove items, quantity management, persistent storage
- **Storage**: Supabase for authenticated users, localStorage for guests
- **Components**: Cart drawer, cart summary, product cards

### 3. Product Catalog
- **API**: `/api/products` with search, filtering, pagination
- **Features**: Product variants, images, reviews, ratings
- **Components**: Product cards, product grid, product details
- **Data Source**: Supabase products table

### 4. User Management
- **Features**: Profile management, address book, order history
- **Pages**: Account dashboard, profile editing, address management
- **Security**: RLS policies for data access

### 5. E-commerce Features
- **Checkout**: Multi-step checkout process
- **Orders**: Order creation and tracking
- **Search**: Product search with filters
- **Newsletter**: Email subscription system

## Component Architecture

### Layout Components
- **Header**: `components/layout/header.tsx` - Navigation, search, cart
- **Footer**: `components/layout/footer.tsx` - Site links, contact info
- **MobileNav**: `components/layout/mobile-nav.tsx` - Mobile navigation
- **AnnouncementBar**: `components/layout/announcement-bar.tsx` - Promotional banner

### Product Components
- **ProductCard**: `components/product/product-card.tsx` - Product display card
- **ProductGrid**: `components/product/product-grid.tsx` - Product listing
- **ProductDetails**: `components/product/product-details-*.tsx` - Product page
- **ProductReviews**: `components/product/product-reviews.tsx` - Review system

### Cart Components
- **CartDrawer**: `components/cart/cart-drawer.tsx` - Side cart panel
- **CartSummary**: `components/cart/cart-summary.tsx` - Cart totals

### UI Components (shadcn/ui)
- **Button**: Various button variants and sizes
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Form**: Form components with validation
- **Input**: Input fields with validation
- **Sheet**: Slide-out panels
- **Badge**: Status indicators
- **Avatar**: User profile images

## API Architecture

### Products API
- **GET** `/api/products` - List products with search/filter
- **GET** `/api/products/[id]` - Get product by ID
- **GET** `/api/products/[handle]` - Get product by handle/slug

### Cart API
- **GET** `/api/cart` - Get user's cart
- **POST** `/api/cart` - Create new cart
- **POST** `/api/cart/items` - Add item to cart
- **PUT** `/api/cart/items` - Update item quantity
- **DELETE** `/api/cart/items` - Remove item from cart

### User API
- **GET** `/api/profile` - Get user profile
- **PUT** `/api/profile` - Update user profile

### Orders API
- **GET** `/api/orders` - Get user orders
- **POST** `/api/orders` - Create new order

## Database Schema

### Core Tables
- **profiles**: User profile information
- **products**: Product catalog with variants and options
- **carts**: Shopping cart instances
- **cart_items**: Items in shopping carts
- **orders**: Order records
- **order_items**: Items within orders

### Security
- **RLS**: Row Level Security enabled on all tables
- **Policies**: User-specific data access policies
- **Auth**: Supabase Auth integration

## State Management

### Context Providers
1. **QueryClientProvider**: TanStack Query for server state
2. **AuthProvider**: Authentication state and methods
3. **CartProvider**: Shopping cart state and operations

### State Flow
- **Server State**: TanStack Query for API data
- **Client State**: React Context for app state
- **Form State**: React Hook Form for form management
- **URL State**: Next.js router for navigation state

## Development Workflow

### Scripts
- `pnpm dev` - Development server with Turbopack
- `pnpm build` - Production build with Turbopack
- `pnpm start` - Production server
- `pnpm lint` - ESLint checking
- `pnpm lint:fix` - ESLint auto-fix

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL` - Site domain
- `NEXT_PUBLIC_STORE_NAME` - Store name
- `PRODUCT_STREAM_API` - External API endpoint

## Key Implementation Patterns

### 1. Server Components
- Product pages use server-side rendering
- Static generation with ISR (Incremental Static Regeneration)
- SEO optimization with metadata generation

### 2. Client Components
- Interactive features (cart, forms, animations)
- State management and user interactions
- Real-time updates and optimistic UI

### 3. API Design
- RESTful endpoints with proper HTTP methods
- Error handling and validation
- Authentication and authorization

### 4. Type Safety
- Comprehensive TypeScript types
- Zod validation schemas
- API response typing

## Performance Optimizations

### 1. Next.js Features
- App Router for better performance
- Turbopack for faster builds
- Image optimization with Next/Image
- Font optimization with Next/Font

### 2. Caching Strategy
- ISR for product pages (60s revalidation)
- TanStack Query for client-side caching
- Supabase connection pooling

### 3. Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking for unused code

## Security Considerations

### 1. Authentication
- Supabase Auth with JWT tokens
- Session management and refresh
- Protected routes and API endpoints

### 2. Data Protection
- Row Level Security (RLS) policies
- Input validation with Zod
- XSS protection with proper sanitization

### 3. API Security
- Authentication middleware
- Rate limiting considerations
- CORS configuration

## Deployment

### 1. Vercel Integration
- Automatic deployments from Git
- Environment variable management
- Analytics and speed insights

### 2. Database
- Supabase hosted PostgreSQL
- Connection pooling
- Backup and recovery

### 3. Monitoring
- Vercel Analytics
- Speed Insights
- Error tracking and logging

## Future Enhancements

Based on the development plan (`plan.md`):

### Phase 1: Foundation & State Management ✅
- [x] Consolidate state management
- [x] Install and configure TanStack Query
- [x] Providers setup

### Phase 2: Core E-commerce Features
- [ ] Product data & SSR/ISG optimization
- [ ] Product variants implementation
- [ ] Enhanced cart functionality

### Phase 3: Checkout & UI/UX Polish
- [ ] Checkout page implementation
- [ ] UI/UX improvements with Framer Motion
- [ ] Animation and transition enhancements

## Contributing

### Code Style
- TypeScript strict mode
- ESLint with Next.js config
- Prettier for code formatting
- Consistent naming conventions

### Git Workflow
- Feature branches
- Pull request reviews
- Automated testing (to be implemented)
- Semantic versioning

---

*This index provides a comprehensive overview of the OriGenZ e-commerce codebase. For specific implementation details, refer to the individual files and their inline documentation.*
