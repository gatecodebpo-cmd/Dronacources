import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { RESOURCES } from "@/lib/admin/resources";

export default async function NewPage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r || r.noCreate) notFound();
  return <ResourceForm resourceKey={r.key} />;
}
