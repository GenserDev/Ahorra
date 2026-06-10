export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-2 text-2xl font-bold">💰 Ahorra</div>
      {children}
    </main>
  );
}
