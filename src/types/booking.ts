import type { BookingMode } from "@/types/room";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show"
  | "expired";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export type ReservationRow = {
  id: string;
  booking_ref: string;
  booking_mode: BookingMode;
  status: BookingStatus;
  payment_status: PaymentStatus;
  check_in_at: string;
  check_out_at: string;
  timer_expires_at: string | null;
  total_amount: number;
  room_id: string;
  client_id: string | null;
  room_number?: string;
  client_name?: string | null;
};

export type NewReservationPayload = {
  booking_mode: BookingMode;
  room_id: string;
  client_id: string | null;
  check_in_at: string;
  check_out_at: string;
  hours?: number | null;
  nights?: number | null;
  pass_type?: string | null;
  base_amount: number;
  tax_amount: number;
  discount_amount: number;
  extras_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  deposit_amount?: number;
  notes?: string;
  internal_notes?: string;
  timer_expires_at?: string | null;
  qr_code?: string | null;
  contract_url?: string | null;
};
