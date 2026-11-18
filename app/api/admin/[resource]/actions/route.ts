import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { HttpError } from "@/lib/auth";
import { buildBody, expand, getResource, guard, handle, modelOf, refresh } from "@/lib/admin/server";

type Ctx = { params: Promise<{ resource: string }> };

const ids = (v: unknown) => {
  const a = Array.isArray(v) ? v.map(String).filter((x) => isValidObjectId(x)) : [];
  if (!a.length) throw new HttpError(400, "Select at least one record.");
  return a;
};

// Unambiguous characters for printed activation keys (no 0/O, 1/I).
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const block = () => Array.from(randomBytes(4), (b) => ALPHA[b % ALPHA.length]).join("");

/** Bulk operations: delete, reorder, import (CSV rows), generate (activation keys). */
export const POST = handle(async (req: NextRequest, ctx: Ctx) => {
  const r = getResource((await ctx.params).resource);
  const user = await guard(r);
  const M = modelOf(r);
  const body = await req.json();

  switch (body.action) {
    case "delete": {
      const list = ids(body.ids);
      if (r.key === "settings") throw new HttpError(405, "Site settings can't be deleted.");
      if (r.model === "User" && list.includes(user.id)) throw new HttpError(400, "You can't delete your own account.");
      const out = await M.deleteMany({ _id: { $in: list }, ...(r.baseFilter ?? {}) });
      refresh();
      return { deleted: out.deletedCount };
    }
    case "reorder": {
      if (!r.reorderable) throw new HttpError(400, "This module can't be reordered.");
      const list = ids(body.ids);
      await M.bulkWrite(list.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: i + 1 } } } })));
      refresh();
      return { ok: true };
    }
    case "import": {
      if (!r.importable) throw new HttpError(400, "This module doesn't support import.");
      const rows: unknown[] = Array.isArray(body.rows) ? body.rows.slice(0, 2000) : [];
      const docs: unknown[] = [];
      const errors: string[] = [];
      for (const [i, row] of rows.entries()) {
        try {
          docs.push(expand(await buildBody(r, row, true), r.defaults ?? {}));
        } catch (e: any) {
          errors.push(`Row ${i + 2}: ${e.message}`); // +2 = header row + 1-based
        }
      }
      const inserted = docs.length ? (await M.insertMany(docs, { ordered: false })).length : 0;
      refresh();
      return { inserted, errors: errors.slice(0, 20), failed: errors.length };
    }
    case "generate": {
      if (r.key !== "keys") throw new HttpError(400, "Only activation keys can be generated.");
      const count = Math.floor(Number(body.count));
      if (!(count >= 1 && count <= 500)) throw new HttpError(400, "Generate between 1 and 500 keys at a time.");
      const product = body.product && isValidObjectId(body.product) ? body.product : undefined;
      const tests = Array.isArray(body.tests) ? body.tests.filter((t: string) => isValidObjectId(t)) : [];
      if (!product && !tests.length) throw new HttpError(400, "Choose a product or at least one test for these keys to unlock.");
      const prefix = String(body.prefix || "DRONA").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "DRONA";
      const codes = new Set<string>();
      while (codes.size < count) codes.add(`${prefix}-${block()}-${block()}`);
      await M.insertMany([...codes].map((code) => ({ code, product, tests, status: "UNUSED" })), { ordered: false });
      refresh();
      return { codes: [...codes] };
    }
    default:
      throw new HttpError(400, "Unknown action.");
  }
});
