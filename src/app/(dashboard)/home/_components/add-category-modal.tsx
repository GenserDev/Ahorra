"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { FloatingField } from "@/components/ui/floating-field";
import { EmojiPicker, DEFAULT_ICON } from "@/components/ui/emoji-picker";
import { addCategory, type ActionState } from "../actions";

export function AddCategoryModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addCategory,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      setIcon(DEFAULT_ICON);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIcon(DEFAULT_ICON);
          setOpen(true);
        }}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-foreground/5"
      >
        + Categoría
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva categoría">
        <form action={formAction} className="space-y-4">
          {/* El emoji solo se elige del tablero (no se pueden escribir letras) */}
          <input type="hidden" name="icon" value={icon} />
          <div className="flex items-start gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Emoji
              </label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>
            <div className="flex-1 pt-7">
              <FloatingField
                id="name"
                name="name"
                label="Nombre"
                error={state?.errors?.name?.[0]}
              />
            </div>
          </div>

          {state?.message && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Creando…" : "Crear categoría"}
          </button>
        </form>
      </Modal>
    </>
  );
}
