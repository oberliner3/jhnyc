"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-context";

export default function CartDrawer() {
	const {
		items,
		isOpen,
		toggleCart,
		removeItem,
		updateQuantity,
		clearCart,
		getTotalPrice,
	} = useCart();

	const totalPrice = getTotalPrice();

	return (
		<Sheet open={isOpen} onOpenChange={toggleCart}>
			<SheetContent className="flex flex-col bg-white">
				<SheetHeader>
					<SheetTitle>Shopping Cart</SheetTitle>
				</SheetHeader>

				{/* Cart Items */}
				<div className="flex-1 p-4 overflow-y-auto">
					{items.length === 0 ? (
						<div className="py-8 text-center">
							<p className="mb-4 text-gray-500">Your cart is empty</p>
							<Button onClick={toggleCart}>Continue Shopping</Button>
						</div>
					) : (
						<div className="space-y-4">
							{items.map((item) => {
								const price = item.product.price;
								const imageUrl = item.product.images?.[0]?.src || "/og.png";

								return (
									<Card key={`${item.product.id}-${item.variant}`}>
										<CardContent className="p-4">
											<div className="flex gap-3">
												{/* Product Image */}
												<div className="relative bg-gray-100 rounded w-16 h-16 overflow-hidden">
													<Image
														src={imageUrl}
														alt={item.product.title || item.product.handle}
														fill
														className="object-cover"
														sizes="64px"
													/>
												</div>

												{/* Product Info */}
												<div className="flex-1 min-w-0">
													<h3 className="mb-1 font-medium text-sm line-clamp-2">
														{item.product.title}
													</h3>
													{item.variant &&
														item.variant.title !== "Default Title" && (
															<p className="mb-1 text-gray-500 text-xs">
																{item.variant.title}
															</p>
														)}
													<p className="font-semibold text-sm">
														${price.toFixed(2)}
													</p>
												</div>

												{/* Remove Button */}
												<Button
													variant="ghost"
													size="icon"
													className="w-8 h-8"
													onClick={() =>
														removeItem(item.product.id, item.variant.id || "0")
													}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>

											{/* Quantity Controls */}
											<div className="flex justify-between items-center mt-3">
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="icon"
														className="w-8 h-8"
														onClick={() =>
															updateQuantity(
																item.product.id,
																item.variant?.id || "0",
																item.quantity - 1,
															)
														}
													>
														<Minus className="w-3 h-3" />
													</Button>
													<Badge variant="secondary" className="px-3">
														{item.quantity}
													</Badge>
													<Button
														variant="outline"
														size="icon"
														className="w-8 h-8"
														onClick={() =>
															updateQuantity(
																item.product.id,
																item.variant?.id || " 0",
																item.quantity + 1,
															)
														}
													>
														<Plus className="w-3 h-3" />
													</Button>
												</div>
												<p className="font-semibold text-sm">
													${(price * item.quantity).toFixed(2)}
												</p>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				{items.length > 0 && (
					<SheetFooter>
						<div className="space-y-4 p-4 border-t w-full">
							{/* Total */}
							<div className="flex justify-between items-center font-semibold text-lg">
								<span>Total:</span>
								<span>${totalPrice.toFixed(2)}</span>
							</div>

							{/* Actions */}
							<div className="space-y-2">
								<Button
									className="w-full"
									size="lg"
									onClick={() => console.log(items)}
								>
									Checkout
								</Button>
								<Link href="/cart" className="block">
									<Button
										variant="outline"
										className="w-full"
										onClick={toggleCart}
									>
										<ShoppingCart className="mr-2 w-4 h-4" />
										View Cart
									</Button>
								</Link>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											variant="destructive"
											className="opacity-50 hover:opacity-100 w-full text-neutral-200"
										>
											Clear Cart
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Are you sure?</AlertDialogTitle>
											<AlertDialogDescription>
												This will remove all items from your cart. This action
												cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={clearCart}>
												Clear Cart
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	);
}
