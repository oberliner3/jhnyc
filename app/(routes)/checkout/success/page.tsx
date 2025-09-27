'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Package, 
  Mail, 
  ArrowRight,
  Home,
  ShoppingBag
} from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const [orderDetails, setOrderDetails] = useState<{
    id: string
    status: string
    total: string
    estimatedDelivery: string
  } | null>(null)

  useEffect(() => {
    if (orderId) {
      // In a real app, you'd fetch order details from your API
      setOrderDetails({
        id: orderId,
        status: 'Confirmed',
        total: '$99.99',
        estimatedDelivery: '3-5 business days'
      })
    }
  }, [orderId])

  return (
    <div className="container px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. We&apos;ve received your order and will process it shortly.
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
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Number</span>
              <span className="font-medium">#{orderDetails.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {orderDetails.status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-medium">{orderDetails.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Delivery</span>
              <span className="font-medium">{orderDetails.estimatedDelivery}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            What&apos;s Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Order Confirmation</h4>
              <p className="text-sm text-gray-600">
                You&apos;ll receive an email confirmation with your order details shortly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Processing</h4>
              <p className="text-sm text-gray-600">
                We&apos;ll prepare your order and send you tracking information once it ships.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Delivery</h4>
              <p className="text-sm text-gray-600">
                Your order will arrive at your doorstep within the estimated timeframe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link href="/account/orders">
            <Package className="h-4 w-4 mr-2" />
            View Order Status
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="text-center mt-8">
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
  )
}
