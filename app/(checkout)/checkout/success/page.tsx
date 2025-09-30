"use client";

import {
	ArrowRight,
	CheckCircle,
	Home,
	Mail,
	Package,
	ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("order");
	const [orderDetails, setOrderDetails] = useState<{
		id: string;
		status: string;
		total: string;
		estimatedDelivery: string;
	} | null>(null);

	useEffect(() => {
		if (orderId) {
			// TODO: In a real app, you'd fetch order details from your API
			setOrderDetails({
				id: orderId,
				status: "Confirmed",
				total: "$99.99",
				estimatedDelivery: "3-5 business days",
			});
		}
	}, [orderId]);

	return (
		<div className="px-4 py-8 max-w-2xl container">
			<div className="mb-8 text-center">
				<div className="flex justify-center items-center bg-green-100 mx-auto mb-4 rounded-full w-16 h-16">
					<CheckCircle className="w-8 h-8 text-green-600" />
				</div>
				<h1 className="mb-2 font-bold text-gray-900 text-3xl">
					Order Confirmed!
				</h1>
				<p className="text-gray-600">
					Thank you for your purchase. We&apos;ve received your order and will
					process it shortly.
				</p>
			</div>

			{orderDetails && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="w-5 h-5" />
							Order Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-gray-600 text-sm">Order Number</span>
							<span className="font-medium">#{orderDetails.id}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 text-sm">Status</span>
							<Badge
								variant="secondary"
								className="bg-green-100 text-green-800"
							>
								{orderDetails.status}
							</Badge>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 text-sm">Total</span>
							<span className="font-medium">{orderDetails.total}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600 text-sm">Estimated Delivery</span>
							<span className="font-medium">
								{orderDetails.estimatedDelivery}
							</span>
						</div>
					</CardContent>
				</Card>
			)}

			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="w-5 h-5" />
						What&apos;s Next?
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start gap-3">
						<div className="flex flex-shrink-0 justify-center items-center bg-blue-100 mt-0.5 rounded-full w-6 h-6">
							<span className="font-medium text-blue-600 text-xs">1</span>
						</div>
						<div>
							<h4 className="font-medium text-sm">Order Confirmation</h4>
							<p className="text-gray-600 text-sm">
								You&apos;ll receive an email confirmation with your order
								details shortly.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<div className="flex flex-shrink-0 justify-center items-center bg-blue-100 mt-0.5 rounded-full w-6 h-6">
							<span className="font-medium text-blue-600 text-xs">2</span>
						</div>
						<div>
							<h4 className="font-medium text-sm">Processing</h4>
							<p className="text-gray-600 text-sm">
								We&apos;ll prepare your order and send you tracking information
								once it ships.
							</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<div className="flex flex-shrink-0 justify-center items-center bg-blue-100 mt-0.5 rounded-full w-6 h-6">
							<span className="font-medium text-blue-600 text-xs">3</span>
						</div>
						<div>
							<h4 className="font-medium text-sm">Delivery</h4>
							<p className="text-gray-600 text-sm">
								Your order will arrive at your doorstep within the estimated
								timeframe.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex sm:flex-row flex-col gap-4">
				<Button asChild className="flex-1">
					<Link href="/account/orders">
						<Package className="mr-2 w-4 h-4" />
						View Order Status
					</Link>
				</Button>
				<Button variant="outline" asChild className="flex-1">
					<Link href="/products">
						<ShoppingBag className="mr-2 w-4 h-4" />
						Continue Shopping
					</Link>
				</Button>
			</div>

			<div className="mt-8 text-center">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
				>
					<Home className="w-4 h-4" />
					Back to Home
					<ArrowRight className="w-4 h-4" />
				</Link>
			</div>
		</div>
	);
}
