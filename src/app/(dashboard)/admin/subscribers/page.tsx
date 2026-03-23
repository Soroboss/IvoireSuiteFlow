"use client";

import { useAdminSaasData } from "@/hooks/useAdminSaasData";
import { formatFCFA, formatDate } from "@/lib/utils";

const PRICE_BY_PLAN = {
  trial: 0,
  starter: 19900,
  pro: 39900,
  business: 79900
};

export default function AdminSubscribersPage() {
  const { loading, rows, error } = useAdminSaasData();

  if (loading) {
    return <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement abonnes...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-isf-error/40 bg-isf-error/10 p-4 text-sm text-isf-error">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <article className="overflow-auto rounded-xl border border-isf-border bg-isf-bgCard">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-isf-bgElevated text-isf-textSecondary">
            <tr>
              <th className="px-3 py-3">Hotel</th>
              <th className="px-3 py-3">Ville</th>
              <th className="px-3 py-3">Plan</th>
              <th className="px-3 py-3">Chambres</th>
              <th className="px-3 py-3">Mensualite</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Echeance</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-isf-border">
                <td className="px-3 py-3">{row.name}</td>
                <td className="px-3 py-3">{row.city ?? "-"}</td>
                <td className="px-3 py-3 uppercase">{row.subscription_plan}</td>
                <td className="px-3 py-3">{row.room_count ?? 0}</td>
                <td className="px-3 py-3">{formatFCFA(PRICE_BY_PLAN[row.subscription_plan])}</td>
                <td className="px-3 py-3">{row.subscription_status}</td>
                <td className="px-3 py-3">{row.subscription_ends_at ? formatDate(row.subscription_ends_at, "dd/MM/yyyy") : "-"}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-md border border-isf-border px-2 py-1 text-xs">Voir details</button>
                    <button className="rounded-md border border-isf-border px-2 py-1 text-xs">Changer plan</button>
                    <button className="rounded-md border border-isf-border px-2 py-1 text-xs">Prolonger essai</button>
                    <button className="rounded-md border border-isf-border px-2 py-1 text-xs">Suspendre</button>
                    <button className="rounded-md border border-isf-border px-2 py-1 text-xs">Relancer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
