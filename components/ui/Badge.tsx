import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import s from "./Badge.module.css";

export type Tone = "neutral" | "gold" | "navy" | "olive" | "success" | "danger" | "info" | "warning";

export function Badge({ tone = "neutral", icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx(s.badge, s[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/** Metadata chip, e.g. "100 Questions". */
export function Chip({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span className={cx(s.chip, className)}>
      {icon}
      {children}
    </span>
  );
}

export function DemoBadge() {
  return (
    <Badge tone="warning" className={s.demo}>
      Demo data
    </Badge>
  );
}
