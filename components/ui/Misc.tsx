import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cx, initials } from "@/lib/utils";
import s from "./Misc.module.css";

export function Skeleton({ w, h = 16, r, className, style }: { w?: number | string; h?: number | string; r?: number; className?: string; style?: CSSProperties }) {
  return <span aria-hidden className={cx(s.skeleton, className)} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/** Placeholder card used by every card type while data loads. */
export function CardSkeleton({ lines = 3, media = false }: { lines?: number; media?: boolean }) {
  return (
    <div className={s.cardSkel} aria-busy="true" aria-label="Loading">
      {media ? <Skeleton h={150} r={12} /> : <Skeleton w={48} h={48} r={12} />}
      <Skeleton w="70%" h={20} />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} w={`${90 - i * 18}%`} h={12} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className={s.empty}>
      {icon && <div className={s.emptyIcon}>{icon}</div>}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

const AVATAR_TONES = ["#16335C", "#5B6B3A", "#9A5C00", "#1E4A7A", "#7C3A2D", "#2F5D50"];
export function Avatar({ name, src, size = 56, ring = false, className }: { name: string; src?: string; size?: number; ring?: boolean; className?: string }) {
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span className={cx(s.avatar, ring && s.ring, className)} style={{ width: size, height: size, background: tone, fontSize: size * 0.36 }}>
      {src ? <Image src={src} alt={name} width={size} height={size} unoptimized={src.endsWith(".svg")} /> : <span aria-hidden>{initials(name)}</span>}
      {!src && <span className="sr-only">{name}</span>}
    </span>
  );
}

export function SectionHead({ title, sub, action, align = "left", onDark }: { title: ReactNode; sub?: ReactNode; action?: ReactNode; align?: "left" | "center"; onDark?: boolean }) {
  return (
    <div className={cx(s.head, align === "center" && s.center, onDark && s.onDark)}>
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function IconBox({ children, tone = "navy", size = "md" }: { children: ReactNode; tone?: "navy" | "gold" | "olive" | "success" | "info"; size?: "sm" | "md" | "lg" }) {
  return <span className={cx(s.iconBox, s[`ib_${tone}`], s[`ib_${size}`])}>{children}</span>;
}
