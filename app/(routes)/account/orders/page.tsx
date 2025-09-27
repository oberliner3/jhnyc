'use client'

import { useEffect, useState } from 'react';
import type { DraftOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

async function getOrders(): Promise<DraftOrder[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  return res.json();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<DraftOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const userOrders = await getOrders();
        setOrders(userOrders);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Your Orders</h1>
      {orders.length > 0 ? (
        orders.map((order) => (
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
        ))
      ) : (
        <p>You have no orders.</p>
      )}
    </div>
  );
}
