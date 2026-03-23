import { cn } from "@/lib/utils";
import type { RoomStatus } from "@/types/room";

const statusMap: Record<RoomStatus, { label: string; dot: string; wrapper: string }> = {
  available: {
    label: "Disponible",
    dot: "bg-isf-success animate-isf-pulse",
    wrapper: "text-isf-success bg-isf-success/10"
  },
  occupied: {
    label: "Occupé",
    dot: "bg-isf-error shadow-[0_0_10px_rgba(239,68,68,0.35)]",
    wrapper: "text-isf-error bg-isf-error/10"
  },
  cleaning: {
    label: "Nettoyage",
    dot: "bg-isf-warning shadow-[0_0_10px_rgba(245,158,11,0.35)]",
    wrapper: "text-isf-warning bg-isf-warning/10"
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-isf-textMuted",
    wrapper: "text-isf-textMuted bg-isf-textMuted/10"
  },
  out_of_service: {
    label: "Hors service",
    dot: "bg-slate-600",
    wrapper: "text-slate-400 bg-slate-600/10"
  }
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const item = statusMap[status];
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium", item.wrapper)}>
      <span className={cn("h-2.5 w-2.5 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
}
