import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { applyCoupon, resolveItem } from "../pricing";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  const item = await resolveItem(body);
  if (!item) return NextResponse.json({ error: "Nothing to apply this coupon to." }, { status: 400 });
  const r = await applyCoupon(body.code, item.price);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ...r, total: item.price - r.discount });
}
