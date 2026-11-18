"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardList, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { TestCard } from "@/components/cards/Cards";
import { useLang } from "@/components/providers/Providers";
import { buttonClass } from "@/components/ui/Button";
import { CardSkeleton, EmptyState } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Overlay";
import { Tabs } from "@/components/ui/Tabs";
import type { DictKey } from "@/lib/i18n";
import type { ProductLite, TestLite, TestState } from "@/lib/types";
import { cx, inr, pctOff } from "@/lib/utils";
import s from "./Exam.module.css";

const TYPES: { id: string; k: DictKey }[] = [
  { id: "MOCK", k: "exam.mock" },
  { id: "TOPIC_WISE", k: "exam.topic" },
  { id: "PREVIOUS_YEAR", k: "exam.pyq" },
  { id: "QUIZ", k: "exam.quiz" },
  { id: "CURRENT_AFFAIRS", k: "exam.ca" },
];

/** Tracks which section is on screen so the sticky sub-nav can highlight it. */
export function ExamSubNav({ sections }: { sections: { id: string; k: DictKey }[] }) {
  const { t } = useLang();
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((x) => {
      const el = document.getElementById(x.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav className={s.subnav} aria-label="Exam sections">
      <div className={`container ${s.subnavInner}`}>
        {sections.map((x) => (
          <a key={x.id} href={`#${x.id}`} className={cx(s.subLink, active === x.id && s.subActive)} aria-current={active === x.id ? "true" : undefined}>
            {t(x.k)}
            {active === x.id && <motion.span layoutId="subnav-ind" className={s.subInd} />}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function ExamTests({ examId, examName, tests, products }: { examId: string; examName: string; tests: TestLite[]; products: ProductLite[] }) {
  const { t } = useLang();
  const { status } = useSession();
  const available = TYPES.filter((x) => tests.some((tt) => tt.type === x.id));
  const [tab, setTab] = useState(available[0]?.id ?? "MOCK");
  const [states, setStates] = useState<Record<string, TestState> | null>(null);
  const [unlock, setUnlock] = useState<TestLite | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return setStates({});
    fetch(`/api/me/tests?exam=${examId}`)
      .then((r) => (r.ok ? r.json() : { states: {} }))
      .then((d) => setStates(d.states ?? {}))
      .catch(() => setStates({}));
  }, [examId, status]);

  const list = useMemo(() => tests.filter((x) => x.type === tab), [tests, tab]);

  return (
    <div>
      <Tabs tabs={TYPES.map((x) => ({ id: x.id, label: t(x.k), count: tests.filter((tt) => tt.type === x.id).length }))} value={tab} onChange={setTab} />
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className={s.tabPanel}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {list.length === 0 ? (
              <EmptyState icon={<ClipboardList size={28} />} title="Nothing here yet" text={t("exam.empty")} />
            ) : states === null ? (
              <div className={s.testGrid}>
                {list.slice(0, 4).map((x) => (
                  <CardSkeleton key={x._id} lines={2} />
                ))}
              </div>
            ) : (
              <div className={s.testGrid}>
                {list.map((x, i) => (
                  <motion.div key={x._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }} style={{ display: "flex" }}>
                    <TestCard test={x} state={states[x._id]} onUnlock={() => setUnlock(x)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Modal open={!!unlock} onClose={() => setUnlock(null)} title={unlock ? `Unlock ${unlock.title}` : ""} size="sm">
        {unlock && <UnlockSummary test={unlock} examName={examName} products={products} />}
      </Modal>
    </div>
  );
}

export function testIncludes(test: TestLite) {
  return [
    `${test.totalQuestions} questions in the latest ${test.type === "PREVIOUS_YEAR" ? "previous year" : "exam"} pattern`,
    `${test.durationMinutes}-minute timed interface with question palette`,
    "Detailed explanation for every question",
    "Score, accuracy and topic-wise analysis",
    "State & All-India rank",
    "Unlimited re-attempts",
  ];
}

function UnlockSummary({ test, examName, products }: { test: TestLite; examName: string; products: ProductLite[] }) {
  const { t } = useLang();
  return (
    <div className={s.unlock}>
      <div className={s.unlockPrice}>
        <strong>{inr(test.price)}</strong>
        <span>one-time · {examName}</span>
      </div>
      <h3 className={s.unlockHead}>{t("exam.included")}</h3>
      <ul className={s.includeList}>
        {testIncludes(test).map((x) => (
          <li key={x}>
            <Check size={16} strokeWidth={2.5} /> {x}
          </li>
        ))}
      </ul>
      <Link href={`/checkout?test=${test._id}`} className={buttonClass({ block: true })}>
        <Lock size={16} /> Continue to unlock for {inr(test.price)}
      </Link>
      {products.length > 0 && (
        <div className={s.unlockAlt}>
          <p>Or get it with a pack:</p>
          {products.map((p) => (
            <Link key={p._id} href={`/e-library/${p.slug}`} className={s.altProduct}>
              <span>{p.title}</span>
              <b>
                {inr(p.salePrice ?? 0)} {pctOff(p.mrp, p.salePrice) > 0 && <small>{pctOff(p.mrp, p.salePrice)}% off</small>}
              </b>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function BottomCta({ href, label }: { href: string; label: string }) {
  return (
    <div className={s.bottomBar} data-bottom-bar>
      <Link href={href} className={buttonClass({ block: true, size: "lg" })}>
        <PlayCircle size={20} /> {label}
      </Link>
    </div>
  );
}
