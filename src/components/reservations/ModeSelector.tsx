"use client";

import type { BookingMode } from "@/types/room";
import { formatFCFA } from "@/lib/utils";

type Props = {
  value: BookingMode | null;
  onChange: (value: BookingMode) => void;
};

const modes: { value: BookingMode; icon: string; title: string; subtitle: string; price: number; unit: string }[] = [
  { value: "hourly", icon: "⏰", title: "À l'heure", subtitle: "Location courte durée (1h à 6h)", price: 4000, unit: "/h" },
  { value: "nightly", icon: "🌙", title: "Nuitée", subtitle: "Réservation classique", price: 15000, unit: "/nuit" },
  { value: "stay", icon: "📅", title: "Séjour", subtitle: "Location longue durée (semaine/mois)", price: 300000, unit: "/mois" },
  { value: "pass", icon: "🎫", title: "Pass", subtitle: "Accès temporaire (journée, piscine, événement)", price: 12000, unit: "" }
];

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {modes.map((mode) => {
        const active = value === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`rounded-xl border p-4 text-left transition ${
              active ? "border-isf-gold bg-[var(--isf-gold-dim)]" : "border-isf-border bg-isf-bgCard"
            }`}
          >
            <div className="text-2xl">{mode.icon}</div>
            <h3 className="mt-2 font-serif text-xl text-isf-cream">{mode.title}</h3>
            <p className="text-sm text-isf-textSecondary">{mode.subtitle}</p>
            <p className="mt-2 text-sm font-semibold text-isf-gold">
              à partir de {formatFCFA(mode.price)}
              {mode.unit}
            </p>
          </button>
        );
      })}
    </div>
  );
}
