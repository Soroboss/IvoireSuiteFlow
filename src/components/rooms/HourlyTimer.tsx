"use client";

import { AlertTriangle, Clock3 } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";

type HourlyTimerProps = {
  timerExpiresAt: string | null;
};

export function HourlyTimer({ timerExpiresAt }: HourlyTimerProps) {
  const { isExpired, label, progress } = useTimer(timerExpiresAt);

  return (
    <div className={`rounded-lg border p-2 ${isExpired ? "border-isf-error bg-isf-error/10" : "border-isf-warning/40 bg-isf-warning/10"}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1">
          {isExpired ? <AlertTriangle className="h-3.5 w-3.5 text-isf-error" /> : <Clock3 className="h-3.5 w-3.5 text-isf-warning" />}
          {isExpired ? "EXPIRÉ" : "Temps restant"}
        </span>
        <span className={`font-mono ${isExpired ? "text-isf-error" : "text-isf-warning"}`}>{label}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-black/20">
        <div
          className={`h-1.5 rounded-full transition-all ${isExpired ? "bg-isf-error animate-pulse" : "bg-isf-warning"}`}
          style={{ width: `${Math.max(0, 100 - progress)}%` }}
        />
      </div>
    </div>
  );
}
