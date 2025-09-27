import { Skeleton } from "@/components/ui/skeleton"

export function CartItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      {/* Image skeleton */}
      <div className="w-20 h-20 relative">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Quantity skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      
      {/* Price skeleton */}
      <Skeleton className="h-4 w-16" />
      
      {/* Remove button skeleton */}
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="container px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            {/* Cart header */}
            <div className="p-4 border-b">
              <Skeleton className="h-5 w-24" />
            </div>
            
            {/* Cart items */}
            <div className="divide-y">
              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <Skeleton className="h-6 w-32 mb-6" />
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            
            <div className="mt-6 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
