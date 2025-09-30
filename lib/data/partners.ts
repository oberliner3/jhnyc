import type { Partner } from "@/lib/types";
import { generatePlaceholderImage } from "../utils";

export const PARTNERS: Partner[] = [
  {
    id: 1,
    name: "TechCorp",
    logo: generatePlaceholderImage({
      width: 200,
      height: 100,
      text: "TechCorp",
      bgColor: "1f2937", // gray-800
      textColor: "f3f4f6", // gray-100
      fontSize: 24,
    }),
    website: "https://techcorp.com",
  },
  {
    id: 2,
    name: "GreenLife",
    logo: generatePlaceholderImage({
      width: 200,
      height: 100,
      text: "GreenLife",
      bgColor: "10b981", // emerald-500
      textColor: "ffffff",
      fontSize: 24,
    }),
    website: "https://greenlife.com",
  },
  {
    id: 3,
    name: "Urban Style",
    logo: generatePlaceholderImage({
      width: 200,
      height: 100,
      text: "Urban Style",
      bgColor: "6366f1", // indigo-500
      textColor: "ffffff",
      fontSize: 24,
    }),
    website: "https://urbanstyle.com",
  },
  {
    id: 4,
    name: "Wellness Co",
    logo: generatePlaceholderImage({
      width: 200,
      height: 100,
      text: "Wellness Co",
      bgColor: "8b5cf6", // violet-500
      textColor: "ffffff",
      fontSize: 24,
    }),
    website: "https://wellness.com",
  },
];
