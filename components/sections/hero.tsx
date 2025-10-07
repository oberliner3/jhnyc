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
  const ref = useRef<HTMLUListElement | null>(null);
	const isInView = useInView(ref, { once: true, amount: 0.1 });

	useEffect(() => {
		if (isInView) {
			controls.start("visible");
		}
	}, [controls, isInView]);

	return (
    <section className="relative h-screen overflow-hidden scroll-snap-align-start" role="banner" aria-label="Hero section showcasing premium flash sales">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1530738472658-404f693bd4b2?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Premium designer products and luxury brands on sale"
          fill
          sizes="(min-width: 1024px) 100vw, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
      </div>

      <div className="container relative z-10 flex items-center h-full px-4 py-2 lg:py-4">
        <div className="grid items-center gap-10 lg:grid-cols-12 w-full">
          {/* Text Content */}
          <header className="lg:col-span-6 space-y-8 animate-fade-in">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide uppercase text-foreground/70" role="status" aria-label="Current promotion">
                🔥 Limited Time Flash Sale
              </div>
              <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight text-foreground">
                Premium Designer Brands at Unbeatable Flash Sale Prices
              </h1>
              <p className="max-w-xl text-lg text-foreground/80">
                Discover exclusive flash sales on luxury fashion, electronics, and lifestyle products. Save up to 70% on premium brands with our curated limited-time deals and member-only promotions.
              </p>
            </div>

            <nav className="flex flex-col sm:flex-row gap-4" role="navigation" aria-label="Primary actions">
              <PrimaryCTA
                className="px-8 text-base lg:text-lg hover:text-primary"
                asChild
              >
                <Link href="/collections/all" aria-label="Browse all flash sale products">
                  Shop Flash Sales Now
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </PrimaryCTA>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <SecondaryCTA
                    className="px-8 text-base lg:text-lg"
                    aria-label="Watch video about our savings process"
                  >
                    <Play className="mr-2 w-5 h-5" aria-hidden="true" />
                    See How We Save You Money
                  </SecondaryCTA>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>How We Deliver Unbeatable Savings</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video">
                    <iframe
                      className="rounded-lg w-full h-full"
                      src="https://www.youtube.com/embed/Hz50_YpicEg"
                      title="How we deliver exclusive flash sales and premium brand discounts"
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      allowTransparency
                      loading="lazy"
                      seamless
                    ></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>

            {/* Social Proof */}
            <motion.section
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
              aria-label="Customer satisfaction metrics"
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
                  <CountUp end={25} suffix="K+" />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Satisfied Customers
                </div>
              </motion.div>

              <div className="h-8 w-px bg-border" aria-hidden="true" />

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
                  <CountUp end={4.8} decimals={1} />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Trust Score
                </div>
              </motion.div>

              <div className="h-8 w-px bg-border" aria-hidden="true" />

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
                  <CountUp end={70} suffix="%" />
                </motion.div>
                <div className="text-sm text-muted-foreground">
                  Average Savings
                </div>
              </motion.div>
            </motion.section>
          </header>
        </div>
      </div>
    </section>
  );
}
