import { NextResponse } from "next/server";
import { getPublicAvailability } from "@/lib/publicBookingServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getPublicAvailability({
      slug: body.slug,
      bookingMode: body.bookingMode,
      checkInAt: body.checkInAt,
      checkOutAt: body.checkOutAt
    });

    return NextResponse.json({
      success: true,
      rooms: result.rooms,
      establishmentId: result.establishment.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur de disponibilite"
      },
      { status: 400 }
    );
  }
}
