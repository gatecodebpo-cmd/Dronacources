import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { HttpError } from "@/lib/auth";
import { buildBody, getResource, guard, handle, modelOf, refresh } from "@/lib/admin/server";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function setup(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const r = getResource(resource);
  const user = await guard(r);
  if (!isValidObjectId(id)) throw new HttpError(404, "Record not found.");
  // baseFilter keeps e.g. /students from touching staff accounts
  return { r, user, id, where: { _id: id, ...(r.baseFilter ?? {}) } };
}

export const GET = handle(async (_req: NextRequest, ctx: Ctx) => {
  const { r, where } = await setup(ctx);
  const doc = await modelOf(r).findOne(where).lean();
  if (!doc) throw new HttpError(404, "Record not found.");
  return doc;
});

export const PUT = handle(async (req: NextRequest, ctx: Ctx) => {
  const { r, where } = await setup(ctx);
  if (r.noEdit) throw new HttpError(405, "This record is read-only.");
  const flat = await buildBody(r, await req.json(), false);
  const doc = await modelOf(r).findOneAndUpdate(where, { $set: flat }, { new: true, runValidators: true }).lean();
  if (!doc) throw new HttpError(404, "Record not found.");
  refresh();
  return { ok: true };
});

export const DELETE = handle(async (_req: NextRequest, ctx: Ctx) => {
  const { r, user, id, where } = await setup(ctx);
  if (r.key === "settings") throw new HttpError(405, "Site settings can't be deleted.");
  if (r.model === "User" && id === user.id) throw new HttpError(400, "You can't delete your own account.");
  const out = await modelOf(r).deleteOne(where);
  if (!out.deletedCount) throw new HttpError(404, "Record not found.");
  refresh();
  return { ok: true };
});
