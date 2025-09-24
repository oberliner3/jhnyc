import { Star } from 'lucide-react'
import Image from 'next/image'
import { CUSTOMER_REVIEWS } from '@/lib/data/reviews'

export function Reviews() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Here&apos;s what real
            customers have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CUSTOMER_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-background rounded-lg p-6 border shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;{review.comment}&quot;
              </p>
              <div className="flex items-center gap-3">
                {review.avatar && (
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{review.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {review.verified && (
                      <span className="text-green-600">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

