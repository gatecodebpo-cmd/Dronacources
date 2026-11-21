"use client";
import { AnimatePresence, m } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";
import s from "./Accordion.module.css";

/** variant "joined": one bordered panel with dividers (home page FAQ); "cards": separate cards (exam pages). */
export function Accordion({ items, defaultOpen = 0, variant = "cards" }: { items: { q: string; a: string }[]; defaultOpen?: number | null; variant?: "cards" | "joined" }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  return (
    <div className={variant === "joined" ? `${s.list} ${s.joined}` : s.list}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={s.item} data-open={isOpen || undefined}>
            <h3>
              <button
                className={s.trigger}
                aria-expanded={isOpen}
                aria-controls={`${base}-${i}`}
                id={`${base}-t-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{it.q}</span>
                <span className={s.icon} aria-hidden>
                  {variant === "joined" && isOpen ? <Minus size={22} strokeWidth={2.5} /> : <Plus size={variant === "joined" ? 22 : 18} strokeWidth={variant === "joined" ? 2.5 : 2} />}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={`${base}-${i}`}
                  role="region"
                  aria-labelledby={`${base}-t-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={s.panel}
                >
                  <p>{it.a}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
