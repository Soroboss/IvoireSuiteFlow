"use client";

import { Suspense } from "react";
import { BookingForm } from "@/components/reservations/BookingForm";

export default function NewReservationPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Nouvelle réservation</h1>
        <p className="text-sm text-isf-textSecondary">Wizard rapide 5 étapes pour la réception.</p>
      </div>
      <Suspense fallback={<div className="rounded-xl border border-isf-border bg-isf-bgCard p-4 text-sm text-isf-textSecondary">Chargement du formulaire...</div>}>
        <BookingForm />
      </Suspense>
    </section>
  );
}
