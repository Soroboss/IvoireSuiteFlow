import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatFCFA } from "@/lib/utils";

type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
  isMoney?: boolean;
  deltaPct?: number;
};

export function KPICard({ title, value, subtitle, isMoney = false, deltaPct = 0 }: Props) {
  const positive = deltaPct >= 0;
  return (
    <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
      <p className="text-xs text-isf-textSecondary">{title}</p>
      <p className="mt-2 font-serif text-3xl text-isf-cream">{isMoney && typeof value === "number" ? formatFCFA(value) : value}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-isf-textMuted">{subtitle}</p>
        <span className={cn("inline-flex items-center gap-1 text-xs", positive ? "text-isf-success" : "text-isf-error")}>
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(deltaPct).toFixed(1)}%
        </span>
      </div>
    </article>
  );
}
