'use client'

import { MOCK_ORDERS } from '@/lib/data/orders';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

export default function OrdersPage() {
  const orders: Order[] = MOCK_ORDERS;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Your Orders</h1>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order #{order.id}</CardTitle>
            <Badge variant={order.status === 'Delivered' ? 'success' : 'secondary'}>
              {order.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{new Date(order.date).toLocaleDateString()}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
