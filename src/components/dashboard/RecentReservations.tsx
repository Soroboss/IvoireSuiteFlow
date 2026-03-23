import Link from "next/link";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { FCFADisplay } from "@/components/shared/FCFADisplay";
import { formatDate } from "@/lib/utils";

export function RecentReservations({
  rows
}: {
  rows: {
    id: string;
    booking_ref: string;
    client_name?: string | null;
    room_number?: string;
    booking_mode: "hourly" | "nightly" | "stay" | "pass";
    total_amount: number;
    payment_status: string;
    status: string;
    created_at: string;
  }[];
}) {
  return (
    <article className="overflow-x-auto rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <h3 className="mb-4 font-serif text-xl text-isf-cream">Dernières réservations</h3>
      <table className="min-w-full text-sm">
        <thead className="text-left text-isf-textSecondary">
          <tr>
            <th className="py-2">Client</th>
            <th className="py-2">Logement</th>
            <th className="py-2">Mode</th>
            <th className="py-2">Montant</th>
            <th className="py-2">Paiement</th>
            <th className="py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-isf-border">
              <td className="py-2">
                <Link href={`/reservations/${r.id}`} className="text-isf-gold">
                  {r.client_name ?? "Walk-in"}
                </Link>
                <p className="text-xs text-isf-textMuted">{formatDate(r.created_at, "dd/MM HH:mm")}</p>
              </td>
              <td className="py-2">{r.room_number ?? "-"}</td>
              <td className="py-2">
                <BookingModeBadge mode={r.booking_mode} />
              </td>
              <td className="py-2 text-isf-gold">
                <FCFADisplay value={r.total_amount} />
              </td>
              <td className="py-2">{r.payment_status}</td>
              <td className="py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
