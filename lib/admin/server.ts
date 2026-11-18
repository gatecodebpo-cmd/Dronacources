import "server-only";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { Model } from "mongoose";
import * as Models from "@/models";
import { HttpError, requireRole, STAFF, type Role, type SessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { getPath, setPath } from "./paths";
import { RESOURCES, resourceRoles, type Field, type Resource } from "./resources";

export function getResource(key: string): Resource {
  const r = RESOURCES[key];
  if (!r) throw new HttpError(404, "Unknown module.");
  return r;
}

export function modelOf(r: Resource): Model<any> {
  return (Models as unknown as Record<string, Model<any>>)[r.model]!;
}

/** Connect + check the caller's role for this module. */
export async function guard(r: Resource, roles?: Role[]): Promise<SessionUser> {
  const user = await requireRole(roles ?? (resourceRoles(r.key) as Role[]));
  await dbConnect();
  return user;
}

export const guardStaff = () => requireRole(STAFF).then(async (u) => (await dbConnect(), u));

export function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/api/nav");
}

/** Wrap a route handler so thrown HttpErrors / Mongoose errors become JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  return async (...args: A) => {
    try {
      const out = await fn(...args);
      return out instanceof Response ? out : NextResponse.json(out ?? { ok: true });
    } catch (e: any) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e?.code === 11000) {
        const key = Object.keys(e.keyValue ?? {})[0] ?? "value";
        return NextResponse.json({ error: `Another record already uses this ${key}.` }, { status: 409 });
      }
      if (e?.name === "ValidationError" || e?.name === "CastError") return NextResponse.json({ error: e.message }, { status: 400 });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 });
    }
  };
}

const RICH = {
  allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "a", "table", "thead", "tbody", "tr", "th", "td", "blockquote", "br"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: { b: "strong", i: "em" },
};
export const cleanHtml = (html: string) => sanitizeHtml(html, RICH);

function coerce(f: Field, v: any): any {
  switch (f.type) {
    case "number":
      return v === "" || v == null ? undefined : Number.isFinite(Number(v)) ? Number(v) : bad(f, "must be a number");
    case "boolean":
      return v === true || v === "true" || v === "on";
    case "select":
      if (v === "" || v == null) return undefined;
      if (f.num) return Number(v);
      if (f.options && !f.options.some((o) => (typeof o === "string" ? o : o.value) === v)) bad(f, "has an invalid value");
      return String(v);
    case "ref":
      return v ? String(v) : null;
    case "refs":
      return Array.isArray(v) ? v.filter(Boolean).map(String) : [];
    case "strings":
      return (Array.isArray(v) ? v : String(v ?? "").split(/\r?\n|,/)).map((x: any) => String(x).trim()).filter(Boolean);
    case "options4": {
      const a = Array.isArray(v) ? v.map((x) => String(x ?? "").trim()) : [];
      if (a.length !== 4 || a.some((x) => !x)) bad(f, "needs all four options filled in");
      return a;
    }
    case "objects":
      return (Array.isArray(v) ? v : []).map((row: any) => {
        const out: any = {};
        f.of!.forEach((sf) => {
          const c = coerce(sf, row?.[sf.name]);
          if (sf.required && (c === undefined || c === "")) bad(sf, `is required in ${f.label}`);
          if (c !== undefined) out[sf.name] = c;
        });
        if (row?.at) out.at = row.at;
        return out;
      });
    case "richtext":
      return cleanHtml(String(v ?? ""));
    case "date":
    case "datetime":
      return v ? (isNaN(new Date(v).getTime()) ? bad(f, "is not a valid date") : new Date(v)) : null;
    case "colour":
      return v ? (/^#[0-9a-f]{3,8}$/i.test(v) ? String(v) : bad(f, "must be a hex colour like #F5A524")) : undefined;
    default:
      return v == null ? undefined : String(v).trim();
  }
}

function bad(f: Field, msg: string): never {
  throw new HttpError(400, `${f.label} ${msg}.`);
}

/**
 * Whitelists registry fields from the request body and coerces them.
 * Returns a flat { "dot.path": value } map (used as $set on update, expanded on create).
 */
export async function buildBody(r: Resource, input: any, isCreate: boolean) {
  const flat: Record<string, unknown> = {};
  for (const f of r.fields) {
    const raw = getPath(input, f.name);
    if (f.type === "password") {
      if (raw) {
        if (String(raw).length < 8) bad(f, "must be at least 8 characters");
        flat.passwordHash = await bcrypt.hash(String(raw), 10);
      } else if (isCreate) bad(f, "is required for a new account");
      continue;
    }
    if (raw === undefined && !isCreate) continue;
    const v = coerce(f, raw);
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length && f.type !== "refs" && f.type !== "objects" && f.type !== "strings");
    if (f.required && empty) bad(f, "is required");
    if (v !== undefined) flat[f.name] = v;
  }
  if (flat.code && typeof flat.code === "string") flat.code = flat.code.toUpperCase();
  return flat;
}

export function expand(flat: Record<string, unknown>, base: Record<string, unknown> = {}) {
  const obj: any = structuredClone(base);
  Object.entries(flat).forEach(([k, v]) => setPath(obj, k, v));
  return obj;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Mongo query for list endpoints from ?q= and ?f_<field>= params. */
export function listQuery(r: Resource, sp: URLSearchParams) {
  const query: Record<string, any> = { ...(r.baseFilter ?? {}) };
  const q = sp.get("q")?.trim();
  if (q && r.searchFields.length) query.$or = r.searchFields.map((f) => ({ [f]: { $regex: escapeRe(q), $options: "i" } }));
  for (const [k, v] of sp.entries()) {
    if (!k.startsWith("f_") || v === "") continue;
    const name = k.slice(2);
    const f = r.fields.find((x) => x.name === name);
    if (!f) continue;
    query[name] = f.type === "boolean" ? v === "true" : f.num ? Number(v) : v;
  }
  return query;
}

export function sortOf(r: Resource, s: string | null) {
  const raw = s || r.sort;
  const key = raw.replace(/^-/, "");
  const ok = ["createdAt", "updatedAt", "order", "_id"].includes(key) || r.columns.some((c) => c.key === key) || r.fields.some((f) => f.name === key);
  const k = ok ? raw : r.sort;
  return { [k.replace(/^-/, "")]: k.startsWith("-") ? -1 : 1 } as Record<string, 1 | -1>;
}

/** populate() specs for ref columns, using the target module's label field. */
export function populateSpecs(r: Resource) {
  const keys = new Set([...r.columns.map((c) => c.key), ...(r.csv ?? []).map((c) => c.split(".")[0]!)]);
  return r.fields
    .filter((f) => f.type === "ref" && keys.has(f.name))
    .map((f) => {
      const target = RESOURCES[f.ref!]!;
      return { path: f.name, select: `${target.labelField} name email title` };
    });
}
