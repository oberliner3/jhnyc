import { Skeleton } from "@/components/ui/skeleton";

export function AccountDashboardSkeleton() {
	return (
		<div className="px-4 py-8 max-w-6xl container">
			{/* Header */}
			<div className="mb-8">
				<Skeleton className="mb-2 w-48 h-8" />
				<Skeleton className="w-96 h-4" />
			</div>

			<div className="gap-8 grid lg:grid-cols-4">
				{/* Sidebar */}
				<div className="lg:col-span-1">
					<div className="space-y-4 bg-white p-6 border rounded-lg">
						<Skeleton className="w-24 h-6" />
						{[...Array(6)].map((_, i) => (
							<div
								key={`${Date.now()}-${i}`}
								className="flex items-center space-x-3"
							>
								<Skeleton className="w-4 h-4" />
								<Skeleton className="w-20 h-4" />
							</div>
						))}
					</div>
				</div>

				{/* Main content */}
				<div className="space-y-6 lg:col-span-3">
					{/* Welcome card */}
					<div className="bg-white p-6 border rounded-lg">
						<Skeleton className="mb-4 w-48 h-6" />
						<Skeleton className="mb-2 w-full h-4" />
						<Skeleton className="w-3/4 h-4" />
					</div>

					{/* Stats cards */}
					<div className="gap-6 grid grid-cols-1 md:grid-cols-3">
						{[...Array(3)].map((_, i) => (
							<div
								key={`${Date.now()}-${i}`}
								className="bg-white p-6 border rounded-lg"
							>
								<Skeleton className="mb-2 w-16 h-8" />
								<Skeleton className="w-24 h-4" />
							</div>
						))}
					</div>

					{/* Recent orders */}
					<div className="bg-white p-6 border rounded-lg">
						<Skeleton className="mb-4 w-32 h-6" />
						<div className="space-y-4">
							{[...Array(3)].map((_, i) => (
								<div
									key={`${Date.now()}-${i}`}
									className="flex justify-between items-center p-4 border rounded-lg"
								>
									<div className="space-y-2">
										<Skeleton className="w-32 h-4" />
										<Skeleton className="w-24 h-3" />
									</div>
									<div className="space-y-2">
										<Skeleton className="w-16 h-4" />
										<Skeleton className="w-20 h-3" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function OrdersListSkeleton() {
	return (
		<div className="space-y-6">
			{[...Array(5)].map((_, i) => (
				<div
					key={`${Date.now()}-${i}`}
					className="bg-white p-6 border rounded-lg"
				>
					<div className="flex justify-between items-center mb-4">
						<div className="space-y-2">
							<Skeleton className="w-32 h-5" />
							<Skeleton className="w-24 h-3" />
						</div>
						<Skeleton className="rounded-full w-20 h-6" />
					</div>

					<div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-4">
						<div className="space-y-1">
							<Skeleton className="w-16 h-3" />
							<Skeleton className="w-24 h-4" />
						</div>
						<div className="space-y-1">
							<Skeleton className="w-20 h-3" />
							<Skeleton className="w-32 h-4" />
						</div>
						<div className="space-y-1">
							<Skeleton className="w-12 h-3" />
							<Skeleton className="w-16 h-4" />
						</div>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex space-x-2">
							{[...Array(2)].map((_, j) => (
								<Skeleton
									key={`${Date.now()}-${j}`}
									className="rounded-md w-20 h-8"
								/>
							))}
						</div>
						<Skeleton className="rounded-md w-24 h-8" />
					</div>
				</div>
			))}
		</div>
	);
}

export function AddressListSkeleton() {
	return (
		<div className="space-y-4">
			{[...Array(3)].map((_, i) => (
				<div
					key={`${Date.now()}-${i}`}
					className="bg-white p-6 border rounded-lg"
				>
					<div className="flex justify-between items-start mb-4">
						<div className="space-y-2">
							<Skeleton className="w-32 h-5" />
							<Skeleton className="w-48 h-4" />
							<Skeleton className="w-40 h-4" />
							<Skeleton className="w-32 h-4" />
						</div>
						<div className="flex space-x-2">
							<Skeleton className="rounded-md w-16 h-8" />
							<Skeleton className="rounded-md w-16 h-8" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
