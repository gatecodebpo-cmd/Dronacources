import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, Clock, FileQuestion, Flame, Languages, Lock, Medal, Quote, RotateCcw, Star, Trophy,
} from "lucide-react";
import type { ReactNode } from "react";
import { Bi, T } from "@/components/providers/Providers";
import { Badge, Chip } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Avatar, IconBox } from "@/components/ui/Misc";
import { CountUp } from "@/components/ui/Motion";
import { Icon } from "@/lib/icons";
import type { CategoryLite, ExamLite, PostLite, ProductLite, StatLite, TestLite, TestState, TestimonialLite, TopperLite } from "@/lib/types";
import { cx, fmtDate, inr, pctOff, TEST_TYPE_LABEL } from "@/lib/utils";
import { QuizCountdown } from "./QuizCountdown";
import s from "./Cards.module.css";

const isSvg = (src?: string) => !!src && src.endsWith(".svg");

/* 1 ─ Exam */
export function ExamCard({ exam }: { exam: ExamLite }) {
  return (
    <article className={cx(s.card, s.interactive, s.exam)}>
      <div className={cx(s.row, s.between)}>
        <span className={s.iconWrap}>
          <IconBox tone="navy">
            <Icon name={exam.icon} size={24} />
          </IconBox>
        </span>
        {exam.hasFree !== false && (
          <Badge tone="success">
            <T k="common.free" /> mock
          </Badge>
        )}
      </div>
      <div>
        {exam.category && (
          <p className={s.muted}>
            <Bi en={exam.category.name} hi={exam.category.nameHi} />
          </p>
        )}
        <h3 className={s.title}>
          <Link href={`/exam/${exam.slug}`} className={s.stretch}>
            {exam.name}
          </Link>
        </h3>
      </div>
      <div className={s.foot}>
        <p className={s.examMeta}>
          <strong>{exam.testCount ?? 0}</strong> <T k="common.tests" /> · <strong>{exam.quizCount ?? 0}</strong> <T k="common.quizzes" />
        </p>
        <span className={s.arrow} aria-hidden>
          <ArrowRight size={18} />
        </span>
      </div>
      <span className={s.underline} aria-hidden />
    </article>
  );
}

/* 2 ─ Category */
export function CategoryCard({ cat, href }: { cat: CategoryLite; href?: string }) {
  return (
    <article className={cx(s.card, s.interactive, s.category)}>
      <span className={s.iconWrap}>
        <IconBox tone="gold" size="lg">
          <Icon name={cat.icon} size={28} />
        </IconBox>
      </span>
      <h3 className={s.title}>
        <Link href={href ?? `/exams/${cat.slug}`} className={s.stretch}>
          <Bi en={cat.name} hi={cat.nameHi} />
        </Link>
      </h3>
      <p className={s.muted}>
        {cat.slug === "e-library" ? (
          "Books, notes & courses"
        ) : (
          <>
            {cat.examCount ?? 0} <T k="common.exams" />
          </>
        )}
      </p>
    </article>
  );
}

/* 3 ─ Test */
export function TestCard({ test, state, onUnlock }: { test: TestLite; state?: TestState; onUnlock?: () => void }) {
  const attempted = !!state?.attemptId;
  const open = test.isFree || state?.unlocked;
  return (
    <article className={cx(s.card, s.interactive, s.test)}>
      <div className={cx(s.row, s.between)}>
        <Badge tone="navy">{TEST_TYPE_LABEL[test.type] ?? test.type}</Badge>
        {attempted ? (
          <Badge tone="info" icon={<CheckCircle2 />}>
            <T k="common.attempted" />
          </Badge>
        ) : open ? (
          <Badge tone="success">{test.isFree ? <T k="common.free" /> : "Unlocked"}</Badge>
        ) : (
          <Badge tone="gold" icon={<Lock />}>
            <T k="common.locked" />
          </Badge>
        )}
      </div>
      <h3 className={s.title}>{test.title}</h3>
      <div className={s.chips}>
        <Chip icon={<FileQuestion />}>
          {test.totalQuestions} <T k="common.questions" />
        </Chip>
        <Chip icon={<Trophy />}>
          {test.totalMarks} <T k="common.marks" />
        </Chip>
        <Chip icon={<Clock />}>
          {test.durationMinutes} <T k="common.minutes" />
        </Chip>
        <Chip icon={<Languages />}>{test.language}</Chip>
      </div>
      {attempted && state?.bestPct !== undefined && (
        <div>
          <div className={cx(s.row, s.between, s.muted)} style={{ fontSize: "var(--fs-xs)", marginBottom: 6 }}>
            <span>Best score</span>
            <span>{state.bestPct}%</span>
          </div>
          <div className={s.progress} role="progressbar" aria-valuenow={state.bestPct} aria-valuemin={0} aria-valuemax={100} aria-label="Best score">
            <span style={{ width: `${state.bestPct}%` }} />
          </div>
        </div>
      )}
      <div className={s.foot}>
        {open ? (
          attempted ? (
            <>
              <Link href={`/result/${state!.attemptId}`} className={buttonClass({ variant: "ghost", size: "sm" })}>
                <T k="common.viewResult" />
              </Link>
              <Link href={`/test/${test._id}`} className={buttonClass({ variant: "outline", size: "sm" })}>
                <RotateCcw size={15} /> <T k="common.reattempt" />
              </Link>
            </>
          ) : (
            <Link href={`/test/${test._id}`} className={buttonClass({ variant: "primary", size: "sm", block: true })}>
              {test.isFree ? <T k="common.startFree" /> : "Start test"}
            </Link>
          )
        ) : (
          <>
            <span className={s.lockNote}>Includes solutions & rank</span>
            {onUnlock ? (
              <button onClick={onUnlock} className={buttonClass({ variant: "outline", size: "sm" })}>
                <Lock size={15} /> <T k="common.unlock" /> {inr(test.price)}
              </button>
            ) : (
              <Link href={`/checkout?test=${test._id}`} className={buttonClass({ variant: "outline", size: "sm" })}>
                <Lock size={15} /> <T k="common.unlock" /> {inr(test.price)}
              </Link>
            )}
          </>
        )}
      </div>
    </article>
  );
}

/* 4 ─ Daily quiz */
export function QuizCard({ test, examName, streak }: { test: TestLite; examName?: string; streak?: number }) {
  const d = test.publishDate ? new Date(test.publishDate) : new Date();
  return (
    <article className={cx(s.card, s.interactive, s.quiz)}>
      <span className={s.ribbon}>
        <b>{d.toLocaleDateString("en-IN", { day: "2-digit" })}</b> {d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      </span>
      <div className={cx(s.row, s.between)}>
        <p className={s.muted}>{examName ?? "Daily quiz"}</p>
        {streak ? (
          <span className={s.flame}>
            <Flame size={16} /> {streak} <T k="common.dayStreak" />
          </span>
        ) : (
          <span className={s.flame}>
            <Flame size={16} /> Streak
          </span>
        )}
      </div>
      <h3 className={s.title}>
        <Link href={`/test/${test._id}`} className={s.stretch}>
          {test.title}
        </Link>
      </h3>
      <div className={s.chips}>
        <Chip icon={<FileQuestion />}>{test.totalQuestions} Q</Chip>
        <Chip icon={<Clock />}>{test.durationMinutes} min</Chip>
        <Badge tone="success">
          <T k="common.free" />
        </Badge>
      </div>
      <div className={s.foot}>
        <span className={s.muted}>
          <T k="common.newQuizIn" /> <span className={s.countdown}><QuizCountdown /></span>
        </span>
        <span className={s.arrow} aria-hidden>
          <ArrowRight size={18} />
        </span>
      </div>
    </article>
  );
}

/* 5 ─ Product / pricing */
export function ProductCard({ product }: { product: ProductLite }) {
  const off = pctOff(product.mrp, product.salePrice);
  return (
    <article className={cx(s.card, s.interactive, s.product)}>
      <div className={s.thumb}>
        {product.thumbnail && <Image src={product.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 400px" unoptimized={isSvg(product.thumbnail)} />}
        {off > 0 && (
          <span className={s.offRibbon}>
            {off}% <T k="common.off" />
          </span>
        )}
      </div>
      <div className={s.productBody}>
        <Badge tone={product.type === "VIDEO_COURSE" ? "info" : product.type === "BUNDLE" ? "gold" : "olive"} className={s.tag}>
          {product.type === "VIDEO_COURSE" ? "Video course" : product.type === "BUNDLE" ? "Bundle" : "E-Library"}
        </Badge>
        <h3 className={s.title}>
          <Link href={`/e-library/${product.slug}`} className={s.stretch}>
            {product.title}
          </Link>
        </h3>
        {!!product.includes?.length && (
          <ul className={s.includes}>
            {product.includes.map((i) => (
              <li key={i.label}>
                <Check size={16} strokeWidth={2.5} />
                {i.count} {i.label}
              </li>
            ))}
          </ul>
        )}
        <div className={s.foot}>
          <div className={s.price}>
            <strong>{inr(product.salePrice ?? 0)}</strong>
            {off > 0 && <s>{inr(product.mrp!)}</s>}
          </div>
          <span className={buttonClass({ variant: "primary", size: "sm" })} aria-hidden>
            <T k="common.buyNow" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* 6 ─ Stat */
export function StatCard({ stat }: { stat: StatLite }) {
  return (
    <div className={cx(s.card, s.stat)}>
      <IconBox tone="gold">
        <Icon name={stat.icon} />
      </IconBox>
      <div>
        <div className={s.statValue}>
          <CountUp to={stat.value} suffix={stat.suffix} />
        </div>
        <p className={s.muted}>{stat.label}</p>
      </div>
    </div>
  );
}

/* 7 ─ Testimonial */
export function TestimonialCard({ t }: { t: TestimonialLite }) {
  return (
    <figure className={cx(s.card, s.testimonial)} style={{ margin: 0 }}>
      <Quote className={s.quoteMark} size={40} aria-hidden />
      <div className={s.stars} role="img" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={16} fill={i < t.rating ? "currentColor" : "none"} aria-hidden />
        ))}
      </div>
      <blockquote>“{t.quote}”</blockquote>
      <figcaption className={cx(s.row, s.foot)} style={{ justifyContent: "flex-start" }}>
        <Avatar name={t.name} src={t.photo} size={48} />
        <div>
          <strong>{t.name}</strong>
          <div className={s.row} style={{ gap: 6, flexWrap: "wrap" }}>
            <span className={s.muted}>{t.exam}</span>
            {t.rank && <Badge tone="gold">{t.rank}</Badge>}
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

/* 8 ─ Topper */
export function TopperCard({ t }: { t: TopperLite }) {
  return (
    <article className={cx(s.card, s.interactive, s.topper)}>
      <Avatar name={t.name} src={t.photo} size={88} ring />
      <div>
        <h3 className={s.title}>{t.name}</h3>
        <p className={s.muted}>
          {t.exam} · {t.year}
        </p>
      </div>
      <Badge tone="gold" icon={<Medal />}>
        <span className={s.rankBig} style={{ fontSize: "inherit" }}>{t.rank}</span>
      </Badge>
    </article>
  );
}

/* 9 ─ Blog / current affairs */
export function PostCard({ post }: { post: PostLite }) {
  return (
    <article className={cx(s.card, s.interactive, s.post)}>
      <div className={s.thumb}>
        {post.coverImage && <Image src={post.coverImage} alt="" fill sizes="(max-width: 768px) 100vw, 400px" unoptimized={isSvg(post.coverImage)} />}
        <Badge tone={post.type === "CURRENT_AFFAIRS" ? "gold" : "navy"} className={s.tagOnImage}>
          {post.category || (post.type === "CURRENT_AFFAIRS" ? "Current Affairs" : "Guide")}
        </Badge>
      </div>
      <div className={s.postBody}>
        <h3 className={s.title}>
          <Link href={`/blog/${post.slug}`} className={s.stretch}>
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className={s.muted}>{post.excerpt}</p>}
        <div className={s.postMeta}>
          <span>
            <CalendarDays size={14} /> {fmtDate(post.publishedAt)}
          </span>
          <span>
            <Clock size={14} /> {post.readMinutes ?? 4} <T k="common.minRead" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* 10 ─ Feature */
export function FeatureCard({ icon, title, text, tone = "navy" }: { icon: ReactNode; title: string; text: string; tone?: "navy" | "gold" | "olive" }) {
  return (
    <article className={cx(s.card, s.interactive, s.feature)}>
      <span className={s.iconWrap}>
        <IconBox tone={tone}>{icon}</IconBox>
      </span>
      <h3 className={s.title}>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
