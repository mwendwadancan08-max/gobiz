
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

type UserProfile = {
  role: string;
  approval_status: string;
};

async function getCurrentUser() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  return user;
}

async function findProfile(
  userId: string
): Promise<UserProfile | undefined> {
  const rows = await sql.query(
    `SELECT role, approval_status
     FROM public.app_users
     WHERE id = $1
     LIMIT 1`,
    [userId]
  );

  return rows[0] as UserProfile | undefined;
}

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Please sign in again to finish setting up your profile.",
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Check whether the user already has a GoBiz profile.
    // This prevents existing admins and employees from
    // being registered again.
    let profile = await findProfile(user.id);

    // Create a profile only when one does not exist.
    if (!profile) {
      await sql.query(
        `SELECT register_gobiz_profile($1, $2, $3)`,
        [user.id, user.name || "", user.email]
      );

      profile = await findProfile(user.id);
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Your GoBiz profile could not be found.",
        },
        {
          status: 500,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(profile, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GoBiz profile setup failed:", error);

    return NextResponse.json(
      {
        error: "Unable to set up your GoBiz profile.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "You are not signed in.",
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const profile = await findProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        {
          error: "No GoBiz profile exists for this account.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    return NextResponse.json(profile, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GoBiz profile lookup failed:", error);

    return NextResponse.json(
      {
        error: "Unable to verify your GoBiz access.",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
