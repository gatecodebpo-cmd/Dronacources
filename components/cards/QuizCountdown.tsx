"use client";
import { useSyncExternalStore } from "react";

// One shared 1-second ticker for every countdown on the page (instead of one interval per card).
const subs = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let label = "--:--:--";

function compute() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    label = compute();
    timer = setInterval(() => {
      label = compute();
      subs.forEach((f) => f());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (!subs.size && timer) (clearInterval(timer), (timer = null));
  };
}

/** Time left until next local midnight, when the next daily quiz goes live. */
export function QuizCountdown() {
  const text = useSyncExternalStore(subscribe, () => label, () => "--:--:--");
  return <time suppressHydrationWarning>{text}</time>;
}
