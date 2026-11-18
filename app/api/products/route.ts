import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type VariantInput = {
  label: string;
  price: number;
  available?: boolean;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  try {
    const products = await sql.query(
      `SELECT
         p.id,
         p.name,
         parent.type AS category,
         c.id::text AS "subCategoryId",
         c.name AS "subCategoryName",
         p.price_kes AS price,
         COALESCE(p.description, '') AS description,
         image.url AS "imageUrl"
       FROM public.products p
       JOIN public.categories c ON c.id = p.category_id
       LEFT JOIN public.categories parent ON parent.id = c.parent_id
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

    const productRows = products as Array<{
      id: string;
      name: string;
      category: string;
      subCategoryId: string | null;
      subCategoryName: string | null;
      price: number;
      description: string;
      imageUrl: string | null;
    }>;

    const productIds = productRows.map((p) => p.id);

    let variantsByProduct: Record<
      string,
      Array<{
        id: string;
        label: string;
        price: number;
        available: boolean;
        position: number;
      }>
    > = {};

    if (productIds.length > 0) {
      const variantRows = await sql.query(
        `SELECT id, product_id, label, price_kes AS price, available, position
         FROM public.product_variants
         WHERE product_id = ANY($1::uuid[])
         ORDER BY position ASC, created_at ASC`,
        [productIds]
      );

      variantsByProduct = (variantRows as Array<{
        id: string;
        product_id: string;
        label: string;
        price: number;
        available: boolean;
        position: number;
      }>).reduce(
        (acc, v) => {
          if (!acc[v.product_id]) acc[v.product_id] = [];
          acc[v.product_id].push({
            id: v.id,
            label: v.label,
            price: v.price,
            available: v.available,
            position: v.position,
          });
          return acc;
        },
        {} as typeof variantsByProduct
      );
    }

    const productsWithVariants = productRows.map((p) => ({
      ...p,
      variants: variantsByProduct[p.id] ?? [],
    }));

    return NextResponse.json({ products: productsWithVariants });
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
    const { data: session } = await auth.getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 }
      );
    }

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
      !["ADMIN", "EMPLOYEE"].includes(profile.role) ||
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

    // Optional sub-category
    const subCategoryIdRaw =
      typeof body.subCategoryId === "string" ? body.subCategoryId.trim() : "";
    const subCategoryId =
      subCategoryIdRaw === "" ? null : subCategoryIdRaw;

    if (subCategoryId !== null && !UUID_RE.test(subCategoryId)) {
      return NextResponse.json(
        { error: "The sub-category ID is invalid." },
        { status: 400 }
      );
    }

    // Optional variants
    const variantsInput = Array.isArray(body.variants) ? body.variants : [];

    if (variantsInput.length > 20) {
      return NextResponse.json(
        { error: "A product can have at most 20 variants." },
        { status: 400 }
      );
    }

    const variants: VariantInput[] = [];

    for (const raw of variantsInput) {
      if (!raw || typeof raw !== "object") {
        return NextResponse.json(
          { error: "Each variant must be an object." },
          { status: 400 }
        );
      }

      const vLabel =
        typeof (raw as Record<string, unknown>).label === "string"
          ? ((raw as Record<string, unknown>).label as string).trim()
          : "";
      const vPrice = Number((raw as Record<string, unknown>).price);
      const vAvailable =
        (raw as Record<string, unknown>).available !== false;

      if (
        !vLabel ||
        vLabel.length > 40 ||
        !Number.isSafeInteger(vPrice) ||
        vPrice <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Each variant needs a label (max 40 chars) and a whole-number price above 0.",
          },
          { status: 400 }
        );
      }

      variants.push({ label: vLabel, price: vPrice, available: vAvailable });
    }

    const labels = variants.map((v) => v.label);
    if (new Set(labels).size !== labels.length) {
      return NextResponse.json(
        { error: "Variant labels must be unique per product." },
        { status: 400 }
      );
    }

    // Resolve the effective category_id
    let categoryRecord: { id: string } | undefined;

    if (subCategoryId !== null) {
      // Must exist, be active, and be a child of the parent category type
      const subRows = await sql.query(
        `SELECT c.id
         FROM public.categories c
         JOIN public.categories parent ON parent.id = c.parent_id
         WHERE c.id = $1
           AND c.active = true
           AND parent.type = $2
         LIMIT 1`,
        [subCategoryId, category]
      );

      categoryRecord = subRows[0] as { id: string } | undefined;

      if (!categoryRecord) {
        return NextResponse.json(
          {
            error:
              "The selected sub-category does not belong to the chosen category.",
          },
          { status: 400 }
        );
      }
    } else {
      const cats = await sql.query(
        `SELECT id
         FROM public.categories
         WHERE type = $1 AND active = true AND parent_id IS NULL
         LIMIT 1`,
        [category]
      );

      categoryRecord = cats[0] as { id: string } | undefined;

      if (!categoryRecord) {
        return NextResponse.json(
          { error: "The selected product category is unavailable." },
          { status: 400 }
        );
      }
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

    let insertedVariants: Array<{
      id: string;
      label: string;
      price: number;
      available: boolean;
      position: number;
    }> = [];

    if (variants.length > 0) {
      const productIds = variants.map(() => product.id);
      const labelsArr = variants.map((v) => v.label);
      const prices = variants.map((v) => v.price);
      const available = variants.map((v) => v.available ?? true);
      const positions = variants.map((_v, i) => i);

      const variantRows = await sql.query(
        `INSERT INTO public.product_variants
           (product_id, label, price_kes, available, position)
         SELECT p_id, p_label, p_price, p_available, p_position
         FROM unnest(
           $1::uuid[],
           $2::text[],
           $3::integer[],
           $4::boolean[],
           $5::integer[]
         ) AS t(p_id, p_label, p_price, p_available, p_position)
         RETURNING id, label, price_kes AS price, available, position`,
        [productIds, labelsArr, prices, available, positions]
      );

      insertedVariants = variantRows as typeof insertedVariants;
    }

    return NextResponse.json(
      {
        product: {
          ...product,
          category,
          subCategoryId,
          imageUrl: imageUrl || null,
          variants: insertedVariants,
        },
      },
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