"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { createClient } from "@/lib/supabase/client";

type SubscriberRow = {
  id: string;
  name: string;
  city: string | null;
  subscription_plan: "trial" | "starter" | "pro" | "business";
  subscription_status: "active" | "trial" | "expired" | "cancelled";
  trial_ends_at: string | null;
  subscription_ends_at?: string | null;
  max_establishments?: number | null;
};

export function useAdminSaasData() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("organizations")
        .select("id, name, city, subscription_plan, subscription_status, trial_ends_at, subscription_ends_at, max_establishments")
        .order("created_at", { ascending: false });
      setRows((data ?? []) as SubscriberRow[]);
      setLoading(false);
    };
    run();
  }, []);

  const monthlyFeeByPlan = useMemo(
    () => ({
      trial: 0,
      starter: 19900,
      pro: 39900,
      business: 79900
    }),
    []
  );

  const kpis = useMemo(() => {
    const active = rows.filter((r) => r.subscription_status === "active");
    const trial = rows.filter((r) => r.subscription_status === "trial");
    const expired = rows.filter((r) => r.subscription_status === "expired" || r.subscription_status === "cancelled");
    const mrr = active.reduce((sum, row) => sum + monthlyFeeByPlan[row.subscription_plan], 0);
    const churn = rows.length ? (expired.length / rows.length) * 100 : 0;
    return {
      totalHotels: rows.length,
      mrr,
      churnRate: Number(churn.toFixed(2)),
      trials: trial.length
    };
  }, [rows, monthlyFeeByPlan]);

  const planDistribution = useMemo(() => {
    const count = { starter: 0, pro: 0, business: 0 };
    rows.forEach((row) => {
      if (row.subscription_plan === "starter") count.starter += 1;
      if (row.subscription_plan === "pro") count.pro += 1;
      if (row.subscription_plan === "business") count.business += 1;
    });
    return Object.entries(count).map(([plan, value]) => ({ plan: plan.toUpperCase(), value }));
  }, [rows]);

  const cityDistribution = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row) => {
      const city = row.city || "Non renseignee";
      map.set(city, (map.get(city) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([city, value]) => ({ city, value }));
  }, [rows]);

  const subscribers12m = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const date = startOfMonth(addMonths(subMonths(new Date(), 11), idx));
      return {
        month: format(date, "MMM"),
        subscribers: Math.max(0, Math.round((rows.length / 12) * (idx + 1)))
      };
    });
  }, [rows.length]);

  const mrr12m = useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const date = startOfMonth(addMonths(subMonths(new Date(), 11), idx));
      return {
        month: format(date, "MMM"),
        mrr: Math.round((kpis.mrr / 12) * (idx + 1))
      };
    });
  }, [kpis.mrr]);

  const alerts = useMemo(() => {
    const now = new Date();
    return rows
      .map((row) => {
        const trialDays = row.trial_ends_at ? Math.ceil((new Date(row.trial_ends_at).getTime() - now.getTime()) / 86400000) : null;
        const endDays = row.subscription_ends_at ? Math.ceil((new Date(row.subscription_ends_at).getTime() - now.getTime()) / 86400000) : null;
        if (trialDays !== null && trialDays >= 0 && trialDays <= 3) {
          return { type: "trial", label: `${row.name} - essai expire dans ${trialDays} jour(s)` };
        }
        if (endDays !== null && endDays >= 0 && endDays <= 7) {
          return { type: "subscription", label: `${row.name} - abonnement expire cette semaine` };
        }
        return null;
      })
      .filter(Boolean) as Array<{ type: string; label: string }>;
  }, [rows]);

  return {
    loading,
    rows,
    kpis,
    subscribers12m,
    mrr12m,
    planDistribution,
    cityDistribution,
    alerts
  };
}
