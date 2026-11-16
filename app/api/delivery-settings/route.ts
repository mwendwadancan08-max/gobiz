import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        service_latitude AS lat,
        service_longitude AS lng,
        radius_km,
        fee_mode
      FROM public.delivery_settings
      WHERE id = 1
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Delivery settings are not configured." },
        { status: 503 }
      );
    }

    const row = rows[0];

    return NextResponse.json({
      latitude: Number(row.lat),
      longitude: Number(row.lng),
      radiusKm: Number(row.radius_km),
      feeMode: String(row.fee_mode),
    });
  } catch (error) {
    console.error("Failed to load delivery settings:", error);
    return NextResponse.json(
      { error: "Could not load delivery settings." },
      { status: 500 }
    );
  }
}