import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(2),
  event: z.string().min(2),
  date: z.string().min(4),
  city: z.string().min(2),
  message: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  honeypot: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.honeypot) {
      // bot
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const webhook = process.env.BOOKING_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      }).catch((e) => console.warn("Webhook failed", e));
    }

    // Always return ok, frontend will also do mailto fallback
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
