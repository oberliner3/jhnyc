---
description: Repository Information Overview
alwaysApply: true
---

# Neo Stories Origins (Originz) Information

## Summary
A Next.js e-commerce application using the App Router pattern with TypeScript. The project emphasizes performance, accessibility, and a modular architecture. It integrates with Supabase for database and authentication, and includes features like analytics tracking, cart management, and PWA capabilities.

## Structure
- **app/**: Next.js App Router routes and API endpoints
  - **(routes)/**: Main application routes
  - **api/**: RESTful API endpoints
- **components/**: Reusable UI components
  - **ui/**: Base UI components following shadcn/ui patterns
  - **common/**: Shared components across the application
- **contexts/**: React Context providers for global state
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and shared code
- **public/**: Static assets
- **supabase/**: Supabase database migrations and configuration

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.9.2
**Runtime**: Next.js 15.5.4 with React 19.1.1
**Build System**: Next.js with Turbopack
**Package Manager**: pnpm

## Dependencies
**Main Dependencies**:
- Next.js 15.5.4 with App Router
- React 19.1.1
- @tanstack/react-query 5.90.2
- @supabase/supabase-js 2.58.0
- @upstash/redis 1.35.4
- Zod 4.1.11
- react-hook-form 7.63.0
- Tailwind CSS 3.4.17

**Development Dependencies**:
- ESLint 9.36.0
- TypeScript 5.9.2
- Tailwind CSS plugins
- Next.js ESLint plugins

## Build & Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
pnpm env:dev

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start
```

## Database & Authentication
**Database**: Supabase
**Authentication**: Supabase Auth with JWT
**Configuration**: Environment variables for Supabase URL and keys
**Data Models**: Products, Orders, Experience Tracking

## State Management
**Global State**: React Context API
- AuthProvider: Authentication state
- CartProvider: Shopping cart management
- PWAProvider: Progressive Web App features

**API Integration**:
- React Query for data fetching and caching
- Server actions for form submissions
- RESTful API endpoints in app/api/

## Performance Features
- MessagePack integration for efficient data serialization
- Redis caching via Upstash
- Next.js Image optimization
- Analytics and experience tracking with sampling controls
- PWA support with offline capabilities

## Testing
No formal testing framework is configured. The package.json includes a placeholder test script.
