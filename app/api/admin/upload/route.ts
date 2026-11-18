import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { HttpError, requireRole } from "@/lib/auth";
import { handle } from "@/lib/admin/server";

// SVG is excluded on purpose: it can carry script.
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico" };
const MAX = 2 * 1024 * 1024;

// shortcut: writes to public/uploads, which works locally but not on Vercel's read-only filesystem; move to S3/Cloudinary for production.
export const POST = handle(async (req: NextRequest) => {
  await requireRole(["ADMIN", "EDITOR"]);
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file received.");
  const ext = TYPES[file.type];
  if (!ext) throw new HttpError(400, "Upload a PNG, JPG, WebP, GIF or ICO image.");
  if (file.size > MAX) throw new HttpError(400, "Images must be 2 MB or smaller.");
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  } catch {
    throw new HttpError(500, "Could not save the file. On Vercel, uploads need cloud storage (see README).");
  }
  return { url: `/uploads/${name}` };
});
