"use client";

import { useEffect, useMemo, useState } from "react";

export function useTimer(targetDate?: string | null) {
  const targetMs = useMemo(() => (targetDate ? new Date(targetDate).getTime() : null), [targetDate]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetMs) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  if (!targetMs) {
    return { secondsLeft: null as number | null, isExpired: false, label: "--:--:--", progress: 0 };
  }

  const secondsLeft = Math.floor((targetMs - now) / 1000);
  const absSeconds = Math.max(0, secondsLeft);
  const h = String(Math.floor(absSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((absSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(absSeconds % 60).padStart(2, "0");

  const total = 6 * 3600;
  const progress = Math.min(100, Math.max(0, ((total - absSeconds) / total) * 100));

  return {
    secondsLeft,
    isExpired: secondsLeft <= 0,
    label: `${h}:${m}:${s}`,
    progress
  };
}
