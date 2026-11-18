import { NextRequest } from "next/server";
import { HttpError } from "@/lib/auth";
import { buildBody, expand, getResource, guard, guardStaff, handle, listQuery, modelOf, populateSpecs, refresh, sortOf } from "@/lib/admin/server";

type Ctx = { params: Promise<{ resource: string }> };

export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const r = getResource((await params).resource);
  const sp = req.nextUrl.searchParams;
  const M = modelOf(r);

  // ?options=1 → {value,label} pairs for ref pickers; any staff role may read labels.
  if (sp.get("options")) {
    await guardStaff();
    const docs = await M.find(r.baseFilter ?? {}).select(r.labelField).sort({ [r.labelField]: 1 }).limit(3000).lean();
    return docs.map((d: any) => ({ value: String(d._id), label: String(d[r.labelField] ?? d._id).slice(0, 110) }));
  }

  await guard(r);
  const exporting = !!sp.get("export");
  const limit = exporting ? 5000 : Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const query = listQuery(r, sp);
  const q = M.find(query).sort(sortOf(r, sp.get("sort"))).skip((page - 1) * limit).limit(limit);
  populateSpecs(r).forEach((p) => q.populate(p));
  if (r.model === "User") q.select("-passwordHash");
  const [items, total] = await Promise.all([q.lean(), M.countDocuments(query)]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
});

export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const r = getResource((await params).resource);
  await guard(r);
  if (r.noCreate) throw new HttpError(405, `${r.label} can't be created here.`);
  const flat = await buildBody(r, await req.json(), true);
  const doc = await modelOf(r).create(expand(flat, r.defaults ?? {}));
  refresh();
  return { _id: String(doc._id) };
});
