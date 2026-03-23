"use client";

import { useState } from "react";

export function PaymentForm({
  reservation,
  onSubmit
}: {
  reservation: { id: string; booking_ref: string; client_name: string; total_amount: number };
  onSubmit: (amount: number, method: string, reference?: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState<number>(reservation.total_amount);
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");

  return (
    <div className="rounded-xl border border-isf-border bg-isf-bgCard p-3">
      <p className="text-sm text-isf-cream">{reservation.booking_ref} · {reservation.client_name}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
          <option value="cash">💵 Espèces</option>
          <option value="orange_money">🟠 Orange Money</option>
          <option value="mtn_momo">🟡 MTN MoMo</option>
          <option value="wave">🔵 Wave</option>
          <option value="moov_money">🟢 Moov Money</option>
          <option value="card">💳 Carte</option>
          <option value="transfer">🏦 Virement</option>
          <option value="corporate">🏢 Corporate</option>
        </select>
        <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Référence" className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm" />
      </div>
      <button onClick={() => onSubmit(amount, method, reference)} className="mt-2 rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black">
        Encaisser
      </button>
    </div>
  );
}
