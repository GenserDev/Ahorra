import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El proxy ya protege la ruta, pero verificamos cerca de los datos.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, currency")
    .eq("id", user.id)
    .single();

  const displayName = profile?.name ?? user.email;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Hola,</p>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-neutral-500">
          🚧 Dashboard del mes en construcción.
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          Siguiente paso: registrar sueldo, categorías y gastos.
        </p>
      </div>
    </main>
  );
}
