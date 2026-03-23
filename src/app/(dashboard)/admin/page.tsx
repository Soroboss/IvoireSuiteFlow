"use client";

import { AlertTriangle } from "lucide-react";
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, BarChart, Bar } from "recharts";
import { useAdminSaasData } from "@/hooks/useAdminSaasData";
import { formatFCFA } from "@/lib/utils";

const colors = ["#C8A951", "#0EA5E9", "#8B5CF6"];

export default function AdminDashboardPage() {
  const { loading, kpis, subscribers12m, mrr12m, planDistribution, cityDistribution, alerts } = useAdminSaasData();

  if (loading) {
    return <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement SaaS...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Hotels abonnes" value={kpis.totalHotels.toString()} />
        <Card title="MRR" value={formatFCFA(kpis.mrr)} />
        <Card title="Taux de churn" value={`${kpis.churnRate}%`} />
        <Card title="Essais en cours" value={kpis.trials.toString()} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-3 text-sm text-isf-textSecondary">Evolution abonnes (12 mois)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={subscribers12m}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line dataKey="subscribers" stroke="#C8A951" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-3 text-sm text-isf-textSecondary">MRR (12 mois)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mrr12m}>
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line dataKey="mrr" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-3 text-sm text-isf-textSecondary">Repartition par plan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={planDistribution} dataKey="value" nameKey="plan" innerRadius={45} outerRadius={80}>
                {planDistribution.map((entry, index) => (
                  <Cell key={entry.plan} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm text-isf-textSecondary">Repartition geographique (villes)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityDistribution}>
              <XAxis dataKey="city" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#C8A951" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <h3 className="mb-3 text-sm text-isf-textSecondary">Alertes</h3>
        <div className="space-y-2">
          {alerts.length ? (
            alerts.map((alert, idx) => (
              <div key={`${alert.label}-${idx}`} className="rounded-lg border border-isf-warning/40 bg-isf-warning/10 px-3 py-2 text-sm text-isf-warning">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                {alert.label}
              </div>
            ))
          ) : (
            <p className="text-sm text-isf-textSecondary">Aucune alerte immediate.</p>
          )}
        </div>
      </article>
    </section>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <p className="text-xs text-isf-textSecondary">{title}</p>
      <p className="mt-2 font-serif text-3xl text-isf-gold">{value}</p>
    </article>
  );
}
