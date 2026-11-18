import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/utils";
import s from "./Field.module.css";

type Wrap = { label?: ReactNode; hint?: ReactNode; error?: string; className?: string };

function Shell({ label, hint, error, className, id, children }: Wrap & { id?: string; children: ReactNode }) {
  return (
    <div className={cx(s.field, error && s.invalid, className)}>
      {label && (
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className={s.error} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={s.hint}>{hint}</p>
      )}
    </div>
  );
}

export function Input({ label, hint, error, className, icon, ...rest }: Wrap & { icon?: ReactNode } & ComponentProps<"input">) {
  const id = rest.id ?? rest.name;
  return (
    <Shell label={label} hint={hint} error={error} className={className} id={id}>
      <div className={cx(s.control, !!icon && s.withIcon)}>
        {icon && <span className={s.icon}>{icon}</span>}
        <input id={id} className={s.input} aria-invalid={!!error || undefined} {...rest} />
      </div>
    </Shell>
  );
}

export function Textarea({ label, hint, error, className, ...rest }: Wrap & ComponentProps<"textarea">) {
  const id = rest.id ?? rest.name;
  return (
    <Shell label={label} hint={hint} error={error} className={className} id={id}>
      <textarea id={id} className={cx(s.input, s.textarea)} aria-invalid={!!error || undefined} {...rest} />
    </Shell>
  );
}

export function Select({ label, hint, error, className, options, placeholder, ...rest }: Wrap & { options: { value: string; label: string }[]; placeholder?: string } & ComponentProps<"select">) {
  const id = rest.id ?? rest.name;
  return (
    <Shell label={label} hint={hint} error={error} className={className} id={id}>
      <select id={id} className={cx(s.input, s.select)} aria-invalid={!!error || undefined} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export function Checkbox({ label, className, ...rest }: { label: ReactNode } & ComponentProps<"input">) {
  return (
    <label className={cx(s.check, className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}
