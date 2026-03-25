import { createServerInsforgeClient } from "@/lib/insforge/server";

export type PublicBookingPayload = {
  slug: string;
  bookingMode: "nightly" | "stay" | "pass";
  checkInAt: string;
  checkOutAt: string;
  roomId: string;
  totalAmount: number;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    notes?: string;
  };
};

type EstablishmentContext = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
};

function generateBookingRef() {
  return `ISF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function getEstablishmentBySlug(slug: string): Promise<EstablishmentContext> {
  const insforge = createServerInsforgeClient();
  const { data, error } = await insforge.database
    .from("establishments")
    .select("id, organization_id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Etablissement introuvable");
  }

  return data as EstablishmentContext;
}

export async function getPublicAvailability(input: {
  slug: string;
  bookingMode: "nightly" | "stay" | "pass";
  checkInAt: string;
  checkOutAt: string;
}) {
  const insforge = createServerInsforgeClient();
  const establishment = await getEstablishmentBySlug(input.slug);

  const { data, error } = await insforge.database.rpc("get_available_rooms", {
    p_establishment_id: establishment.id,
    p_check_in: input.checkInAt,
    p_check_out: input.checkOutAt,
    p_booking_mode: input.bookingMode
  });

  if (error) {
    throw new Error("Impossible de verifier la disponibilite en temps reel");
  }

  return {
    establishment,
    rooms: (data ?? []) as Array<{
      room_id: string;
      room_number: string;
      room_type_id: string;
      room_type_name: string;
      room_status: string;
    }>
  };
}

export async function createPublicReservation(payload: PublicBookingPayload) {
  const insforge = createServerInsforgeClient();
  const availability = await getPublicAvailability({
    slug: payload.slug,
    bookingMode: payload.bookingMode,
    checkInAt: payload.checkInAt,
    checkOutAt: payload.checkOutAt
  });

  const roomStillAvailable = availability.rooms.some((room) => room.room_id === payload.roomId);
  if (!roomStillAvailable) {
    throw new Error("Le logement selectionne n'est plus disponible");
  }

  const { data: clientRows, error: clientError } = await insforge.database
    .from("clients")
    .insert({
      organization_id: availability.establishment.organization_id,
      full_name: payload.customer.fullName,
      phone: payload.customer.phone,
      email: payload.customer.email ?? null
    })
    .select("id");

  const client = Array.isArray(clientRows) ? clientRows[0] : null;

  if (clientError || !client) {
    throw new Error("Impossible d'enregistrer les informations client");
  }

  const bookingRef = generateBookingRef();
  const { data: reservationRows, error: reservationError } = await insforge.database
    .from("reservations")
    .insert({
      organization_id: availability.establishment.organization_id,
      establishment_id: availability.establishment.id,
      room_id: payload.roomId,
      client_id: client.id,
      booking_ref: bookingRef,
      booking_mode: payload.bookingMode,
      status: "confirmed",
      source: "online",
      check_in_at: payload.checkInAt,
      check_out_at: payload.checkOutAt,
      base_amount: payload.totalAmount,
      total_amount: payload.totalAmount,
      payment_status: "unpaid",
      notes: payload.customer.notes ?? "Reservation publique en ligne - paiement a l'arrivee"
    })
    .select("id, booking_ref, check_in_at, check_out_at");

  const reservation = Array.isArray(reservationRows) ? reservationRows[0] : null;

  if (reservationError || !reservation) {
    throw new Error("Impossible de finaliser la reservation");
  }

  return {
    reservationId: reservation.id as string,
    bookingRef: reservation.booking_ref as string,
    checkInAt: reservation.check_in_at as string,
    checkOutAt: reservation.check_out_at as string,
    establishmentName: availability.establishment.name
  };
}
