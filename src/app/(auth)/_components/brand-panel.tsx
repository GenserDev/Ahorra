"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Panel lateral de marca (lado izquierdo del split-screen).
 * Usa la foto real de fondo según la pantalla (login / signup), con un
 * degradado esmeralda encima para que el texto sea legible.
 */
export function BrandPanel() {
  const pathname = usePathname();
  const isSignup = pathname?.includes("signup");
  const image = isSignup ? "/Sign-in.jpg" : "/Login.jpg";

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Foto de fondo */}
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />

      {/* Degradado esmeralda para legibilidad */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(12,58,44,0.78) 0%, rgba(6,35,27,0.55) 45%, rgba(6,35,27,0.92) 100%)",
        }}
      />

      {/* Logo en placa clara (su texto verde no se leería directo sobre la foto) */}
      <div className="relative">
        <div className="inline-flex items-center rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
          <Image
            src="/LogoAhorra.png"
            alt="Ahorra"
            width={120}
            height={91}
            className="h-9 w-auto"
            priority
          />
        </div>
      </div>

      {/* Mensaje inferior */}
      <div className="relative max-w-sm text-white">
        <h2 className="text-3xl font-semibold leading-tight drop-shadow">
          Tus finanzas, claras y bajo control.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/80 drop-shadow">
          Registra tus gastos, define metas de ahorro y descubre exactamente
          cuándo las vas a alcanzar.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Gastos por categoría", "Metas de ahorro", "Predicciones"].map(
            (chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur"
              >
                {chip}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
