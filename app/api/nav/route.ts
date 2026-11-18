import { NextResponse } from "next/server";
import { getNavData } from "@/lib/data";

// Menu + search index, served as a cached static response instead of being embedded in every page's HTML.
// Admin edits call revalidatePath("/api/nav") (lib/admin/server.ts).
export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await getNavData());
}
