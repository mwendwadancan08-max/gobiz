import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feedback = await sql`
      SELECT
        id,
        feedback_type,
        is_anonymous,
        customer_name,
        phone,
        message,
        created_at
      FROM public.customer_feedback
      ORDER BY created_at DESC
      LIMIT 200
    `;

    return NextResponse.json(
      { success: true, feedback },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GoBiz admin feedback retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve customer feedback." },
      { status: 500 }
    );
  }
}