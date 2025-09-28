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
import { AccountDropdown } from "./account-dropdown";
import { MobileNav } from "./mobile-nav";

export function Header() {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const { getTotalItems, toggleCart } = useCart();
	const cartItemCount = getTotalItems();

	return (
		<header className="top-0 z-50 sticky bg-white/95 supports-backdrop-filter:bg-white/60 shadow-sm backdrop-blur border-b w-full">
			<div className="flex justify-between items-center px-4 h-16 container">
				{/* Mobile menu */}
				<MobileNav />

				{/* Logo */}
				<Logo className="md:mr-8" />

				{/* Desktop navigation */}
				<nav className="hidden md:flex flex-1 items-center space-x-8">
					{NAVIGATION_ITEMS.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="group relative font-medium text-gray-700 hover:text-primary text-sm transition-colors"
						>
							{item.name}
							<span className="-bottom-1 left-0 absolute bg-primary w-0 group-hover:w-full h-0.5 transition-all"></span>
						</Link>
					))}
				</nav>

				{/* Search bar - Desktop */}
				<div className="hidden md:block flex-1 mx-8 max-w-md">
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
						onClick={toggleCart}
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
			<CartDrawer />
		</header>
	);
}
