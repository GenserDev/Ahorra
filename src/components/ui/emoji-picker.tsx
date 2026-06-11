"use client";

import { useEffect, useRef, useState } from "react";

export const DEFAULT_ICON = "🏷️";

const EMOJIS = [
  "🏷️", "🍔", "🍕", "🛒", "🍺", "☕", "🍎", "🍣",
  "🚗", "⛽", "🚌", "✈️", "🏠", "💡", "🔧", "🛋️",
  "📱", "📺", "🎮", "🎬", "🎵", "📚", "🎓", "💻",
  "👕", "👟", "💄", "✂️", "💊", "🏥", "💪", "🏋️",
  "🐶", "🐱", "🎁", "💼", "🏦", "💳", "💰", "🧾",
  "🌱", "☂️", "🎉", "🍷", "🧼", "⚽", "🚿", "✏️",
];

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Elegir emoji"
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-input bg-transparent text-2xl outline-none transition hover:bg-foreground/5 focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {value || DEFAULT_ICON}
      </button>

      {open && (
        <div className="absolute left-0 top-16 z-20 grid w-64 grid-cols-8 gap-1 rounded-xl border border-border bg-card p-2 shadow-xl">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg transition hover:bg-foreground/10 ${
                value === e ? "bg-primary/15" : ""
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
