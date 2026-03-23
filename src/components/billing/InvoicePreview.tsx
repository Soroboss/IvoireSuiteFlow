import { formatFCFA } from "@/lib/utils";

export function InvoicePreview({
  invoice
}: {
  invoice: {
    invoice_number: string;
    client_name: string;
    room_number: string;
    mode: string;
    period: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method?: string;
    reference?: string;
    establishment: { name: string; address?: string; phone?: string };
  };
}) {
  return (
    <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <div className="mb-3 border-b border-isf-border pb-3">
        <h3 className="font-serif text-2xl text-isf-gold">IvoireSuiteFlow</h3>
        <p className="text-sm text-isf-textSecondary">{invoice.establishment.name}</p>
        <p className="text-xs text-isf-textMuted">{invoice.establishment.address ?? "-"}</p>
      </div>
      <div className="grid gap-2 text-sm md:grid-cols-2">
        <p>Facture: {invoice.invoice_number}</p>
        <p>Client: {invoice.client_name}</p>
        <p>Logement: {invoice.room_number}</p>
        <p>Mode: {invoice.mode}</p>
        <p className="md:col-span-2">Période: {invoice.period}</p>
      </div>
      <div className="mt-3 space-y-1 rounded-lg border border-isf-border bg-isf-bgElevated p-3 text-sm">
        <p>Sous-total: {formatFCFA(invoice.subtotal)}</p>
        <p>Taxes: {formatFCFA(invoice.tax_amount)}</p>
        <p>Réductions: {formatFCFA(invoice.discount_amount)}</p>
        <p className="font-serif text-2xl text-isf-gold">TOTAL: {formatFCFA(invoice.total_amount)}</p>
      </div>
      <p className="mt-3 text-xs text-isf-textSecondary">
        Paiement: {invoice.payment_method ?? "-"} {invoice.reference ? `· Ref: ${invoice.reference}` : ""}
      </p>
      <p className="mt-6 text-center text-xs text-isf-textMuted">
        IvoireSuiteFlow — Simplifiez vos opérations, valorisez vos établissements.
      </p>
    </div>
  );
}
