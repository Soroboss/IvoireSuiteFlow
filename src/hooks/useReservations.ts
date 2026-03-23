"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NewReservationPayload, ReservationRow } from "@/types/booking";
import type { BookingMode } from "@/types/room";

const ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";
const ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";
const CREATED_BY = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

export function useReservations() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const canUseSupabase = typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const fetchReservations = useCallback(async () => {
    if (!canUseSupabase) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("reservations")
      .select(
        `
        id, booking_ref, booking_mode, status, payment_status, check_in_at, check_out_at, timer_expires_at, total_amount, room_id, client_id, created_at,
        rooms:room_id(room_number),
        clients:client_id(full_name)
      `
      )
      .eq("establishment_id", ESTABLISHMENT_ID)
      .order("created_at", { ascending: false });

    const mapped: ReservationRow[] = (data ?? []).map((row: any) => {
      const room = Array.isArray(row.rooms) ? row.rooms[0] : row.rooms;
      const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
      return {
        id: row.id,
        booking_ref: row.booking_ref,
        booking_mode: row.booking_mode,
        status: row.status,
        payment_status: row.payment_status,
        check_in_at: row.check_in_at,
        check_out_at: row.check_out_at,
        timer_expires_at: row.timer_expires_at,
        total_amount: Number(row.total_amount ?? 0),
        created_at: row.created_at,
        room_id: row.room_id,
        client_id: row.client_id,
        room_number: room?.room_number ?? "-",
        client_name: client?.full_name ?? null
      };
    });

    setReservations(mapped);
    setLoading(false);
  }, [canUseSupabase]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const addJournalLog = useCallback(
    async (reservationId: string, actionType: string, actionLabel: string, metadata: Record<string, unknown> = {}) => {
      if (!canUseSupabase) return;
      const supabase = createClient();
      await supabase.from("reservation_action_logs").insert({
        organization_id: ORGANIZATION_ID,
        establishment_id: ESTABLISHMENT_ID,
        reservation_id: reservationId,
        action_type: actionType,
        action_label: actionLabel,
        metadata,
        created_by: CREATED_BY
      });
    },
    [canUseSupabase]
  );

  const createReservation = useCallback(
    async (payload: NewReservationPayload) => {
      if (!canUseSupabase) return null;
      const supabase = createClient();

      const bookingRef = `ISF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
          organization_id: ORGANIZATION_ID,
          establishment_id: ESTABLISHMENT_ID,
          booking_ref: bookingRef,
          status: "confirmed",
          source: "walk_in",
          created_by: CREATED_BY,
          ...payload
        })
        .select("id, booking_ref")
        .single();

      if (error || !reservation) return null;

      await supabase.from("rooms").update({ status: "occupied", current_reservation_id: reservation.id }).eq("id", payload.room_id);

      if (payload.payment_status === "paid" || payload.payment_status === "partial") {
        await supabase.from("payments").insert({
          organization_id: ORGANIZATION_ID,
          establishment_id: ESTABLISHMENT_ID,
          reservation_id: reservation.id,
          amount: payload.total_amount,
          payment_method: payload.payment_method ?? "cash",
          payment_type: "reservation",
          received_by: CREATED_BY
        });
      }

      await addJournalLog(reservation.id, "create", "Reservation creee", {
        booking_mode: payload.booking_mode,
        total_amount: payload.total_amount,
        payment_status: payload.payment_status
      });

      await fetchReservations();
      return reservation;
    },
    [addJournalLog, canUseSupabase, fetchReservations]
  );

  const getAvailableRooms = useCallback(
    async (checkIn: string, checkOut: string, mode: BookingMode) => {
      if (!canUseSupabase) return [];
      const supabase = createClient();
      const { data } = await supabase.rpc("get_available_rooms", {
        p_establishment_id: ESTABLISHMENT_ID,
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_booking_mode: mode
      });
      return data ?? [];
    },
    [canUseSupabase]
  );

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      paid: reservations.filter((r) => r.payment_status === "paid").length,
      pending: reservations.filter((r) => r.status === "pending" || r.status === "confirmed").length
    };
  }, [reservations]);

  return {
    reservations,
    loading,
    stats,
    establishmentId: ESTABLISHMENT_ID,
    fetchReservations,
    createReservation,
    getAvailableRooms,
    addJournalLog
  };
}
