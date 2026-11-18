import { isValidObjectId } from "mongoose";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { RESOURCES } from "@/lib/admin/resources";

export default async function EditPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const r = RESOURCES[resource];
  if (!r || r.noEdit || !isValidObjectId(id)) notFound();
  return <ResourceForm resourceKey={r.key} id={id} />;
}
