"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DraftOrder } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getProductPlaceholder } from "@/lib/placeholder";

export const dynamic = "force-dynamic";

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
      <h1 className="font-bold text-3xl lg:text-4xl tracking-tight">
        Your Orders
      </h1>
      {orders.length > 0 ? (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Order #{order.id}</CardTitle>
              <Badge
                variant={order.status === "Delivered" ? "success" : "secondary"}
              >
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>{new Date(order.date).toLocaleDateString()}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative rounded w-16 h-16 overflow-hidden">
                        <Image
                          src={
                            item.image
                              ? item.image.replace("https://cdn.shopify.com", "https://jhuangnyc.com/cdn")
                              : getProductPlaceholder(item.name, 200, 200)
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-sm">
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
