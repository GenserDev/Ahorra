/** Formatea un monto como moneda (ej. Q1,250.00). */
export function formatMoney(amount: number, currency = "GTQ"): string {
  try {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)}`;
  }
}

/** Fecha local en formato YYYY-MM-DD (para inputs date). */
export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** Muestra una fecha YYYY-MM-DD como "12 jun" en español. */
export function formatDayMonth(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}
