"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function BreakdownChart({ correct, incorrect, skipped }: { correct: number; incorrect: number; skipped: number }) {
  const data = [
    { name: "Correct", value: correct, color: "#16A34A" },
    { name: "Incorrect", value: incorrect, color: "#DC2626" },
    { name: "Skipped", value: skipped, color: "#94A3B8" },
  ].filter((d) => d.value > 0);
  return (
    <div style={{ width: "100%", height: 220 }} aria-hidden>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none" animationDuration={1100}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
