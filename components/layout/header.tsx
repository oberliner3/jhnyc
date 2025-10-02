"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CartDrawer from "@/components/cart/cart-drawer";
import { Logo } from "@/components/common/logo";
import { SearchBar } from "@/components/common/search-bar";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { useClickTracking } from "@/lib/experience-tracking/hooks";
import { AccountDropdown } from "./account-dropdown";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getTotalItems, toggleCart } = useCart();
  const cartItemCount = getTotalItems();
  
  // Experience tracking hooks
  const trackLogoClick = useClickTracking('header-logo');
  const trackSearchToggle = useClickTracking('header-search-toggle');
  const trackCartToggle = useClickTracking('header-cart-toggle', {
    cartItemCount
  });
  const trackNavClick = useClickTracking('header-navigation');

  return (
    <header className="top-0 z-50 sticky bg-white/55 supports-backdrop-filter:bg-white/60 shadow-sm backdrop-blur w-full">
      <div className="flex justify-between items-center px-4 h-16 container">
        {/* Mobile menu */}
        <MobileNav />

        {/* Logo */}
        <div className="flex-1 md:flex-none" onClick={() => trackLogoClick()}>
          <Logo />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-medium text-gray-700 hover:text-primary text-sm transition-colors"
              onClick={() => trackNavClick(undefined, {
                navigationItem: item.name,
                destination: item.href
              })}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex flex-1 justify-end items-center space-x-3">
          {/* Search */}
          <IconButton
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              trackSearchToggle(e);
              setIsSearchOpen(!isSearchOpen);
            }}
            aria-label="Open search bar"
          >
            <Search className="w-5 h-5" />
            <span className="sr-only">Search</span>
          </IconButton>

          {/* Account */}
          <AccountDropdown />

          {/* Cart */}
          <IconButton
            variant="ghost"
            size="sm"
            className="relative text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              trackCartToggle(e);
              toggleCart();
            }}
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <Badge
                variant="destructive"
                className="-top-1 -right-1 absolute bg-red-500 hover:bg-red-600 p-0 rounded-full w-5 h-5 text-xs"
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
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-background p-4 border-t">
              <SearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop search */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden md:block overflow-hidden"
          >
            <div className="bg-background p-4 border-t">
              <SearchBar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CartDrawer />
    </header>
  );
}
