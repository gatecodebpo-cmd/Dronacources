"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 to `to` (ease-out) the first time it scrolls into view.
 * Plain requestAnimationFrame + IntersectionObserver so it doesn't pull the animation library into first load.
 */
export function CountUp({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(to);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / (duration * 1000));
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { rootMargin: "-40px" },
    );
    io.observe(el);
    return () => (io.disconnect(), cancelAnimationFrame(raf));
  }, [to, duration]);
  return (
    <span ref={ref}>
      <span className="sr-only">{`${to.toLocaleString("en-IN")}${suffix}`}</span>
      <span aria-hidden>
        {v.toLocaleString("en-IN")}
        {suffix}
      </span>
    </span>
  );
}
