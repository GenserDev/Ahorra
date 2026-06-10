"use client";

import { useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
  label: string;
  error?: string;
};

/**
 * Input con label flotante "notched" (estilo Material), igual al de la referencia.
 * Si el type es "password" muestra un botón de ojo para revelar/ocultar.
 */
export function FloatingField({ label, error, type = "text", id, className = "", ...props }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder=" "
          className={`peer h-14 w-full rounded-xl border bg-transparent px-4 ${
            isPassword ? "pr-11" : ""
          } pt-4 text-[15px] text-foreground outline-none transition
            placeholder-transparent
            ${error ? "border-danger" : "border-input focus:border-primary"}
            focus:ring-1 ${error ? "focus:ring-danger" : "focus:ring-primary"}`}
          {...props}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-card px-1 text-[15px] text-muted transition-all
            peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium
            peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium
            ${error ? "text-danger peer-focus:text-danger" : "peer-focus:text-primary"}`}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 px-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
