"use client";
import { AnimatePresence, m } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/Providers";
import { useToast } from "@/components/ui/Toast";
import s from "./SiteChrome.module.css";

export function AnnouncementBar({ id, text, link }: { id: string; text: string; link?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem("drona-ann") !== id);
    } catch {
      setShow(true);
    }
  }, [id]);
  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("drona-ann", id);
    } catch {}
  };
  return (
    <AnimatePresence initial={false}>
      {show && (
        <m.div className={s.ann} initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.25 }}>
          <div className={`container ${s.annInner}`}>
            <Megaphone size={16} aria-hidden className={s.annIcon} />
            {link ? (
              <Link href={link} className={s.annText}>
                {text} <u>See details</u>
              </Link>
            ) : (
              <p className={s.annText}>{text}</p>
            )}
            <button onClick={dismiss} aria-label="Dismiss announcement" className={s.annClose}>
              <X size={16} />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function WhatsAppFab({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={s.wa} aria-label="Chat with Drona on WhatsApp">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden fill="currentColor">
        <path d="M16.04 3C9 3 3.3 8.7 3.3 15.73c0 2.25.6 4.45 1.72 6.38L3.2 29l7.07-1.8a12.7 12.7 0 0 0 5.76 1.4h.01c7.03 0 12.76-5.7 12.76-12.74C28.8 8.7 23.07 3 16.04 3Zm0 23.3h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.2 1.07 1.12-4.08-.25-.42a10.53 10.53 0 0 1-1.62-5.62c0-5.84 4.75-10.6 10.6-10.6a10.6 10.6 0 0 1 10.6 10.6c0 5.85-4.76 10.6-10.45 10.76Zm5.8-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.5-2.55-1.58a9.6 9.6 0 0 1-1.77-2.2c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.14-.29-.21-.61-.37Z" />
      </svg>
      <span className={s.waPulse} aria-hidden />
    </a>
  );
}

export function NewsletterForm() {
  const { t } = useLang();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className={s.news}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Enter a valid email address.", "error");
        setBusy(true);
        const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        setBusy(false);
        if (r.ok) {
          setEmail("");
          toast("Subscribed. Watch your inbox for exam alerts.");
        } else toast("Could not subscribe right now. Try again shortly.", "error");
      }}
    >
      <label htmlFor="nl-email" className={s.newsLabel}>
        {t("footer.newsletter")}
      </label>
      <div className={s.newsRow}>
        <input id="nl-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("footer.emailPlaceholder")} autoComplete="email" />
        <button type="submit" disabled={busy}>
          {t("footer.subscribe")}
        </button>
      </div>
    </form>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className={s.langSwitch} role="group" aria-label="Language">
      <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
      <button aria-pressed={lang === "hi"} onClick={() => setLang("hi")} lang="hi">
        हिन्दी
      </button>
    </div>
  );
}
