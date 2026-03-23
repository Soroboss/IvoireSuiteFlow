export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      booking_mode_enum: "hourly" | "nightly" | "stay" | "pass";
      reservation_status_enum: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show" | "expired";
      user_role_enum: "super_admin" | "admin" | "receptionist" | "cashier" | "housekeeper" | "accountant" | "manager";
      room_status_enum: "available" | "occupied" | "cleaning" | "maintenance" | "out_of_service";
      payment_method_enum: "cash" | "orange_money" | "mtn_momo" | "wave" | "moov_money" | "card" | "transfer" | "corporate";
    };
    Tables: {
      organizations: {
        Row: { id: string; name: string; email: string; city: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; email: string; city?: string | null; phone?: string | null; subscription_plan?: "trial" | "starter" | "pro" | "business"; subscription_status?: "active" | "trial" | "expired" | "cancelled"; trial_ends_at?: string | null };
      };
      establishments: {
        Row: { id: string; organization_id: string; name: string; slug: string; type: string; city: string | null; neighborhood: string | null; is_active: boolean };
        Insert: { id?: string; organization_id: string; name: string; slug: string; type: string; address?: string | null; neighborhood?: string | null; city?: string | null; country?: string };
      };
      profiles: {
        Row: { id: string; organization_id: string; establishment_id: string | null; full_name: string; email: string | null; role: Database["public"]["Enums"]["user_role_enum"] };
        Insert: { id: string; organization_id: string; establishment_id?: string | null; full_name: string; email?: string | null; phone?: string | null; role?: Database["public"]["Enums"]["user_role_enum"] };
      };
      room_types: { Row: { id: string; establishment_id: string; name: string; base_price_hour: number | null; base_price_night: number | null; base_price_week: number | null; base_price_month: number | null } };
      rooms: { Row: { id: string; establishment_id: string; room_type_id: string; room_number: string; status: Database["public"]["Enums"]["room_status_enum"]; is_active: boolean } };
      clients: { Row: { id: string; organization_id: string; full_name: string; phone: string | null; email: string | null; total_stays: number; total_spent: number } };
      reservations: {
        Row: {
          id: string;
          organization_id: string;
          establishment_id: string;
          room_id: string;
          client_id: string | null;
          booking_ref: string;
          booking_mode: Database["public"]["Enums"]["booking_mode_enum"];
          status: Database["public"]["Enums"]["reservation_status_enum"];
          check_in_at: string;
          check_out_at: string;
          total_amount: number;
          payment_status: "unpaid" | "partial" | "paid" | "refunded";
          payment_method: Database["public"]["Enums"]["payment_method_enum"] | null;
          created_at: string;
        };
      };
      extras: { Row: { id: string; establishment_id: string; name: string; price: number; is_active: boolean } };
      payments: { Row: { id: string; reservation_id: string | null; establishment_id: string; amount: number; payment_method: Database["public"]["Enums"]["payment_method_enum"]; created_at: string } };
      invoices: { Row: { id: string; reservation_id: string | null; establishment_id: string; invoice_number: string; total_amount: number; created_at: string } };
    };
  };
};
