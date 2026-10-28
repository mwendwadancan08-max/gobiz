import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user?.id) {
    return {
      response: NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 }
      ),
    };
  }

  const profiles = await sql`
    SELECT role, approval_status
    FROM public.app_users
    WHERE id = ${user.id}
    LIMIT 1
  `;

  const profile = profiles[0] as
    | { role: string; approval_status: string }
    | undefined;

  if (
    profile?.role !== "ADMIN" ||
    profile?.approval_status !== "APPROVED"
  ) {
    return {
      response: NextResponse.json(
        { error: "Approved admin access is required." },
        { status: 403 }
      ),
    };
  }

  return { response: null };
}

export async function GET() {
  try {
    const access = await checkAdmin();
    if (access.response) return access.response;

    const rows = await sql`
      SELECT
        id,
        service_latitude,
        service_longitude,
        radius_km,
        fee_mode,
        fixed_fee_kes,
        fee_percentage,
        updated_at
      FROM public.delivery_settings
      ORDER BY id
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "Delivery settings row not found." },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: rows[0] });
  } catch (error) {
    console.error("Loading delivery settings failed:", error);
    return NextResponse.json(
      { error: "Could not load delivery settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const access = await checkAdmin();
    if (access.response) return access.response;

    const body = await request.json();
    const latitude = body.latitude;
    const longitude = body.longitude;
    const radiusKm = body.radiusKm;

    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      typeof radiusKm !== "number" ||
      !Number.isFinite(radiusKm) ||
      radiusKm <= 0 ||
      radiusKm > 100
    ) {
      return NextResponse.json(
        { error: "Enter valid GPS coordinates and a radius greater than 0 and no more than 100 km." },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id
      FROM public.delivery_settings
      ORDER BY id
      LIMIT 1
    `;

    if (!existing.length) {
      return NextResponse.json(
        { error: "The existing delivery settings row was not found." },
        { status: 500 }
      );
    }

    const rows = await sql`
      UPDATE public.delivery_settings
      SET
        service_latitude = ${latitude},
        service_longitude = ${longitude},
        radius_km = ${radiusKm},
        updated_at = NOW()
      WHERE id = ${existing[0].id}
      RETURNING
        id,
        service_latitude,
        service_longitude,
        radius_km,
        fee_mode,
        fixed_fee_kes,
        fee_percentage,
        updated_at
    `;

    return NextResponse.json({
      message: "Delivery coverage saved.",
      settings: rows[0],
    });
  } catch (error) {
    console.error("Saving delivery settings failed:", error);
    return NextResponse.json(
      { error: "Could not save delivery settings." },
      { status: 500 }
    );
  }
}
