import type { ReactNode } from "react";

export function ArticleHeader({
	title,
	lastUpdate,
}: {
	title: string;
	lastUpdate?: string;
}) {
	return (
		<header className="pb-2">
			<h1 className="mb-2 p-4 font-bold text-3xl lg:text-4xl text-center tracking-tight">
				{title}
			</h1>
			{lastUpdate ? (
				<p className="p-2 text-neutral-600 text-xs">
					Last updated: <time dateTime={lastUpdate}>{lastUpdate}</time>
				</p>
			) : null}
		</header>
	);
}
export function ArticleSection({
	title,
	first,
	children,
}: {
	title: string;
	first: string;
	children?: ReactNode;
}) {
	return (
		<section className="p-2 border-neutral-50 border-t">
			<h2 className="mb-4 font-bold text-2xl">{title}</h2>
			<p className="text-muted-foreground">{first}</p>
			{children}
		</section>
	);
}

export function UnorderdList({ items }: { items: string[] }) {
	return (
		<ul className="space-y-2 pl-6 text-muted-foreground list-disc">
			{items.map((e) => (
				<li key={e}>{e}</li>
			))}
		</ul>
	);
}

export function ArticleWrapper({ children }: { children: ReactNode }) {
	return (
		<div className="relative m-auto mx-auto px-2 py-4 w-full container">
			<article className="bg-white shadow mx-auto px-4 py-10 rounded rounded-t-lg max-w-4xl overflow-hidden">
				<div className="space-y-8 max-w-none prose prose-lg">{children}</div>
			</article>
		</div>
	);
}
