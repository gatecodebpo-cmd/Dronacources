import { notFound } from "next/navigation";
import { KeysPage } from "@/components/admin/KeysPage";
import { LeadsBoard } from "@/components/admin/LeadsBoard";
import { ReorderList } from "@/components/admin/ReorderList";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { ResourceList } from "@/components/admin/ResourceList";
import s from "@/components/admin/admin.module.css";
import { RESOURCES } from "@/lib/admin/resources";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models";

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r) notFound();

  if (r.key === "settings") {
    await dbConnect();
    const doc = (await SiteSettings.findOne().select("_id").lean<{ _id: unknown }>()) ?? (await SiteSettings.create({ siteName: "Drona" }));
    return <ResourceForm resourceKey="settings" id={String(doc._id)} />;
  }

  return (
    <>
      <div className={s.pageHead}>
        <div>
          <h1>{r.label}</h1>
          {r.description && <p>{r.description}</p>}
        </div>
      </div>
      {r.key === "leads" ? <LeadsBoard /> : r.key === "keys" ? <KeysPage /> : r.reorderable ? <ReorderList resourceKey={r.key} /> : <ResourceList resourceKey={r.key} />}
    </>
  );
}
