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
