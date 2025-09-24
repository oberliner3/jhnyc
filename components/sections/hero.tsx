import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative bg-linear-to-br via-black to-primary/5 overflow-hidden from-accent-forground/5">
			<div className="px-4 py-16 lg:py-24 container">
				<div className="items-center gap-8 lg:gap-12 grid lg:grid-cols-2">
					<div className="space-y-6 animate-fade-in">
						<div className="space-y-4">
							<div className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-full font-medium text-primary text-xs">
								✨ New Collection Available
							</div>
							<h1 className="font-bold text-4xl lg:text-6xl tracking-tight">
								Discover Your
								<span className="block gradient-text">Perfect Style</span>
							</h1>
							<p className="max-w-lg text-muted-foreground text-lg">
								Shop our curated collection of premium products designed for the
								modern lifestyle. Quality meets style in every piece.
							</p>
						</div>

						<div className="flex sm:flex-row flex-col gap-4">
							<Button size="lg" className="px-8 text-lg" asChild>
								<Link href="/products">
									Shop Now
									<ArrowRight className="ml-2 w-5 h-5" />
								</Link>
							</Button>
							<Button size="lg" variant="outline" className="px-8 text-lg">
								{/**
								 * TODO: PopUp VideoPlayer
								 */}
								<Play className="mr-2 w-5 h-5" />
								Watch Story
							</Button>
						</div>

						{/* Social Proof */}
						<div className="flex items-center gap-6 pt-8">
							<div className="text-center">
								<div className="font-bold text-2xl">10K+</div>
								<div className="text-muted-foreground text-sm">
									Happy Customers
								</div>
							</div>
							<div className="bg-border w-px h-8"></div>
							<div className="text-center">
								<div className="font-bold text-2xl">4.7</div>
								<div className="text-muted-foreground text-sm">
									Average Rating
								</div>
							</div>
							<div className="bg-border w-px h-8"></div>
							<div className="text-center">
								<div className="font-bold text-2xl">50+</div>
								<div className="text-muted-foreground text-sm">
									Premium Brands
								</div>
							</div>
						</div>
					</div>

					{/* Hero Image */}
					<div className="relative">
						<div className="relative bg-linear-to-br from-primary/20 to-secondary/20 rounded-2xl aspect-square lg:aspect-4/5 overflow-hidden">
							<Image
								src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"
								alt="Hero product showcase"
								fill
								className="object-cover"
								priority
							/>
							{/* Floating Cards */}
							<div className="top-6 right-6 absolute bg-white/90 shadow-lg backdrop-blur-sm p-4 rounded-lg">
								<div className="flex items-center gap-2">
									<div className="bg-green-500 rounded-full w-2 h-2"></div>
									<span className="font-medium text-sm">Free Shipping</span>
								</div>
							</div>
							<div className="bottom-6 left-6 absolute bg-white/90 shadow-lg backdrop-blur-sm p-4 rounded-lg">
								<div className="flex items-center gap-2">
									<span className="font-bold text-primary text-2xl">20%</span>
									<span className="text-sm">Off Today</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
