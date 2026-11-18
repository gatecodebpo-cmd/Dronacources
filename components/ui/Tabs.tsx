"use client";
import { m } from "framer-motion";
import { useId, useRef, type ReactNode, type KeyboardEvent } from "react";
import { cx } from "@/lib/utils";
import s from "./Tabs.module.css";

export type TabItem = { id: string; label: ReactNode; count?: number };

/** Controlled tab list with a sliding indicator (shared layoutId). Panels are rendered by the caller with id `${idBase}-panel-${tab.id}`. */
export function Tabs({ tabs, value, onChange, className, variant = "underline" }: { tabs: TabItem[]; value: string; onChange: (id: string) => void; className?: string; variant?: "underline" | "pill" }) {
  const layoutId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const n = (i + d + tabs.length) % tabs.length;
    onChange(tabs[n]!.id);
    refs.current[n]?.focus();
  };
  return (
    <div role="tablist" className={cx(s.list, s[variant], className)}>
      {tabs.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            className={cx(s.tab, active && s.active)}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {active && <m.span layoutId={layoutId} className={s.indicator} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className={s.label}>{t.label}</span>
            {t.count !== undefined && <span className={s.count}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
