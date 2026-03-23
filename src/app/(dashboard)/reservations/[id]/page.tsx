"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { FCFADisplay } from "@/components/shared/FCFADisplay";
import { HourlyTimer } from "@/components/reservations/HourlyTimer";
import { createClient } from "@/lib/supabase/client";
import { downloadInvoicePdf } from "@/lib/pdf/invoice-template";
import { formatDate } from "@/lib/utils";
import { useReservations } from "@/hooks/useReservations";

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const { addJournalLog } = useReservations();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    const run = async () => {
      const { data } = await supabase
        .from("reservations")
        .select(
          `
          *,
          rooms:room_id(room_number),
          clients:client_id(full_name,phone,email)
        `
        )
        .eq("id", params.id)
        .single();
      setReservation(data);

      const { data: p } = await supabase.from("payments").select("*").eq("reservation_id", params.id).order("created_at", { ascending: false });
      const { data: x } = await supabase
        .from("reservation_extras")
        .select("*, extras:extra_id(name)")
        .eq("reservation_id", params.id)
        .order("date_added", { ascending: false });
      const { data: j } = await supabase
        .from("reservation_action_logs")
        .select("*")
        .eq("reservation_id", params.id)
        .order("created_at", { ascending: false });

      setPayments(p ?? []);
      setExtras(x ?? []);
      setJournal(j ?? []);
    };
    run();
  }, [params.id]);

  if (!reservation) return <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4">Chargement...</div>;

  const room = Array.isArray(reservation.rooms) ? reservation.rooms[0] : reservation.rooms;
  const client = Array.isArray(reservation.clients) ? reservation.clients[0] : reservation.clients;

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <h1 className="font-serif text-3xl text-isf-cream">{reservation.booking_ref}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <BookingModeBadge mode={reservation.booking_mode} />
          <span className="rounded-md bg-white/5 px-2 py-1 text-xs">{reservation.status}</span>
        </div>
      </header>

      {reservation.booking_mode === "hourly" && reservation.status !== "checked_out" ? (
        <HourlyTimer
          expiresAt={reservation.timer_expires_at}
          reservationId={reservation.id}
          roomNumber={room?.room_number ?? "-"}
          onExtend={async (_id, hours) => {
            const supabase = createClient();
            const newDate = new Date(new Date(reservation.check_out_at).getTime() + hours * 3600000).toISOString();
            await supabase.from("reservations").update({ check_out_at: newDate, timer_expires_at: newDate }).eq("id", reservation.id);
            await addJournalLog(reservation.id, "extend_hourly", `Prolongation +${hours}h`, { previous_checkout: reservation.check_out_at, new_checkout: newDate });
            setReservation((prev: any) => ({ ...prev, check_out_at: newDate, timer_expires_at: newDate }));
          }}
          onCheckout={async () => {
            const supabase = createClient();
            await supabase.from("reservations").update({ status: "checked_out", actual_check_out: new Date().toISOString() }).eq("id", reservation.id);
            await supabase.from("rooms").update({ status: "available", current_reservation_id: null }).eq("id", reservation.room_id);
            await addJournalLog(reservation.id, "checkout", "Check-out effectue", { room_id: reservation.room_id });
            setReservation((prev: any) => ({ ...prev, status: "checked_out" }));
          }}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h2 className="font-serif text-xl">Informations</h2>
          <p className="mt-2 text-sm text-isf-textSecondary">Client: {client?.full_name ?? "-"}</p>
          <p className="text-sm text-isf-textSecondary">Téléphone: {client?.phone ?? "-"}</p>
          <p className="text-sm text-isf-textSecondary">Logement: {room?.room_number ?? "-"}</p>
          <p className="text-sm text-isf-textSecondary">Check-in: {formatDate(reservation.check_in_at)}</p>
          <p className="text-sm text-isf-textSecondary">Fin: {formatDate(reservation.check_out_at)}</p>
          <p className="mt-2 text-isf-gold"><FCFADisplay value={Number(reservation.total_amount ?? 0)} /></p>
        </article>

        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h2 className="font-serif text-xl">Actions</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="rounded-md bg-isf-gold px-3 py-2 text-sm text-black">Check-out</button>
            <button className="rounded-md border border-isf-border px-3 py-2 text-sm">Prolonger</button>
            <button className="rounded-md border border-isf-border px-3 py-2 text-sm">Modifier</button>
            <button className="rounded-md border border-isf-error/40 px-3 py-2 text-sm text-isf-error">Annuler</button>
            <button
              className="rounded-md border border-isf-border px-3 py-2 text-sm"
              onClick={async () => {
                downloadInvoicePdf({
                  bookingRef: reservation.booking_ref,
                  clientName: client?.full_name ?? "Walk-in",
                  roomNumber: room?.room_number ?? "-",
                  mode: reservation.booking_mode,
                  checkIn: formatDate(reservation.check_in_at),
                  checkOut: formatDate(reservation.check_out_at),
                  total: Number(reservation.total_amount ?? 0)
                });
                await addJournalLog(reservation.id, "invoice_pdf", "Facture PDF generee");
              }}
            >
              Générer facture
            </button>
            <button className="rounded-md border border-isf-border px-3 py-2 text-sm" onClick={() => window.print()}>Imprimer</button>
          </div>
        </article>
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-lg">Paiements</h3>
          <div className="mt-2 space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="rounded-md border border-isf-border bg-isf-bgElevated p-2 text-xs">
                {p.payment_method} · <FCFADisplay value={Number(p.amount ?? 0)} />
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-lg">Extras</h3>
          <button className="mb-2 rounded-md border border-isf-border px-2 py-1 text-xs">Ajouter un extra</button>
          <div className="space-y-2">
            {extras.map((x) => (
              <div key={x.id} className="rounded-md border border-isf-border bg-isf-bgElevated p-2 text-xs">
                {(Array.isArray(x.extras) ? x.extras[0]?.name : x.extras?.name) ?? "Extra"} · {x.quantity} · <FCFADisplay value={Number(x.total_price ?? 0)} />
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-lg">Journal</h3>
          <div className="space-y-2 text-xs text-isf-textSecondary">
            {journal.length ? (
              journal.map((entry) => (
                <div key={entry.id} className="rounded-md border border-isf-border bg-isf-bgElevated p-2">
                  <p className="text-isf-cream">{entry.action_label}</p>
                  <p>{formatDate(entry.created_at)}</p>
                </div>
              ))
            ) : (
              <>
                <p>Créé par réception à {formatDate(reservation.created_at)}</p>
                <p>Statut courant: {reservation.status}</p>
                <p>Paiement: {reservation.payment_status}</p>
              </>
            )}
          </div>
        </article>
      </section>
    </section>
  );
}
