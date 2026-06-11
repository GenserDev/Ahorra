"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { deleteCategory } from "../actions";

export function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [blockedOpen, setBlockedOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.ok) {
        router.refresh();
      } else if (res.reason === "has_expenses") {
        setBlockedOpen(true);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Eliminar ${name}`}
        title="Eliminar categoría"
        className="text-muted transition hover:text-danger disabled:opacity-50"
      >
        ✕
      </button>

      <Modal
        open={blockedOpen}
        onClose={() => setBlockedOpen(false)}
        title="No se puede eliminar"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            La categoría <strong>{name}</strong> no se puede eliminar porque
            tiene gastos asociados.
          </p>
          <p className="text-sm text-muted">
            Si deseas eliminarla, primero elimina los gastos registrados en esta
            categoría.
          </p>
          <button
            type="button"
            onClick={() => setBlockedOpen(false)}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Entendido
          </button>
        </div>
      </Modal>
    </>
  );
}
