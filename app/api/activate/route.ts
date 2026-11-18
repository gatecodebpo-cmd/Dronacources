import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { ActivationKey, Exam, Product, Test, User } from "@/models";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Log in to redeem a key." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9-]{6,24}$/.test(code)) return NextResponse.json({ error: "Enter the code exactly as printed." }, { status: 400 });

  await dbConnect();
  // Atomic: only one request can flip UNUSED → REDEEMED.
  const key = await ActivationKey.findOneAndUpdate(
    { code, status: "UNUSED" },
    { $set: { status: "REDEEMED", redeemedBy: user.id, redeemedAt: new Date() } },
    { new: true },
  ).lean<any>();
  if (!key) {
    const exists = await ActivationKey.exists({ code });
    return NextResponse.json({ error: exists ? "This key has already been redeemed." : "We couldn't find that key. Check for typos and try again." }, { status: exists ? 409 : 404 });
  }

  if (key.product) {
    await User.updateOne({ _id: user.id }, { $addToSet: { purchasedProducts: key.product } });
    const product = await Product.findById(key.product).select("title slug").lean<any>();
    return NextResponse.json({ message: `${product?.title ?? "Your product"} is now in your account.`, href: "/dashboard" });
  }

  const tests = key.tests ?? [];
  await User.updateOne({ _id: user.id }, { $addToSet: { unlockedTests: { $each: tests } } });
  const first = await Test.findById(tests[0]).select("exam").lean<any>();
  const exam = first && (await Exam.findById(first.exam).select("slug").lean<any>());
  return NextResponse.json({
    message: `${tests.length} test${tests.length === 1 ? "" : "s"} unlocked on your account.`,
    href: exam ? `/exam/${exam.slug}#tests` : "/dashboard",
  });
}
