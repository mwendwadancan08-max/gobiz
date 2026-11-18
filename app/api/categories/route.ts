import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type CategoryRow = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  parent_id: string | null;
  active: boolean;
  created_at: string;
};

export async function GET() {
  try {
    const rows = (await sql.query(
      `SELECT
         id::text AS id,
         name,
         type::text AS type,
         COALESCE(description, '') AS description,
         parent_id::text AS parent_id,
         active,
         created_at
       FROM public.categories
       WHERE active = true
       ORDER BY
         CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
         name ASC`
    )) as CategoryRow[];

    // Group children under their parent so the UI can render a tree
    type CategoryNode = {
      id: string;
      name: string;
      type: string;
      description: string;
      parentId: string | null;
      children: CategoryNode[];
    };

    const byId = new Map<string, CategoryNode>();

    for (const row of rows) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description ?? "",
        parentId: row.parent_id,
        children: [],
      });
    }

    const tree: CategoryNode[] = [];

    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        tree.push(node);
      }
    }

    return NextResponse.json({ categories: tree });
  } catch (error) {
    console.error("Failed to load categories:", error);

    return NextResponse.json(
      { error: "Could not load categories." },
      { status: 500 }
    );
  }
}