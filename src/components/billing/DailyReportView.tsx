"use client";

import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { formatFCFA } from "@/lib/utils";

export function DailyReportView({
  summary,
  checkins,
  checkouts,
  reservationsCount,
  cancellations,
  onCloseDay
}: {
  summary: {
    cash: number;
    orange_money: number;
    mtn_momo: number;
    wave: number;
    moov_money: number;
    card: number;
    transfer: number;
    corporate: number;
    totalRevenue: number;
  };
  checkins: number;
  checkouts: number;
  reservationsCount: number;
  cancellations: number;
  onCloseDay: (closingCash: number, variance: number) => Promise<void>;
}) {
  const [realCash, setRealCash] = useState(summary.cash);
  const variance = useMemo(() => realCash - summary.cash, [realCash, summary.cash]);

  const printPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport Z - IvoireSuiteFlow", 14, 18);
    doc.setFontSize(11);
    doc.text(`Espèces: ${formatFCFA(summary.cash)}`, 14, 32);
    doc.text(`Orange Money: ${formatFCFA(summary.orange_money)}`, 14, 40);
    doc.text(`MTN MoMo: ${formatFCFA(summary.mtn_momo)}`, 14, 48);
    doc.text(`Wave: ${formatFCFA(summary.wave)}`, 14, 56);
    doc.text(`Moov Money: ${formatFCFA(summary.moov_money)}`, 14, 64);
    doc.text(`Carte: ${formatFCFA(summary.card)}`, 14, 72);
    doc.text(`Virement: ${formatFCFA(summary.transfer)}`, 14, 80);
    doc.text(`Corporate: ${formatFCFA(summary.corporate)}`, 14, 88);
    doc.text(`TOTAL: ${formatFCFA(summary.totalRevenue)}`, 14, 100);
    doc.text(`Caisse réelle: ${formatFCFA(realCash)} | Variance: ${formatFCFA(variance)}`, 14, 110);
    doc.save("rapport-z-isf.pdf");
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Espèces", summary.cash],
          ["Orange Money", summary.orange_money],
          ["MTN MoMo", summary.mtn_momo],
          ["Wave", summary.wave],
          ["Moov Money", summary.moov_money],
          ["Carte", summary.card],
          ["Virement", summary.transfer],
          ["Corporate", summary.corporate]
        ].map(([label, value]) => (
          <article key={label as string} className="rounded-lg border border-isf-border bg-isf-bgCard p-3">
            <p className="text-xs text-isf-textMuted">{label as string}</p>
            <p className="text-sm text-isf-cream">{formatFCFA(value as number)}</p>
          </article>
        ))}
      </div>

      <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <p className="text-sm text-isf-textSecondary">TOTAL REVENUS JOUR</p>
        <p className="font-serif text-3xl text-isf-gold">{formatFCFA(summary.totalRevenue)}</p>
      </article>

      <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <label className="mb-1 block text-sm text-isf-textSecondary">Montant caisse réelle (espèces)</label>
        <input type="number" value={realCash} onChange={(e) => setRealCash(Number(e.target.value))} className="h-10 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
        <p className={`mt-2 text-sm ${variance > 0 ? "text-isf-success" : variance < 0 ? "text-isf-error" : "text-isf-success"}`}>
          {variance > 0 ? "Excédent" : variance < 0 ? "Manquant" : "Caisse juste"} · {formatFCFA(variance)}
        </p>
      </article>

      <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm">
        <p>Check-in: {checkins}</p>
        <p>Check-out: {checkouts}</p>
        <p>Réservations: {reservationsCount}</p>
        <p>Annulations: {cancellations}</p>
      </article>

      <div className="flex gap-2">
        <button onClick={printPdf} className="rounded-md border border-isf-border px-3 py-2 text-sm">
          Imprimer PDF
        </button>
        <button onClick={() => onCloseDay(realCash, variance)} className="rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black">
          Clôturer la journée
        </button>
      </div>
    </section>
  );
}
