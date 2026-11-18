"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useLang } from "@/components/providers/Providers";
import type { NavExam } from "@/lib/data";
import { useNav } from "@/lib/useNav";
import { cx } from "@/lib/utils";
import s from "./ExamSearch.module.css";

export function filterExams(exams: NavExam[], q: string, limit = 8) {
  const n = q.trim().toLowerCase();
  if (!n) return [];
  const words = n.split(/\s+/);
  return exams
    .map((e) => {
      const hay = `${e.name} ${e.category}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return null;
      return { e, score: e.name.toLowerCase().startsWith(n) ? 0 : e.name.toLowerCase().includes(n) ? 1 : 2 };
    })
    .filter(Boolean)
    .sort((a, b) => a!.score - b!.score || a!.e.name.localeCompare(b!.e.name))
    .slice(0, limit)
    .map((r) => r!.e);
}

/** Combobox with live autocomplete. `variant="glass"` is the hero version. */
export function ExamSearch({ exams: given, variant = "plain", autoFocus, onNavigate }: { exams?: NavExam[]; variant?: "plain" | "glass"; autoFocus?: boolean; onNavigate?: () => void }) {
  const { t } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  // the exam index loads on first focus unless the caller already has it
  const [wanted, setWanted] = useState(false);
  const lazy = useNav(!given && wanted);
  const exams = given ?? lazy?.exams ?? [];
  const id = useId();
  const results = useMemo(() => filterExams(exams, q), [exams, q]);

  const go = (slug: string) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(`/exam/${slug}`);
  };

  return (
    <div className={cx(s.wrap, s[variant])} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <form
        role="search"
        className={s.box}
        onSubmit={(e) => {
          e.preventDefault();
          if (results[active]) go(results[active].slug);
          else if (q.trim()) (onNavigate?.(), router.push(`/exams?q=${encodeURIComponent(q.trim())}`));
        }}
      >
        <Search size={20} className={s.icon} aria-hidden />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => (setQ(e.target.value), setActive(0), setOpen(true))}
          onFocus={() => (setOpen(true), setWanted(true))}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, results.length - 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={variant === "glass" ? t("hero.searchPlaceholder") : t("nav.searchExams")}
          aria-label={t("nav.searchExams")}
          role="combobox"
          aria-expanded={open && !!q}
          aria-controls={id}
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `${id}-${active}` : undefined}
          autoComplete="off"
        />
        {variant === "glass" && (
          <button type="submit" className={s.submit}>
            {t("common.search")}
          </button>
        )}
      </form>
      {open && q.trim() && (
        <ul id={id} role="listbox" className={s.list}>
          {!exams.length ? (
            <li className={s.none}>Loading exams…</li>
          ) : results.length ? (
            results.map((e, i) => (
              <li key={e.slug} id={`${id}-${i}`} role="option" aria-selected={i === active}>
                <Link href={`/exam/${e.slug}`} onClick={() => (setOpen(false), setQ(""), onNavigate?.())} className={cx(s.item, i === active && s.activeItem)} onMouseEnter={() => setActive(i)}>
                  <span>{e.name}</span>
                  <small>{e.category}</small>
                </Link>
              </li>
            ))
          ) : (
            <li className={s.none}>{t("common.noResults")}</li>
          )}
        </ul>
      )}
    </div>
  );
}
