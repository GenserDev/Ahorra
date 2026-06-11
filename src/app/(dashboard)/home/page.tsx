import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatMoney, formatDayMonth } from "@/lib/format";
import { AddExpenseModal } from "./_components/add-expense-modal";
import { AddCategoryModal } from "./_components/add-category-modal";
import { MonthCalendar, type DayExpense } from "./_components/month-calendar";
import { DeleteCategoryButton } from "./_components/delete-category-button";
import { deleteExpense } from "./actions";

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ y?: string; m?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, currency, onboarded")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded) redirect("/onboarding");

  const currency = profile?.currency ?? "GTQ";
  const displayName = profile?.name?.split(" ")[0] ?? user.email;

  const now = new Date();
  const sp = await searchParams;
  const navY = Number(sp?.y);
  const navM = Number(sp?.m);
  const validNav =
    Number.isInteger(navY) &&
    Number.isInteger(navM) &&
    navM >= 1 &&
    navM <= 12 &&
    navY >= 2000 &&
    navY <= 2100;
  const year = validNav ? navY : now.getFullYear();
  const month = validNav ? navM : now.getMonth() + 1;
  const pad = (n: number) => String(n).padStart(2, "0");

  // .limit(1) evita el error de maybeSingle() si existieran filas de mes
  // duplicadas; tomamos la de mayor sueldo (la real del onboarding).
  const { data: monthRow } = await supabase
    .from("months")
    .select("id, salary")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("month", month)
    .order("salary", { ascending: false })
    .limit(1)
    .maybeSingle();

  const salary = Number(monthRow?.salary ?? 0);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, icon, color, monthly_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const cats = categories ?? [];
  const catById = new Map(cats.map((c) => [c.id, c]));

  // Gastos del mes visto, filtrados por la FECHA del gasto (fuente de verdad),
  // no por month_id. Así el total por categoría siempre cuadra.
  const lastDay = new Date(year, month, 0).getDate();
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(lastDay)}`;
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, note, date, category_id")
    .eq("user_id", user.id)
    .gte("date", monthStart)
    .lte("date", monthEnd)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const exps = expenses ?? [];

  // Totales del mes (por categoría y detalle por día para el calendario)
  const spentByCat = new Map<string, number>();
  const expensesByDay: Record<string, DayExpense[]> = {};
  let totalSpent = 0;
  for (const e of exps) {
    const amt = Number(e.amount);
    totalSpent += amt;
    spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + amt);
    const c = catById.get(e.category_id);
    (expensesByDay[e.date] ??= []).push({
      id: e.id,
      amount: amt,
      note: e.note,
      categoryName: c?.name ?? "Sin categoría",
      categoryIcon: c?.icon ?? "🏷️",
    });
  }
  const savings = salary - totalSpent;

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // Últimos 5 gastos registrados (de cualquier mes)
  const { data: recentRaw } = await supabase
    .from("expenses")
    .select("id, amount, note, date, category_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const recent = recentRaw ?? [];

  // Ahorro acumulado total = todos los ingresos − todos los gastos (de todos los meses)
  const { data: allMonths } = await supabase
    .from("months")
    .select("salary")
    .eq("user_id", user.id);
  const totalIncome = (allMonths ?? []).reduce(
    (s, m) => s + Number(m.salary),
    0,
  );
  const { data: allExpenseAmounts } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", user.id);
  const totalExpensesAll = (allExpenseAmounts ?? []).reduce(
    (s, e) => s + Number(e.amount),
    0,
  );
  const accumulatedSavings = totalIncome - totalExpensesAll;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Hola, {displayName} 👋</p>
          <h1 className="text-2xl font-semibold capitalize text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Resumen */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Sueldo del mes" value={formatMoney(salary, currency)} />
        <SummaryCard
          label="Gastado"
          value={formatMoney(totalSpent, currency)}
          tone="spent"
        />
        <SummaryCard
          label="Ahorro esperado"
          value={formatMoney(savings, currency)}
          tone={savings >= 0 ? "good" : "bad"}
        />
      </section>

      {/* Ahorro acumulado total */}
      <section className="mb-10 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Ahorro acumulado total</p>
            <p className="mt-1 text-3xl font-bold text-primary">
              {formatMoney(accumulatedSavings, currency)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Suma de tu ahorro mes a mes (todos tus ingresos menos todos tus
          gastos registrados).
        </p>
      </section>

      {/* Categorías */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Categorías</h2>
          <AddCategoryModal />
        </div>

        {cats.length === 0 ? (
          <EmptyCard text="Aún no tienes categorías." />
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {cats.map((c) => {
              const spent = spentByCat.get(c.id) ?? 0;
              const limit = c.monthly_limit ? Number(c.monthly_limit) : null;
              const over = limit !== null && spent > limit;
              return (
                <div
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-3 pr-2"
                  style={{
                    borderColor: c.color ? `${c.color}55` : "var(--border)",
                  }}
                >
                  <span className="text-base">{c.icon ?? "🏷️"}</span>
                  <span className="text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      over ? "text-danger" : "text-foreground"
                    }`}
                  >
                    {formatMoney(spent, currency)}
                    {limit !== null ? ` / ${formatMoney(limit, currency)}` : ""}
                  </span>
                  <DeleteCategoryButton id={c.id} name={c.name} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Calendario del mes */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Calendario del mes
          </h2>
          <AddExpenseModal categories={cats} currency={currency} />
        </div>
        <MonthCalendar
          year={year}
          month={month}
          expensesByDay={expensesByDay}
          currency={currency}
          todayStr={todayStr}
        />
      </section>

      {/* Gastos recientes */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Gastos recientes
        </h2>
        {recent.length === 0 ? (
          <EmptyCard text="Todavía no registras gastos. Usa “+ Agregar gasto”." />
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {recent.map((e) => {
              const c = catById.get(e.category_id);
              return (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-lg">{c?.icon ?? "🏷️"}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c?.name ?? "Sin categoría"}
                        {e.note ? (
                          <span className="font-normal text-muted"> · {e.note}</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted">{formatDayMonth(e.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatMoney(Number(e.amount), currency)}
                    </span>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        aria-label="Eliminar gasto"
                        className="text-muted transition hover:text-danger"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "spent" | "good" | "bad";
}) {
  const valueColor =
    tone === "good"
      ? "text-primary"
      : tone === "bad"
        ? "text-danger"
        : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
      {text}
    </div>
  );
}
