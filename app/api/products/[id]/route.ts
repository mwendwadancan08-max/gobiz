
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
        { error: "Only approved admins can manage products." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { id } = await context.params;
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category = body.category;
    const price = Number(body.price);
    const imageUrl = body.imageUrl;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Product ID and name are required." },
        { status: 400 }
      );
    }

    if (
      !["READY_MADE", "FARM"].includes(category) ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        { error: "Choose a valid category and a whole-number price." },
        { status: 400 }
      );
    }

    if (
      imageUrl !== undefined &&
      (typeof imageUrl !== "string" ||
        !imageUrl.startsWith("https://"))
    ) {
      return NextResponse.json(
        { error: "The image URL is invalid." },
        { status: 400 }
      );
    }

    const categories = await sql.query(
      `SELECT id
       FROM public.categories
       WHERE type = $1 AND active = true
       LIMIT 1`,
      [category]
    );

    const categoryRow = categories[0] as { id: string } | undefined;

    if (!categoryRow) {
      return NextResponse.json(
        { error: "The selected category was not found or is inactive." },
        { status: 400 }
      );
    }

    const updated = await sql.query(
      `UPDATE public.products
       SET name = $1,
           category_id = $2,
           price_kes = $3,
           updated_at = NOW()
       WHERE id = $4 AND available = true
       RETURNING id`,
      [name, categoryRow.id, price, id]
    );

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Product not found or already deleted." },
        { status: 404 }
      );
    }

    // Only replace the image if a new image was uploaded.
    if (typeof imageUrl === "string") {
      await sql.query(
        `DELETE FROM public.product_images WHERE product_id = $1`,
        [id]
      );

      await sql.query(
        `INSERT INTO public.product_images
           (product_id, url, alt_text, position)
         VALUES ($1, $2, $3, 0)`,
        [id, imageUrl, name]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      { error: "Could not update the product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    if ("error" in admin) return admin.error;

    const { id } = await context.params;

    const rows = await sql.query(
      `UPDATE public.products
       SET available = false,
           updated_at = NOW()
       WHERE id = $1 AND available = true
       RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      { error: "Could not delete the product." },
      { status: 500 }
    );
  }
}
