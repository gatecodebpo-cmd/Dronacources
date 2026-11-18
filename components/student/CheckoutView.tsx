"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CheckCircle2, CreditCard, FlaskConical, Lock, ShieldCheck, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cx, inr } from "@/lib/utils";
import s from "./Checkout.module.css";

export type CheckoutItem = {
  kind: "test" | "product";
  id: string; // test id or product slug
  title: string;
  subtitle: string;
  price: number;
  mrp?: number;
  thumbnail?: string;
  includes: string[];
  owned: boolean;
  startHref: string;
  backHref: string;
};

export function CheckoutView({ item, userName }: { item: CheckoutItem; userName: string }) {
  const toast = useToast();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<null | { code: string; discount: number; label: string }>(null);
  const [couponErr, setCouponErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const ref = item.kind === "test" ? { test: item.id } : { product: item.id };
  const total = item.price - (coupon?.discount ?? 0);

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setCouponErr("");
    const r = await fetch("/api/checkout/coupon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ref, code }) });
    const d = await r.json().catch(() => ({}));
    setChecking(false);
    if (!r.ok) return setCouponErr(d.error ?? "Coupon not valid.");
    setCoupon({ code: d.code, discount: d.discount, label: d.label });
    toast(`Coupon ${d.code} applied: you save ${inr(d.discount)}`);
  }

  async function pay() {
    setPaying(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ref, coupon: coupon?.code }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setPaying(false);
      return toast(d.error ?? "Payment could not be completed.", "error");
    }
    await new Promise((res) => setTimeout(res, 900)); // let the "processing" state register
    setPaying(false);
    setDone(true);
    router.refresh();
  }

  if (item.owned && !done)
    return (
      <div className={cx("container", s.center)}>
        <div className={s.doneCard}>
          <CheckCircle2 size={56} className={s.ok} strokeWidth={1.5} />
          <h1>You already have access</h1>
          <p>
            <b>{item.title}</b> is unlocked on your account.
          </p>
          <Link href={item.startHref} className={buttonClass({ size: "lg", block: true })}>
            {item.kind === "test" ? "Start the test" : "Go to my dashboard"}
          </Link>
        </div>
      </div>
    );

  return (
    <div className={s.page}>
      <div className={cx("container", s.wrap)}>
        <Link href={item.backHref} className={s.back}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div className={s.demo} role="note">
          <FlaskConical size={18} />
          <span>
            <b>Demo mode – no real payment.</b> Clicking pay unlocks the item instantly. No card details are collected.
          </span>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" className={s.doneCard} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
              <SuccessMark />
              <h1>Unlocked</h1>
              <p>
                Payment of <b>{inr(total)}</b> received, {userName.split(" ")[0]}. <b>{item.title}</b> is now on your account.
              </p>
              <div className={s.doneActions}>
                <Link href={item.startHref} className={buttonClass({ size: "lg", block: true })}>
                  {item.kind === "test" ? "Start the test now" : "Go to my dashboard"}
                </Link>
                <Link href={item.backHref} className={buttonClass({ variant: "ghost", block: true })}>
                  Keep browsing
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className={s.grid} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <section className={s.card} aria-labelledby="sum">
                <h1 id="sum" className={s.h1}>
                  Order summary
                </h1>
                <div className={s.item}>
                  <div className={s.thumb}>
                    {item.thumbnail ? <Image src={item.thumbnail} alt="" fill sizes="96px" unoptimized={item.thumbnail.endsWith(".svg")} /> : <Lock size={28} />}
                  </div>
                  <div>
                    <p className={s.sub}>{item.subtitle}</p>
                    <h2 className={s.title}>{item.title}</h2>
                  </div>
                </div>
                <h3 className={s.h3}>What's included</h3>
                <ul className={s.includes}>
                  {item.includes.map((i) => (
                    <li key={i}>
                      <Check size={16} strokeWidth={2.5} /> {i}
                    </li>
                  ))}
                </ul>
              </section>

              <section className={s.card} aria-labelledby="pay">
                <h2 id="pay" className={s.h1}>
                  Payment
                </h2>
                {coupon ? (
                  <div className={s.applied}>
                    <Tag size={16} />
                    <span>
                      <b>{coupon.code}</b> · {coupon.label}
                    </span>
                    <button onClick={() => (setCoupon(null), setCode(""))} aria-label="Remove coupon">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyCoupon} className={s.couponForm}>
                    <label htmlFor="coupon" className="sr-only">
                      Coupon code
                    </label>
                    <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code (try DRONA10)" aria-invalid={!!couponErr} aria-describedby={couponErr ? "coupon-err" : undefined} />
                    <Button type="submit" variant="outline" loading={checking}>
                      Apply
                    </Button>
                  </form>
                )}
                {couponErr && (
                  <p id="coupon-err" className={s.err} role="alert">
                    {couponErr}
                  </p>
                )}
                <dl className={s.totals}>
                  {item.mrp && item.mrp > item.price && (
                    <div>
                      <dt>MRP</dt>
                      <dd>
                        <s>{inr(item.mrp)}</s>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>Price</dt>
                    <dd>{inr(item.price)}</dd>
                  </div>
                  {coupon && (
                    <div className={s.discount}>
                      <dt>Coupon discount</dt>
                      <dd>−{inr(coupon.discount)}</dd>
                    </div>
                  )}
                  <div className={s.total}>
                    <dt>Total</dt>
                    <dd>
                      <motion.span key={total} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                        {inr(total)}
                      </motion.span>
                    </dd>
                  </div>
                </dl>
                <Button size="lg" block onClick={pay} loading={paying} icon={<CreditCard size={18} />}>
                  {paying ? "Processing…" : `Pay ${inr(total)} (demo)`}
                </Button>
                <p className={s.secure}>
                  <ShieldCheck size={16} /> Access unlocks instantly. Refunds follow our <Link href="/refund">refund policy</Link>.
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuccessMark() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden>
      <motion.circle cx="48" cy="48" r="44" fill="none" stroke="var(--color-success)" strokeWidth="5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
      <motion.path d="M30 50 L43 62 L67 36" fill="none" stroke="var(--color-success)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
    </svg>
  );
}
