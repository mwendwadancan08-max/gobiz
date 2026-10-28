import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const sql = neon(process.env.DATABASE_URL!);

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json(
        { error: "Please sign in first." },
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
      profile?.role !== "ADMIN" ||
      profile.approval_status !== "APPROVED"
    ) {
      return NextResponse.json(
        { error: "Only approved admins can upload product images." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const contentType =
      typeof body.contentType === "string" ? body.contentType : "";
    const extension = allowedTypes[contentType];

    if (!extension) {
      return NextResponse.json(
        { error: "Choose a JPG, PNG, WebP, or AVIF image." },
        { status: 400 }
      );
    }

    const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

    if (!publicBase) {
      return NextResponse.json(
        {
          error:
            "Image hosting is not configured. Add R2_PUBLIC_URL using your R2 public domain.",
        },
        { status: 500 }
      );
    }

    const key = `products/${randomUUID()}.${extension}`;

    const uploadUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 300 }
    );

    return NextResponse.json({
      uploadUrl,
      imageUrl: `${publicBase}/${key}`,
      contentType,
    });
  } catch (error) {
    console.error("Product image upload setup failed:", error);

    return NextResponse.json(
      { error: "Could not prepare the image upload." },
      { status: 500 }
    );
  }
}