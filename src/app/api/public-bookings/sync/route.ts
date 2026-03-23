import { NextResponse } from "next/server";
import { createPublicReservation, type PublicBookingPayload } from "@/lib/publicBookingServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as PublicBookingPayload[];

    const results = await Promise.allSettled(items.map((item) => createPublicReservation(item)));

    return NextResponse.json({
      success: true,
      synced: results.filter((entry) => entry.status === "fulfilled").length,
      failed: results.filter((entry) => entry.status === "rejected").length
    });
  } catch {
    return NextResponse.json({ success: false, message: "Sync offline impossible" }, { status: 400 });
  }
}
