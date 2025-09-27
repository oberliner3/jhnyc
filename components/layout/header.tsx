'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search } from 'lucide-react'
import { AccountDropdown } from './account-dropdown'
import { IconButton } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/common/logo'
import { SearchBar } from '@/components/common/search-bar'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { useCart } from '@/contexts/cart-context'
import CartDrawer from '@/components/cart/cart-drawer'
import { motion, AnimatePresence } from 'framer-motion'
import { MobileNav } from './mobile-nav'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { getTotalItems, toggleCart } = useCart()
  const cartItemCount = getTotalItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile menu */}
        <MobileNav />

        {/* Logo */}
        <Logo className="md:mr-8" />

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8 flex-1">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Search bar - Desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Mobile search */}
          <IconButton
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </IconButton>

          {/* Account */}
          <AccountDropdown />

          {/* Cart */}
          <IconButton 
            variant="ghost" 
            size="sm" 
            className="relative text-gray-600 hover:text-gray-900" 
            onClick={toggleCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-600"
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
