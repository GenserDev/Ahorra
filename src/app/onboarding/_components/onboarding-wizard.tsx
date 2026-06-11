"use client";

import { useMemo, useState, useTransition } from "react";
import { FloatingField } from "@/components/ui/floating-field";
import {
  CURRENCIES,
  SUGGESTED_CATEGORIES,
  CATEGORY_COLORS,
  currencySymbol,
} from "@/lib/constants";
import { completeOnboarding } from "../actions";

type Cat = { name: string; icon: string | null; color: string };

const STEPS = ["Tu sueldo", "Categorías", "Tu primera meta"] as const;

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Paso 1
  const [currency, setCurrency] = useState("GTQ");
  const [salary, setSalary] = useState("");

  // Paso 2
  const [selected, setSelected] = useState<Cat[]>(
    SUGGESTED_CATEGORIES.slice(0, 4).map((c) => ({ ...c })),
  );
  const [customName, setCustomName] = useState("");

  // Paso 3
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const symbol = currencySymbol(currency);

  const isSelected = (name: string) =>
    selected.some((c) => c.name.toLowerCase() === name.toLowerCase());

  const toggleSuggested = (c: Cat) =>
    setSelected((prev) =>
      isSelected(c.name)
        ? prev.filter((x) => x.name.toLowerCase() !== c.name.toLowerCase())
        : [...prev, { ...c }],
    );

  const addCustom = () => {
    const name = customName.trim();
    if (!name || isSelected(name)) {
      setCustomName("");
      return;
    }
    const color = CATEGORY_COLORS[selected.length % CATEGORY_COLORS.length];
    setSelected((prev) => [...prev, { name, icon: "🏷️", color }]);
    setCustomName("");
  };

  const removeCat = (name: string) =>
    setSelected((prev) =>
      prev.filter((x) => x.name.toLowerCase() !== name.toLowerCase()),
    );

  const salaryNum = Number(salary);
  const step1Valid = salary !== "" && !Number.isNaN(salaryNum) && salaryNum >= 0;
  const step2Valid = selected.length >= 1;

  const allSuggested = useMemo(
    () =>
      SUGGESTED_CATEGORIES.map((c) => ({ ...c, on: isSelected(c.name) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  );

  const customs = selected.filter(
    (c) => !SUGGESTED_CATEGORIES.some((s) => s.name === c.name),
  );

  function finish() {
    setError(null);
    const amount = Number(goalAmount);
    const goal =
      goalName.trim() && amount > 0
        ? {
            name: goalName.trim(),
            target_amount: amount,
            deadline: goalDeadline || null,
          }
        : null;

    startTransition(async () => {
      const res = await completeOnboarding({
        currency,
        salary: salaryNum,
        categories: selected.map((c) => ({
          name: c.name,
          icon: c.icon,
          color: c.color,
        })),
        goal,
      });
      // Si llega aquí es porque hubo error (el éxito redirige).
      if (res && !res.ok) setError(res.message);
    });
  }

  return (
    <div className="w-full max-w-lg">
      {/* Encabezado + progreso */}
      <div className="mb-6">
        <p className="text-sm text-muted">
          {step === 0 ? `¡Hola, ${firstName}! Configuremos tu cuenta.` : `Paso ${step + 1} de 3`}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {STEPS[step]}
        </h1>
        <div className="mt-4 flex gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Paso 1: Moneda + sueldo */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Moneda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="h-14 w-full rounded-xl border border-input bg-transparent px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-card text-foreground">
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              {symbol}
            </span>
            <FloatingField
              id="salary"
              label="Sueldo mensual"
              type="number"
              inputMode="decimal"
              min={0}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="[&_input]:pl-9 [&_label]:left-7"
            />
          </div>
          <p className="text-xs text-muted">
            Lo usaremos para calcular tu ahorro esperado cada mes. Puedes
            cambiarlo cuando quieras.
          </p>
        </div>
      )}

      {/* Paso 2: Categorías */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            Elige las categorías donde sueles gastar. Puedes agregar las tuyas.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {allSuggested.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleSuggested(c)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                  c.on
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted hover:border-foreground/30"
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                <span className="font-medium">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Categorías personalizadas agregadas */}
          {customs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customs.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1 text-sm"
                  style={{ borderColor: c.color }}
                >
                  {c.icon} {c.name}
                  <button
                    type="button"
                    onClick={() => removeCat(c.name)}
                    aria-label={`Quitar ${c.name}`}
                    className="ml-0.5 text-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Agregar personalizada */}
          <div className="flex gap-2">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Agregar otra categoría…"
              className="h-11 flex-1 rounded-xl border border-input bg-transparent px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addCustom}
              className="h-11 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              Agregar
            </button>
          </div>

          <p className="text-xs text-muted">
            {selected.length} categoría{selected.length === 1 ? "" : "s"}{" "}
            seleccionada{selected.length === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      {/* Paso 3: Meta opcional */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Define tu primera meta de ahorro (opcional). Podrás crear más
            después.
          </p>
          <FloatingField
            id="goalName"
            label="Nombre de la meta (ej. Viaje a Japón)"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              {symbol}
            </span>
            <FloatingField
              id="goalAmount"
              label="Monto objetivo"
              type="number"
              inputMode="decimal"
              min={0}
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="[&_input]:pl-9 [&_label]:left-7"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Fecha límite (opcional)
            </label>
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="h-14 w-full rounded-xl border border-input bg-transparent px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Navegación */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-0"
        >
          Atrás
        </button>

        <div className="flex items-center gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-50"
            >
              Omitir meta
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
