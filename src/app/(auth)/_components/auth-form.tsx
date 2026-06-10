"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "../actions";

type Mode = "login" | "signup";

const COPY = {
  login: {
    title: "Inicia sesión",
    subtitle: "Bienvenido de vuelta a Ahorra.",
    submit: "Entrar",
    footer: "¿No tienes cuenta?",
    footerLink: "Crear una",
    footerHref: "/signup",
  },
  signup: {
    title: "Crea tu cuenta",
    subtitle: "Empieza a controlar tus gastos hoy.",
    submit: "Registrarme",
    footer: "¿Ya tienes cuenta?",
    footerLink: "Inicia sesión",
    footerHref: "/login",
  },
} as const;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-sm text-red-600">{messages[0]}</p>;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const copy = COPY[mode];

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{copy.subtitle}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <FieldError messages={state?.errors?.name} />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
          <FieldError messages={state?.errors?.email} />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
          <FieldError messages={state?.errors?.password} />
        </div>

        {state?.message && (
          <p className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Procesando…" : copy.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        {copy.footer}{" "}
        <Link href={copy.footerHref} className="font-medium text-neutral-900 underline">
          {copy.footerLink}
        </Link>
      </p>
    </div>
  );
}
