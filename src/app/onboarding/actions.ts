"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PayloadSchema = z.object({
  currency: z.string().min(1),
  salary: z.number().min(0, { error: "El sueldo no puede ser negativo." }),
  categories: z
    .array(
      z.object({
        name: z.string().min(1).max(40),
        icon: z.string().max(8).nullable().optional(),
        color: z.string().max(16).nullable().optional(),
      }),
    )
    .min(1, { error: "Crea al menos una categoría." }),
  goal: z
    .object({
      name: z.string().min(1).max(60),
      target_amount: z.number().positive(),
      deadline: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type OnboardingPayload = z.infer<typeof PayloadSchema>;

export type OnboardingResult = { ok: false; message: string };

export async function completeOnboarding(
  payload: OnboardingPayload,
): Promise<OnboardingResult> {
  const parsed = PayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos ingresados." };
  }
  const { currency, salary, categories, goal } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Perfil: moneda + marcar onboarding completado
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ currency, onboarded: true })
    .eq("id", user.id);
  if (profileErr) return { ok: false, message: "No se pudo guardar el perfil." };

  // 2. Sueldo del mes actual (un registro por mes/usuario)
  const now = new Date();
  const { error: monthErr } = await supabase.from("months").upsert(
    {
      user_id: user.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      salary,
    },
    { onConflict: "user_id,year,month" },
  );
  if (monthErr) return { ok: false, message: "No se pudo guardar el sueldo." };

  // 3. Categorías
  const { error: catErr } = await supabase.from("categories").insert(
    categories.map((c) => ({
      user_id: user.id,
      name: c.name,
      icon: c.icon ?? null,
      color: c.color ?? null,
    })),
  );
  if (catErr) return { ok: false, message: "No se pudieron guardar las categorías." };

  // 4. Meta inicial (opcional)
  if (goal) {
    const { error: goalErr } = await supabase.from("goals").insert({
      user_id: user.id,
      name: goal.name,
      target_amount: goal.target_amount,
      deadline: goal.deadline ?? null,
    });
    if (goalErr) return { ok: false, message: "No se pudo guardar la meta." };
  }

  redirect("/home");
}
