import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { CheckoutView, type CheckoutItem } from "@/components/student/CheckoutView";
import { EmptyState } from "@/components/ui/Misc";
import { buttonClass } from "@/components/ui/Button";
import { canAccessTest } from "@/lib/access";
import { getUser } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { Exam, Product, Test, User } from "@/models";
import { TEST_TYPE_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ test?: string; product?: string }> }) {
  const sp = await searchParams;
  const qs = sp.test ? `test=${encodeURIComponent(sp.test)}` : sp.product ? `product=${encodeURIComponent(sp.product)}` : "";
  const user = await getUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout?${qs}`)}`);
  await dbConnect();

  let item: CheckoutItem | null = null;
  if (sp.test && isValidObjectId(sp.test)) {
    const t = await Test.findOne({ _id: sp.test, status: "PUBLISHED" }).select("title type price isFree exam totalQuestions totalMarks durationMinutes language").lean<any>();
    if (t?.isFree) redirect(`/test/${t._id}`);
    if (t) {
      const exam = await Exam.findById(t.exam).select("name slug").lean<any>();
      item = {
        kind: "test",
        id: String(t._id),
        title: t.title,
        subtitle: `${exam?.name ?? ""} · ${TEST_TYPE_LABEL[t.type] ?? t.type}`,
        price: t.price,
        includes: [
          `${t.totalQuestions} questions, ${t.totalMarks} marks, ${t.durationMinutes} minutes`,
          "Detailed explanation for every question",
          "Score analysis with State & All-India rank",
          "Unlimited re-attempts to fix weak areas",
          `${t.language} medium, lifetime access`,
        ],
        owned: await canAccessTest(user.id, t),
        startHref: `/test/${t._id}`,
        backHref: exam ? `/exam/${exam.slug}` : "/exams",
      };
    }
  } else if (sp.product) {
    const p = await Product.findOne({ slug: sp.product, isActive: true }).lean<any>();
    if (p) {
      const u = await User.findById(user.id).select("purchasedProducts").lean<any>();
      item = {
        kind: "product",
        id: p.slug,
        title: p.title,
        subtitle: p.type === "VIDEO_COURSE" ? "Video course" : p.type === "BUNDLE" ? "Bundle" : "E-Library",
        price: p.salePrice ?? p.mrp ?? 0,
        mrp: p.mrp,
        thumbnail: p.thumbnail,
        includes: [...(p.includes ?? []).map((i: any) => `${i.count} ${i.label}`), `${p.validityDays ?? 365} days validity`],
        owned: (u?.purchasedProducts ?? []).some((x: unknown) => String(x) === String(p._id)),
        startHref: "/dashboard",
        backHref: `/e-library/${p.slug}`,
      };
    }
  }

  if (!item)
    return (
      <div className="container section">
        <EmptyState
          title="Nothing to check out"
          text="This test or product is no longer available. Pick another one from the exam page."
          action={
            <Link href="/exams" className={buttonClass({})}>
              Browse exams
            </Link>
          }
        />
      </div>
    );

  return <CheckoutView item={plain(item)} userName={user.name} />;
}
