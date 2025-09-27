import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedProductsSkeleton() {
  return (
    <div className="py-12 bg-white">
      <div className="container px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <Skeleton className="h-8 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Featured product grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Image skeleton */}
              <div className="aspect-square relative overflow-hidden">
                <Skeleton className="w-full h-full" />
                
                {/* Badge skeleton */}
                <div className="absolute top-4 left-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="p-6 space-y-4">
                {/* Category skeleton */}
                <Skeleton className="h-3 w-20" />
                
                {/* Title skeleton */}
                <Skeleton className="h-5 w-3/4" />
                
                {/* Description skeleton */}
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                
                {/* Rating skeleton */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-3 w-3 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
                
                {/* Price skeleton */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Button skeleton */}
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* View all button skeleton */}
        <div className="text-center mt-12">
          <Skeleton className="h-12 w-32 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function HeroSectionSkeleton() {
  return (
    <div className="relative bg-gray-100 min-h-[500px] flex items-center">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-32 rounded-md" />
              <Skeleton className="h-12 w-32 rounded-md" />
            </div>
          </div>
          
          {/* Image skeleton */}
          <div className="aspect-square relative">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
