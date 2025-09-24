import { ReactNode } from "react";

export function ArticleHeader({
  title,
  lastUpdate,
}: {
  title: string;
  lastUpdate?: string;
}) {
  return (
    <header className="  pb-2">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-2  p-4 text-center ">
        {title}
      </h1>
      {lastUpdate ? (
        <p className=" text-neutral-600 text-xs p-2">
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
    <section className="p-2 border-t border-neutral-50">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground">{first}</p>
      {children}
    </section>
  );
}

export function UnorderdList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
      {items.map((e, i) => (
        <li key={i}>{e}</li>
      ))}
    </ul>
  );
}

export function ArticleWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="container px-2 py-4  w-full m-auto mx-auto relative ">
      <article className="max-w-4xl mx-auto bg-white   shadow rounded-t-lg overflow-hidden rounded py-10 px-4">
        <div className="prose prose-lg max-w-none space-y-8">{children}</div>
      </article>
    </div>
  );
}
