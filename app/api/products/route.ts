import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const products = await sql.query(
      `SELECT
         p.id,
         p.name,
         c.type AS category,
         p.price_kes AS price,
         COALESCE(p.description, '') AS description,
         image.url AS "imageUrl"
       FROM public.products p
       JOIN public.categories c ON c.id = p.category_id
       LEFT JOIN LATERAL (
         SELECT url
         FROM public.product_images
         WHERE product_id = p.id
         ORDER BY position ASC, created_at ASC
         LIMIT 1
       ) image ON true
       WHERE p.available = true
         AND c.active = true
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load GoBiz products:", error);

    return NextResponse.json(
      { error: "Unable to load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify the signed-in user on the server.
    const { data: session } = await auth.getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

    // Only approved administrators may create products.
    const profiles = await sql.query(
      `SELECT role, approval_status
       FROM public.app_users
       WHERE id = $1
       LIMIT 1`,
      [user.id]
    );

    const profile = profiles[0] as
      | { role: string; approval_status: string }
      | undefined;

    if (
      !profile ||
      profile.role !== "ADMIN" ||
      profile.approval_status !== "APPROVED"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to add products." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const price = Number(body.price);
    const imageUrl =
      typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (
      !name ||
      name.length > 150 ||
      !["READY_MADE", "FARM"].includes(category) ||
      !Number.isSafeInteger(price) ||
      price <= 0 ||
      description.length > 2000
    ) {
      return NextResponse.json(
        { error: "Enter a valid name, category, price and description." },
        { status: 400 }
      );
    }

    if (imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (parsedUrl.protocol !== "https:") {
          throw new Error("HTTPS required");
        }
      } catch {
        return NextResponse.json(
          { error: "The image URL must be a valid HTTPS URL." },
          { status: 400 }
        );
      }
    }

    const categories = await sql.query(
      `SELECT id
       FROM public.categories
       WHERE type = $1 AND active = true
       LIMIT 1`,
      [category]
    );

    const categoryRecord = categories[0] as
      | { id: string }
      | undefined;

    if (!categoryRecord) {
      return NextResponse.json(
        { error: "The selected product category is unavailable." },
        { status: 400 }
      );
    }

    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;

    const created = await sql.query(
      `INSERT INTO public.products
         (category_id, name, slug, description, price_kes, available, created_by)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       RETURNING id, name, description, price_kes AS price`,
      [
        categoryRecord.id,
        name,
        slug,
        description,
        price,
        user.id,
      ]
    );

    const product = created[0] as
      | {
          id: string;
          name: string;
          description: string;
          price: number;
        }
      | undefined;

    if (!product) {
      throw new Error("Product creation returned no record.");
    }

    if (imageUrl) {
      await sql.query(
        `INSERT INTO public.product_images (product_id, url, alt_text)
         VALUES ($1, $2, $3)`,
        [product.id, imageUrl, product.name]
      );
    }

    return NextResponse.json(
      { product: { ...product, category, imageUrl: imageUrl || null } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create GoBiz product:", error);

    return NextResponse.json(
      { error: "Unable to create the product." },
      { status: 500 }
    );
  }
}