import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const state = String(body.state ?? "").trim();
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (phone && !/^[+\d][\d\s-]{7,15}$/.test(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (state.length > 60) return NextResponse.json({ error: "State name is too long." }, { status: 400 });
  await dbConnect();
  await User.updateOne({ _id: user.id }, { $set: { name, phone, state } });
  return NextResponse.json({ ok: true });
}
