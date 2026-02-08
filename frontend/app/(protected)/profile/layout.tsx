export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">{children}</main>
  );
}
