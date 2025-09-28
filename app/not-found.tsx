import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="px-4 py-16 text-center container">
			<div className="mx-auto max-w-md">
				<h1 className="mb-4 font-bold text-primary text-6xl">404</h1>
				<h2 className="mb-4 font-semibold text-2xl">Page Not Found</h2>
				<p className="mb-8 text-muted-foreground">
					Sorry, we couldn&apos;t find the page you&apos;re looking for.
				</p>
				<Button asChild>
					<Link href="/">Return Home</Link>
				</Button>
			</div>
		</div>
	);
}
