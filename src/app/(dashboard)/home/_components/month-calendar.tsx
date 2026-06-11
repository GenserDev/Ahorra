"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { formatMoney } from "@/lib/format";

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export type DayExpense = {
  id: string;
  amount: number;
  note: string | null;
  categoryName: string;
  categoryIcon: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Calendario del mes. Cada día muestra el total gastado; al hacer clic en un
 * día con gastos, abre un modal con el detalle de ese día.
 */
export function MonthCalendar({
  year,
  month, // 1-12
  expensesByDay,
  currency,
  todayStr,
}: {
  year: number;
  month: number;
  expensesByDay: Record<string, DayExpense[]>;
  currency: string;
  todayStr: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedItems = selected ? (expensesByDay[selected] ?? []) : [];
  const selectedTotal = selectedItems.reduce((s, e) => s + e.amount, 0);
  const selectedDay = selected ? Number(selected.slice(8, 10)) : 0;

  // Navegación entre meses
  const py = month === 1 ? year - 1 : year;
  const pm = month === 1 ? 12 : month - 1;
  const ny = month === 12 ? year + 1 : year;
  const nm = month === 12 ? 1 : month + 1;
  const curY = Number(todayStr.slice(0, 4));
  const curM = Number(todayStr.slice(5, 7));
  const isCurrentMonth = year === curY && month === curM;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Navegación de mes */}
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/home?y=${py}&m=${pm}`}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-foreground/5"
        >
          ‹
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold capitalize text-foreground">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          {!isCurrentMonth && (
            <Link
              href="/home"
              className="text-xs font-medium text-primary hover:underline"
            >
              Hoy
            </Link>
          )}
        </div>
        <Link
          href={`/home?y=${ny}&m=${nm}`}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition hover:bg-foreground/5"
        >
          ›
        </Link>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[11px] font-medium text-muted"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const iso = `${year}-${pad(month)}-${pad(d)}`;
          const items = expensesByDay[iso] ?? [];
          const spent = items.reduce((s, e) => s + e.amount, 0);
          const hasItems = items.length > 0;
          const isToday = iso === todayStr;

          return (
            <button
              key={iso}
              type="button"
              disabled={!hasItems}
              onClick={() => hasItems && setSelected(iso)}
              className={`flex min-h-14 flex-col rounded-lg border p-1.5 text-left transition sm:min-h-16 ${
                hasItems
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                  : "border-border cursor-default"
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday
                    ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {d}
              </span>
              {hasItems ? (
                <span className="mt-auto truncate text-[10px] font-semibold text-primary">
                  {formatMoney(spent, currency)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Gastos del ${selectedDay} de ${MONTH_NAMES[month - 1]}`}
      >
        <div className="space-y-3">
          <ul className="divide-y divide-border">
            {selectedItems.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-lg">{e.categoryIcon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.categoryName}
                    </p>
                    {e.note && (
                      <p className="truncate text-xs text-muted">{e.note}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(e.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted">Total del día</span>
            <span className="text-base font-bold text-primary">
              {formatMoney(selectedTotal, currency)}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
