"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Adds data-inview to its wrapper the first time it scrolls into view, so CSS can run a one-off transition. */
export function InView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) (setSeen(true), io.disconnect());
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} data-inview={seen || undefined}>
      {children}
    </div>
  );
}
