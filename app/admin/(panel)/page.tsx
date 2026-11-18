import { ClipboardCheck, IndianRupee, Inbox, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { ChartsLazy } from "@/components/admin/ChartsLazy";
import s from "@/components/admin/admin.module.css";
import { Badge, type Tone } from "@/components/ui/Badge";
import { IconBox } from "@/components/ui/Misc";
import { Table } from "@/components/ui/Table";
import { sectionRoles } from "@/lib/admin/access";
import { getUser } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { fmtDate, inr } from "@/lib/utils";
import { Attempt, Lead, Order, User } from "@/models";

const TZ = "Asia/Kolkata";
const LEAD_TONE: Record<string, Tone> = { NEW: "warning", CONTACTED: "info", CONVERTED: "success", CLOSED: "neutral" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const [user, sp] = await Promise.all([getUser(), searchParams]);
  await dbConnect();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = new Date(Date.now() - 13 * 864e5);
  since.setHours(0, 0, 0, 0);

  const [students, attemptsToday, leadCount, newLeads, orders, revenue, daily, topExams, leadsByStatus, recentLeads, recentAttempts] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    Attempt.countDocuments({ completedAt: { $gte: today } }),
    Lead.countDocuments(),
    Lead.countDocuments({ status: "NEW" }),
    Order.countDocuments({ status: "PAID" }),
    Order.aggregate([{ $match: { status: "PAID" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Attempt.aggregate([
      { $match: { completedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt", timezone: TZ } }, n: { $sum: 1 } } },
    ]),
    Attempt.aggregate([
      { $lookup: { from: "tests", localField: "test", foreignField: "_id", as: "t" } },
      { $unwind: "$t" },
      { $group: { _id: "$t.exam", n: { $sum: 1 } } },
      { $sort: { n: -1 } },
      { $limit: 6 },
      { $lookup: { from: "exams", localField: "_id", foreignField: "_id", as: "e" } },
      { $project: { n: 1, name: { $ifNull: [{ $arrayElemAt: ["$e.name", 0] }, "Deleted exam"] } } },
    ]),
    Lead.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Lead.find().sort({ createdAt: -1 }).limit(5).lean(),
    Attempt.find().sort({ completedAt: -1 }).limit(6).populate("user", "name").populate("test", "title").lean(),
  ]);

  // fill missing days with 0 so the area chart is continuous
  const counts = new Map(daily.map((d: any) => [d._id, d.n]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 864e5);
    const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
    return { day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: TZ }), attempts: counts.get(key) ?? 0 };
  });
  const chartData = {
    daily: days,
    topExams: topExams.map((t: any) => ({ name: t.name, attempts: t.n })),
    leads: ["NEW", "CONTACTED", "CONVERTED", "CLOSED"].map((st) => ({ status: st, count: leadsByStatus.find((l: any) => l._id === st)?.n ?? 0 })),
  };
  const can = (k: string) => !!user && sectionRoles(k).includes(user.role);
  const kpis = [
    { label: "Students", value: students.toLocaleString("en-IN"), icon: <Users size={22} />, tone: "navy" as const, href: can("students") ? "/admin/students" : undefined },
    { label: "Attempts today", value: attemptsToday, icon: <ClipboardCheck size={22} />, tone: "gold" as const, href: can("attempts") ? "/admin/attempts" : undefined },
    { label: `Leads · ${newLeads} new`, value: leadCount, icon: <Inbox size={22} />, tone: "info" as const, href: can("leads") ? "/admin/leads" : undefined },
    { label: "Paid orders", value: orders, icon: <ShoppingBag size={22} />, tone: "olive" as const, href: can("orders") ? "/admin/orders" : undefined },
    { label: "Revenue (demo)", value: inr(revenue[0]?.total ?? 0), icon: <IndianRupee size={22} />, tone: "success" as const },
  ];

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>Good to see you, {user?.name.split(" ")[0]}</h1>
          <p>Here is how Drona is doing today. Every change you make in this panel shows on the public site straight away.</p>
        </div>
      </div>
      {sp.denied && (
        <p className={`${s.panel} ${s.panelPad}`} role="alert" style={{ marginBottom: 20, borderColor: "var(--color-warning)" }}>
          Your role doesn't include that section. Ask an admin if you need access.
        </p>
      )}
      <div className={s.kpis}>
        {kpis.map((k) => {
          const body = (
            <>
              <IconBox tone={k.tone}>{k.icon}</IconBox>
              <div>
                <strong>{k.value}</strong>
                <span className={s.muted}>{k.label}</span>
              </div>
            </>
          );
          return k.href ? (
            <Link key={k.label} href={k.href} className={`${s.panel} ${s.kpi}`}>
              {body}
            </Link>
          ) : (
            <div key={k.label} className={`${s.panel} ${s.kpi}`}>
              {body}
            </div>
          );
        })}
      </div>
      <ChartsLazy data={chartData} />
      <div className={s.twoCol}>
        {can("leads") && (
          <section className={s.panel} aria-label="Recent leads">
            <div className={s.panelHead}>
              <h2>Recent leads</h2>
              <Link href="/admin/leads">Open pipeline</Link>
            </div>
            <div className={s.flatTable}>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Interest</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {plain(recentLeads).map((l: any) => (
                    <tr key={l._id}>
                      <td>
                        <Link href={`/admin/leads?open=${l._id}`}>{l.name}</Link>
                      </td>
                      <td>{l.examInterest || "—"}</td>
                      <td>
                        <Badge tone={LEAD_TONE[l.status]}>{l.status.charAt(0) + l.status.slice(1).toLowerCase()}</Badge>
                      </td>
                      <td>{fmtDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </section>
        )}
        <section className={s.panel} aria-label="Recent attempts">
          <div className={s.panelHead}>
            <h2>Recent attempts</h2>
            {can("attempts") && <Link href="/admin/attempts">See all</Link>}
          </div>
          <div className={s.flatTable}>
            <Table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {plain(recentAttempts).map((a: any) => (
                  <tr key={a._id}>
                    <td>{a.user?.name ?? "Guest"}</td>
                    <td>{a.test?.title ?? "Deleted test"}</td>
                    <td>
                      {a.score}/{a.maxScore}
                    </td>
                    <td>{a.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </section>
      </div>
    </>
  );
}
