import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailsSkeleton() {
	return (
		<div className="px-4 py-8 max-w-6xl container">
			<div className="gap-8 grid lg:grid-cols-2">
				{/* Image Gallery Skeleton */}
				<div className="space-y-4">
					{/* Main Image */}
					<div className="relative rounded-lg aspect-square overflow-hidden">
						<Skeleton className="w-full h-full" />
					</div>

					{/* Thumbnail Images */}
					<div className="gap-2 grid grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div
								key={`${Date.now()}-${i}`}
								className="relative rounded-md aspect-square overflow-hidden"
							>
								<Skeleton className="w-full h-full" />
							</div>
						))}
					</div>
				</div>

				{/* Product Info Skeleton */}
				<div className="space-y-6">
					{/* Title */}
					<div className="space-y-2">
						<Skeleton className="w-3/4 h-8" />
						<Skeleton className="w-1/2 h-4" />
					</div>

					{/* Rating */}
					<div className="flex items-center space-x-2">
						<div className="flex space-x-1">
							{[...Array(5)].map((_, i) => (
								<Skeleton
									key={`${Date.now()}-${i}`}
									className="rounded-full w-4 h-4"
								/>
							))}
						</div>
						<Skeleton className="w-20 h-4" />
					</div>

					{/* Price */}
					<div className="space-y-2">
						<Skeleton className="w-24 h-8" />
						<Skeleton className="w-16 h-5" />
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Skeleton className="w-full h-4" />
						<Skeleton className="w-full h-4" />
						<Skeleton className="w-3/4 h-4" />
					</div>

					{/* Variants */}
					<div className="space-y-3">
						<Skeleton className="w-20 h-5" />
						<div className="flex space-x-2">
							{[...Array(3)].map((_, i) => (
								<Skeleton
									key={`${Date.now()}-${i}`}
									className="rounded-md w-16 h-10"
								/>
							))}
						</div>
					</div>

					{/* Quantity */}
					<div className="space-y-3">
						<Skeleton className="w-16 h-5" />
						<Skeleton className="rounded-md w-24 h-10" />
					</div>

					{/* Buttons */}
					<div className="space-y-3">
						<Skeleton className="rounded-md w-full h-12" />
						<Skeleton className="rounded-md w-full h-12" />
					</div>

					{/* Features */}
					<div className="space-y-3">
						{[...Array(3)].map((_, i) => (
							<div
								key={`${Date.now()}-${i}`}
								className="flex items-center space-x-2"
							>
								<Skeleton className="rounded-full w-4 h-4" />
								<Skeleton className="w-32 h-4" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Related Products Skeleton */}
			<div className="mt-16">
				<Skeleton className="mb-8 w-48 h-8" />
				<div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<div key={`${Date.now()}-${i}`} className="space-y-3">
							<Skeleton className="rounded-lg w-full aspect-square" />
							<Skeleton className="w-3/4 h-4" />
							<Skeleton className="w-1/2 h-4" />
							<Skeleton className="w-16 h-8" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
