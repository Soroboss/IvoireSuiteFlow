import { formatFCFA } from "@/lib/utils";

export function FCFADisplay({ value }: { value: number }) {
  return <span className="font-mono">{formatFCFA(value)}</span>;
}
