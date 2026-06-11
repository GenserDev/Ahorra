"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_COLORS } from "@/lib/constants";

export type ActionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

/** Devuelve el id del mes para una fecha dada; lo crea si no existe. */
async function getOrCreateMonthId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: Date,
): Promise<string | null> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const { data: existing } = await supabase
    .from("months")
    .select("id")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("months")
    .insert({ user_id: userId, year, month, salary: 0 })
    .select("id")
    .single();

  return created?.id ?? null;
}

const ExpenseSchema = z.object({
  category_id: z.uuid({ error: "Elige una categoría." }),
  amount: z.coerce.number().positive({ error: "Ingresa un monto mayor a 0." }),
  date: z.string().min(1, { error: "Elige una fecha." }),
  note: z
    .string()
    .max(140, { error: "La nota no puede superar 140 caracteres." })
    .optional(),
});

export async function addExpense(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = ExpenseSchema.safeParse({
    category_id: formData.get("category_id"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });
  if (!fields.success) {
    return { ok: false, errors: z.flattenError(fields.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const monthId = await getOrCreateMonthId(
    supabase,
    user.id,
    new Date(fields.data.date + "T00:00:00"),
  );
  if (!monthId) return { ok: false, message: "No se pudo registrar el mes." };

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    month_id: monthId,
    category_id: fields.data.category_id,
    amount: fields.data.amount,
    date: fields.data.date,
    note: fields.data.note ?? null,
  });
  if (error) return { ok: false, message: "No se pudo guardar el gasto." };

  revalidatePath("/home");
  return { ok: true };
}

export async function deleteExpense(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS garantiza que solo borre gastos propios.
  await supabase.from("expenses").delete().eq("id", id);
  revalidatePath("/home");
}

const CategorySchema = z.object({
  name: z.string().min(1, { error: "Escribe un nombre." }).max(40),
  icon: z.string().max(16).optional(),
});

export async function addCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fields = CategorySchema.safeParse({
    name: formData.get("name"),
    icon: formData.get("icon") || undefined,
  });
  if (!fields.success) {
    return { ok: false, errors: z.flattenError(fields.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Color aleatorio de la paleta.
  const color =
    CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: fields.data.name,
    icon: fields.data.icon ?? "🏷️",
    color,
  });
  if (error) return { ok: false, message: "No se pudo crear la categoría." };

  revalidatePath("/home");
  return { ok: true };
}

export type DeleteCategoryResult = {
  ok: boolean;
  reason?: "has_expenses" | "error";
};

export async function deleteCategory(
  id: string,
): Promise<DeleteCategoryResult> {
  if (!id) return { ok: false, reason: "error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si la categoría tiene gastos asociados, no se puede eliminar.
  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("category_id", id);

  if ((count ?? 0) > 0) return { ok: false, reason: "has_expenses" };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, reason: "error" };

  revalidatePath("/home");
  return { ok: true };
}
