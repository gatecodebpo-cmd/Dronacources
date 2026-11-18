"use client";
import { useEffect, useState } from "react";

/** Time left until next local midnight, when the next daily quiz goes live. */
export function QuizCountdown() {
  const [left, setLeft] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
      const p = (n: number) => String(n).padStart(2, "0");
      setLeft(`${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <time suppressHydrationWarning>{left}</time>;
}
