import { formatFCFA } from "@/lib/utils";

type ModeRow = { key: string; label: string; color: string; amount: number; pct: number };

export function RevenueByModeChart({ rows }: { rows: ModeRow[] }) {
  return (
    <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <h3 className="mb-4 font-serif text-xl text-isf-cream">Répartition par mode</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <p className="text-isf-textSecondary">
                {row.label} {Math.round(row.pct)}%
              </p>
              <p className="text-isf-cream">{formatFCFA(row.amount)}</p>
            </div>
            <div className="h-2 rounded-full bg-isf-bgElevated">
              <div className="h-2 rounded-full" style={{ width: `${Math.max(2, row.pct)}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
