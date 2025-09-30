import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

export function Logo({ className = "" }: { className?: string }) {
	return (
		<Link href="/" className={`flex items-center space-x-2 ${className}`}>
			<span className="font-bold text-xl">Vohovintage</span>
		</Link>
	);
}
