import { Skeleton } from "@/components/ui/skeleton";

export function CartItemSkeleton() {
	return (
		<div className="flex items-center space-x-4 p-4 border-b">
			{/* Image skeleton */}
			<div className="relative w-20 h-20">
				<Skeleton className="rounded-md w-full h-full" />
			</div>

			{/* Content skeleton */}
			<div className="flex-1 space-y-2">
				<Skeleton className="w-3/4 h-4" />
				<Skeleton className="w-1/2 h-3" />
				<Skeleton className="w-16 h-4" />
			</div>

			{/* Quantity skeleton */}
			<div className="flex items-center space-x-2">
				<Skeleton className="rounded w-8 h-8" />
				<Skeleton className="w-8 h-4" />
				<Skeleton className="rounded w-8 h-8" />
			</div>

			{/* Price skeleton */}
			<Skeleton className="w-16 h-4" />

			{/* Remove button skeleton */}
			<Skeleton className="rounded w-8 h-8" />
		</div>
	);
}

export function CartSkeleton() {
	return (
		<div className="px-4 py-8 max-w-6xl container">
			{/* Header */}
			<div className="mb-8">
				<Skeleton className="mb-2 w-32 h-8" />
				<Skeleton className="w-48 h-4" />
			</div>

			<div className="gap-8 grid lg:grid-cols-3">
				{/* Cart items */}
				<div className="lg:col-span-2">
					<div className="bg-white border rounded-lg">
						{/* Cart header */}
						<div className="p-4 border-b">
							<Skeleton className="w-24 h-5" />
						</div>

						{/* Cart items */}
						<div className="divide-y">
							{[...Array(3)].map((_, i) => (
								<CartItemSkeleton key={`${Date.now()}-${i}`} />
							))}
						</div>
					</div>
				</div>

				{/* Order summary */}
				<div className="lg:col-span-1">
					<div className="top-4 sticky bg-white p-6 border rounded-lg">
						<Skeleton className="mb-6 w-32 h-6" />

						<div className="space-y-4">
							<div className="flex justify-between">
								<Skeleton className="w-16 h-4" />
								<Skeleton className="w-16 h-4" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="w-20 h-4" />
								<Skeleton className="w-16 h-4" />
							</div>
							<div className="flex justify-between">
								<Skeleton className="w-12 h-4" />
								<Skeleton className="w-16 h-4" />
							</div>
							<div className="pt-4 border-t">
								<div className="flex justify-between">
									<Skeleton className="w-16 h-5" />
									<Skeleton className="w-20 h-5" />
								</div>
							</div>
						</div>

						<div className="space-y-3 mt-6">
							<Skeleton className="rounded-md w-full h-12" />
							<Skeleton className="rounded-md w-full h-10" />
						</div>

						<div className="space-y-2 mt-6">
							<Skeleton className="w-full h-3" />
							<Skeleton className="w-3/4 h-3" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
