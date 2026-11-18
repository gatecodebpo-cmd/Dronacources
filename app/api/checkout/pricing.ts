import { isValidObjectId } from "mongoose";
import { Coupon, Product, Test } from "@/models";

/** Resolve what is being bought and its base price. Caller must have connected to the DB. */
export async function resolveItem(input: { test?: string; product?: string }) {
  if (input.test && isValidObjectId(input.test)) {
    const t = await Test.findOne({ _id: input.test, status: "PUBLISHED" }).select("title price isFree exam").lean<any>();
    if (t && !t.isFree && t.price > 0) return { kind: "test" as const, doc: t, price: t.price as number };
  }
  if (input.product) {
    const p = await Product.findOne({ slug: String(input.product), isActive: true }).select("title salePrice mrp").lean<any>();
    if (p) return { kind: "product" as const, doc: p, price: (p.salePrice ?? p.mrp ?? 0) as number };
  }
  return null;
}

/** Validates a coupon and returns the discount in rupees, or an error message. */
export async function applyCoupon(code: string | undefined, price: number) {
  const clean = String(code ?? "").trim().toUpperCase();
  if (!clean) return { discount: 0, code: undefined };
  const c = await Coupon.findOne({ code: clean }).lean<any>();
  if (!c) return { error: "That coupon code doesn't exist." };
  if (c.expiry && new Date(c.expiry) < new Date()) return { error: "This coupon has expired." };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return { error: "This coupon has reached its usage limit." };
  const raw = c.type === "PERCENT" ? (price * c.value) / 100 : c.value;
  const discount = Math.min(price, Math.round(raw));
  return { discount, code: clean, label: c.type === "PERCENT" ? `${c.value}% off` : `₹${c.value} off` };
}
