"use client";

import { useState } from "react";
import { downloadInvoicePdf } from "@/lib/pdf/invoice-template";
import { useBillingData } from "@/hooks/useBillingData";
import { formatDate, formatFCFA } from "@/lib/utils";
import { InvoicePreview } from "@/components/billing/InvoicePreview";

export default function BillingPage() {
  const { loading, invoices } = useBillingData();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Facturation</h1>
        <p className="text-sm text-isf-textSecondary">Gestion des factures et génération PDF.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <table className="min-w-full text-sm">
            <thead className="text-left text-isf-textSecondary">
              <tr>
                <th className="py-2">N° facture</th>
                <th className="py-2">Client</th>
                <th className="py-2">Montant</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const client = (Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients)?.full_name ?? "Client";
                return (
                  <tr key={invoice.id} className="border-t border-isf-border">
                    <td className="py-2">{invoice.invoice_number}</td>
                    <td className="py-2">{client}</td>
                    <td className="py-2 text-isf-gold">{formatFCFA(Number(invoice.total_amount ?? 0))}</td>
                    <td className="py-2">{invoice.paid_at ? "Payée" : "Impayée"}</td>
                    <td className="py-2">{formatDate(invoice.created_at, "dd/MM/yyyy")}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          className="rounded-md border border-isf-border px-2 py-1 text-xs"
                          onClick={() =>
                            setSelectedInvoice({
                              invoice_number: invoice.invoice_number,
                              client_name: client,
                              room_number: "-",
                              mode: "-",
                              period: "-",
                              subtotal: Number(invoice.subtotal ?? 0),
                              tax_amount: Number(invoice.tax_amount ?? 0),
                              discount_amount: 0,
                              total_amount: Number(invoice.total_amount ?? 0),
                              establishment: { name: "IvoireSuiteFlow" }
                            })
                          }
                        >
                          Voir
                        </button>
                        <button
                          className="rounded-md border border-isf-border px-2 py-1 text-xs"
                          onClick={() =>
                            downloadInvoicePdf({
                              bookingRef: invoice.invoice_number,
                              clientName: client,
                              roomNumber: "-",
                              mode: "Facture",
                              checkIn: formatDate(invoice.created_at),
                              checkOut: formatDate(invoice.created_at),
                              total: Number(invoice.total_amount ?? 0)
                            })
                          }
                        >
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedInvoice ? <InvoicePreview invoice={selectedInvoice} /> : null}
    </section>
  );
}
