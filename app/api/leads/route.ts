import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Lead } from "@/models";

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const lead = {
    name: clip(b.name, 80),
    phone: clip(b.phone, 20).replace(/[^\d+ ]/g, ""),
    email: clip(b.email, 120).toLowerCase(),
    examInterest: clip(b.examInterest, 80),
    message: clip(b.message, 2000),
    sourcePage: clip(b.sourcePage, 200),
  };
  if (lead.name.length < 2) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!lead.phone && !lead.email) return NextResponse.json({ error: "Phone or email is required." }, { status: 400 });
  if (lead.email && !/^\S+@\S+\.\S+$/.test(lead.email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  await dbConnect();
  await Lead.create(lead);
  return NextResponse.json({ ok: true }, { status: 201 });
}
