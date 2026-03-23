import { NextResponse } from "next/server";
import { createPublicReservation, type PublicBookingPayload } from "@/lib/publicBookingServer";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PublicBookingPayload;
    const reservation = await createPublicReservation(payload);
    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la creation de la reservation"
      },
      { status: 400 }
    );
  }
}
