"use client";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/** Counts from 0 to `to` the first time it's on screen. */
export function CountUp({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    const c = animate(0, to, { duration, ease: "easeOut", onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to, duration, reduce]);
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

/** Pulls its child toward the cursor (desktop pointers only). */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 });
  const reduce = useReducedMotion();
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !matchMedia("(pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const reset = () => (x.set(0), y.set(0));
  return (
    <motion.div style={{ x, y, display: "inline-flex" }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </motion.div>
  );
}
