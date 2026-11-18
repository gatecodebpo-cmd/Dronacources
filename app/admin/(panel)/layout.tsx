import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { sectionRoles } from "@/lib/admin/access";
import { RESOURCE_LIST } from "@/lib/admin/resources";
import { getUser } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { Lead } from "@/models";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user || user.role === "STUDENT") redirect("/admin/login");
  const nav = RESOURCE_LIST.filter((r) => sectionRoles(r.key).includes(user.role)).map((r) => ({ key: r.key, label: r.label, group: r.group }));
  const canLeads = sectionRoles("leads").includes(user.role);
  await dbConnect();
  const [leads, count] = canLeads
    ? await Promise.all([Lead.find({ status: "NEW" }).sort({ createdAt: -1 }).limit(5).select("name examInterest createdAt").lean(), Lead.countDocuments({ status: "NEW" })])
    : [[], 0];
  return (
    <AdminShell user={user} nav={nav} leads={plain(leads)} newLeadCount={count}>
      {children}
    </AdminShell>
  );
}
