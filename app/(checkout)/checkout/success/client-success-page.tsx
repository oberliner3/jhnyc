// app/checkout/success/ClientSuccessPage.tsx
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
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientSuccessPageProps {
  orderId: string;
}

export function ClientSuccessPage({ orderId }: ClientSuccessPageProps) {
  const [orderDetails, setOrderDetails] = useState<{
    id: string;
    status: string;
    total: string;
    estimatedDelivery: string;
  } | null>(null);

  useEffect(() => {
    // TODO: In a real app, you'd fetch order details from your API
    setOrderDetails({
      id: orderId,
      status: "Confirmed",
      total: "$99.99",
      estimatedDelivery: "3-5 business days",
    });
  }, [orderId]);

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. We've received your order and will
          process it shortly.
        </p>
      </div>

      {orderDetails && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Order Number</span>
              <span className="font-medium">#{orderDetails.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {orderDetails.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium">{orderDetails.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Delivery</span>
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
            <Mail className="h-5 w-5" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">Order Confirmation</h4>
              <p className="text-sm text-gray-600">
                You'll receive an email confirmation with your order details
                shortly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">Processing</h4>
              <p className="text-sm text-gray-600">
                We'll prepare your order and send you tracking information once
                it ships.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <h4 className="text-sm font-medium">Delivery</h4>
              <p className="text-sm text-gray-600">
                Your order will arrive at your doorstep within the estimated
                timeframe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/account/orders">
            <Package className="mr-2 h-4 w-4" />
            View Order Status
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/collections/all">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Home className="h-4 w-4" />
          Back to Home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
