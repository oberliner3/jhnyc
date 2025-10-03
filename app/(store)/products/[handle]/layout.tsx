export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-2 p-2 pt-3 overflow-hidden container">{children}</div>
  );
}
