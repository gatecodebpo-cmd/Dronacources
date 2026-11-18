"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Bookmark, Check, ChevronLeft, ChevronRight, Eraser, Grid3x3, Info, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Drawer, Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { cx } from "@/lib/utils";
import s from "./Player.module.css";

type Q = { _id: string; text: string; options: string[]; topic?: string; image?: string };
type T = { _id: string; title: string; type: string; totalQuestions: number; totalMarks: number; durationMinutes: number; negativeMarking: number; language: string };
type Saved = { answers: Record<string, number | null>; marked: string[]; visited: string[]; current: number; startedAt: number };
type Status = "notVisited" | "notAnswered" | "answered" | "marked" | "answeredMarked";

const LETTERS = ["A", "B", "C", "D"];
const STATUS_LABEL: Record<Status, string> = {
  answered: "Answered",
  notAnswered: "Not answered",
  notVisited: "Not visited",
  marked: "Marked for review",
  answeredMarked: "Answered & marked",
};

export function Player({ test, exam, questions, loggedIn }: { test: T; exam: { name: string; slug: string } | null; questions: Q[]; loggedIn: boolean }) {
  const key = `drona-test-${test._id}`;
  const [phase, setPhase] = useState<"intro" | "exam">("intro");
  const [st, setSt] = useState<Saved>({ answers: {}, marked: [], visited: [], current: 0, startedAt: 0 });
  const [dir, setDir] = useState(1);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);
  const router = useRouter();
  const toast = useToast();
  const per = test.totalQuestions ? test.totalMarks / test.totalQuestions : 1;
  const totalSec = test.durationMinutes * 60;

  // resume an in-progress attempt after a refresh
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as Saved;
        if (saved.startedAt && Date.now() - saved.startedAt < totalSec * 1000) {
          setSt(saved);
          setPhase("exam");
        } else sessionStorage.removeItem(key);
      }
    } catch {}
  }, [key, totalSec]);

  useEffect(() => {
    if (phase !== "exam" || submitted.current) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(st));
    } catch {}
  }, [st, phase, key]);

  useEffect(() => {
    if (phase !== "exam") return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!submitted.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  const q = questions[st.current];
  const statusOf = useCallback(
    (qq: Q): Status => {
      const ans = typeof st.answers[qq._id] === "number";
      const m = st.marked.includes(qq._id);
      if (ans && m) return "answeredMarked";
      if (m) return "marked";
      if (ans) return "answered";
      return st.visited.includes(qq._id) ? "notAnswered" : "notVisited";
    },
    [st],
  );
  const counts = useMemo(() => {
    const c: Record<Status, number> = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 };
    questions.forEach((qq) => c[statusOf(qq)]++);
    return c;
  }, [questions, statusOf]);

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= questions.length) return;
      setDir(i > st.current ? 1 : -1);
      setSt((p) => ({ ...p, current: i, visited: p.visited.includes(questions[i]!._id) ? p.visited : [...p.visited, questions[i]!._id] }));
      setPaletteOpen(false);
    },
    [questions, st.current],
  );
  const select = useCallback((opt: number) => q && setSt((p) => ({ ...p, answers: { ...p.answers, [q._id]: opt } })), [q]);
  const clear = () => q && setSt((p) => ({ ...p, answers: { ...p.answers, [q._id]: null } }));
  const toggleMark = () => q && setSt((p) => ({ ...p, marked: p.marked.includes(q._id) ? p.marked.filter((x) => x !== q._id) : [...p.marked, q._id] }));

  const start = () => {
    setSt({ answers: {}, marked: [], visited: [questions[0]!._id], current: 0, startedAt: Date.now() });
    setPhase("exam");
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const submit = useCallback(
    async (auto = false) => {
      if (submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: test._id, answers: st.answers, marked: st.marked, timeTakenSec: Math.round((Date.now() - st.startedAt) / 1000) }),
      }).catch(() => null);
      const data = await res?.json().catch(() => ({}));
      if (!res?.ok) {
        submitted.current = false;
        setSubmitting(false);
        return toast(data?.error ?? "Couldn't submit. Check your connection and try again — your answers are saved.", "error");
      }
      try {
        sessionStorage.removeItem(key);
      } catch {}
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (auto) toast("Time's up. Your test was submitted automatically.", "info");
      router.replace(`/result/${data.id}`);
    },
    [st, test._id, key, router, toast],
  );

  // keyboard: 1–4 choose, ←/→ move
  useEffect(() => {
    if (phase !== "exam") return;
    const onKey = (e: KeyboardEvent) => {
      if (confirm || paletteOpen || (e.target as HTMLElement).closest("input,textarea,select") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-4]$/.test(e.key) && q && Number(e.key) <= q.options.length) select(Number(e.key) - 1);
      if (e.key === "ArrowRight") go(st.current + 1);
      if (e.key === "ArrowLeft") go(st.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confirm, paletteOpen, q, select, go, st.current]);

  if (!questions.length)
    return (
      <div className={s.introWrap}>
        <div className={s.intro}>
          <h1>This test has no questions yet</h1>
          <p className={s.muted}>We're adding questions to this test. Try another test from the same exam.</p>
          {exam && <Link href={`/exam/${exam.slug}`}>Back to {exam.name}</Link>}
        </div>
      </div>
    );

  if (phase === "intro")
    return <Intro test={test} exam={exam} count={questions.length} per={per} loggedIn={loggedIn} onStart={start} />;

  const palette = (
    <div className={s.paletteInner}>
      <div className={s.legend}>
        {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
          <span key={k} className={s.legendItem}>
            <span className={cx(s.dot, s[k])} aria-hidden />
            {STATUS_LABEL[k]} <b>{counts[k]}</b>
          </span>
        ))}
      </div>
      <ol className={s.grid} aria-label="Question palette">
        {questions.map((qq, i) => {
          const status = statusOf(qq);
          return (
            <li key={qq._id}>
              <button
                className={cx(s.cell, s[status], i === st.current && s.cellCurrent)}
                onClick={() => go(i)}
                aria-label={`Question ${i + 1}, ${STATUS_LABEL[status]}`}
                aria-current={i === st.current ? "step" : undefined}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="secondary" block icon={<Send size={16} />} onClick={() => (setPaletteOpen(false), setConfirm(true))}>
        Submit test
      </Button>
    </div>
  );

  const chosen = q ? st.answers[q._id] : null;
  const isMarked = q ? st.marked.includes(q._id) : false;

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <div className={s.topLeft}>
          <LogoMark size={32} />
          <div className={s.topTitle}>
            <strong>{test.title}</strong>
            <span>
              {questions.length} questions · {test.language}
            </span>
          </div>
        </div>
        <Timer startedAt={st.startedAt} totalSec={totalSec} onExpire={() => submit(true)} />
        <div className={s.topRight}>
          <button className={s.paletteBtn} onClick={() => setPaletteOpen(true)} aria-label="Open question palette">
            <Grid3x3 size={20} />
            <span>
              {counts.answered + counts.answeredMarked}/{questions.length}
            </span>
          </button>
          <Button size="sm" className={s.submitTop} onClick={() => setConfirm(true)}>
            Submit
          </Button>
        </div>
      </header>

      <div className={s.body}>
        <section className={s.qArea} aria-live="polite">
          <div className={s.qMeta}>
            <span className={s.qNum}>
              Question {st.current + 1} <small>of {questions.length}</small>
            </span>
            <span className={s.qMarks}>
              +{round(per)} / −{round(test.negativeMarking)}
            </span>
            {q?.topic && <span className={s.qTopic}>{q.topic}</span>}
          </div>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={q?._id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={s.qCard}
            >
              <h1 className={s.qText}>{q?.text}</h1>
              {q?.image && <img src={q.image} alt="" className={s.qImg} />}
              <div role="radiogroup" aria-label="Options" className={s.options}>
                {q?.options.map((o, i) => {
                  const on = chosen === i;
                  return (
                    <motion.button
                      key={i}
                      role="radio"
                      aria-checked={on}
                      className={cx(s.option, on && s.optionOn)}
                      onClick={() => select(i)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={s.letter}>{on ? <Check size={16} strokeWidth={3} /> : LETTERS[i]}</span>
                      <span>{o}</span>
                      {on && (
                        <motion.span className={s.saved} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
                          Saved
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
          <p className={s.kbd}>
            Tip: press <kbd>1</kbd>–<kbd>4</kbd> to choose, <kbd>←</kbd> <kbd>→</kbd> to move.
          </p>
        </section>
        <aside className={s.palette} aria-label="Question palette">
          {palette}
        </aside>
      </div>

      <footer className={s.actions}>
        <Button variant="outline" onClick={() => go(st.current - 1)} disabled={st.current === 0} icon={<ChevronLeft size={18} />} className={s.prev} aria-label="Previous question">
          <span className={s.hideXs}>Previous</span>
        </Button>
        <Button variant="ghost" onClick={clear} disabled={typeof chosen !== "number"} icon={<Eraser size={18} />} aria-label="Clear response">
          <span className={s.hideXs}>Clear</span>
        </Button>
        <Button variant={isMarked ? "secondary" : "outline"} onClick={toggleMark} icon={<Bookmark size={18} fill={isMarked ? "currentColor" : "none"} />} aria-pressed={isMarked} aria-label="Mark for review">
          <span className={s.hideXs}>{isMarked ? "Marked" : "Mark for review"}</span>
        </Button>
        {st.current < questions.length - 1 ? (
          <Button onClick={() => go(st.current + 1)} iconRight={<ChevronRight size={18} />} className={s.next}>
            Save & next
          </Button>
        ) : (
          <Button onClick={() => setConfirm(true)} icon={<Send size={16} />} className={s.next}>
            Submit
          </Button>
        )}
      </footer>

      <Drawer open={paletteOpen} onClose={() => setPaletteOpen(false)} side="bottom" title="Question palette">
        {palette}
      </Drawer>

      <Modal
        open={confirm}
        onClose={() => !submitting && setConfirm(false)}
        title="Submit your test?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)} disabled={submitting}>
              Keep going
            </Button>
            <Button onClick={() => submit()} loading={submitting} icon={<Send size={16} />}>
              Submit test
            </Button>
          </>
        }
      >
        <ul className={s.summary}>
          <li>
            <span className={cx(s.dot, s.answered)} /> Answered <b>{counts.answered + counts.answeredMarked}</b>
          </li>
          <li>
            <span className={cx(s.dot, s.notAnswered)} /> Not answered <b>{counts.notAnswered}</b>
          </li>
          <li>
            <span className={cx(s.dot, s.marked)} /> Marked for review <b>{counts.marked + counts.answeredMarked}</b>
          </li>
          <li>
            <span className={cx(s.dot, s.notVisited)} /> Not visited <b>{counts.notVisited}</b>
          </li>
        </ul>
        {counts.notAnswered + counts.notVisited > 0 && (
          <p className={s.warnNote}>
            <AlertTriangle size={16} /> You can't change answers after submitting.
          </p>
        )}
      </Modal>
    </div>
  );
}

const round = (n: number) => Math.round(n * 100) / 100;

function Timer({ startedAt, totalSec, onExpire }: { startedAt: number; totalSec: number; onExpire: () => void }) {
  const [left, setLeft] = useState(totalSec);
  const fired = useRef(false);
  useEffect(() => {
    const tick = () => {
      const l = Math.max(0, totalSec - Math.floor((Date.now() - startedAt) / 1000));
      setLeft(l);
      if (l === 0 && !fired.current) {
        fired.current = true;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, totalSec, onExpire]);
  const r = 20, c = 2 * Math.PI * r;
  const warn = left <= 300;
  const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), sec = left % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <div className={cx(s.timer, warn && s.timerWarn)} role="timer" aria-label={`Time left ${h ? h + " hours " : ""}${m} minutes`}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r={r} className={s.ringBg} />
        <circle cx="24" cy="24" r={r} className={s.ringFg} strokeDasharray={c} strokeDashoffset={c * (1 - left / totalSec)} transform="rotate(-90 24 24)" />
      </svg>
      <span className={s.timerText}>
        {h ? `${h}:` : ""}
        {p(m)}:{p(sec)}
      </span>
    </div>
  );
}

function Intro({ test, exam, count, per, loggedIn, onStart }: { test: T; exam: { name: string; slug: string } | null; count: number; per: number; loggedIn: boolean; onStart: () => void }) {
  return (
    <div className={s.introWrap}>
      <motion.div className={s.intro} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
        {exam && (
          <Link href={`/exam/${exam.slug}`} className={s.back}>
            <ArrowLeft size={16} /> {exam.name}
          </Link>
        )}
        <h1>{test.title}</h1>
        <dl className={s.facts}>
          <div>
            <dt>Questions</dt>
            <dd>{test.totalQuestions}</dd>
          </div>
          <div>
            <dt>Marks</dt>
            <dd>{test.totalMarks}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{test.durationMinutes} min</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{test.language}</dd>
          </div>
        </dl>
        {count < test.totalQuestions && (
          <p className={s.demoNote}>
            <Info size={18} /> Demo test: contains {count} sample questions out of the full {test.totalQuestions}.
          </p>
        )}
        <h2>Instructions</h2>
        <ul className={s.rules}>
          <li>
            Each correct answer earns <b>+{round(per)}</b> mark{per === 1 ? "" : "s"}.{" "}
            {test.negativeMarking ? (
              <>
                Each wrong answer deducts <b>{round(test.negativeMarking)}</b>.
              </>
            ) : (
              "There is no negative marking."
            )}{" "}
            Unanswered questions score zero.
          </li>
          <li>The timer starts when you press Start and the test submits itself when time runs out.</li>
          <li>Use “Mark for review” to flag a question and come back to it from the palette.</li>
          <li>Your answers are saved as you go. Refreshing the page won't lose them.</li>
          <li>After submitting you'll see your score, rank and a full explanation for every question.</li>
        </ul>
        <h2>Question palette</h2>
        <div className={s.legend}>
          {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
            <span key={k} className={s.legendItem}>
              <span className={cx(s.dot, s[k])} aria-hidden />
              {STATUS_LABEL[k]}
            </span>
          ))}
        </div>
        {!loggedIn && (
          <p className={s.guestNote}>
            You're not logged in. You can take this free test, but <Link href={`/login?callbackUrl=/test/${test._id}`}>log in</Link> to save it to your dashboard and build a streak.
          </p>
        )}
        <Button size="lg" onClick={onStart} block>
          I'm ready, start the test
        </Button>
      </motion.div>
    </div>
  );
}
