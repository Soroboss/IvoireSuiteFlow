import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";

export function PaymentMethodIcon({ method }: { method: string }) {
  if (method.includes("money") || method.includes("momo") || method === "wave") return <Smartphone className="h-4 w-4" />;
  if (method === "card") return <CreditCard className="h-4 w-4" />;
  if (method === "transfer" || method === "corporate") return <Landmark className="h-4 w-4" />;
  return <Banknote className="h-4 w-4" />;
}
