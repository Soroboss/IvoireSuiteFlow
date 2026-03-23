"use client";

import { formatFCFA } from "@/lib/utils";

type Props = {
  hours: number;
  onChange: (hours: number) => void;
  baseHourlyPrice: number;
  isNight: boolean;
  nightSurchargePerHour: number;
};

export function HourSelector({ hours, onChange, baseHourlyPrice, isNight, nightSurchargePerHour }: Props) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((h) => {
          const total = h * (baseHourlyPrice + (isNight ? nightSurchargePerHour : 0));
          return (
            <button
              key={h}
              onClick={() => onChange(h)}
              className={`rounded-lg border p-3 text-left ${hours === h ? "border-isf-gold bg-[var(--isf-gold-dim)]" : "border-isf-border bg-isf-bgCard"}`}
            >
              <p className="text-sm font-semibold text-isf-cream">{h}h</p>
              <p className="text-xs text-isf-gold">{formatFCFA(total)}</p>
            </button>
          );
        })}
      </div>
      {isNight ? <p className="text-xs text-isf-warning">Supplément nuit : +{formatFCFA(nightSurchargePerHour)}/h</p> : null}
    </div>
  );
}
