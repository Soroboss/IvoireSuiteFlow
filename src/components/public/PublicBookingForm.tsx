"use client";

import { useEffect, useMemo, useState } from "react";
import { queueOfflineBooking } from "@/lib/offline-booking-queue";
import { formatFCFA } from "@/lib/utils";
import type { PublicBookingPayload } from "@/lib/publicBookingServer";

type RoomOption = {
  room_id: string;
  room_number: string;
  room_type_name: string;
};

export function PublicBookingForm({ slug }: { slug: string }) {
  const [bookingMode, setBookingMode] = useState<"nightly" | "stay" | "pass">("nightly");
  const [checkInAt, setCheckInAt] = useState("");
  const [checkOutAt, setCheckOutAt] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [offlineQueued, setOfflineQueued] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(checkInAt && checkOutAt && selectedRoomId && fullName && phone);
  }, [checkInAt, checkOutAt, selectedRoomId, fullName, phone]);

  const checkAvailability = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/public-bookings/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, bookingMode, checkInAt, checkOutAt })
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message ?? "Disponibilite indisponible");

      setRooms(json.rooms ?? []);
      setSelectedRoomId((json.rooms ?? [])[0]?.room_id ?? "");
      setEstimatedAmount((json.rooms?.length ?? 0) > 0 ? 25000 : 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de disponibilite");
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async () => {
    if (!canSubmit) return;

    const payload: PublicBookingPayload = {
      slug,
      bookingMode,
      checkInAt,
      checkOutAt,
      roomId: selectedRoomId,
      totalAmount: estimatedAmount || 25000,
      customer: {
        fullName,
        phone,
        email: email || undefined,
        notes: notes || undefined
      }
    };

    setLoading(true);
    setMessage(null);
    setOfflineQueued(false);

    try {
      const response = await fetch("/api/public-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("request-failed");
      }

      const json = await response.json();
      if (!json.success) throw new Error(json.message ?? "Reservation impossible");

      setMessage(`Reservation confirmee. Numero: ${json.reservation.bookingRef}`);
    } catch {
      await queueOfflineBooking(payload);
      setOfflineQueued(true);
      setMessage("Mode hors-ligne: votre reservation a ete enregistree et sera synchronisee a la reconnexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-xl font-semibold text-[#1A1A2E]">Reservation en ligne</h3>
      {!isOnline || offlineQueued ? (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          📡 Mode hors-ligne - Les donnees seront synchronisees a la reconnexion
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          { value: "nightly", label: "Nuitee" },
          { value: "stay", label: "Sejour" },
          { value: "pass", label: "Pass" }
        ].map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setBookingMode(mode.value as "nightly" | "stay" | "pass")}
            className={`rounded-lg border px-4 py-2 text-sm ${bookingMode === mode.value ? "border-[#C8A951] bg-[#C8A951]/10 text-[#1A1A2E]" : "border-slate-200 text-slate-600"}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input type="datetime-local" value={checkInAt} onChange={(e) => setCheckInAt(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
        <input type="datetime-local" value={checkOutAt} onChange={(e) => setCheckOutAt(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
      </div>

      <div className="mt-3">
        <button type="button" onClick={checkAvailability} className="rounded-lg bg-[#1A1A2E] px-4 py-2 text-sm text-white" disabled={loading}>
          {loading ? "Verification..." : "Verifier la disponibilite"}
        </button>
      </div>

      {rooms.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-[#1A1A2E]">Logement disponible</p>
          <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_type_name} - Chambre {room.room_number}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
        <input placeholder="Telephone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
        <input placeholder="Email (optionnel)" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" />
        <textarea
          placeholder="Commentaire (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          rows={3}
        />
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3">
        <p className="text-sm text-slate-600">Paiement</p>
        <p className="text-[#1A1A2E]">Paiement a l'arrivee (integration CinetPay a venir)</p>
        <p className="mt-1 text-sm font-semibold text-[#1A1A2E]">Estimation: {formatFCFA(estimatedAmount || 25000)}</p>
      </div>

      <button
        type="button"
        onClick={submitBooking}
        disabled={!canSubmit || loading}
        className="mt-4 w-full rounded-lg bg-[#C8A951] px-4 py-3 font-semibold text-[#1A1A2E] disabled:opacity-50"
      >
        {loading ? "Traitement..." : "Confirmer la reservation"}
      </button>

      {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
