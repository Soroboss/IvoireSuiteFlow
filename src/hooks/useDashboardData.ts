"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";

type ReservationLite = {
  id: string;
  booking_ref: string;
  booking_mode: "hourly" | "nightly" | "stay" | "pass";
  status: string;
  payment_status: "unpaid" | "partial" | "paid" | "refunded";
  total_amount: number;
  check_in_at: string;
  check_out_at: string;
  timer_expires_at: string | null;
  created_at: string;
  room_id: string;
  room_number?: string;
  client_name?: string | null;
};

export function useDashboardData() {
  const [rows, setRows] = useState<ReservationLite[]>([]);
  const [activeRooms, setActiveRooms] = useState(0);
  const [loading, setLoading] = useState(true);
  const canUseSupabase = typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const fetchData = useCallback(async () => {
    if (!canUseSupabase) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    const [{ data: reservations }, { count }] = await Promise.all([
      supabase
        .from("reservations")
        .select(
          `
          id, booking_ref, booking_mode, status, payment_status, total_amount, check_in_at, check_out_at, timer_expires_at, created_at, room_id,
          rooms:room_id(room_number),
          clients:client_id(full_name)
        `
        )
        .eq("establishment_id", ESTABLISHMENT_ID)
        .order("created_at", { ascending: false })
        .limit(400),
      supabase
        .from("rooms")
        .select("id", { count: "exact", head: true })
        .eq("establishment_id", ESTABLISHMENT_ID)
        .eq("is_active", true)
    ]);

    const mapped = (reservations ?? []).map((r: any) => ({
      id: r.id,
      booking_ref: r.booking_ref,
      booking_mode: r.booking_mode,
      status: r.status,
      payment_status: r.payment_status,
      total_amount: Number(r.total_amount ?? 0),
      check_in_at: r.check_in_at,
      check_out_at: r.check_out_at,
      timer_expires_at: r.timer_expires_at,
      created_at: r.created_at,
      room_id: r.room_id,
      room_number: (Array.isArray(r.rooms) ? r.rooms[0] : r.rooms)?.room_number ?? "-",
      client_name: (Array.isArray(r.clients) ? r.clients[0] : r.clients)?.full_name ?? "Walk-in"
    })) as ReservationLite[];

    setRows(mapped);
    setActiveRooms(count ?? 0);
    setLoading(false);
  }, [canUseSupabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!canUseSupabase) return;
    const supabase = createClient();
    const channel = supabase
      .channel("isf-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `establishment_id=eq.${ESTABLISHMENT_ID}` }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `establishment_id=eq.${ESTABLISHMENT_ID}` }, fetchData)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [canUseSupabase, fetchData]);

  const metrics = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayRows = rows.filter((r) => new Date(r.created_at).getTime() >= startToday);
    const monthRows = rows.filter((r) => new Date(r.created_at).getTime() >= startMonth);
    const prevMonthRows = rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= startPrevMonth && t < endPrevMonth;
    });

    const occupiedNow = rows.filter((r) => ["checked_in", "confirmed"].includes(r.status)).length;
    const occupancy = activeRooms ? (occupiedNow / activeRooms) * 100 : 0;
    const revpar = activeRooms ? monthRows.reduce((acc, r) => acc + r.total_amount, 0) / activeRooms : 0;
    const todayRevenue = todayRows.reduce((acc, r) => acc + r.total_amount, 0);
    const monthRevenue = monthRows.reduce((acc, r) => acc + r.total_amount, 0);
    const prevMonthRevenue = prevMonthRows.reduce((acc, r) => acc + r.total_amount, 0);
    const monthDeltaPct = prevMonthRevenue ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;

    return {
      occupancy,
      todayRevenue,
      todayCount: todayRows.length,
      revpar,
      monthRevenue,
      monthDeltaPct
    };
  }, [activeRooms, rows]);

  const byMode = useMemo(() => {
    const base = {
      hourly: 0,
      nightly: 0,
      stay: 0,
      pass: 0
    };
    rows.forEach((r) => {
      base[r.booking_mode] += r.total_amount;
    });
    const total = Object.values(base).reduce((a, b) => a + b, 0) || 1;
    return {
      total,
      rows: [
        { key: "hourly", label: "Horaire", color: "#F59E0B", amount: base.hourly, pct: (base.hourly / total) * 100 },
        { key: "nightly", label: "Nuitée", color: "#C8A951", amount: base.nightly, pct: (base.nightly / total) * 100 },
        { key: "stay", label: "Séjour", color: "#3B82F6", amount: base.stay, pct: (base.stay / total) * 100 },
        { key: "pass", label: "Pass", color: "#8B5CF6", amount: base.pass, pct: (base.pass / total) * 100 }
      ]
    };
  }, [rows]);

  const occupancy7d = useMemo(() => {
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const now = new Date();
    return labels.map((label, i) => {
      const offset = 6 - i;
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      const dayStart = day.getTime();
      const dayEnd = dayStart + 86400000;
      const occupied = rows.filter((r) => {
        const t = new Date(r.check_in_at).getTime();
        return t >= dayStart && t < dayEnd && ["checked_in", "checked_out", "confirmed"].includes(r.status);
      }).length;
      return { day: label, value: activeRooms ? Math.min(100, (occupied / activeRooms) * 100) : 0 };
    });
  }, [activeRooms, rows]);

  const revenue30d = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i));
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const amount = rows
        .filter((r) => {
          const t = new Date(r.created_at).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .reduce((acc, r) => acc + r.total_amount, 0);
      return { day: `${day.getDate()}`, amount };
    });
  }, [rows]);

  const alerts = useMemo(() => {
    const now = Date.now();
    return [
      ...rows
        .filter((r) => r.booking_mode === "hourly" && r.timer_expires_at && new Date(r.timer_expires_at).getTime() < now && r.status !== "checked_out")
        .map((r) => ({ type: "error", label: `Timer expiré · ${r.room_number} · ${r.booking_ref}` })),
      ...rows
        .filter((r) => ["checked_in", "confirmed"].includes(r.status) && new Date(r.check_out_at).getTime() < now)
        .map((r) => ({ type: "warning", label: `Check-out en retard · ${r.room_number} · ${r.booking_ref}` })),
      ...rows
        .filter((r) => r.payment_status !== "paid" && r.booking_mode === "stay")
        .map((r) => ({ type: "warning", label: `Paiement en retard · ${r.client_name} · ${r.booking_ref}` }))
    ].slice(0, 8);
  }, [rows]);

  return {
    loading,
    metrics,
    byMode,
    occupancy7d,
    revenue30d,
    latestReservations: rows.slice(0, 10),
    alerts
  };
}
