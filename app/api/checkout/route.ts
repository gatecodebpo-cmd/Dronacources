import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Coupon, Order, User } from "@/models";
import { applyCoupon, resolveItem } from "./pricing";

/** Demo payment: always succeeds, no gateway is called. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await dbConnect();
  const item = await resolveItem(body);
  if (!item) return NextResponse.json({ error: "This item is not available for purchase." }, { status: 400 });

  const c = await applyCoupon(body.coupon, item.price);
  if ("error" in c) return NextResponse.json({ error: c.error }, { status: 400 });
  if (c.code) {
    // re-check the limit atomically so concurrent orders can't overshoot it
    const ok = await Coupon.updateOne({ code: c.code, $or: [{ usageLimit: 0 }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] }, { $inc: { usedCount: 1 } });
    if (!ok.modifiedCount) return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
  }

  const amount = item.price - c.discount;
  const order = await Order.create({
    user: user.id,
    ...(item.kind === "test" ? { test: item.doc._id } : { product: item.doc._id }),
    amount,
    coupon: c.code,
    status: "PAID",
    gateway: "DEMO",
  });
  await User.updateOne({ _id: user.id }, { $addToSet: item.kind === "test" ? { unlockedTests: item.doc._id } : { purchasedProducts: item.doc._id } });
  return NextResponse.json({ orderId: String(order._id), amount });
}
