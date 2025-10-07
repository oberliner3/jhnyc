"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, IconButton } from "../ui/button";

const ANNOUNCEMENTS = [
  "🎉 Free shipping on orders over $50 - Limited time offer!",
  "💰 Save 20% with code SAVE2025 - Valid until December 31st 2025",
  "✨ New arrivals now available - Shop the latest trends",
];

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  if (!isVisible) return null;

  return (
    <div className="z-60 relative bg-primary border-b text-primary-foreground">
      <div className="flex justify-center items-center h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="min-w-full font-medium text-xs text-center"
          >
            {ANNOUNCEMENTS[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Pause/Play Button */}
      <IconButton
        type="button"
        onClick={() => setIsPaused(!isPaused)}
        className="top-1/2 left-2 absolute hover:bg-primary-foreground/20 p-1 rounded-sm -translate-y-1/2"
        aria-label={isPaused ? "Play announcements" : "Pause announcements"}
      >
        {isPaused ? (
          <Play className="w-4 h-4" />
        ) : (
          <Pause className="w-4 h-4" />
        )}
      </IconButton>
      <IconButton
        type="button"
        onClick={() => setIsVisible(false)}
        className="top-1/2 right-2 absolute hover:bg-primary-foreground/20 p-1 rounded-sm -translate-y-1/2"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4" />
      </IconButton>
    </div>
  );
}
