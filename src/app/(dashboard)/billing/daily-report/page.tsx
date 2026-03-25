"use client";

import { useMemo } from "react";
import { DailyReportView } from "@/components/billing/DailyReportView";
import { useBillingData } from "@/hooks/useBillingData";
import { useReservations } from "@/hooks/useReservations";
import { createClient } from "@/lib/insforge/client";

const ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";
const ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";
const OPENED_BY = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

export default function DailyReportPage() {
  const { dailySummary } = useBillingData();
  const { reservations } = useReservations();

  const dayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ts = today.getTime();
    const todayRows = reservations.filter((r) => new Date(r.created_at).getTime() >= ts);
    return {
      checkins: todayRows.filter((r) => r.status === "checked_in").length,
      checkouts: todayRows.filter((r) => r.status === "checked_out").length,
      reservationsCount: todayRows.length,
      cancellations: todayRows.filter((r) => r.status === "cancelled").length
    };
  }, [reservations]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Rapport Z de caisse</h1>
        <p className="text-sm text-isf-textSecondary">Clôture de journée, contrôle caisse et archivage.</p>
      </div>
      <DailyReportView
        summary={dailySummary}
        checkins={dayStats.checkins}
        checkouts={dayStats.checkouts}
        reservationsCount={dayStats.reservationsCount}
        cancellations={dayStats.cancellations}
        onCloseDay={async (closingCash, variance) => {
          if (!process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) return;
          const insforge = createClient();
          const today = new Date();
          const reportDate = today.toISOString().slice(0, 10);
          await insforge.database.from("daily_reports").insert({
            organization_id: ORGANIZATION_ID,
            establishment_id: ESTABLISHMENT_ID,
            report_date: reportDate,
            opened_by: OPENED_BY,
            closed_by: OPENED_BY,
            opening_cash: dailySummary.cash,
            closing_cash: closingCash,
            total_cash: dailySummary.cash,
            total_orange_money: dailySummary.orange_money,
            total_mtn_momo: dailySummary.mtn_momo,
            total_wave: dailySummary.wave,
            total_moov: dailySummary.moov_money,
            total_card: dailySummary.card,
            total_transfer: dailySummary.transfer,
            total_corporate: dailySummary.corporate,
            total_revenue: dailySummary.totalRevenue,
            total_reservations: dayStats.reservationsCount,
            total_checkins: dayStats.checkins,
            total_checkouts: dayStats.checkouts,
            occupancy_rate: 0,
            variance,
            status: "closed"
          });
        }}
      />
    </section>
  );
}
