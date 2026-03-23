"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueAreaChart({ data }: { data: { day: string; amount: number }[] }) {
  return (
    <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <h3 className="mb-3 font-serif text-xl text-isf-cream">Revenus 30 jours</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="isfArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C8A951" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C8A951" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="day" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip />
            <Area type="monotone" dataKey="amount" stroke="#C8A951" fill="url(#isfArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
