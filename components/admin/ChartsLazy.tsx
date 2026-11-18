"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Misc";
import type { ChartData } from "./DashboardCharts";

// Recharts is client-only and heavy: load it after the KPIs render.
const Charts = dynamic(() => import("./DashboardCharts"), { ssr: false, loading: () => <Skeleton h={320} r={16} style={{ marginBottom: 20 }} /> });

export function ChartsLazy({ data }: { data: ChartData }) {
  return <Charts data={data} />;
}
