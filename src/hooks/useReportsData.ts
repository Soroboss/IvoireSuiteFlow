"use client";

import { useMemo, useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

type Period = "today" | "week" | "month" | "custom";

export function useReportsData() {
  const { latestReservations } = useDashboardData();
  const [period, setPeriod] = useState<Period>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filtered = useMemo(() => {
    const now = Date.now();
    return latestReservations.filter((row) => {
      const t = new Date(row.created_at).getTime();
      if (period === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return t >= start.getTime();
      }
      if (period === "week") return t >= now - 7 * 86400000;
      if (period === "month") return t >= now - 30 * 86400000;
      if (period === "custom" && startDate && endDate) {
        return t >= new Date(startDate).getTime() && t <= new Date(endDate).getTime() + 86399999;
      }
      return true;
    });
  }, [endDate, latestReservations, period, startDate]);

  const metrics = useMemo(() => {
    const totalRevenue = filtered.reduce((acc, r) => acc + r.total_amount, 0);
    const byMode = filtered.reduce(
      (acc, r) => {
        acc[r.booking_mode] += r.total_amount;
        return acc;
      },
      { hourly: 0, nightly: 0, stay: 0, pass: 0 }
    );
    const byStatus = filtered.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {} as Record<string, number>);
    const byPayment = filtered.reduce((acc, r) => ({ ...acc, [r.payment_status]: (acc[r.payment_status] ?? 0) + 1 }), {} as Record<string, number>);
    const roomsSold = filtered.length || 1;
    const roomsAvailable = 20;
    const adr = totalRevenue / roomsSold;
    const revpar = totalRevenue / roomsAvailable;
    const occupancyAvg = Math.min(100, (roomsSold / roomsAvailable) * 100);

    const topRooms = filtered.reduce((acc, r) => {
      const key = r.room_number ?? "-";
      acc[key] = (acc[key] ?? 0) + r.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const topClients = filtered.reduce((acc, r) => {
      const key = r.client_name ?? "Walk-in";
      acc[key] = (acc[key] ?? 0) + r.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const hourlySlots = filtered
      .filter((r) => r.booking_mode === "hourly")
      .reduce((acc, r) => {
        const hour = new Date(r.check_in_at).getHours();
        const bucket = `${String(hour).padStart(2, "0")}h`;
        acc[bucket] = (acc[bucket] ?? 0) + r.total_amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalRevenue,
      byMode,
      byStatus,
      byPayment,
      adr,
      revpar,
      occupancyAvg,
      topRooms: Object.entries(topRooms).sort((a, b) => b[1] - a[1]).slice(0, 10),
      topClients: Object.entries(topClients).sort((a, b) => b[1] - a[1]).slice(0, 10),
      hourlySlots: Object.entries(hourlySlots).sort((a, b) => (a[0] > b[0] ? 1 : -1))
    };
  }, [filtered]);

  return {
    period,
    setPeriod,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    filtered,
    metrics
  };
}
