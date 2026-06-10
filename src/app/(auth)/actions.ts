"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.email({ error: "Ingresa un correo válido." }).trim(),
  password: z.string().min(1, { error: "Ingresa tu contraseña." }),
});

const SignupSchema = z.object({
  name: z.string().min(2, { error: "Tu nombre debe tener al menos 2 letras." }).trim(),
  email: z.email({ error: "Ingresa un correo válido." }).trim(),
  password: z
    .string()
    .min(8, { error: "La contraseña debe tener al menos 8 caracteres." }),
});

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(fields.data);

  if (error) {
    return { message: "Correo o contraseña incorrectos." };
  }

  redirect("/home");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fields = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!fields.success) {
    return { errors: z.flattenError(fields.error).fieldErrors };
  }

  const { name, email, password } = fields.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { message: error.message };
  }

  // Si Supabase tiene la confirmación de correo activada, no habrá sesión aún.
  if (!data.session) {
    return {
      message: "Cuenta creada. Revisa tu correo para confirmar tu cuenta.",
    };
  }

  redirect("/home");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
