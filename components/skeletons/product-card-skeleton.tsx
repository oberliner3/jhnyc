import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
	return (
		<div className="group relative bg-white hover:shadow-lg border border-gray-200 rounded-lg overflow-hidden transition-shadow duration-300">
			{/* Image skeleton */}
			<div className="relative aspect-square overflow-hidden">
				<Skeleton className="w-full h-full" />
			</div>

			{/* Content skeleton */}
			<div className="space-y-3 p-4">
				{/* Title skeleton */}
				<Skeleton className="w-3/4 h-4" />

				{/* Description skeleton */}
				<Skeleton className="w-full h-3" />
				<Skeleton className="w-2/3 h-3" />

				{/* Rating skeleton */}
				<div className="flex items-center space-x-2">
					<div className="flex space-x-1">
						{[...Array(5)].map((_, i) => (
							<Skeleton
								key={`star-${i}`}
								className="rounded-full w-3 h-3"
							/>
						))}
					</div>
					<Skeleton className="w-12 h-3" />
				</div>

				{/* Price skeleton */}
				<div className="flex items-center space-x-2">
					<Skeleton className="w-16 h-5" />
					<Skeleton className="w-12 h-4" />
				</div>

				{/* Button skeleton */}
				<Skeleton className="rounded-md w-full h-10" />
			</div>
		</div>
	);
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
	return (
		<div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{[...Array(count)].map((_, i) => (
				<ProductCardSkeleton key={`product-card-${i}`} />
			))}
		</div>
	);
}
