import { Skeleton } from "@/components/ui/skeleton";

export function CollectionHeaderSkeleton() {
	return (
		<div className="bg-gray-50 py-12">
			<div className="px-4 container">
				<div className="space-y-4 text-center">
					<Skeleton className="mx-auto w-64 h-8" />
					<Skeleton className="mx-auto w-96 h-4" />
					<Skeleton className="mx-auto w-48 h-4" />
				</div>
			</div>
		</div>
	);
}

export function CollectionFiltersSkeleton() {
	return (
		<div className="bg-white border-b">
			<div className="px-4 py-4 container">
				<div className="flex flex-wrap items-center gap-4">
					{/* Sort dropdown skeleton */}
					<Skeleton className="w-32 h-10" />

					{/* Filter buttons skeleton */}
					<div className="flex space-x-2">
						{[...Array(4)].map((_, i) => (
							<Skeleton
								key={`${Date.now()}-${i}`}
								className="rounded-full w-20 h-8"
							/>
						))}
					</div>

					{/* View toggle skeleton */}
					<div className="flex space-x-2 ml-auto">
						<Skeleton className="rounded w-8 h-8" />
						<Skeleton className="rounded w-8 h-8" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function CollectionSkeleton() {
	return (
		<div className="bg-gray-50 min-h-screen">
			<CollectionHeaderSkeleton />
			<CollectionFiltersSkeleton />

			<div className="px-4 py-8 container">
				{/* Product count skeleton */}
				<div className="mb-6">
					<Skeleton className="w-32 h-5" />
				</div>

				{/* Product grid skeleton */}
				<div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(12)].map((_, i) => (
						<div
							key={`${Date.now()}-${i}`}
							className="bg-white border border-gray-200 rounded-lg overflow-hidden"
						>
							<Skeleton className="w-full aspect-square" />
							<div className="space-y-3 p-4">
								<Skeleton className="w-3/4 h-4" />
								<Skeleton className="w-full h-3" />
								<Skeleton className="w-2/3 h-3" />
								<div className="flex items-center space-x-2">
									<div className="flex space-x-1">
										{[...Array(5)].map((_, j) => (
											<Skeleton
												key={`${Date.now()}-${j}`}
												className="rounded-full w-3 h-3"
											/>
										))}
									</div>
									<Skeleton className="w-12 h-3" />
								</div>
								<div className="flex items-center space-x-2">
									<Skeleton className="w-16 h-5" />
									<Skeleton className="w-12 h-4" />
								</div>
								<Skeleton className="rounded-md w-full h-10" />
							</div>
						</div>
					))}
				</div>

				{/* Pagination skeleton */}
				<div className="flex justify-center mt-12">
					<div className="flex space-x-2">
						{[...Array(5)].map((_, i) => (
							<Skeleton
								key={`${Date.now()}-${i}`}
								className="rounded-md w-10 h-10"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
