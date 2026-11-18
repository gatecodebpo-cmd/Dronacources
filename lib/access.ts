import "server-only";
import { dbConnect } from "./db";
import { Attempt, Product, User } from "@/models";
import type { TestState } from "./types";

type TestRef = { _id: unknown; exam: unknown; isFree?: boolean };

/** Exam ids a user has bought access to through products. */
async function productExamIds(productIds: unknown[]) {
  if (!productIds?.length) return new Set<string>();
  const products = await Product.find({ _id: { $in: productIds } }).select("exams").lean<any[]>();
  return new Set(products.flatMap((p) => (p.exams ?? []).map(String)));
}

export async function canAccessTest(userId: string | null | undefined, test: TestRef) {
  if (test.isFree) return true;
  if (!userId) return false;
  await dbConnect();
  const user = await User.findById(userId).select("unlockedTests purchasedProducts").lean<any>();
  if (!user) return false;
  if ((user.unlockedTests ?? []).some((t: unknown) => String(t) === String(test._id))) return true;
  return (await productExamIds(user.purchasedProducts)).has(String(test.exam));
}

/** Per-test unlocked / attempted / best score for one user over a set of tests. */
export async function testStates(userId: string, tests: TestRef[]): Promise<Record<string, TestState>> {
  await dbConnect();
  const ids = tests.map((t) => t._id);
  const [user, attempts] = await Promise.all([
    User.findById(userId).select("unlockedTests purchasedProducts").lean<any>(),
    Attempt.find({ user: userId, test: { $in: ids } }).select("test score maxScore completedAt").sort({ completedAt: -1 }).lean<any[]>(),
  ]);
  const unlocked = new Set((user?.unlockedTests ?? []).map(String));
  const viaProduct = await productExamIds(user?.purchasedProducts ?? []);
  const states: Record<string, TestState> = {};
  for (const t of tests) {
    const id = String(t._id);
    const mine = attempts.filter((a) => String(a.test) === id);
    const best = mine.reduce((m, a) => Math.max(m, a.maxScore ? (a.score / a.maxScore) * 100 : 0), 0);
    states[id] = {
      unlocked: !!t.isFree || unlocked.has(id) || viaProduct.has(String(t.exam)),
      ...(mine.length ? { attemptId: String(mine[0]._id), bestPct: Math.max(0, Math.round(best)) } : {}),
    };
  }
  return states;
}
