"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Send } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import s from "./Content.module.css";

type Errors = Partial<Record<"name" | "phone" | "email" | "message", string>>;

export function ContactForm({ exams }: { exams: string[] }) {
  const toast = useToast();
  const path = usePathname();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const err: Errors = {};
    if (f.name!.trim().length < 2) err.name = "Enter your name.";
    if (!/^[6-9]\d{9}$/.test(f.phone!.replace(/\D/g, "").slice(-10)) && !f.email) err.phone = "Enter a 10-digit mobile number or an email.";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Enter a valid email address.";
    if (f.message!.trim().length < 5) err.message = "Tell us a little about what you need.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, sourcePage: path }) });
    setBusy(false);
    if (!res.ok) return toast("We couldn't send that. Please try again or email us.", "error");
    toast("Message sent. We'll get back to you soon.");
    setDone(true);
  }

  if (done)
    return (
      <motion.div className={s.success} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
          <CheckCircle2 size={64} strokeWidth={1.5} />
        </motion.span>
        <h3>Message received</h3>
        <p style={{ color: "var(--color-muted)" }}>We'll call or email you soon.</p>
        <Button variant="outline" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </motion.div>
    );

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <Input name="name" label="Full name" autoComplete="name" required error={errors.name} />
      <Input name="phone" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" error={errors.phone} />
      <Input name="email" label="Email (optional)" type="email" autoComplete="email" error={errors.email} />
      <Select name="examInterest" label="Exam you're preparing for" placeholder="Select an exam" options={exams.map((e) => ({ value: e, label: e }))} />
      <Textarea name="message" label="How can we help?" className={s.full} required error={errors.message} />
      <div className={s.full}>
        <Button type="submit" size="lg" loading={busy} icon={<Send size={18} />}>
          Send message
        </Button>
      </div>
    </form>
  );
}
