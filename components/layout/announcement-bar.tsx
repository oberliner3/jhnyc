'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ANNOUNCEMENTS = [
  "🎉 Free shipping on orders over $50 - Limited time offer!",
  "💰 Save 20% with code SAVE2025 - Valid until midnight",
  "✨ New arrivals now available - Shop the latest trends",
]

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="relative bg-primary text-primary-foreground border-b z-60">
      <div className="overflow-hidden h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="min-w-full text-center text-sm font-medium"
          >
            {ANNOUNCEMENTS[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 hover:bg-primary-foreground/20"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
