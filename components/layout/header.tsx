'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, ShoppingCart, Search } from 'lucide-react'
import { AccountDropdown } from './account-dropdown'
import { IconButton } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/common/logo'
import { SearchBar } from '@/components/common/search-bar'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { useCart } from '@/contexts/cart-context'
import CartDrawer from '@/components/cart/cart-drawer'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { getTotalItems, toggleCart } = useCart()
  const cartItemCount = getTotalItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <IconButton>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </IconButton>
          </SheetTrigger>
          <SheetContent side="left" className="w-80  bg-zinc-50 ">
            <div className="flex flex-col space-y-4 py-2">
              <div className="px-2">
                <Logo />
              </div>
              <nav className="flex flex-col space-y-2 gap-2 border-t ">
                {NAVIGATION_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors hover:shadow-sm hover:border-b p-2"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Logo className="md:mr-8" />

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8 flex-1">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile search */}
          <IconButton
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </IconButton>

          {/* Account */}
          <AccountDropdown />

          {/* Cart */}
          <IconButton className="relative" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {cartItemCount}
              </Badge>
            )}
            <span className="sr-only">Cart ({cartItemCount} items)</span>
          </IconButton>
        </div>
      </div>

      {/* Mobile search */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden md:hidden"
          >
            <div className="border-t bg-background p-4">
              <SearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer />
    </header>
  );
}
