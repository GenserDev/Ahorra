export type Currency = { code: string; symbol: string; name: string };

export const CURRENCIES: Currency[] = [
  { code: "GTQ", symbol: "Q", name: "Quetzal guatemalteco" },
  { code: "USD", symbol: "$", name: "Dólar estadounidense" },
  { code: "MXN", symbol: "$", name: "Peso mexicano" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "COP", symbol: "$", name: "Peso colombiano" },
  { code: "PEN", symbol: "S/", name: "Sol peruano" },
  { code: "CLP", symbol: "$", name: "Peso chileno" },
  { code: "ARS", symbol: "$", name: "Peso argentino" },
];

export function currencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export type SuggestedCategory = { name: string; icon: string; color: string };

export const SUGGESTED_CATEGORIES: SuggestedCategory[] = [
  { name: "Comida", icon: "🍔", color: "#ef4444" },
  { name: "Transporte", icon: "⛽", color: "#f59e0b" },
  { name: "Hogar", icon: "🏠", color: "#3b82f6" },
  { name: "Ocio", icon: "🎮", color: "#8b5cf6" },
  { name: "Salud", icon: "💊", color: "#10b981" },
  { name: "Suscripciones", icon: "📺", color: "#ec4899" },
];

/** Paleta de colores para asignar a categorías personalizadas. */
export const CATEGORY_COLORS = [
  "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6",
  "#10b981", "#ec4899", "#06b6d4", "#f43f5e",
];
