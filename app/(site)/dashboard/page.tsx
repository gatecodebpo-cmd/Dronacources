import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, ClipboardList, Flame, Gauge, KeyRound, Trophy } from "lucide-react";
import { ProductCard, TestCard } from "@/components/cards/Cards";
import { ActivationKeyButton } from "@/components/flows/ActivationKey";
import { T } from "@/components/providers/Providers";
import { ProfileCard } from "@/components/student/ProfileCard";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Misc";
import { Stagger } from "@/components/ui/Reveal";
import { testStates } from "@/lib/access";
import { getUser } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { fmtDate, TEST_TYPE_LABEL } from "@/lib/utils";
import { Attempt, Exam, Product, Test, User } from "@/models";
import s from "@/components/student/Dashboard.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My dashboard", robots: { index: false } };

const TEST_FIELDS = "title type totalQuestions totalMarks durationMinutes language isFree price exam publishDate";

export default async function DashboardPage() {
  const session = await getUser();
  if (!session) redirect("/login?callbackUrl=/dashboard");
  await dbConnect();
  const user = await User.findById(session.id).lean<any>();
  if (!user) redirect("/login");

  const [attempts, totals] = await Promise.all([
    Attempt.find({ user: user._id }).sort({ completedAt: -1 }).limit(6).populate({ path: "test", select: "title type exam" }).lean<any[]>(),
    Attempt.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, n: { $sum: 1 }, avg: { $avg: { $cond: [{ $gt: ["$maxScore", 0] }, { $divide: ["$score", "$maxScore"] }, 0] } }, best: { $min: "$rank" } } },
    ]),
  ]);
  const stats = totals[0] ?? { n: 0, avg: 0, best: null };
  const attemptedIds = (await Attempt.distinct("test", { user: user._id })).map(String);

  // recommend free, unattempted tests from the student's exams (or popular exams)
  let examIds = (user.examInterests ?? []) as unknown[];
  if (!examIds.length) examIds = (await Exam.find({ isPopular: true, isActive: true }).select("_id").limit(6).lean<any[]>()).map((e) => e._id);
  const [recommended, unlocked, products] = await Promise.all([
    Test.find({ exam: { $in: examIds }, isFree: true, status: "PUBLISHED", publishDate: { $lte: new Date() }, _id: { $nin: attemptedIds } })
      .select(TEST_FIELDS)
      .sort({ type: 1, publishDate: -1 })
      .limit(3)
      .lean<any[]>(),
    Test.find({ _id: { $in: user.unlockedTests ?? [] } }).select(TEST_FIELDS).lean<any[]>(),
    Product.find({ _id: { $in: user.purchasedProducts ?? [] } }).lean<any[]>(),
  ]);
  const states = await testStates(String(user._id), [...recommended, ...unlocked]);
  const first = user.name.split(" ")[0];
  const avgPct = Math.max(0, Math.round((stats.avg ?? 0) * 100));

  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={`container ${s.heroInner}`}>
          <div>
            <p className={s.hello}>Jai Hind, {first}</p>
            <h1>{stats.n ? "Keep the momentum going." : "Let's start with your first mock."}</h1>
          </div>
          <div className={s.streak} aria-label={`${user.streak ?? 0} day quiz streak`}>
            <Flame size={30} className={s.flame} />
            <div>
              <strong>{user.streak ?? 0}</strong>
              <span>
                <T k="common.dayStreak" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={`container ${s.body}`}>
        <div className={s.stats}>
          <div className={s.stat}>
            <ClipboardList />
            <div>
              <strong>{stats.n}</strong>
              <span>Tests attempted</span>
            </div>
          </div>
          <div className={s.stat}>
            <Gauge />
            <div>
              <strong>{avgPct}%</strong>
              <span>Average score</span>
            </div>
          </div>
          <div className={s.stat}>
            <Trophy />
            <div>
              <strong>{stats.best ? stats.best.toLocaleString("en-IN") : "—"}</strong>
              <span>Best All-India rank</span>
            </div>
          </div>
          <div className={s.stat}>
            <BookOpenCheck />
            <div>
              <strong>{unlocked.length + products.length}</strong>
              <span>Unlocked items</span>
            </div>
          </div>
        </div>

        <div className={s.columns}>
          <section className={s.panel} aria-labelledby="recent">
            <div className={s.panelHead}>
              <h2 id="recent">Recent attempts</h2>
            </div>
            {attempts.length ? (
              <ul className={s.attempts}>
                {attempts.map((a) => {
                  const pct = a.maxScore ? Math.max(0, Math.round((a.score / a.maxScore) * 100)) : 0;
                  return (
                    <li key={String(a._id)}>
                      <Link href={`/result/${a._id}`} className={s.attempt}>
                        <span className={s.pct} data-tone={pct >= 70 ? "good" : pct >= 40 ? "mid" : "low"}>
                          {pct}%
                        </span>
                        <span className={s.attemptText}>
                          <strong>{a.test?.title ?? "Deleted test"}</strong>
                          <small>
                            {TEST_TYPE_LABEL[a.test?.type] ?? ""} · {fmtDate(a.completedAt)} · AIR {a.rank?.toLocaleString("en-IN")}
                          </small>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={<ClipboardList />}
                title="No attempts yet"
                text="Your results, ranks and explanations will appear here after your first test."
                action={
                  <Link href="/exams" className={buttonClass({})}>
                    Find a free test
                  </Link>
                }
              />
            )}
          </section>
          <ProfileCard user={plain({ name: user.name, email: user.email, phone: user.phone ?? "", state: user.state ?? "" })} />
        </div>

        <section aria-labelledby="rec">
          <div className={s.panelHead}>
            <h2 id="rec">Recommended for you</h2>
            <Link href="/exams" className={s.link}>
              <T k="common.viewAll" />
            </Link>
          </div>
          {recommended.length ? (
            <Stagger className={s.grid}>
              {recommended.map((t) => (
                <TestCard key={String(t._id)} test={plain(t)} state={states[String(t._id)]} />
              ))}
            </Stagger>
          ) : (
            <EmptyState title="You've attempted every free test here" text="Unlock a full mock series to keep practising." />
          )}
        </section>

        <section aria-labelledby="mine">
          <div className={s.panelHead}>
            <h2 id="mine">My unlocked content</h2>
            <ActivationKeyButton className={buttonClass({ variant: "outline", size: "sm" })}>
              <KeyRound size={16} /> Redeem a key
            </ActivationKeyButton>
          </div>
          {unlocked.length || products.length ? (
            <Stagger className={s.grid}>
              {[
                ...unlocked.map((t) => <TestCard key={String(t._id)} test={plain(t)} state={states[String(t._id)]} />),
                ...products.map((p) => <ProductCard key={String(p._id)} product={plain(p)} />),
              ]}
            </Stagger>
          ) : (
            <EmptyState
              icon={<KeyRound />}
              title="Nothing unlocked yet"
              text="Unlock a mock series or redeem the activation key from your book to see it here."
              action={
                <Link href="/e-library" className={buttonClass({ variant: "outline" })}>
                  Browse the E-Library
                </Link>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
