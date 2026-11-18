"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import s from "./admin.module.css";

export type ChartData = {
  daily: { day: string; attempts: number }[];
  topExams: { name: string; attempts: number }[];
  leads: { status: string; count: number }[];
};

const tick = { fill: "var(--color-muted)", fontSize: 12 };
const tooltip = { contentStyle: { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, color: "var(--color-text)", fontSize: 13 } };
const LEAD_COLOURS: Record<string, string> = { NEW: "#F5A524", CONTACTED: "#2563EB", CONVERTED: "#16A34A", CLOSED: "#94A3B8" };

export default function DashboardCharts({ data }: { data: ChartData }) {
  return (
    <div className={s.charts}>
      <section className={`${s.panel} ${s.panelPad}`} aria-label="Attempts over the last 14 days">
        <h2>Attempts, last 14 days</h2>
        <div className={s.chartBox}>
          <ResponsiveContainer>
            <AreaChart data={data.daily} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A524" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#F5A524" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={tick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="attempts" name="Attempts" stroke="#D98A0B" strokeWidth={2.5} fill="url(#att)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={`${s.panel} ${s.panelPad}`} aria-label="Leads by status">
        <h2>Leads by status</h2>
        <div className={s.chartBox}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.leads} dataKey="count" nameKey="status" innerRadius="58%" outerRadius="85%" paddingAngle={3} stroke="none" animationDuration={900}>
                {data.leads.map((l) => (
                  <Cell key={l.status} fill={LEAD_COLOURS[l.status] ?? "#16335C"} />
                ))}
              </Pie>
              <Tooltip {...tooltip} />
              <Legend iconType="circle" formatter={(v: string) => <span style={{ color: "var(--color-text)", fontSize: 13 }}>{v.charAt(0) + v.slice(1).toLowerCase()}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className={`${s.panel} ${s.panelPad} ${s.chartsWide}`} aria-label="Top exams by attempts">
        <h2>Top exams by attempts</h2>
        <div className={s.chartBox}>
          <ResponsiveContainer>
            <BarChart data={data.topExams} layout="vertical" margin={{ left: 20, right: 16 }}>
              <CartesianGrid stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={tick} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={tick} tickLine={false} axisLine={false} width={150} />
              <Tooltip {...tooltip} cursor={{ fill: "var(--color-tint)" }} />
              <Bar dataKey="attempts" name="Attempts" fill="#1E4A7A" radius={[0, 6, 6, 0]} barSize={18} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
