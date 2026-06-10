import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Componentes de Cliente ('use client').
 * Usa la publishable key (NEXT_PUBLIC_*), segura de exponer en el navegador.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
