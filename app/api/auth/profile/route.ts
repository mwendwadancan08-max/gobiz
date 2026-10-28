
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    if (!user?.id || !user.email) {
      return NextResponse.json(
        { error: "Please sign in again to finish setting up your profile." },
        { status: 401 }
      );
    }

    await sql.query(
      `SELECT register_gobiz_profile($1, $2, $3)`,
      [user.id, user.name || "", user.email]
    );

    const rows = await sql.query(
      `SELECT role, approval_status
       FROM public.app_users
       WHERE id = $1
       LIMIT 1`,
      [user.id]
    );

    const profile = rows[0] as
      | { role: string; approval_status: string }
      | undefined;

    if (!profile) {
      return NextResponse.json(
        { error: "Your GoBiz profile could not be found." },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GoBiz profile setup failed:", error);

    return NextResponse.json(
      { error: "Unable to load your GoBiz profile." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "You are not signed in." },
        { status: 401 }
      );
    }

    const rows = await sql.query(
      `SELECT role, approval_status
       FROM public.app_users
       WHERE id = $1
       LIMIT 1`,
      [user.id]
    );

    const profile = rows[0] as
      | { role: string; approval_status: string }
      | undefined;

    if (!profile) {
      return NextResponse.json(
        { error: "No GoBiz profile exists for this account." },
        { status: 403 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("GoBiz profile lookup failed:", error);

    return NextResponse.json(
      { error: "Unable to verify your GoBiz access." },
      { status: 500 }
    );
  }
}
