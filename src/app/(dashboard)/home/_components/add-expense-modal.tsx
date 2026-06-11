"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { FloatingField } from "@/components/ui/floating-field";
import { currencySymbol } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import { addExpense, type ActionState } from "../actions";

type Category = { id: string; name: string; icon: string | null; color: string | null };

export function AddExpenseModal({
  categories,
  currency,
}: {
  categories: Category[];
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addExpense,
    undefined,
  );

  const NOTE_MAX = 140;

  // Al guardar con éxito: cerrar, limpiar la nota y refrescar el dashboard.
  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      setNote("");
      router.refresh();
    }
  }, [state, router]);

  const symbol = currencySymbol(currency);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNote("");
          setOpen(true);
        }}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
      >
        + Agregar gasto
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo gasto">
        {categories.length === 0 ? (
          <p className="text-sm text-muted">
            Primero crea una categoría para registrar gastos.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            {/* Categoría */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Categoría
              </label>
              <input type="hidden" name="category_id" value={categoryId} />
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = c.id === categoryId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted hover:border-foreground/30"
                      }`}
                    >
                      <span>{c.icon ?? "🏷️"}</span>
                      {c.name}
                    </button>
                  );
                })}
              </div>
              {state?.errors?.category_id && (
                <p className="mt-1 text-xs text-danger">
                  {state.errors.category_id[0]}
                </p>
              )}
            </div>

            {/* Monto */}
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                {symbol}
              </span>
              <FloatingField
                id="amount"
                name="amount"
                label="Monto"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                error={state?.errors?.amount?.[0]}
                className="[&_input]:pl-9 [&_label]:left-7"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                defaultValue={todayISO()}
                max={todayISO()}
                className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {state?.errors?.date && (
                <p className="mt-1 text-xs text-danger">{state.errors.date[0]}</p>
              )}
            </div>

            {/* Nota */}
            <div>
              <FloatingField
                id="note"
                name="note"
                label="Nota (opcional)"
                maxLength={NOTE_MAX}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                error={state?.errors?.note?.[0]}
              />
              <p
                className={`mt-1 text-right text-xs ${
                  note.length >= NOTE_MAX ? "text-danger" : "text-muted"
                }`}
              >
                {note.length}/{NOTE_MAX}
              </p>
            </div>

            {state?.message && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar gasto"}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
