import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFCFA(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

export function formatDate(value: string | Date, formatPattern = "dd/MM/yyyy HH:mm") {
  return format(new Date(value), formatPattern, { locale: fr });
}

export function formatPhone(phone: string) {
  return phone.replace(/\s+/g, "").replace(/(\+225|225)?(\d{2})(\d{2})(\d{2})(\d{2})/, "+225 $2 $3 $4 $5");
}

export function generateQR(payload: string) {
  return payload;
}
