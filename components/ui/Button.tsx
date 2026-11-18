import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/utils";
import s from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "onDark" | "danger";
type Size = "sm" | "md" | "lg";

type Common = { variant?: Variant; size?: Size; block?: boolean; loading?: boolean; icon?: ReactNode; iconRight?: ReactNode; className?: string; children?: ReactNode };

export function buttonClass({ variant = "primary", size = "md", block, className }: Pick<Common, "variant" | "size" | "block" | "className">) {
  return cx(s.btn, s[variant], s[size], block && s.block, className);
}

export function Button({ variant, size, block, loading, icon, iconRight, className, children, disabled, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={buttonClass({ variant, size, block, className })} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className={s.spinner} aria-hidden /> : icon}
      <span>{children}</span>
      {iconRight && <span className={s.iconRight}>{iconRight}</span>}
    </button>
  );
}

export function LinkButton({ variant, size, block, icon, iconRight, className, children, href, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={buttonClass({ variant, size, block, className })} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight && <span className={s.iconRight}>{iconRight}</span>}
    </Link>
  );
}
