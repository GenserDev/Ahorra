import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El proxy ya protege la ruta, pero verificamos cerca de los datos.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, currency, onboarded")
    .eq("id", user.id)
    .single();

  // Usuario nuevo sin configurar → al onboarding.
  if (!profile?.onboarded) redirect("/onboarding");

  const displayName = profile?.name ?? user.email;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Hola,</p>
          <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-muted">🚧 Dashboard del mes en construcción.</p>
        <p className="mt-1 text-sm text-muted">
          Siguiente paso: registrar sueldo, categorías y gastos.
        </p>
      </div>
    </main>
  );
}
