
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 3000;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type =
      body?.type === "COMPLAINT" || body?.type === "SUGGESTION"
        ? body.type
        : null;

    const anonymous = body?.anonymous === true;
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    const name = !anonymous && typeof body?.name === "string"
      ? body.name.trim()
      : null;

    const phone = !anonymous && typeof body?.phone === "string"
      ? body.phone.trim()
      : null;

    if (!type) {
      return NextResponse.json(
        { error: "Choose a complaint or suggestion." },
        { status: 400 }
      );
    }

    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Enter feedback of no more than 3000 characters." },
        { status: 400 }
      );
    }

    if (!anonymous && (!name || !phone)) {
      return NextResponse.json(
        { error: "Enter your name and phone number, or submit anonymously." },
        { status: 400 }
      );
    }

    if (name && name.length > 100) {
      return NextResponse.json(
        { error: "Your name is too long." },
        { status: 400 }
      );
    }

    if (phone && phone.length > 30) {
      return NextResponse.json(
        { error: "Your phone number is too long." },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO public.customer_feedback
        (feedback_type, is_anonymous, customer_name, phone, message)
      VALUES
        (${type}, ${anonymous}, ${name}, ${phone}, ${message})
    `;

    return NextResponse.json(
      { success: true, message: "Feedback received." },
      { status: 201 }
    );
  } catch (error) {
    console.error("GoBiz feedback submission failed:", error);

    return NextResponse.json(
      { error: "Unable to send feedback right now. Please try again." },
      { status: 500 }
    );
  }
}
