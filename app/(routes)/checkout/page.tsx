"use client";

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	CreditCard,
	Lock,
	Mail,
	MapPin,
	Phone,
	Shield,
	Truck,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations";
import { handleCheckout } from "./actions";

interface CheckoutFormData {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	postalCode: string;
	country: string;
	phone?: string;
	apartment?: string;
}

export default function CheckoutPage() {
	const router = useRouter();
	const { items, getTotalPrice, clearCart } = useCart();
	const { user } = useAuth();
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<CheckoutFormData>({
		email: user?.email || "",
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		postalCode: "",
		country: "US",
		phone: "",
		apartment: "",
	});

	const totalPrice = getTotalPrice();
	const shipping = totalPrice > 50 ? 0 : 9.99;
	const tax = totalPrice * 0.08; // 8% tax
	const finalTotal = totalPrice + shipping + tax;

	const inputFirtNameId = useId();
	const inputLastNameId = useId();
	const inputEmailId = useId();
	const inputPhoneId = useId();
	const inputCityId = useId();
	const inputAddressId = useId();
	const inputCountryId = useId();
	const inputApartmentId = useId();
	const inputPostalCodeId = useId();

	useEffect(() => {
		if (items.length === 0) {
			router.push("/cart");
		}
	}, [items, router]);

	const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsProcessing(true);
		setError(null);

		try {
			// Validate form data
			const validatedData = checkoutSchema.parse(formData);

			// Create order data
			const orderData = {
				items: items.map((item) => ({
					productId: item.product.id,
					variantId: item.variant.id,
					quantity: item.quantity,
					price: item.variant.price,
				})),
				customer: validatedData,
				totals: {
					subtotal: totalPrice,
					shipping,
					tax,
					total: finalTotal,
				},
			};

			// Process checkout
			const result = await handleCheckout(orderData);

			if (result.success) {
				// Clear cart and redirect to success page
				clearCart();
				router.push(`/checkout/success?order=${result.orderId}`);
			} else {
				setError(result.error || "Checkout failed. Please try again.");
			}
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsProcessing(false);
		}
	};

	if (items.length === 0) {
		return null; // Will redirect
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/cart"
						className="inline-flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900 text-sm"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Cart
					</Link>
					<div className="flex justify-between items-center">
						<div>
							<h1 className="font-bold text-2xl tracking-tight">Checkout</h1>
						</div>
					</div>
				</div>

				<div className="gap-8 grid lg:grid-cols-[2fr_1fr]">
					{/* Checkout Form */}
					<div className="space-y-6">
						{/* Express Checkout */}
						<div className="bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Express checkout</h2>
							<div className="space-y-3">
								<Button
									variant="outline"
									className="bg-purple-600 hover:bg-purple-700 border-purple-600 w-full h-12 text-white"
								>
									Shop Pay
								</Button>
								<Button
									variant="outline"
									className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500 w-full h-12 text-white"
								>
									PayPal
								</Button>
								<Button
									variant="outline"
									className="bg-black hover:bg-gray-800 border-black w-full h-12 text-white"
								>
									Google Pay
								</Button>
							</div>
							<div className="flex items-center my-6">
								<Separator className="flex-1" />
								<span className="px-4 text-gray-500 text-sm">OR</span>
								<Separator className="flex-1" />
							</div>
						</div>

						{/* Contact Information */}
						<div className="bg-white p-6 border rounded-lg">
							<div className="flex justify-between items-center mb-4">
								<h2 className="font-semibold text-lg">Contact</h2>
								<Link
									href="/auth/signin"
									className="text-blue-600 text-sm hover:underline"
								>
									Sign in
								</Link>
							</div>
							<div>
								<Label htmlFor={inputEmailId}>
									Email or mobile phone number
								</Label>
								<Input
									id={inputEmailId}
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="Enter your email or phone"
									required
									className="mt-1"
								/>
							</div>
						</div>

						{/* Delivery Information */}
						<div className="bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Delivery</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Country/Region */}
								<div>
									<Label htmlFor={inputCountryId}>Country/Region</Label>
									<Input
										id={inputCountryId}
										value={formData.country}
										onChange={(e) =>
											handleInputChange("country", e.target.value)
										}
										required
										className="mt-1"
									/>
								</div>

								{/* Name Fields */}
								<div className="gap-4 grid grid-cols-2">
									<div>
										<Label htmlFor={inputFirtNameId}>
											First name (optional)
										</Label>
										<Input
											id={inputFirtNameId}
											value={formData.firstName}
											onChange={(e) =>
												handleInputChange("firstName", e.target.value)
											}
											className="mt-1"
										/>
									</div>
									<div>
										<Label htmlFor={inputLastNameId}>Last name</Label>
										<Input
											id={inputLastNameId}
											value={formData.lastName}
											onChange={(e) =>
												handleInputChange("lastName", e.target.value)
											}
											required
											className="mt-1"
										/>
									</div>
								</div>

								{/* Address */}
								<div>
									<Label htmlFor={inputAddressId}>Address</Label>
									<Input
										id={inputAddressId}
										value={formData.address}
										onChange={(e) =>
											handleInputChange("address", e.target.value)
										}
										placeholder="123 Main Street"
										required
										className="mt-1"
									/>
								</div>

								{/* Apartment */}
								<div>
									<Label htmlFor={inputApartmentId}>
										Apartment, suite, etc. (optional)
									</Label>
									<Input
										id={inputApartmentId}
										value={formData.apartment}
										onChange={(e) =>
											handleInputChange("apartment", e.target.value)
										}
										placeholder="Apt 4B"
										className="mt-1"
									/>
								</div>

								{/* City and Postal Code */}
								<div className="gap-4 grid grid-cols-2">
									<div>
										<Label htmlFor={inputPostalCodeId}>
											Postal code (optional)
										</Label>
										<Input
											id={inputPostalCodeId}
											value={formData.postalCode}
											onChange={(e) =>
												handleInputChange("postalCode", e.target.value)
											}
											className="mt-1"
										/>
									</div>
									<div>
										<Label htmlFor={inputCityId}>City</Label>
										<Input
											id={inputCityId}
											value={formData.city}
											onChange={(e) =>
												handleInputChange("city", e.target.value)
											}
											required
											className="mt-1"
										/>
									</div>
								</div>

								{/* Phone */}
								<div>
									<Label htmlFor={inputPhoneId}>Phone number (optional)</Label>
									<Input
										id={inputPhoneId}
										type="tel"
										value={formData.phone}
										onChange={(e) => handleInputChange("phone", e.target.value)}
										placeholder="(555) 123-4567"
										className="mt-1"
									/>
								</div>
							</form>
						</div>

						{/* Shipping Method */}
						<div className="bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Shipping method</h2>
							<div className="space-y-3">
								<div className="flex justify-between items-center bg-gray-50 p-4 border rounded-lg">
									<div className="flex items-center gap-3">
										<input
											type="radio"
											name="shipping"
											defaultChecked
											className="w-4 h-4"
										/>
										<div>
											<p className="font-medium">Free Shipping</p>
											<p className="text-gray-600 text-sm">Standard delivery</p>
										</div>
									</div>
									<Badge
										variant="secondary"
										className="bg-green-100 text-green-800"
									>
										FREE
									</Badge>
								</div>
							</div>
						</div>

						{/* Payment */}
						<div className="bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Payment</h2>
							<p className="mb-4 text-gray-600 text-sm">
								All transactions are secure and encrypted.
							</p>

							<div className="space-y-4">
								{/* Credit Card Option */}
								<div className="p-4 border rounded-lg">
									<div className="flex items-center gap-3 mb-3">
										<input
											type="radio"
											name="payment"
											defaultChecked
											className="w-4 h-4"
										/>
										<div className="flex items-center gap-2">
											<span className="font-medium">Credit card</span>
											<div className="flex items-center gap-1">
												<Image
													src="/payment-logos/cards/visa.svg"
													alt="Visa"
													width={24}
													height={16}
													className="object-contain"
												/>
												<Image
													src="/payment-logos/cards/mastercard.svg"
													alt="Mastercard"
													width={24}
													height={16}
													className="object-contain"
												/>
												<Image
													src="/payment-logos/cards/american-express.svg"
													alt="American Express"
													width={24}
													height={16}
													className="object-contain"
												/>
												<span className="text-gray-500 text-xs">+5</span>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<Input placeholder="Card number" />
										<div className="gap-3 grid grid-cols-2">
											<Input placeholder="MM/YY" />
											<Input placeholder="CVC" />
										</div>
									</div>
								</div>

								{/* Billing Address */}
								<div className="flex items-center gap-2">
									<input type="checkbox" defaultChecked className="w-4 h-4" />
									<Label className="text-sm">
										Use shipping address as billing address
									</Label>
								</div>

								{/* Alternative Payment Methods */}
								<div className="space-y-3">
									<div className="flex items-center gap-3 p-3 border rounded-lg">
										<input type="radio" name="payment" className="w-4 h-4" />
										<div className="flex items-center gap-2">
											<span className="font-medium">PayPal</span>
											<Image
												src="/payment-logos/apm/paypal.svg"
												alt="PayPal"
												width={24}
												height={16}
												className="object-contain"
											/>
										</div>
									</div>
									<div className="flex items-center gap-3 p-3 border rounded-lg">
										<input type="radio" name="payment" className="w-4 h-4" />
										<span className="font-medium">Cash on Delivery (COD)</span>
									</div>
								</div>
							</div>
						</div>

						{/* Remember Me */}
						<div className="bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Remember me</h2>
							<div className="flex items-center gap-2">
								<input type="checkbox" className="w-4 h-4" />
								<Label className="text-sm">
									Save my information for a faster checkout with a Shop account
								</Label>
							</div>
						</div>

						{error && (
							<div className="flex items-center gap-2 bg-red-50 p-3 border border-red-200 rounded-md">
								<AlertCircle className="w-4 h-4 text-red-600" />
								<span className="text-red-600 text-sm">{error}</span>
							</div>
						)}

						{/* Complete Order Button */}
						<Button
							onClick={handleSubmit}
							className="bg-blue-600 hover:bg-blue-700 w-full h-12 text-white"
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>
									<div className="mr-2 border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
									Processing...
								</>
							) : (
								`Complete order - ${formatPrice(finalTotal)}`
							)}
						</Button>

						{/* Shop Account Info */}
						<p className="text-gray-600 text-xs text-center">
							Your info will be saved to a Shop account. By continuing, you
							agree to Shop&apos;s Terms of Service and acknowledge the Privacy
							Policy.
						</p>

						{/* Footer Links */}
						<div className="flex flex-wrap justify-center gap-4 text-gray-600 text-xs">
							<Link href="/policies/refund" className="hover:underline">
								Refund policy
							</Link>
							<Link href="/policies/shipping" className="hover:underline">
								Shipping
							</Link>
							<Link href="/policies/privacy" className="hover:underline">
								Privacy policy
							</Link>
							<Link href="/policies/terms" className="hover:underline">
								Terms of service
							</Link>
							<Link href="/contact" className="hover:underline">
								Contact
							</Link>
						</div>
					</div>

					{/* Order Summary */}
					<div className="space-y-6">
						<div className="top-8 sticky bg-white p-6 border rounded-lg">
							<h2 className="mb-4 font-semibold text-lg">Order summary</h2>

							{/* Items */}
							<div className="space-y-4 mb-6">
								{items.map((item) => (
									<div
										key={`${item.product.id}-${item.variant.id}`}
										className="flex gap-3"
									>
										<div className="relative flex-shrink-0 bg-gray-100 rounded-md w-16 h-16 overflow-hidden">
											<Image
												src={item.image || "/placeholder.svg"}
												alt={item.name}
												fill
												className="object-cover"
												sizes="64px"
											/>
											<div className="-top-1 -right-1 absolute flex justify-center items-center bg-gray-800 rounded-full w-5 h-5 text-white text-xs">
												{item.quantity}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm line-clamp-2 leading-tight">
												{item.name}
											</h4>
											{item.variant.title !== "Default Title" && (
												<p className="mt-1 text-gray-600 text-xs">
													{item.variant.title}
												</p>
											)}
											<div className="flex justify-between items-center mt-2">
												<span className="text-gray-600 text-sm">
													Qty: {item.quantity}
												</span>
												<span className="font-medium text-sm">
													{formatPrice(item.variant.price * item.quantity)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>

							<Separator className="my-4" />

							{/* Totals */}
							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>{formatPrice(totalPrice)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Shipping</span>
									<span>
										{shipping === 0 ? (
											<Badge
												variant="secondary"
												className="bg-green-100 text-green-800 text-xs"
											>
												FREE
											</Badge>
										) : (
											formatPrice(shipping)
										)}
									</span>
								</div>
								<Separator />
								<div className="flex justify-between font-semibold text-lg">
									<span>Total</span>
									<span>{formatPrice(finalTotal)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
