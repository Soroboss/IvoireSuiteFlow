"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModeSelector } from "@/components/reservations/ModeSelector";
import { HourSelector } from "@/components/reservations/HourSelector";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { FCFADisplay } from "@/components/shared/FCFADisplay";
import { SearchInput } from "@/components/shared/SearchInput";
import { createClient } from "@/lib/insforge/client";
import { generateContractPdf } from "@/lib/pdf/contract-template";
import { formatFCFA } from "@/lib/utils";
import { useReservations } from "@/hooks/useReservations";
import { useRooms } from "@/hooks/useRooms";
import type { BookingMode, RoomWithRelations } from "@/types/room";

type Step = 1 | 2 | 3 | 4 | 5;

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetRoom = searchParams.get("room");
  const { createReservation, getAvailableRooms } = useReservations();
  const { rooms } = useRooms();
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<BookingMode | null>(null);
  const [dates, setDates] = useState({ checkIn: new Date().toISOString().slice(0, 16), checkOut: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16) });
  const [durationHours, setDurationHours] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(presetRoom);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [client, setClient] = useState<any>(null);
  const [newClient, setNewClient] = useState({ full_name: "", phone: "", email: "", id_type: "cni", id_number: "" });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "partial" | "unpaid">("paid");
  const [depositAmount, setDepositAmount] = useState(0);
  const [passType, setPassType] = useState("day");
  const [eventPeople, setEventPeople] = useState(20);
  const [eventDescription, setEventDescription] = useState("");
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const isNight = useMemo(() => {
    const hour = new Date(dates.checkIn).getHours();
    return hour >= 22 || hour < 6;
  }, [dates.checkIn]);

  const amountBase = useMemo(() => {
    if (!selectedRoom || !mode) return 0;
    if (mode === "hourly") return durationHours * ((selectedRoom.room_type as any)?.base_price_hour ?? 4000) + (isNight ? durationHours * 3000 : 0);
    if (mode === "nightly") return ((selectedRoom.room_type as any)?.base_price_night ?? 15000) * Math.max(1, Math.ceil((new Date(dates.checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000));
    if (mode === "stay") return (selectedRoom.room_type?.base_price_night ?? 20000) * 30 * 0.75;
    return (selectedRoom.room_type as any)?.base_price_day_pass ?? 12000;
  }, [dates.checkIn, dates.checkOut, durationHours, isNight, mode, selectedRoom]);

  const amountTax = 0;
  const amountDiscount = 0;
  const amountExtras = 0;
  const total = amountBase + amountTax + amountExtras - amountDiscount;

  const next = async () => {
    if (step === 2 && mode && !presetRoom) {
      const data = await getAvailableRooms(dates.checkIn, dates.checkOut, mode);
      setAvailableRooms(data);
    }
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  };
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const lookupClient = async (query: string) => {
    setClientSearch(query);
    if (query.length < 3 || !process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) return;
    const insforge = createClient();
    const { data } = await insforge.database
      .from("clients")
      .select("id, full_name, phone, total_stays, total_spent, loyalty_points, is_blacklisted, blacklist_reason")
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(5);
    if (data?.[0]) setClient(data[0]);
  };

  const submit = async () => {
    let clientId = client?.id ?? null;
    const backendReady = Boolean(process.env.NEXT_PUBLIC_INSFORGE_BASE_URL);
    if (!clientId && backendReady) {
      const insforge = createClient();
      let idDocumentUrl: string | null = null;
      if (idDocumentFile && mode !== "hourly") {
        // TODO: brancher InsForge Storage (selon ton setup bucket/ACL).
        // Pour l’instant on n’envoie pas la pièce, on garde uniquement les champs.
        idDocumentUrl = null;
      }
      const { data: clientRows } = await insforge.database
        .from("clients")
        .insert({
          organization_id: "11111111-1111-1111-1111-111111111111",
          client_type: "individual",
          full_name: newClient.full_name,
          phone: newClient.phone,
          email: newClient.email || null,
          id_type: mode === "hourly" ? null : newClient.id_type,
          id_number: mode === "hourly" ? null : newClient.id_number,
          id_document_url: mode === "hourly" ? null : idDocumentUrl
        })
        .select("id");
      clientId = Array.isArray(clientRows) ? clientRows[0]?.id ?? null : null;
    }

    const checkOut = mode === "hourly" ? new Date(new Date(dates.checkIn).getTime() + durationHours * 3600000).toISOString() : new Date(dates.checkOut).toISOString();
    let contractUrl: string | null = null;
    if (mode === "stay" && backendReady) {
      createClient();
      const contractDoc = generateContractPdf({
        bookingRef: `ISF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        clientName: client?.full_name ?? newClient.full_name,
        roomNumber: selectedRoom?.room_number ?? "-",
        startDate: new Date(dates.checkIn).toLocaleString("fr-FR"),
        endDate: new Date(checkOut).toLocaleString("fr-FR"),
        monthlyAmount: amountBase,
        depositAmount: depositAmount
      });
      void contractDoc;
      // TODO: brancher InsForge Storage pour stocker le contrat PDF.
      contractUrl = null;
    }
    const reservation = await createReservation({
      booking_mode: mode!,
      room_id: selectedRoomId!,
      client_id: clientId,
      check_in_at: new Date(dates.checkIn).toISOString(),
      check_out_at: checkOut,
      hours: mode === "hourly" ? durationHours : null,
      nights: mode === "nightly" ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(dates.checkIn).getTime()) / 86400000)) : null,
      pass_type: mode === "pass" ? passType : null,
      base_amount: amountBase,
      tax_amount: amountTax,
      discount_amount: amountDiscount,
      extras_amount: amountExtras,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      deposit_amount: depositAmount,
      timer_expires_at: mode === "hourly" ? checkOut : null,
      qr_code: mode === "pass" ? `QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : null,
      contract_url: mode === "stay" ? contractUrl : null,
      notes: mode === "pass" && passType === "event" ? `${eventPeople} pers. - ${eventDescription}` : ""
    });

    if (!reservation) return;
    router.push(`/reservations/confirmed/${reservation.id}`);
  };

  const progress = (step / 5) * 100;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-isf-border bg-isf-bgCard p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-isf-textSecondary">
          <span>Étape {step}/5</span>
          <span>Nouvelle réservation</span>
        </div>
        <div className="h-2 rounded-full bg-isf-bgElevated">
          <div className="h-2 rounded-full bg-isf-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 1 ? <ModeSelector value={mode} onChange={setMode} /> : null}

      {step === 2 ? (
        <div className="space-y-3 rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-xl">Choix du logement</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input type="datetime-local" value={dates.checkIn} onChange={(e) => setDates((d) => ({ ...d, checkIn: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
            <input type="datetime-local" value={dates.checkOut} onChange={(e) => setDates((d) => ({ ...d, checkOut: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
          </div>
          {mode === "pass" ? (
            <select value={passType} onChange={(e) => setPassType(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
              <option value="day">Pass journée</option>
              <option value="half_day">Pass demi-journée</option>
              <option value="pool">Pass piscine</option>
              <option value="event">Pass événement</option>
            </select>
          ) : null}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(presetRoom ? rooms.filter((r) => r.id === presetRoom) : (availableRooms.length ? rooms.filter((r) => availableRooms.some((a: any) => a.room_id === r.id)) : rooms.filter((r) => r.status === "available"))).map((room: RoomWithRelations) => (
              <button key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`rounded-lg border p-3 text-left ${selectedRoomId === room.id ? "border-isf-gold bg-[var(--isf-gold-dim)]" : "border-isf-border bg-isf-bgElevated"}`}>
                <p className="font-serif text-lg">{room.room_number}</p>
                <p className="text-xs text-isf-textSecondary">{room.room_type?.name}</p>
                <p className="text-xs text-isf-gold">Prix {formatFCFA(room.room_type?.base_price_night ?? 0)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3 rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-xl">Détails du mode</h3>
          {mode === "hourly" ? (
            <>
              <HourSelector hours={durationHours} onChange={setDurationHours} baseHourlyPrice={4000} isNight={isNight} nightSurchargePerHour={3000} />
              <p className="text-xs text-isf-textSecondary">Un timer sera lancé au check-in.</p>
            </>
          ) : null}
          {mode === "nightly" ? <p className="text-sm text-isf-textSecondary">Calcul automatique des nuits, week-end et saisons (détail affiché au récapitulatif).</p> : null}
          {mode === "stay" ? <p className="text-sm text-isf-textSecondary">Tarif dégressif appliqué. Un contrat PDF sera généré.</p> : null}
          {mode === "pass" ? (
            <>
              {passType === "half_day" ? (
                <select className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
                  <option>Matin 8h-12h</option>
                  <option>Après-midi 14h-18h</option>
                </select>
              ) : null}
              {passType === "event" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input type="number" value={eventPeople} onChange={(e) => setEventPeople(Number(e.target.value))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
                  <input value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Description événement" className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
                </div>
              ) : null}
              <p className="text-xs text-isf-textSecondary">Un QR code d'accès sera généré.</p>
            </>
          ) : null}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-3 rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-xl">Client</h3>
          <SearchInput value={clientSearch} onChange={(e) => lookupClient(e.target.value)} placeholder="Recherche nom ou téléphone" />
          {client ? (
            <div className={`rounded-lg border p-3 ${client.is_blacklisted ? "border-isf-error bg-isf-error/10" : "border-isf-border bg-isf-bgElevated"}`}>
              <p className="font-medium">{client.full_name}</p>
              <p className="text-xs text-isf-textSecondary">{client.phone} · {client.total_stays} séjours · {formatFCFA(client.total_spent ?? 0)}</p>
              {client.is_blacklisted ? <p className="mt-1 text-xs text-isf-error">⚠️ Client blacklisté : {client.blacklist_reason}</p> : null}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              <input placeholder="Nom complet" value={newClient.full_name} onChange={(e) => setNewClient((v) => ({ ...v, full_name: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
              <input placeholder="Téléphone" value={newClient.phone} onChange={(e) => setNewClient((v) => ({ ...v, phone: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
              {mode !== "hourly" ? (
                <>
                  <input placeholder="Email" value={newClient.email} onChange={(e) => setNewClient((v) => ({ ...v, email: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
                  <select value={newClient.id_type} onChange={(e) => setNewClient((v) => ({ ...v, id_type: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
                    <option value="cni">CNI</option>
                    <option value="passport">Passeport</option>
                    <option value="carte_sejour">Carte séjour</option>
                  </select>
                  <input placeholder="Numéro pièce" value={newClient.id_number} onChange={(e) => setNewClient((v) => ({ ...v, id_number: e.target.value }))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm sm:col-span-2" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    capture="environment"
                    onChange={(e) => setIdDocumentFile(e.target.files?.[0] ?? null)}
                    className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm sm:col-span-2"
                  />
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-3 rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h3 className="font-serif text-xl">Récapitulatif & Paiement</h3>
          <div className="rounded-lg border border-isf-border bg-isf-bgElevated p-3 text-sm">
            <p>Logement : <span className="font-medium">{selectedRoom?.room_number}</span> ({selectedRoom?.room_type?.name})</p>
            <p className="mt-1">Mode : {mode ? <BookingModeBadge mode={mode} /> : null}</p>
            <p className="mt-1">Durée : {mode === "hourly" ? `${durationHours}h` : `${dates.checkIn} → ${dates.checkOut}`}</p>
            <p className="mt-1">Détail calcul : {formatFCFA(amountBase)}</p>
          </div>
          <div className="space-y-1 rounded-lg border border-isf-gold/30 bg-[var(--isf-gold-dim)] p-3">
            <p className="text-sm">Base: <FCFADisplay value={amountBase} /></p>
            <p className="text-sm">Extras: <FCFADisplay value={amountExtras} /></p>
            <p className="text-sm">Taxes: <FCFADisplay value={amountTax} /></p>
            <p className="text-sm">Réduction: <FCFADisplay value={amountDiscount} /></p>
            <p className="font-serif text-2xl text-isf-gold">TOTAL: <FCFADisplay value={total} /></p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
              <option value="cash">💵 Espèces</option>
              <option value="orange_money">🟠 Orange Money</option>
              <option value="mtn_momo">🟡 MTN MoMo</option>
              <option value="wave">🔵 Wave</option>
              <option value="moov_money">🟢 Moov Money</option>
              <option value="card">💳 Carte bancaire</option>
              <option value="transfer">🏦 Virement bancaire</option>
              <option value="corporate">🏢 Entreprise</option>
            </select>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
              <option value="paid">Payé</option>
              <option value="partial">Acompte</option>
              <option value="unpaid">Impayé</option>
            </select>
            {paymentStatus === "partial" ? (
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} placeholder="Montant acompte" className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm sm:col-span-2" />
            ) : null}
          </div>
          <button onClick={submit} className="h-11 w-full rounded-md bg-isf-gold text-sm font-semibold text-black">✓ Confirmer la réservation</button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <button disabled={step === 1} onClick={back} className="h-10 flex-1 rounded-md border border-isf-border">Retour</button>
        <button disabled={step === 5 || (step === 1 && !mode)} onClick={next} className="h-10 flex-1 rounded-md bg-isf-gold text-black">
          Continuer
        </button>
      </div>
    </section>
  );
}
