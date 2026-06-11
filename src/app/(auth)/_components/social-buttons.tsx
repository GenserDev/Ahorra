"use client";

import { useState } from "react";

/**
 * Botones de login social (Google / Apple / Facebook).
 * Nota MVP: el OAuth se implementa en la Fase 4. Por ahora muestran un aviso.
 */
export function SocialButtons({ verb = "continuar" }: { verb?: string }) {
  const [msg, setMsg] = useState<string | null>(null);

  const handle = (provider: string) =>
    setMsg(`Pronto podrás ${verb} con ${provider}.`);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <SocialBtn label="Google" onClick={() => handle("Google")}>
          <GoogleIcon />
        </SocialBtn>
        <SocialBtn label="Apple" onClick={() => handle("Apple")}>
          <AppleIcon />
        </SocialBtn>
        <SocialBtn label="Facebook" onClick={() => handle("Facebook")}>
          <FacebookIcon />
        </SocialBtn>
      </div>
      {msg && <p className="mt-3 text-center text-xs text-muted">{msg}</p>}
    </div>
  );
}

function SocialBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 items-center justify-center rounded-xl border border-input bg-card transition hover:bg-foreground/5"
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-foreground">
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.47 7.83 1.3 10.39.86 1.25 1.89 2.66 3.24 2.61 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.03 2.29-1.28 3.15-2.54 1-1.45 1.41-2.86 1.43-2.93-.03-.01-2.74-1.05-2.77-4.18zM14.5 4.5c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.18 1.15.09 2.32-.58 3.03-1.45z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12z" />
    </svg>
  );
}
