"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "../actions";
import { FloatingField } from "@/components/ui/floating-field";
import { SocialButtons } from "./social-buttons";

type Mode = "login" | "signup";

const COPY = {
  login: {
    title: "Bienvenido de vuelta a Ahorra",
    subtitle: "Inicia sesión para seguir tu progreso y alcanzar tus metas de ahorro.",
    submit: "Iniciar sesión",
    footer: "¿Nuevo en Ahorra?",
    footerLink: "Crea tu cuenta",
    footerHref: "/signup",
    divider: "O continúa con",
    verb: "iniciar sesión",
  },
  signup: {
    title: "Comienza tu camino con Ahorra",
    subtitle: "Crea tu cuenta y toma el control de tu futuro financiero.",
    submit: "Crear mi cuenta",
    footer: "¿Ya tienes cuenta?",
    footerLink: "Inicia sesión",
    footerHref: "/login",
    divider: "O regístrate con",
    verb: "registrarte",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const copy = COPY[mode];
  const e = state?.errors;

  return (
    <div>
      <header className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>
      </header>

      <form action={formAction} className="space-y-4">
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingField
              id="name"
              name="name"
              label="Nombre completo"
              autoComplete="name"
              error={e?.name?.[0]}
            />
            <FloatingField
              id="email"
              name="email"
              type="email"
              label="Correo electrónico"
              autoComplete="email"
              error={e?.email?.[0]}
            />
          </div>
        )}

        {mode === "login" && (
          <FloatingField
            id="email"
            name="email"
            type="email"
            label="Correo electrónico"
            autoComplete="email"
            error={e?.email?.[0]}
          />
        )}

        {mode === "signup" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingField
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              autoComplete="new-password"
              error={e?.password?.[0]}
            />
            <FloatingField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              autoComplete="new-password"
              error={e?.confirmPassword?.[0]}
            />
          </div>
        ) : (
          <FloatingField
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            autoComplete="current-password"
            error={e?.password?.[0]}
          />
        )}

        {mode === "login" ? (
          <div className="flex items-center justify-between text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-muted">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Recordarme
            </label>
            <Link href="/login" className="font-medium text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        ) : (
          <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            />
            <span>
              Acepto los{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
        )}

        {state?.message && (
          <p className="rounded-xl bg-foreground/5 px-4 py-3 text-sm text-foreground">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "Procesando…" : copy.submit}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted">{copy.divider}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <SocialButtons verb={copy.verb} />

      <p className="mt-7 text-center text-sm text-muted">
        {copy.footer}{" "}
        <Link href={copy.footerHref} className="font-semibold text-primary hover:underline">
          {copy.footerLink}
        </Link>
      </p>
    </div>
  );
}
