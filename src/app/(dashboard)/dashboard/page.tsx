"use client";

import { AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RecentReservations } from "@/components/dashboard/RecentReservations";
import { RevenueAreaChart } from "@/components/dashboard/RevenueAreaChart";
import { RevenueByModeChart } from "@/components/dashboard/RevenueByModeChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatFCFA } from "@/lib/utils";

export default function DashboardPage() {
  const { loading, metrics, byMode, occupancy7d, revenue30d, latestReservations, alerts } = useDashboardData();

  const occupancyGauge = Math.max(0, Math.min(100, metrics.occupancy));
  const radius = 38;
  const c = 2 * Math.PI * radius;
  const dash = (occupancyGauge / 100) * c;

  if (loading) {
    return <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement dashboard...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <p className="text-xs text-isf-textSecondary">Taux d'occupation</p>
          <div className="mt-2 flex items-center gap-3">
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke="#C8A951"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${dash} ${c}`}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
              <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill="#E8E6E1" fontSize="14">
                {Math.round(occupancyGauge)}%
              </text>
            </svg>
            <p className="text-xs text-isf-textMuted">Comparaison semaine passée disponible sur `/reports`</p>
          </div>
        </article>
        <KPICard title="CA du jour" value={metrics.todayRevenue} subtitle={`${metrics.todayCount} réservations`} isMoney />
        <KPICard title="RevPAR" value={metrics.revpar} subtitle="Revenue per available room" isMoney />
        <KPICard title="CA du mois" value={metrics.monthRevenue} subtitle="Évolution vs mois précédent" isMoney deltaPct={metrics.monthDeltaPct} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RevenueByModeChart rows={byMode.rows} />
        <OccupancyChart data={occupancy7d} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueAreaChart data={revenue30d} />
        </div>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="mb-3 font-serif text-xl text-isf-cream">Alertes</h3>
          {alerts.length ? (
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={`${alert.label}-${index}`}
                  className={`rounded-lg border p-2 text-sm ${
                    alert.type === "error" ? "border-isf-error/40 bg-isf-error/10 text-isf-error" : "border-isf-warning/40 bg-isf-warning/10 text-isf-warning"
                  }`}
                >
                  <AlertTriangle className="mr-1 inline h-4 w-4" />
                  {alert.label}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-isf-textSecondary">Aucune alerte critique.</p>
          )}
          <div className="mt-4 rounded-lg border border-isf-border bg-isf-bgElevated p-3 text-sm">
            <p className="text-isf-textSecondary">CA total modes</p>
            <p className="font-serif text-2xl text-isf-gold">{formatFCFA(byMode.total)}</p>
          </div>
        </article>
      </div>

      <RecentReservations rows={latestReservations} />
    </section>
  );
}
