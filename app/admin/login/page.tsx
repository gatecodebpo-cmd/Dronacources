"use client";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import s from "./login.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) {
      setBusy(false);
      return setError("That email and password don't match a staff account.");
    }
    const session = await getSession();
    if ((session?.user as any)?.role === "STUDENT") {
      await signOut({ redirect: false });
      setBusy(false);
      return setError("This is a student account. Students sign in on the main site.");
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className={s.page}>
      <main className={s.card}>
        <div className={s.brand}>
          <LogoMark size={44} />
          <div>
            <h1>Drona admin</h1>
            <p>Sign in to manage exams, tests, content and leads.</p>
          </div>
        </div>
        <form onSubmit={submit} className={s.form} noValidate>
          <Input name="email" type="email" label="Email" autoComplete="username" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input name="password" type="password" label="Password" autoComplete="current-password" icon={<Lock size={18} />} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" block loading={busy}>
            Sign in
          </Button>
        </form>
        <p className={s.hint}>
          Demo: <code>admin@drona.demo</code> / <code>Admin@123</code>
          <br />
          Editor and support roles: <code>editor@drona.demo</code>, <code>support@drona.demo</code>
        </p>
        <Link href="/" className={s.back}>
          Back to the website
        </Link>
      </main>
    </div>
  );
}
