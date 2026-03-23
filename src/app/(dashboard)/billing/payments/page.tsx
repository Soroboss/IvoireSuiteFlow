"use client";

import { useMemo } from "react";
import { PaymentForm } from "@/components/billing/PaymentForm";
import { useBillingData } from "@/hooks/useBillingData";
import { formatDate, formatFCFA } from "@/lib/utils";

export default function BillingPaymentsPage() {
  const { openBalances, addPayment, loading } = useBillingData();

  const timeline = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() + i);
        return {
          label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
          status: i === 0 ? "en retard" : i === 1 ? "à venir" : "à venir"
        };
      }),
    []
  );

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Encaissements</h1>
        <p className="text-sm text-isf-textSecondary">Paiements partiels, soldes restants et échéanciers.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {openBalances.map((res: any) => {
            const client = (Array.isArray(res.clients) ? res.clients[0] : res.clients)?.full_name ?? "Client";
            return (
              <article key={res.id} className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
                <p className="text-sm text-isf-cream">
                  {res.booking_ref} · {client}
                </p>
                <p className="text-xs text-isf-textSecondary">
                  Solde restant estimé: <span className="text-isf-gold">{formatFCFA(Number(res.total_amount ?? 0))}</span> · {res.payment_status}
                </p>
                <p className="mb-2 text-xs text-isf-textMuted">Période: {formatDate(res.check_in_at, "dd/MM/yyyy")} → {formatDate(res.check_out_at, "dd/MM/yyyy")}</p>
                <PaymentForm
                  reservation={{ id: res.id, booking_ref: res.booking_ref, client_name: client, total_amount: Number(res.total_amount ?? 0) }}
                  onSubmit={async (amount, method, reference) => addPayment(res.id, amount, method, reference)}
                />
                {res.booking_mode === "stay" ? (
                  <div className="mt-3 rounded-lg border border-isf-border bg-isf-bgElevated p-3">
                    <p className="mb-2 text-sm text-isf-textSecondary">Échéancier mensuel</p>
                    <div className="space-y-2">
                      {timeline.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="flex items-center gap-3 text-sm">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.status === "en retard" ? "bg-isf-error" : "bg-isf-info"}`} />
                          <span className="text-isf-textSecondary">{item.label}</span>
                          <span className={item.status === "en retard" ? "text-isf-error" : "text-isf-info"}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
