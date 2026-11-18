"use client";
import { m } from "framer-motion";
import { Lock, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useLang } from "@/components/providers/Providers";
import s from "./Auth.module.css";

/** Only same-site relative paths, so callbackUrl can't redirect off-site. */
const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : undefined);

export function AuthForm({ mode, callbackUrl }: { mode: "login" | "signup"; callbackUrl?: string }) {
  const { t } = useLang();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const next = safePath(callbackUrl);

  function validate() {
    const e: Record<string, string> = {};
    if (mode === "signup" && f.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (mode === "signup" && f.password.length < 8) e.password = "Use at least 8 characters.";
    if (mode === "login" && !f.password) e.password = "Enter your password.";
    if (mode === "signup" && f.phone && !/^[+\d][\d\s-]{7,15}$/.test(f.phone)) e.phone = "Enter a valid phone number.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setBusy(true);
    if (mode === "signup") {
      const r = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setBusy(false);
        return setFormError(d.error ?? "Could not create your account.");
      }
    }
    const res = await signIn("credentials", { email: f.email, password: f.password, redirect: false });
    if (!res || res.error) {
      setBusy(false);
      return setFormError("Email or password is incorrect.");
    }
    const session = await getSession();
    const role = (session?.user as any)?.role;
    router.replace(next ?? (role && role !== "STUDENT" ? "/admin" : "/dashboard"));
    router.refresh();
  }

  const other = mode === "login" ? "/signup" : "/login";
  const otherHref = next ? `${other}?callbackUrl=${encodeURIComponent(next)}` : other;

  return (
    <m.div className={s.formWrap} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <div>
        <h1 className={s.h1}>{mode === "login" ? "Welcome back" : "Create your free account"}</h1>
        <p className={s.lead}>
          {mode === "login" ? "Log in to continue your tests and see your ranks." : "Take your first full-length mock in under a minute."}
        </p>
      </div>

      <button className={s.google} disabled aria-describedby="google-demo">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        Continue with Google
        <span id="google-demo" className={s.demoTag}>
          Demo
        </span>
      </button>
      <div className={s.or}>
        <span>or with email</span>
      </div>

      <form onSubmit={submit} className={s.form} noValidate>
        {mode === "signup" && <Input name="name" label="Full name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} icon={<UserRound size={18} />} />}
        <Input name="email" type="email" label="Email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} icon={<Mail size={18} />} />
        {mode === "signup" && <Input name="phone" type="tel" label="Mobile number (optional)" autoComplete="tel" value={f.phone} onChange={set("phone")} error={errors.phone} icon={<Phone size={18} />} />}
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={f.password}
          onChange={set("password")}
          error={errors.password}
          hint={mode === "signup" ? "At least 8 characters." : undefined}
          icon={<Lock size={18} />}
        />
        {formError && (
          <p className={s.formError} role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" block loading={busy}>
          {mode === "login" ? t("nav.login") : t("home.ctaBtn")}
        </Button>
      </form>

      {mode === "login" && (
        <div className={s.demoCreds}>
          <strong>Demo accounts</strong>
          <button type="button" onClick={() => setF((p) => ({ ...p, email: "student@drona.demo", password: "Student@123" }))}>
            Student: student@drona.demo / Student@123
          </button>
          <button type="button" onClick={() => setF((p) => ({ ...p, email: "admin@drona.demo", password: "Admin@123" }))}>
            Admin: admin@drona.demo / Admin@123
          </button>
        </div>
      )}

      <p className={s.switch}>
        {mode === "login" ? "New to Drona?" : "Already have an account?"} <Link href={otherHref}>{mode === "login" ? "Create a free account" : "Log in"}</Link>
      </p>
    </m.div>
  );
}

/** Left panel: a small animated "result card" that previews what students get. */
export function AuthArt() {
  return (
    <div className={s.art} aria-hidden>
      <div className={s.artCopy}>
        <p className={s.artMotto}>Perform · Analyse · Improve</p>
        <h2>Every mock ends with a rank, a review and a plan.</h2>
      </div>
      <div className={s.stack}>
        <m.div className={s.card1} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <span className={s.cardLabel}>AFCAT Mock Test 3</span>
          <div className={s.scoreRow}>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
              <m.circle cx="40" cy="40" r="32" fill="none" stroke="#F5A524" strokeWidth="8" strokeLinecap="round" transform="rotate(-90 40 40)" initial={{ pathLength: 0 }} animate={{ pathLength: 0.78 }} transition={{ delay: 0.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }} />
              <text x="40" y="46" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700">
                78%
              </text>
            </svg>
            <div className={s.bars}>
              {[82, 64, 90, 55].map((w, i) => (
                <span key={i}>
                  <m.i initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.8 + i * 0.12, duration: 0.8 }} />
                </span>
              ))}
            </div>
          </div>
          <p className={s.cardRank}>
            All-India rank <b>#214</b> · State rank <b>#12</b>
          </p>
        </m.div>
      </div>
    </div>
  );
}
