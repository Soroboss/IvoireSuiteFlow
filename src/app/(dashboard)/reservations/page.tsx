"use client";

import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { ReservationTable } from "@/components/reservations/ReservationTable";
import { SearchInput } from "@/components/shared/SearchInput";
import { useReservations } from "@/hooks/useReservations";

export default function ReservationsPage() {
  const { reservations, loading } = useReservations();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");

  const filtered = useMemo(() => {
    return reservations
      .filter((row) => (mode === "all" ? true : row.booking_mode === mode))
      .filter((row) => (status === "all" ? true : row.status === status))
      .filter((row) => (payment === "all" ? true : row.payment_status === payment))
      .filter((row) =>
        `${row.booking_ref} ${row.client_name ?? ""} ${row.room_number ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 20);
  }, [mode, payment, reservations, search, status]);

  const exportXlsx = () => {
    const rows = filtered.map((r) => ({
      Reference: r.booking_ref,
      Client: r.client_name ?? "",
      Logement: r.room_number ?? "",
      Mode: r.booking_mode,
      CheckIn: r.check_in_at,
      Fin: r.check_out_at,
      Montant: r.total_amount,
      Paiement: r.payment_status,
      Statut: r.status
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservations");
    XLSX.writeFile(wb, "reservations-isf.xlsx");
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl text-isf-cream">Réservations</h1>
          <p className="text-sm text-isf-textSecondary">Liste, filtres, exports et actions opérationnelles.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="rounded-md border border-isf-border px-3 py-2 text-sm"><FileText className="mr-1 inline h-4 w-4" />PDF</button>
          <button onClick={exportXlsx} className="rounded-md border border-isf-border px-3 py-2 text-sm"><Download className="mr-1 inline h-4 w-4" />Excel</button>
        </div>
      </div>

      <div className="grid gap-2 rounded-xl border border-isf-border bg-isf-bgCard p-3 md:grid-cols-2 xl:grid-cols-6">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Recherche client/réf/logement" />
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
          <option value="all">Mode: tous</option>
          <option value="hourly">Horaire</option>
          <option value="nightly">Nuitée</option>
          <option value="stay">Séjour</option>
          <option value="pass">Pass</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
          <option value="all">Statut: tous</option>
          <option value="confirmed">Confirmée</option>
          <option value="checked_in">Check-in</option>
          <option value="checked_out">Check-out</option>
          <option value="cancelled">Annulée</option>
        </select>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
          <option value="all">Paiement: tous</option>
          <option value="paid">Payé</option>
          <option value="partial">Acompte</option>
          <option value="unpaid">Impayé</option>
        </select>
        <input type="date" className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
        <input type="date" className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
      </div>

      {loading ? <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement...</div> : <ReservationTable rows={filtered} />}
    </section>
  );
}
