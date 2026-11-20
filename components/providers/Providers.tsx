"use client";
import { SessionProvider } from "next-auth/react";
import { LazyMotion, MotionConfig } from "framer-motion";

// Animation engine is code-split: components use `m.*` and the features chunk loads after hydration.
const loadMotionFeatures = () => import("./motionFeatures").then((r) => r.default);
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type DictKey, type Lang } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/Toast";

/* ---------------- language ---------------- */
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

function readLang(): Lang {
  try {
    return localStorage.getItem("drona-lang") === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  const t = useCallback((k: DictKey) => translate(lang, k), [lang]);
  return { lang, setLang, t };
}

/** Translated UI label usable from server components. */
export function T({ k }: { k: DictKey }) {
  return <>{useLang().t(k)}</>;
}

/** DB content with an optional Hindi variant (category names). */
export function Bi({ en, hi }: { en: string; hi?: string }) {
  const { lang } = useLang();
  return <>{lang === "hi" && hi ? hi : en}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(readLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("drona-lang", l);
    } catch {}
  };

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">
        <LangCtx.Provider value={{ lang, setLang }}>
          <ToastProvider>{children}</ToastProvider>
        </LangCtx.Provider>
      </MotionConfig>
      </LazyMotion>
    </SessionProvider>
  );
}

