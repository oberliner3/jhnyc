/**
 * Product Utility Functions
 * Shared utilities for product data manipulation and formatting
 *
 * NOTE: This file contains ONLY pure utility functions that can be used
 * on both client and server. Server-side functions that access the COSMOS
 * API are in separate files to prevent client-side bundle inclusion.
 *
 * For server-side product fetching, see: lib/utils/product-server-utils.ts
 */

/**
 * Format price for merchant feeds (Google/Bing)
 * Returns format: "123.45 USD"
 */
export function formatPriceForMerchant(
  amount: number,
  currency: string = "USD"
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${value.toFixed(2)} ${currency}`;
}

/**
 * Format weight in grams for merchant feeds
 * Returns format: "100 g"
 */
export function formatWeight(grams?: number): string {
  const g = typeof grams === "number" && grams > 0 ? grams : 100;
  return `${g} g`;
}

/**
 * Check if a string is likely a GTIN (barcode)
 * Valid lengths: 8, 12, 13, or 14 digits
 */
export function isLikelyGTIN(value?: string): boolean {
  if (!value) return false;
  const digits = value.replace(/\s+/g, "");
  return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits);
}

/**
 * Normalize product type for consistent formatting
 * Removes leading separators and formats hierarchy
 */
export function normalizeProductType(input?: string): string {
  if (!input) return "General";
  const trimmed = input.trim().replace(/^([>/\-\s])+/, "");
  const parts = trimmed
    .split(/>|\//)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return parts.length ? parts.join(" > ") : "General";
}

/**
 * Get Google Product Category ID from product type
 * Maps common categories to Google taxonomy IDs
 */
export function getGoogleCategory(category: string | undefined): string {
  if (!category) return "166"; // Default: Apparel & Accessories

  const categoryMap: Record<string, string> = {
    // Apparel & Accessories
    "accessories": "166",
    "apparel & accessories": "166",
    "bags & cases": "3032",
    "clothing": "1604",
    "dressing gown": "2271",
    "fitted sheet": "493",
    "duvet cover": "472",
    "coverlet": "472",
    "flat sheet": "493",
    "pajama set": "2271",
    "shoes": "187",
    "watches": "201",
    "jewelry": "188",

    // Automotive
    "automotive": "888",
    "automotive tools": "888",
    "4 post lifts": "888",
    "2 post lifts": "888",
    "alignment lifts": "888",
    "mobile column lifts": "888",
    "motorcycle/atv lift": "888",
    "scissor lift": "888",
    "vehicle storage lift": "888",
    "air compressors": "4635",
    "air compressor": "4635",
    "combo kits": "888",
    "floor mats": "2594",
    "led pods": "888",
    "side steps": "888",
    "tire changer": "888",
    "wheel balancer": "888",
    "workbenches": "4196",
    "paint booth": "888",
    "frame machine": "888",
    "rolling jack": "888",
    "strut compressors": "888",
    "wheel lifts": "888",
    "turn plates": "888",
    "work benches": "4196",
    "rear bumper": "888",
    "bed bars": "888",
    "full protection skid plates": "888",
    "front skid plates": "888",
    "double cab racks": "888",
    "bed racks": "888",
    "roof rack height bed racks": "888",
    "adjustable height bed racks": "888",
    "mid height bed racks": "888",
    "cab height bed racks": "888",
    "truck bed cap racks": "888",
    "truck bed covers": "888",
    "tonneau covers": "888",
    "sport racks": "888",
    "sliders": "888",
    "rock sliders": "888",
    "spindles": "888",
    "superchargers": "888",
    "trailing arms": "888",
    "front bumpers": "888",
    "tail lights": "3703",
    "steering wheels": "2609",
    "grille accessories": "888",
    "rear bumper accessories": "888",
    "headlights": "3703",
    "air intake systems": "888",
    "hoods": "888",
    "bedsides": "888",
    "fenders": "888",
    "power control": "888",
    "brake kit": "888",
    "hitch tire carriers": "888",
    "portal axle kit": "888",
    "leaf springs": "888",
    "suspension systems": "888",
    "exhaust systems": "888",
    "front coilovers": "888",
    "lower control arms": "888",
    "reverse light brackets": "888",
    "fuel tank skid plates": "888",
    "insulation kits": "888",
    "rear skid plates": "888",
    "grille inserts": "888",
    "wheels": "2609",
    "radiators": "3703",

    // Electronics
    "electronics": "172",
    "amplifiers": "172",
    "cinema cameras": "172",
    "dslr cameras": "172",
    "mirrorless cameras": "172",
    "point & shoot cameras": "172",
    "360 video cameras": "172",
    "medium format camera": "172",
    "on-camera flashes": "172",
    "strobe lights": "172",
    "led monolight": "172",
    "light tubes": "172",
    "light modifiers": "172",
    "gimbals & stabilizers": "172",
    "microphones": "172",
    "monitors & accessories": "172",
    "tripods": "172",
    "video streaming": "172",
    "head units": "172",
    "portable power stations": "172",
    "drones & accessories": "172",
    "memory cards & storage": "172",
    "lens accessories": "172",
    "lens filters": "172",
    "cine lenses": "172",
    "mirrorless lenses": "172",
    "medium format lenses": "172",
    "camera accessories": "172",
    "studio accessories": "172",
    "cameras protection & maintenance": "172",
    "lighting ring lights & - macro": "172",
    "bags hard cases": "172",

    // Furniture
    "furniture": "632",
    "furniture set": "632",
    "furniture collection": "632",
    "cabinets & storage": "4196",
    "cabinet": "4196",
    "credenza": "4196",
    "dining chairs": "4579",
    "chair": "4579",
    "loveseat": "4579",
    "sofa": "4579",
    "ottoman": "4579",
    "recliner": "4579",
    "sectional": "4579",
    "living > sofas": "4579",
    "living > armchairs": "4579",
    "living > sofas and armchairs": "4579",
    "kitchen island": "4196",
    "bathroom > vanities": "4196",
    "living > tables": "4579",
    "coffee tables": "4579",
    "side & end tables": "4579",
    "mesas": "4579",
    "mesas bajas": "4579",
    "bedroom > bedroom sets": "4579",
    "bedroom > case goods": "4579",
    "bedroom > beds": "4579",
    "camas": "4579",
    "benches": "4579",
    "bar & counter stools": "4579",
    "taburetes": "4579",
    "sillas": "4579",
    "oficina": "4196",
    "escritorios": "4196",
    "estanterías": "4196",
    "recibidor": "4196",
    "armarios": "4196",
    "espejos": "4196",
    "portavelas": "4196",
    "lockers": "4196",
    "manicure nail table": "4196",
    "barber chairs": "4196",
    "styling chairs": "4196",
    "waiting chairs": "4196",
    "backwashes": "4196",
    "all purpose chairs": "4196",
    "shampoo chairs": "4196",
    "manicure tables": "4196",
    "pedicure chairs": "4196",
    "styling stations": "4196",
    "color bars": "4196",
    "beauty beds": "4196",
    "waiting benches": "4196",
    "reception desks": "4196",
    "hydrotherapy & pedicure": "4196",
    "massage & spa tables": "4196",
    "dining tables": "4579",
    "conference tables": "4196",
    "bookcases & shelving": "4196",

    // Home & Garden
    "home": "632",
    "lawn & garden": "632",
    "fire pit": "632",
    "fire & water bowl": "632",
    "fire bowl": "632",
    "water bowl": "632",
    "scupper": "632",
    "fountain": "632",
    "fire pit accessory": "632",
    "grill": "3117",
    "grill accessory": "3117",
    "pizza oven": "3117",
    "pizza oven accessory": "3117",
    "griddle": "3117",
    "sauna": "632",
    "sauna accessories": "632",
    "sauna heater": "632",
    "storage shed": "632",
    "gazebo accessory": "632",
    "pergola": "632",
    "patio cover": "632",
    "carport": "632",
    "carport accessory": "632",
    "greenhouse": "632",
    "greenhouse accessory": "632",
    "dog kennel": "632",
    "playset": "1098",
    "playhouse": "1098",
    "playhouse accessory": "1098",
    "basketball hoop": "1098",
    "outdoor > bar and dining": "4579",
    "outdoor > sofa sectionals": "4579",
    "outdoor > daybeds and lounges": "4579",
    "outdoor/outdoor furniture/outdoor lounge furniture/outdoor lounge chairs": "4579",
    "camping chairs & tables": "4579",
    "living > decor": "4196",
    "rugs": "4196",
    "alfombras": "4196",
    "vanity tray": "4196",
    "boutique tissue": "4196",
    "wastebaskets": "4196",
    "tumbler": "4196",
    "soap dish": "4196",
    "brush holder": "4196",
    "lotion pump": "4196",
    "tray": "4196",
    "bath collection": "4196",
    "bed collection": "4196",
    "vanity mirror": "4196",
    "sculptures & statues": "4196",
    "fossil": "4196",
    "amethyst": "4196",
    "serpentine": "4196",
    "quartz cluster": "4196",
    "citrine": "4196",
    "obsidian": "4196",
    "sandstone": "4196",
    "black obsidian": "4196",

    // Lighting
    "lighting": "2984",
    "lighting/ceiling lights/pendants": "2984",
    "pendant lights": "2984",
    "mini pendants": "2984",
    "pendant lamp": "2984",
    "lamparas de suspension": "2984",
    "lighting/ceiling lights/chandeliers": "2984",
    "chandeliers": "2984",
    "chandelier": "2984",
    "lighting/ceiling lights/flush mounts": "2984",
    "flush mounts": "2984",
    "flush mount lighting": "2984",
    "lighting/ceiling lights/semi flush mounts": "2984",
    "lighting/ceiling lights/linear suspension": "2984",
    "lighting/ceiling lights/track lighting": "2984",
    "lighting/wall lights/modern sconces": "2984",
    "wall sconces": "2984",
    "wall sonce": "2984",
    "lighting/wall lights/swing arm wall lamps": "2984",
    "bath & vanity lights": "2984",
    "outdoor/outdoor lighting/landscape lighting/well lights": "2984",
    "outdoor/outdoor lighting/outdoor wall lights": "2984",
    "lighting/all fans/ceiling fans": "2984",
    "lighting/all fans/outdoor fans": "2984",
    "lighting/lamps/table lamps": "2984",
    "table lamp": "2984",
    "lighting/lamps/table lamps/accent table lamps": "2984",
    "lighting/lamps/table lamps/desk lamps": "2984",
    "lighting/lamps/floor lamps/torchieres": "2984",
    "lighting/lamps/floor lamps/reading floor lamps": "2984",
    "lighting/lamps/floor lamps/accent floor lamps": "2984",
    "lamparas de pie": "2984",

    // Tools & Hardware
    "tools": "632",
    "augers": "632",
    "brush cutters": "632",
    "string trimmers": "632",
    "sprayers": "632",
    "drill bits": "632",
    "generators": "632",
    "drills": "632",
    "ladders": "632",
    "chainsaws": "632",
    "concrete vibrators": "632",
    "power rotary tools": "632",
    "inspection tools": "632",
    "water pumps": "632",
    "rotary laser levels": "632",
    "gauges": "632",
    "measuring tools": "632",
    "calipers": "632",
    "wire tracers": "632",
    "axes": "632",
    "clamps": "632",
    "wrench sets": "632",
    "mechanics tool sets": "632",
    "industrial fans": "632",
    "tool storage & organization": "632",
    "heaters": "632",

    // Kids & Baby
    "literas": "4579",
    "armarios infantiles": "4196",
    "cunas": "4579",
    "alfombras": "4196",
    "comodas infantiles": "4196",
    "colchones infantiles": "4579",
    "estanterias infantiles": "4196",
    "escritorios infantiles": "4196",
    "camas infantiles": "4579",
    "papel pintado infantil": "4196",
    "mesas infantiles": "4579",
    "colgadores infantiles": "4196",
    "sillas infantiles": "4579",
    "minicunas": "4579",
    "accesorios camas": "4579",
    "almacenaje infantil": "4196",
    "alfombras infantiles": "4196",

    // Other
    "biss": "166", // Business & Industrial > ??
    "equipment": "166", // Business & Industrial > ??
    "product": "166",
    "pre-owned": "166",
    "discontinued": "166",
    "add-on": "166",
    "options_hidden_product": "166",
    "mws_fee_generated": "166",
    "diet/training plan": "499", // Health & Beauty > Fitness
    "aircraft manual": "784", // Books & Literature
    "radios": "172", // Electronics
    "headsets": "172", // Electronics
    "espresso machine": "3117", // Home & Garden > Kitchen & Dining
    "machines": "166",
    "binocular": "172",
    "telescope": "172",
    "rifle scopes": "499",
    "torch": "632",
  };

  const normalizedCategory = category.toLowerCase().trim();
  return categoryMap[normalizedCategory] || "166"; // Default to Apparel & Accessories
}
