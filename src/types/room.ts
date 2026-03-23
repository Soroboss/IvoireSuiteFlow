import type { Database } from "@/types/database";

export type RoomStatus = Database["public"]["Enums"]["room_status_enum"];
export type BookingMode = Database["public"]["Enums"]["booking_mode_enum"];

export type RoomWithRelations = {
  id: string;
  room_number: string;
  floor: string | null;
  status: RoomStatus;
  is_active: boolean;
  room_type: {
    id: string;
    name: string;
    amenities: string[];
    base_price_night: number | null;
  } | null;
  current_reservation: {
    id: string;
    booking_mode: BookingMode;
    check_out_at: string;
    timer_expires_at: string | null;
    client_name: string | null;
  } | null;
};

export type RoomTypeRow = {
  id: string;
  name: string;
  description: string | null;
  base_price_hour: number | null;
  base_price_night: number | null;
  weekend_price_night: number | null;
  high_season_price_night: number | null;
  holiday_price_night: number | null;
  base_price_week: number | null;
  base_price_month: number | null;
  base_price_day_pass: number | null;
  deposit_amount: number | null;
  capacity_adults: number;
  capacity_children: number;
  amenities: string[];
  images: string[];
  sort_order: number;
  is_active: boolean;
};
