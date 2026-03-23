import { Plus } from "lucide-react";

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-isf-border bg-isf-bgDeep/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-isf-cream">{title}</h1>
          {subtitle ? <p className="text-sm text-isf-textMuted">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden items-center gap-2 rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black md:flex">
            <Plus className="h-4 w-4" />
            Nouvelle réservation
          </button>
          <select className="h-10 rounded-md border border-isf-border bg-isf-bgCard px-3 text-sm text-isf-textSecondary">
            <option>Résidence Angré</option>
            <option>Hôtel Plateau</option>
          </select>
        </div>
      </div>
    </header>
  );
}
