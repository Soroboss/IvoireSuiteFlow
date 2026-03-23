"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, description, onCancel, onConfirm }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-isf-border bg-isf-bgElevated p-5">
        <h3 className="font-serif text-xl text-isf-cream">{title}</h3>
        {description ? <p className="mt-2 text-sm text-isf-textSecondary">{description}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-isf-border px-3 py-2 text-sm">
            Annuler
          </button>
          <button onClick={onConfirm} className="rounded-md bg-isf-gold px-3 py-2 text-sm text-black">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
