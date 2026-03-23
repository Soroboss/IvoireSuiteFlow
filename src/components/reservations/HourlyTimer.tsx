"use client";

import { useMemo, useState } from "react";
import { useTimer } from "@/hooks/useTimer";

type Props = {
  expiresAt: string | null;
  reservationId: string;
  roomNumber: string;
  compact?: boolean;
  onExtend?: (reservationId: string, hours: number) => void;
  onCheckout?: (reservationId: string) => void;
};

export function HourlyTimer({ expiresAt, reservationId, roomNumber, compact = false, onExtend, onCheckout }: Props) {
  const { label, secondsLeft, isExpired } = useTimer(expiresAt);
  const [open, setOpen] = useState(false);

  const pct = useMemo(() => {
    if (!expiresAt) return 0;
    const total = 6 * 3600;
    return Math.max(0, Math.min(100, (Math.max(secondsLeft ?? 0, 0) / total) * 100));
  }, [expiresAt, secondsLeft]);

  const stroke = useMemo(() => {
    if (isExpired) return "#EF4444";
    if ((secondsLeft ?? 0) < 15 * 60) return "#EF4444";
    if ((secondsLeft ?? 0) < 0.5 * 6 * 3600) return "#F59E0B";
    return "#22C55E";
  }, [isExpired, secondsLeft]);

  const radius = compact ? 26 : 44;
  const c = 2 * Math.PI * radius;
  const dash = (pct / 100) * c;

  return (
    <div className={`rounded-xl border p-3 ${isExpired ? "border-isf-error bg-isf-error/10" : "border-isf-border bg-isf-bgCard"}`}>
      <div className="flex items-center gap-3">
        <svg width={compact ? 62 : 100} height={compact ? 62 : 100} viewBox={`0 0 ${compact ? 62 : 100} ${compact ? 62 : 100}`}>
          <circle cx={compact ? 31 : 50} cy={compact ? 31 : 50} r={radius} stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
          <circle
            cx={compact ? 31 : 50}
            cy={compact ? 31 : 50}
            r={radius}
            stroke={stroke}
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${compact ? 31 : 50} ${compact ? 31 : 50})`}
            className={(secondsLeft ?? 0) < 15 * 60 ? "animate-pulse" : ""}
          />
          <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontSize={compact ? "9" : "12"} fill="#E8E6E1">
            {isExpired ? "ÉCOULÉ" : label}
          </text>
        </svg>

        <div className="flex-1">
          <p className="text-sm font-semibold text-isf-cream">Chambre {roomNumber}</p>
          <p className="text-xs text-isf-textSecondary">Réservation {reservationId.slice(0, 8)}</p>
          {isExpired ? <p className="mt-1 text-xs font-semibold text-isf-error">TEMPS ÉCOULÉ</p> : null}
        </div>
      </div>

      {!compact ? (
        <div className="mt-3 flex gap-2">
          <button className="rounded-md border border-isf-border px-2 py-1 text-xs" onClick={() => setOpen((v) => !v)}>
            Prolonger
          </button>
          <button className="rounded-md bg-isf-error/15 px-2 py-1 text-xs text-isf-error" onClick={() => onCheckout?.(reservationId)}>
            Check-out
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="mt-2 flex gap-2">
          {[1, 2, 3].map((h) => (
            <button key={h} className="rounded-md border border-isf-gold/40 px-2 py-1 text-xs text-isf-gold" onClick={() => onExtend?.(reservationId, h)}>
              +{h}h
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
