import { cn } from "@/lib/utils";

export function StatusBadge({ label, className }: { label: string; className?: string }) {
  return <span className={cn("rounded-full px-2 py-1 text-xs font-medium", className)}>{label}</span>;
}
