import { Star } from "lucide-react";
import Image from "next/image";
import { CUSTOMER_REVIEWS } from "@/lib/data/reviews";

export function Reviews() {
	return (
		<section className="bg-muted/30 py-16 lg:py-24">
			<div className="px-4 container">
				<div className="mb-12 text-center">
					<h2 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
						What Our Customers Say
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						Don&apos;t just take our word for it. Here&apos;s what real
						customers have to say about their experience.
					</p>
				</div>

				<div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{CUSTOMER_REVIEWS.map((review) => (
						<div
							key={review.id}
							className="bg-background shadow-sm p-6 border rounded-lg"
						>
							<div className="flex items-center gap-1 mb-4">
								{[...Array(4)].map((_, i) => (
									<Star
										key={`${review.id + i}`}
										className={`h-4 w-4 ${
											i < review.rating
												? "fill-yellow-400 text-yellow-400"
												: "text-muted-foreground/30"
										}`}
									/>
								))}
							</div>
							<p className="mb-6 text-muted-foreground">
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
									<div className="flex items-center gap-1 text-muted-foreground text-sm">
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
