"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ExamCard } from "@/components/cards/Cards";
import { Bi, useLang } from "@/components/providers/Providers";
import { EmptyState } from "@/components/ui/Misc";
import type { CategoryLite, ExamLite } from "@/lib/types";
import { cx } from "@/lib/utils";
import s from "./Exam.module.css";

/** All-exams grid: text search + category chips, filtered client-side. */
export function ExamBrowser({ exams, categories }: { exams: ExamLite[]; categories: CategoryLite[] }) {
  const params = useSearchParams();
  const { t } = useLang();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState(params.get("category") ?? "all");

  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return exams.filter((e) => (cat === "all" || e.category?.slug === cat) && words.every((w) => `${e.name} ${e.category?.name}`.toLowerCase().includes(w)));
  }, [exams, q, cat]);

  const withExams = categories.filter((c) => (c.examCount ?? 0) > 0);

  return (
    <div className={s.browser}>
      <div className={s.toolbar}>
        <label className={s.searchBox}>
          <Search size={20} aria-hidden />
          <span className="sr-only">{t("nav.searchExams")}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("nav.searchExams")} />
        </label>
        <p className={s.count} aria-live="polite">
          {list.length} {t("common.exams")}
        </p>
      </div>
      <div className={s.chipRow} role="group" aria-label="Filter by category">
        <button className={cx(s.filterChip, cat === "all" && s.filterOn)} aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          All
        </button>
        {withExams.map((c) => (
          <button key={c._id} className={cx(s.filterChip, cat === c.slug && s.filterOn)} aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)}>
            <Bi en={c.name} hi={c.nameHi} /> <span>{c.examCount}</span>
          </button>
        ))}
      </div>
      {list.length ? (
        <motion.div layout className={s.examGrid}>
          <AnimatePresence initial={false}>
            {list.map((e) => (
              <motion.div key={e._id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
                <ExamCard exam={e} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState icon={<SearchX size={28} />} title="No exams match" text={t("common.noResults")} />
      )}
    </div>
  );
}
