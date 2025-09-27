import { Skeleton } from "@/components/ui/skeleton"

export function CollectionHeaderSkeleton() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container px-4">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function CollectionFiltersSkeleton() {
  return (
    <div className="bg-white border-b">
      <div className="container px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort dropdown skeleton */}
          <Skeleton className="h-10 w-32" />
          
          {/* Filter buttons skeleton */}
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          
          {/* View toggle skeleton */}
          <div className="ml-auto flex space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CollectionSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CollectionHeaderSkeleton />
      <CollectionFiltersSkeleton />
      
      <div className="container px-4 py-8">
        {/* Product count skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-32" />
        </div>
        
        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-3 w-3 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination skeleton */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
