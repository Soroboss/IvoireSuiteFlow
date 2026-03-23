"use client";

import Link from "next/link";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { FCFADisplay } from "@/components/shared/FCFADisplay";
import { formatDate } from "@/lib/utils";
import type { ReservationRow } from "@/types/booking";

export function ReservationTable({ rows }: { rows: ReservationRow[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-isf-border bg-isf-bgCard lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-isf-bgElevated text-left text-isf-textSecondary">
            <tr>
              <th className="px-3 py-2">Réf</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Logement</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Check-in</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Paiement</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-isf-border">
                <td className="px-3 py-2">{row.booking_ref}</td>
                <td className="px-3 py-2">{row.client_name ?? "-"}</td>
                <td className="px-3 py-2">{row.room_number}</td>
                <td className="px-3 py-2"><BookingModeBadge mode={row.booking_mode} /></td>
                <td className="px-3 py-2">{formatDate(row.check_in_at)}</td>
                <td className="px-3 py-2">{formatDate(row.check_out_at)}</td>
                <td className="px-3 py-2 text-isf-gold"><FCFADisplay value={row.total_amount} /></td>
                <td className="px-3 py-2">{row.payment_status}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">
                  <Link href={`/reservations/${row.id}`} className="text-isf-gold">Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 lg:hidden">
        {rows.map((row) => (
          <Link key={row.id} href={`/reservations/${row.id}`} className="block rounded-xl border border-isf-border bg-isf-bgCard p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-isf-cream">{row.booking_ref}</p>
              <BookingModeBadge mode={row.booking_mode} />
            </div>
            <p className="text-xs text-isf-textSecondary">{row.client_name ?? "Walk-in"} · Chambre {row.room_number}</p>
            <p className="mt-1 text-sm text-isf-gold"><FCFADisplay value={row.total_amount} /></p>
          </Link>
        ))}
      </div>
    </>
  );
}
