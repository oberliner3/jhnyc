import type { MetadataRoute } from "next";
import { publicEnv, SITE_CONFIG } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE_CONFIG.name,
		short_name: publicEnv.NEXT_PUBLIC_STORE_NAME,
		background_color: "#ffffff",
		theme_color: "#336571",
		description: SITE_CONFIG.description,
		dir: "auto",
		display: "standalone",
		lang: "en",
		orientation: "portrait-primary",
		start_url: "/",
		scope: "/",
		id: "originz-store",

		icons: [
			{
				src: "/web-app-manifest-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/web-app-manifest-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
		],
	};
}
