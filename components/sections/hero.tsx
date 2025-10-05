"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { PrimaryCTA, SecondaryCTA } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { CountUp } from "@/components/common/count-up";

export function Hero() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const controls = useAnimation();
	const ref = useRef<HTMLDivElement | null>(null);
	const isInView = useInView(ref, { once: true, amount: 0.1 });

	useEffect(() => {
		if (isInView) {
			controls.start("visible");
		}
	}, [controls, isInView]);

	return (
    <section className="relative h-screen overflow-hidden scroll-snap-align-start">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1530738472658-404f693bd4b2?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Hero product showcase"
          fill
          sizes="(min-width: 1024px) 100vw, 100vw"
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
      </div>

      <div className="container relative z-10 flex items-center h-full px-4 py-2 lg:py-4">
        <div className="grid items-center gap-10 lg:grid-cols-12 w-full">
          {/* Text Content */}
          <div className="lg:col-span-6 space-y-8 animate-fade-in">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide uppercase text-foreground/70">
                New Collection
              </div>
              <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight text-foreground">
                Timeless essentials for everyday life.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Considered design, premium materials, and meticulous attention
                to detail. Elevate your daily rituals with pieces that last.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <PrimaryCTA
                className="px-8 text-base lg:text-lg hover:text-primary"
                asChild
              >
                <Link href="/collections/all">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </PrimaryCTA>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <SecondaryCTA
                    variant="outline"
                    className="px-8 text-base lg:text-lg"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Story
                  </SecondaryCTA>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Our Story</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video">
                    <iframe
                      className="rounded-lg w-full h-full"
                      src="https://www.youtube.com/embed/njVnaQmtfOE"
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Social Proof */}
            <motion.div
              ref={ref}
              className="flex items-center gap-6 pt-6"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.2,
                    duration: 0.6,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div
                  className="text-2xl font-semibold"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  <CountUp end={10} suffix="K+" />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Happy Customers
                </div>
              </motion.div>

              <div className="h-8 w-px bg-border" />

              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div
                  className="text-2xl font-semibold"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  <CountUp end={4.7} decimals={1} />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </motion.div>

              <div className="h-8 w-px bg-border" />

              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div
                  className="text-2xl font-semibold"
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                >
                  <CountUp end={50} suffix="+" />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Premium Brands
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
