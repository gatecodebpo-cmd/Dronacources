"use client";
import { animate, motion, useReducedMotion } from "framer-motion";
import { Award, CheckCircle2, Clock, MapPin, RotateCcw, Target, XCircle, MinusCircle, LayoutDashboard } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useLang } from "@/components/providers/Providers";
import { cx, fmtDate } from "@/lib/utils";
import s from "./Result.module.css";

const BreakdownChart = dynamic(() => import("./BreakdownChart"), { ssr: false, loading: () => <div className={s.chartSkel} /> });

type Review = { _id: string; text: string; options: string[]; correctIndex: number; explanation?: string; topic: string; selected: number | null; correct: boolean };
type Attempt = { _id: string; score: number; maxScore: number; correct: number; incorrect: number; skipped: number; accuracy: number; timeTakenSec: number; rank: number; stateRank: number; totalCandidates: number; completedAt: string };

const fmtTime = (sec: number) => `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s`;
const LETTERS = ["A", "B", "C", "D"];

export function ResultView({ attempt, test, exam, review, topics }: { attempt: Attempt; test: { _id: string; title: string; durationMinutes: number } | null; exam: { name: string; slug: string } | null; review: Review[]; topics: { topic: string; correct: number; total: number }[] }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const pct = attempt.maxScore ? Math.max(0, Math.round((attempt.score / attempt.maxScore) * 100)) : 0;
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (pct < 70 || reduce) return;
    let alive = true;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (!alive) return;
      const colors = ["#F5A524", "#0B1F3A", "#16A34A", "#ffffff"];
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
      setTimeout(() => alive && confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors, disableForReducedMotion: true }), 300);
      setTimeout(() => alive && confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors, disableForReducedMotion: true }), 500);
    });
    return () => {
      alive = false;
    };
  }, [pct, reduce]);

  const verdict = pct >= 70 ? "Outstanding work. You're exam-ready on this set." : pct >= 45 ? "Solid attempt. Fix the weak topics below and re-attempt." : "Every topper started here. Review the explanations, then try again.";
  const list = review.filter((r) => (filter === "incorrect" ? r.selected !== null && !r.correct : filter === "skipped" ? r.selected === null : filter === "correct" ? r.correct : true));

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={cx("container", s.heroGrid)}>
          <div className={s.heroText}>
            {exam && (
              <Link href={`/exam/${exam.slug}`} className={s.crumb}>
                {exam.name}
              </Link>
            )}
            <h1>{test?.title ?? "Test result"}</h1>
            <p className={s.verdict}>{verdict}</p>
            <p className={s.date}>Submitted {fmtDate(attempt.completedAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
            <div className={s.heroActions}>
              {test && (
                <Link href={`/test/${test._id}`} className={buttonClass({ variant: "primary" })}>
                  <RotateCcw size={18} /> {t("common.reattempt")}
                </Link>
              )}
              <Link href="/dashboard" className={buttonClass({ variant: "onDark" })}>
                <LayoutDashboard size={18} /> {t("nav.dashboard")}
              </Link>
            </div>
          </div>
          <ScoreRing pct={pct} score={attempt.score} max={attempt.maxScore} />
        </div>
      </section>

      <div className={cx("container", s.content)}>
        <div className={s.stats}>
          <Stat icon={<Target />} label="Accuracy" value={`${attempt.accuracy}%`} />
          <Stat icon={<Clock />} label="Time taken" value={fmtTime(attempt.timeTakenSec)} sub={test ? `of ${test.durationMinutes} min` : undefined} />
          <Stat icon={<Award />} label="All-India rank" value={attempt.rank?.toLocaleString("en-IN")} sub={`of ${attempt.totalCandidates?.toLocaleString("en-IN")}`} tone="gold" />
          <Stat icon={<MapPin />} label="State rank" value={attempt.stateRank?.toLocaleString("en-IN")} tone="gold" />
        </div>
        <p className={s.rankNote}>Rank is estimated from Drona's candidate pool for this test.</p>

        <div className={s.panels}>
          <section className={s.panel} aria-labelledby="bd">
            <h2 id="bd">Answer breakdown</h2>
            <BreakdownChart correct={attempt.correct} incorrect={attempt.incorrect} skipped={attempt.skipped} />
            <ul className={s.legend}>
              <li><CheckCircle2 size={16} className={s.ok} /> Correct <b>{attempt.correct}</b></li>
              <li><XCircle size={16} className={s.bad} /> Incorrect <b>{attempt.incorrect}</b></li>
              <li><MinusCircle size={16} className={s.skip} /> Skipped <b>{attempt.skipped}</b></li>
            </ul>
          </section>
          <section className={s.panel} aria-labelledby="tp">
            <h2 id="tp">Topic-wise performance</h2>
            <ul className={s.bars}>
              {topics.map((tp, i) => {
                const p = tp.total ? Math.round((tp.correct / tp.total) * 100) : 0;
                return (
                  <li key={tp.topic}>
                    <div className={s.barHead}>
                      <span>{tp.topic}</span>
                      <span>
                        {tp.correct}/{tp.total} · <b>{p}%</b>
                      </span>
                    </div>
                    <div className={s.track}>
                      <motion.span
                        className={cx(s.fill, p >= 70 ? s.fillGood : p >= 40 ? s.fillMid : s.fillLow)}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            {topics.some((tp) => tp.total && tp.correct / tp.total < 0.5) && (
              <p className={s.tip}>Focus next on: {topics.filter((tp) => tp.total && tp.correct / tp.total < 0.5).map((tp) => tp.topic).join(", ")}.</p>
            )}
          </section>
        </div>

        <section className={s.review} aria-labelledby="rv">
          <div className={s.reviewHead}>
            <h2 id="rv">Review every question</h2>
            <Tabs
              variant="pill"
              value={filter}
              onChange={setFilter}
              tabs={[
                { id: "all", label: "All", count: review.length },
                { id: "correct", label: "Correct", count: attempt.correct },
                { id: "incorrect", label: "Incorrect", count: attempt.incorrect },
                { id: "skipped", label: "Skipped", count: attempt.skipped },
              ]}
            />
          </div>
          <ol className={s.qList} id={`panel-${filter}`} role="tabpanel" aria-labelledby={`tab-${filter}`}>
            {list.map((r) => {
              const n = review.indexOf(r) + 1;
              return (
                <li key={r._id} className={cx(s.q, r.correct ? s.qOk : r.selected === null ? s.qSkip : s.qBad)}>
                  <div className={s.qTop}>
                    <span className={s.qNum}>Q{n}</span>
                    <span className={s.qTag}>{r.topic}</span>
                    <span className={s.qStatus}>{r.correct ? "Correct" : r.selected === null ? "Skipped" : "Incorrect"}</span>
                  </div>
                  <p className={s.qText}>{r.text}</p>
                  <ul className={s.opts}>
                    {r.options.map((o, i) => (
                      <li key={i} className={cx(s.opt, i === r.correctIndex && s.optRight, i === r.selected && i !== r.correctIndex && s.optWrong)}>
                        <span className={s.letter}>{LETTERS[i]}</span>
                        <span>{o}</span>
                        {i === r.correctIndex && <em>Correct answer</em>}
                        {i === r.selected && i !== r.correctIndex && <em>Your answer</em>}
                        {i === r.selected && i === r.correctIndex && <em>Your answer ✓</em>}
                      </li>
                    ))}
                  </ul>
                  {r.explanation && (
                    <div className={s.expl}>
                      <strong>Explanation</strong>
                      <p>{r.explanation}</p>
                    </div>
                  )}
                </li>
              );
            })}
            {!list.length && <li className={s.none}>Nothing in this filter. Nice.</li>}
          </ol>
        </section>
      </div>
    </div>
  );
}

function ScoreRing({ pct, score, max }: { pct: number; score: number; max: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? pct : 0);
  useEffect(() => {
    if (reduce) return setShown(pct);
    const c = animate(0, pct, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [pct, reduce]);
  const r = 88, c = 2 * Math.PI * r;
  return (
    <div className={s.ring} role="img" aria-label={`Score ${score} out of ${max}, ${pct} percent`}>
      <svg viewBox="0 0 200 200" width="220" height="220" aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFC65A" />
            <stop offset="1" stopColor="#F5A524" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="14" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} transform="rotate(-90 100 100)" />
      </svg>
      <div className={s.ringText} aria-hidden>
        <strong>{shown}%</strong>
        <span>
          {score} / {max}
        </span>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value?: string; sub?: string; tone?: "gold" }) {
  return (
    <div className={cx(s.stat, tone && s.statGold)}>
      <span className={s.statIcon}>{icon}</span>
      <div>
        <p className={s.statLabel}>{label}</p>
        <p className={s.statValue}>
          {value ?? "—"} {sub && <small>{sub}</small>}
        </p>
      </div>
    </div>
  );
}
