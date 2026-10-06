import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email(),
  honeypot: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (parsed.data.honeypot) return NextResponse.json({ ok: true });

  const endpoint = process.env.NEWSLETTER_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ ok: true, note: "No endpoint configured, saved locally only" });
  }

  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Newsletter service failed" }, { status: 500 });
  }
}
