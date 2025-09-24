import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-red-500/50 via-purple-500 to-blue-500/50">
      <div className="container px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                ✨ New Collection Available
              </div>
              <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
                Discover Your
                <span className="gradient-text block">Perfect Style</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Shop our curated collection of premium products designed for the
                modern lifestyle. Quality meets style in every piece.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                {/**
                 * TODO: PopUp VideoPlayer
                 */}
                <Play className="mr-2 h-5 w-5" />
                Watch Story
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Customers
                </div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.7</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">
                  Premium Brands
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative aspect-square lg:aspect-4/5 overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop"
                alt="Hero product showcase"
                fill
                className="object-cover"
                priority
              />
              {/* Floating Cards */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">20%</span>
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
