"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { downloadInvoicePdf } from "@/lib/pdf/invoice-template";

export default function ReservationConfirmedPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-xl border border-isf-success/40 bg-isf-success/10 p-6 text-center">
        <p className="text-2xl">✓</p>
        <h1 className="font-serif text-3xl text-isf-cream">Réservation confirmée</h1>
        <p className="mt-2 text-sm text-isf-textSecondary">Réservation {id.slice(0, 8).toUpperCase()} créée avec succès.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          className="rounded-md border border-isf-border px-3 py-2 text-sm"
          onClick={() =>
            downloadInvoicePdf({
              bookingRef: id.slice(0, 8).toUpperCase(),
              clientName: "Client",
              roomNumber: "-",
              mode: "reservation",
              checkIn: new Date().toLocaleString("fr-FR"),
              checkOut: new Date().toLocaleString("fr-FR"),
              total: 0
            })
          }
        >
          Imprimer ticket
        </button>
        <button
          className="rounded-md border border-isf-border px-3 py-2 text-sm"
          onClick={() => {
            const text = encodeURIComponent(`Réservation ${id.slice(0, 8).toUpperCase()} confirmée via IvoireSuiteFlow.`);
            window.open(`https://wa.me/?text=${text}`, "_blank");
          }}
        >
          Partager sur WhatsApp
        </button>
        <Link href="/reservations/new" className="rounded-md bg-isf-gold px-3 py-2 text-center text-sm font-medium text-black">
          Nouvelle réservation
        </Link>
      </div>

      <Link href={`/reservations/${id}`} className="text-sm text-isf-gold">
        Voir le détail de la réservation
      </Link>
    </section>
  );
}
