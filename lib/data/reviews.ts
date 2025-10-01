import type { Review } from "@/lib/types";

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Sarah ElFikri",
    rating: 5,
    comment:
      "Absolutely love my purchase! The quality exceeded my expectations and shipping was super fast.",
    date: "2025-02-15",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 5,
    comment:
      "Great customer service and top-notch products. Will definitely shop here again!",
    date: "2025-05-12",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Emma Davis",
    rating: 4,
    comment:
      "Beautiful products and fast delivery. The packaging was also very eco-friendly.",
    date: "2024-10-18",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];
