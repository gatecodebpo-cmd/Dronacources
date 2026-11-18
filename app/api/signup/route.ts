import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const phone = String(body.phone ?? "").trim();
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8 || password.length > 100) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (phone && !/^[+\d][\d\s-]{7,15}$/.test(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  await dbConnect();
  if (await User.exists({ email })) return NextResponse.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
  await User.create({ name, email, phone, passwordHash: await bcrypt.hash(password, 10), role: "STUDENT" });
  return NextResponse.json({ ok: true }, { status: 201 });
}
