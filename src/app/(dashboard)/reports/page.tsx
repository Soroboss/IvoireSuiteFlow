"use client";

import { useMemo } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReportsData } from "@/hooks/useReportsData";
import { formatFCFA } from "@/lib/utils";

const COLORS = {
  hourly: "#F59E0B",
  nightly: "#C8A951",
  stay: "#3B82F6",
  pass: "#8B5CF6"
};

export default function ReportsPage() {
  const { period, setPeriod, startDate, endDate, setStartDate, setEndDate, filtered, metrics } = useReportsData();

  const modeRows = useMemo(
    () => [
      { name: "Horaire", value: metrics.byMode.hourly, color: COLORS.hourly },
      { name: "Nuitée", value: metrics.byMode.nightly, color: COLORS.nightly },
      { name: "Séjour", value: metrics.byMode.stay, color: COLORS.stay },
      { name: "Pass", value: metrics.byMode.pass, color: COLORS.pass }
    ],
    [metrics.byMode.hourly, metrics.byMode.nightly, metrics.byMode.pass, metrics.byMode.stay]
  );

  const paymentRows = useMemo(
    () => Object.entries(metrics.byPayment).map(([name, value]) => ({ name, value })),
    [metrics.byPayment]
  );

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport Analytics IvoireSuiteFlow", 14, 18);
    doc.setFontSize(11);
    doc.text(`CA total: ${formatFCFA(metrics.totalRevenue)}`, 14, 30);
    doc.text(`ADR: ${formatFCFA(metrics.adr)} | RevPAR: ${formatFCFA(metrics.revpar)}`, 14, 38);
    doc.text(`Occupation moyenne: ${metrics.occupancyAvg.toFixed(1)}%`, 14, 46);
    doc.text("Top logements:", 14, 58);
    metrics.topRooms.slice(0, 5).forEach((item, index) => doc.text(`${index + 1}. ${item[0]} - ${formatFCFA(item[1])}`, 18, 66 + index * 8));
    doc.save("rapport-isf.pdf");
  };

  const exportXlsx = () => {
    const wb = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet([
      { metrique: "CA total", valeur: metrics.totalRevenue },
      { metrique: "ADR", valeur: metrics.adr },
      { metrique: "RevPAR", valeur: metrics.revpar },
      { metrique: "Occupation moyenne", valeur: metrics.occupancyAvg }
    ]);
    const reservations = XLSX.utils.json_to_sheet(
      filtered.map((r) => ({
        ref: r.booking_ref,
        client: r.client_name ?? "",
        room: r.room_number ?? "",
        mode: r.booking_mode,
        montant: r.total_amount,
        statut: r.status,
        paiement: r.payment_status
      }))
    );
    XLSX.utils.book_append_sheet(wb, summary, "Résumé");
    XLSX.utils.book_append_sheet(wb, reservations, "Réservations");
    XLSX.writeFile(wb, "analytics-isf.xlsx");
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl text-isf-cream">Rapports & Analytics</h1>
          <p className="text-sm text-isf-textSecondary">Analyse de performance et export financier.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPdf} className="rounded-md border border-isf-border px-3 py-2 text-sm">
            Télécharger PDF
          </button>
          <button onClick={exportXlsx} className="rounded-md border border-isf-border px-3 py-2 text-sm">
            Télécharger Excel
          </button>
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-isf-border bg-isf-bgCard p-3 md:grid-cols-2 xl:grid-cols-6">
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="custom">Personnalisé</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4"><p className="text-xs text-isf-textMuted">CA total</p><p className="font-serif text-2xl text-isf-gold">{formatFCFA(metrics.totalRevenue)}</p></article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4"><p className="text-xs text-isf-textMuted">Occupation moyenne</p><p className="font-serif text-2xl">{metrics.occupancyAvg.toFixed(1)}%</p></article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4"><p className="text-xs text-isf-textMuted">ADR</p><p className="font-serif text-2xl">{formatFCFA(metrics.adr)}</p></article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4"><p className="text-xs text-isf-textMuted">RevPAR</p><p className="font-serif text-2xl">{formatFCFA(metrics.revpar)}</p></article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">CA par mode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeRows} dataKey="value" nameKey="name" outerRadius={90} label>
                  {modeRows.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">Paiements par méthode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentRows} dataKey="value" nameKey="name" outerRadius={90} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">Top 10 logements par revenu</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topRooms.map((r) => ({ name: r[0], value: r[1] }))} layout="vertical">
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#C8A951" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">Revenus horaires par tranche</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.hourlySlots.map((r) => ({ slot: r[0], value: r[1] }))}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />
                <XAxis dataKey="slot" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="#F59E0B33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">Top 10 clients</h3>
          <div className="space-y-2">
            {metrics.topClients.map((c) => (
              <div key={c[0]} className="flex items-center justify-between rounded-md border border-isf-border bg-isf-bgElevated p-2 text-sm">
                <span>{c[0]}</span>
                <span className="text-isf-gold">{formatFCFA(c[1])}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-2 font-serif text-xl">Réservations par statut</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byStatus).map(([statusName, value]) => (
              <div key={statusName} className="flex items-center justify-between rounded-md border border-isf-border bg-isf-bgElevated p-2 text-sm">
                <span>{statusName}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
