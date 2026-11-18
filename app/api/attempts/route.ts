import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getUser } from "@/lib/auth";
import { canAccessTest } from "@/lib/access";
import { dbConnect } from "@/lib/db";
import { scoreAttempt, simulatedRank } from "@/lib/scoring";
import { Attempt, Question, Test, User } from "@/models";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const testId = String(body?.testId ?? "");
  if (!isValidObjectId(testId)) return NextResponse.json({ error: "Unknown test." }, { status: 400 });

  await dbConnect();
  const user = await getUser();
  const test = await Test.findOne({ _id: testId, status: "PUBLISHED" }).lean<any>();
  if (!test) return NextResponse.json({ error: "Unknown test." }, { status: 404 });
  if (!(await canAccessTest(user?.id, test))) return NextResponse.json({ error: "Unlock this test to submit it." }, { status: 403 });

  const qIds = (test.questions ?? []).map(String);
  const valid = new Set(qIds);
  // Only keep selections for questions that belong to this test, values 0–3 or null.
  const raw = body?.answers && typeof body.answers === "object" ? body.answers : {};
  const answers: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(raw)) if (valid.has(k)) answers[k] = Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3 ? (v as number) : null;
  const marked = Array.isArray(body?.marked) ? body.marked.map(String).filter((id: string) => valid.has(id)) : [];
  const timeTakenSec = Math.max(0, Math.min(Math.round(Number(body?.timeTakenSec) || 0), test.durationMinutes * 60));

  const questions = await Question.find({ _id: { $in: qIds } }).select("correctIndex").lean<any[]>();
  const ordered = qIds.map((id: string) => questions.find((q) => String(q._id) === id)).filter(Boolean);
  const sc = scoreAttempt(test, ordered, answers, marked);
  const pct = sc.maxScore ? Math.max(0, (sc.score / sc.maxScore) * 100) : 0;
  const better = await Attempt.countDocuments({ test: test._id, score: { $gt: sc.score } });
  const rank = simulatedRank(testId, pct, better);

  if (user && test.type === "QUIZ") await bumpStreak(user.id);

  const attempt = await Attempt.create({ user: user?.id, test: test._id, ...sc, timeTakenSec, ...rank, completedAt: new Date() });
  return NextResponse.json({ id: String(attempt._id) }, { status: 201 });
}

/** +1 if the last quiz was yesterday, unchanged if already played today, otherwise restart at 1. */
async function bumpStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 864e5);
  const quizIds = await Test.find({ type: "QUIZ" }).distinct("_id");
  const last = await Attempt.findOne({ user: userId, test: { $in: quizIds } }).sort({ completedAt: -1 }).select("completedAt").lean<any>();
  if (last && last.completedAt >= today) return;
  if (last && last.completedAt >= yesterday) await User.updateOne({ _id: userId }, { $inc: { streak: 1 } });
  else await User.updateOne({ _id: userId }, { $set: { streak: 1 } });
}
