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
    <section className="relative bg-gradient-to-br from-background via-muted/50 to-primary/10 overflow-hidden">
      <div className="px-4 py-16 lg:py-24 container">
        <div className="items-center gap-8 lg:gap-12 grid lg:grid-cols-2 lg:grid-flow-col-dense">
          {/* Hero Image - first on mobile, right on desktop */}
          <div className="relative lg:order-last">
            <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/20 mx-auto lg:mx-0 rounded-2xl lg:max-w-none max-w-xs aspect-square lg:aspect-4/5 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1530738472658-404f693bd4b2?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Hero product showcase"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              {/* Floating Cards */}
              <div className="top-6 right-6 absolute bg-card/90 shadow-lg backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 rounded-full w-2 h-2"></div>
                  <span className="font-medium text-sm">Free Shipping</span>
                </div>
              </div>
              <div className="bottom-6 left-6 absolute bg-card/90 shadow-lg backdrop-blur-sm p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-2xl">20%</span>
                  <span className="text-sm">Off Today</span>
                </div>
              </div>
            </div>
          </div>

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
              <PrimaryCTA className="px-8 text-lg" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </PrimaryCTA>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <SecondaryCTA className="px-8 text-lg">
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
                      src="https://www.youtube.com/embed/x-vyU_MGg4M"
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
              className="flex items-center gap-6 pt-8"
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
                  className="font-bold text-2xl"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                      },
                    },
                  }}
                >
                  <CountUp end={10} suffix="K+" />
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  Happy Customers
                </div>
              </motion.div>
              <div className="bg-border w-px h-8"></div>
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div
                  className="font-bold text-2xl"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                      },
                    },
                  }}
                >
                  <CountUp end={4.7} decimals={1} />
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  Average Rating
                </div>
              </motion.div>
              <div className="bg-border w-px h-8"></div>
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div
                  className="font-bold text-2xl"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                      },
                    },
                  }}
                >
                  <CountUp end={50} suffix="+" />
                </motion.div>
                <div className="text-muted-foreground text-sm">
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
