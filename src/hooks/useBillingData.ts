"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/insforge/client";

const ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";
const ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";
const CREATED_BY = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

export function useBillingData() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [openBalances, setOpenBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canUseBackend = typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_INSFORGE_BASE_URL);

  const fetchData = useCallback(async () => {
    if (!canUseBackend) {
      setLoading(false);
      return;
    }
    const insforge = createClient();
    const [{ data: inv }, { data: pay }, { data: res }] = await Promise.all([
      insforge.database.from("invoices").select("*, clients:client_id(full_name)").eq("establishment_id", ESTABLISHMENT_ID).order("created_at", { ascending: false }).limit(200),
      insforge.database.from("payments").select("*, reservations:reservation_id(booking_ref)").eq("establishment_id", ESTABLISHMENT_ID).order("created_at", { ascending: false }).limit(300),
      insforge.database
        .from("reservations")
        .select("id, booking_ref, client_id, total_amount, payment_status, clients:client_id(full_name), booking_mode, check_in_at, check_out_at")
        .eq("establishment_id", ESTABLISHMENT_ID)
        .neq("payment_status", "paid")
        .order("created_at", { ascending: false })
    ]);
    setInvoices(inv ?? []);
    setPayments(pay ?? []);
    setOpenBalances(res ?? []);
    setLoading(false);
  }, [canUseBackend]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createInvoice = useCallback(
    async (reservation: any) => {
      if (!canUseBackend) return null;
      const insforge = createClient();
      const year = new Date().getFullYear();
      const invoiceNumber = `ISF-${year}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;
      const { data: invoiceRows } = await insforge.database
        .from("invoices")
        .insert({
          organization_id: ORGANIZATION_ID,
          reservation_id: reservation.id,
          establishment_id: ESTABLISHMENT_ID,
          client_id: reservation.client_id,
          invoice_number: invoiceNumber,
          type: "invoice",
          subtotal: reservation.total_amount,
          tax_amount: 0,
          total_amount: reservation.total_amount
        })
        .select("*");
      await fetchData();
      return Array.isArray(invoiceRows) ? invoiceRows[0] : null;
    },
    [canUseBackend, fetchData]
  );

  const addPayment = useCallback(
    async (reservationId: string, amount: number, paymentMethod: string, reference?: string) => {
      if (!canUseBackend) return;
      const insforge = createClient();
      await insforge.database.from("payments").insert({
        organization_id: ORGANIZATION_ID,
        reservation_id: reservationId,
        establishment_id: ESTABLISHMENT_ID,
        amount,
        payment_method: paymentMethod,
        payment_type: "reservation",
        reference: reference ?? null,
        received_by: CREATED_BY
      });
      await fetchData();
    },
    [canUseBackend, fetchData]
  );

  const dailySummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const todayPayments = payments.filter((p) => new Date(p.created_at).getTime() >= todayTs);

    const sumByMethod = (method: string) => todayPayments.filter((p) => p.payment_method === method).reduce((acc, p) => acc + Number(p.amount ?? 0), 0);
    const totalRevenue = todayPayments.reduce((acc, p) => acc + Number(p.amount ?? 0), 0);

    return {
      cash: sumByMethod("cash"),
      orange_money: sumByMethod("orange_money"),
      mtn_momo: sumByMethod("mtn_momo"),
      wave: sumByMethod("wave"),
      moov_money: sumByMethod("moov_money"),
      card: sumByMethod("card"),
      transfer: sumByMethod("transfer"),
      corporate: sumByMethod("corporate"),
      totalRevenue
    };
  }, [payments]);

  return {
    loading,
    invoices,
    payments,
    openBalances,
    dailySummary,
    fetchData,
    createInvoice,
    addPayment
  };
}
