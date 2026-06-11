import Image from "next/image";
import { BrandPanel } from "./_components/brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <main className="relative flex items-center justify-center bg-card px-6 py-10 sm:px-10">
        <ThemeToggle className="absolute right-6 top-6" />

        {/* Marca compacta para móvil (cuando el panel lateral está oculto) */}
        <Image
          src="/LogoAhorra.png"
          alt="Ahorra"
          width={120}
          height={91}
          priority
          className="absolute left-6 top-6 h-9 w-auto lg:hidden"
        />

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
