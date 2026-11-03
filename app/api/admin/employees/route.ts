
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

async function requireAdmin() {
  const { data: session } = await auth.getSession();
  const user = session?.user;

  if (!user?.id) {
    return {
      error: NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      ),
    };
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

  if (
    profile?.role !== "ADMIN" ||
    profile.approval_status !== "APPROVED"
  ) {
    return {
      error: NextResponse.json(
        { error: "Only approved administrators can manage employees." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const employees = await sql.query(
      `SELECT
         id,
         full_name,
         email,
         approval_status,
         approved_by,
         approved_at,
         created_at
       FROM public.app_users
       WHERE role = 'EMPLOYEE'
       ORDER BY created_at DESC`
    );

    return NextResponse.json(
      { success: true, employees },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Employee retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve employees." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const body = await request.json();

    const employeeId =
      typeof body.employeeId === "string" ? body.employeeId : "";

    const action =
      typeof body.action === "string" ? body.action : "";

    if (!employeeId || !["APPROVE", "BAN", "DELETE", "RESTORE"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid employee or action." },
        { status: 400 }
      );
    }

    const employeeRows = await sql.query(
      `SELECT id, role, approval_status
       FROM public.app_users
       WHERE id = $1
       LIMIT 1`,
      [employeeId]
    );

    const employee = employeeRows[0] as
      | { id: string; role: string; approval_status: string }
      | undefined;

    if (!employee || employee.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "Employee account not found." },
        { status: 404 }
      );
    }

    let updated;

    switch (action) {
      case "APPROVE":
        if (employee.approval_status !== "PENDING") {
          return NextResponse.json(
            { error: "Only pending employees can be approved." },
            { status: 400 }
          );
        }

        updated = await sql.query(
          `UPDATE public.app_users
           SET approval_status = 'APPROVED',
               approved_by = $1,
               approved_at = NOW(),
               updated_at = NOW()
           WHERE id = $2
           RETURNING id`,
          [admin.user.id, employeeId]
        );
        break;

      case "BAN":
        if (employee.approval_status === "DELETED") {
          return NextResponse.json(
            { error: "Restore the employee before banning them." },
            { status: 400 }
          );
        }

        if (employee.approval_status === "BANNED") {
          return NextResponse.json(
            { error: "This employee is already banned." },
            { status: 400 }
          );
        }

        updated = await sql.query(
          `UPDATE public.app_users
           SET approval_status = 'BANNED',
               updated_at = NOW()
           WHERE id = $1
           RETURNING id`,
          [employeeId]
        );
        break;

      case "DELETE":
        if (employee.approval_status === "DELETED") {
          return NextResponse.json(
            { error: "This employee is already deleted." },
            { status: 400 }
          );
        }

        updated = await sql.query(
          `UPDATE public.app_users
           SET approval_status = 'DELETED',
               updated_at = NOW()
           WHERE id = $1
           RETURNING id`,
          [employeeId]
        );
        break;

      case "RESTORE":
        if (employee.approval_status !== "DELETED") {
          return NextResponse.json(
            { error: "Only deleted employees can be restored." },
            { status: 400 }
          );
        }

        updated = await sql.query(
          `UPDATE public.app_users
           SET approval_status = 'PENDING',
               approved_by = NULL,
               approved_at = NULL,
               updated_at = NOW()
           WHERE id = $1
           RETURNING id`,
          [employeeId]
        );
        break;
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "The employee could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Employee management failed:", error);

    return NextResponse.json(
      { error: "Unable to update the employee account." },
      { status: 500 }
    );
  }
}
