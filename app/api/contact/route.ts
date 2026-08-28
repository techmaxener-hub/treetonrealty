import { NextResponse } from "next/server";

import { createLead, validateContactFields, ValidationError } from "@/lib/server/leads";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = validateContactFields(body.name, body.phone);

    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : null;
    const message = typeof body.message === "string" && body.message.trim() ? body.message.trim() : null;
    const propertyInterest =
      typeof body.propertyInterest === "string" && body.propertyInterest.trim()
        ? body.propertyInterest.trim()
        : null;

    await createLead({
      name,
      phone,
      email,
      message,
      propertyInterest,
      source: "contact_page",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/contact failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while sending your message. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
