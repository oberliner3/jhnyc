"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { CUSTOMER_REVIEWS } from "@/lib/data/reviews";
import type { Review } from "@/lib/types";

export function ProductReviews() {
  return (
    <div className="space-y-8">
      <h2 className="font-bold text-2xl tracking-tight">Customer Reviews</h2>
      {CUSTOMER_REVIEWS.map((review: Review) => (
        <div key={review.id} className="flex gap-4">
          <Image
            src={review.avatar || "/placeholder.svg"}
            alt={review.name}
            width={48}
            height={48}
            className="rounded-full w-12 h-12 object-cover"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{review.name}</h3>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`${review.id}-${i}`}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-sm">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
