import type { Partner } from "@/lib/types";
import { generateImage } from "../utils";

export const PARTNERS: Partner[] = [
  {
    id: "1",
    name: "TechCorp",
    logo: "https://via.placeholder.com/120x60/008060/ffffff?text=TechCorp",
    website: "https://techcorp.com",
  },
  {
    id: "2",
    name: "GreenLife",
    logo: generateImage({
      text: "GreenLife",
      bg: "008060",
      fg: "ffffff",
      dim: {
        w: 120,
        h: 60,
      },
    }),
    website: "https://greenlife.com",
  },
  {
    id: "3",
    name: "Urban Style",
    logo: "https://via.placeholder.com/120x60/008060/ffffff?text=Urban+Style",
    website: "https://urbanstyle.com",
  },
  {
    id: "4",
    name: "Wellness Co",
    logo: "https://via.placeholder.com/120x60/008060/ffffff?text=Wellness+Co",
    website: "https://wellness.com",
  },
];
