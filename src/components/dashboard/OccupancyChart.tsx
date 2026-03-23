"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function OccupancyChart({ data }: { data: { day: string; value: number }[] }) {
  return (
    <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <h3 className="mb-3 font-serif text-xl text-isf-cream">Occupation 7 jours</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="isfGoldBar" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#E2D292" />
                <stop offset="100%" stopColor="#C8A951" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="day" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="url(#isfGoldBar)" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="value" position="top" formatter={(v: number) => `${Math.round(v)}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
