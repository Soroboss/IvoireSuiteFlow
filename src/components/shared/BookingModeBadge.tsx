import { BOOKING_MODES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function BookingModeBadge({ mode }: { mode: (typeof BOOKING_MODES)[number]["value"] }) {
  const item = BOOKING_MODES.find((m) => m.value === mode);
  return <StatusBadge label={item?.label ?? mode} className={`bg-white/5 ${item?.color ?? "text-isf-text"}`} />;
}
