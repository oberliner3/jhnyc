'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Note: This would typically use a server action or API route
// For now, this is a client-side demo component

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<{orderNumber: string, status: string, trackingNumber: string, estimatedDelivery: string, items: {name: string, quantity: number}[], timeline: {status: string, date: string, completed: boolean}[]} | null>(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock order data for demonstration
    if (orderNumber.toLowerCase() === 'demo123') {
      setOrderData({
        orderNumber: 'DEMO123',
        status: 'shipped',
        trackingNumber: 'TRACK123456789',
        estimatedDelivery: '2025-01-05',
        items: [
          { name: 'Premium T-Shirt', quantity: 2 },
          { name: 'Cotton Hoodie', quantity: 1 }
        ],
        timeline: [
          { status: 'ordered', date: '2025-01-01', completed: true },
          { status: 'processing', date: '2025-01-02', completed: true },
          { status: 'shipped', date: '2025-01-03', completed: true },
          { status: 'delivered', date: '2025-01-05', completed: false },
        ]
      });
    } else {
      setError('Order not found. Please check your order number and email address.');
    }

    setIsLoading(false);
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    switch (status) {
      case 'ordered':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-yellow-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'Order Placed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your order details below to track the status and location of your package.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Track Order Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    type="text"
                    placeholder="Enter your order number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Try &quot;demo123&quot; for a sample order
                  </p>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Tracking...' : 'Track Order'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order #{orderData.orderNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{orderData.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{orderData.trackingNumber}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">{orderData.estimatedDelivery}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Items</p>
                    <div className="space-y-1">
                      {orderData.items.map((item, index: number) => (
                        <p key={index} className="text-sm">
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.timeline.map((step, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`flex-shrink-0 ${step.completed ? 'opacity-100' : 'opacity-50'}`}>
                          {getStatusIcon(step.status, step.completed)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {getStatusText(step.status)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step.completed ? step.date : `Expected ${step.date}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <div className="text-center mt-12 p-8 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about your order or need assistance, we&apos;re here to help.
            </p>
            <div className="space-x-4">
              <a
                href="/contact"
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="inline-block border border-input bg-background px-6 py-2 rounded-md hover:bg-accent transition-colors"
              >
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}