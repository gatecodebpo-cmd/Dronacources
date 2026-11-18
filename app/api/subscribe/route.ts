import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Subscriber } from "@/models";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const email = typeof b?.email === "string" ? b.email.trim().toLowerCase().slice(0, 120) : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  await dbConnect();
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  return NextResponse.json({ ok: true });
}
