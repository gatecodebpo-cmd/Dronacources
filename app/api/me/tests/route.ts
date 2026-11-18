import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUser } from "@/lib/auth";
import { testStates } from "@/lib/access";
import { dbConnect } from "@/lib/db";
import { Test } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const exam = new URL(req.url).searchParams.get("exam");
  const user = await getUser();
  if (!user || !exam || !isValidObjectId(exam)) return NextResponse.json({ states: {} });
  await dbConnect();
  const tests = await Test.find({ exam, status: "PUBLISHED" }).select("_id exam isFree").lean<any[]>();
  return NextResponse.json({ states: await testStates(user.id, tests) });
}
