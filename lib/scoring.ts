/** Scoring shared by the test-submit API and the seed script. */
export type ScoredAnswer = { question: string; selected: number | null; correct: boolean; marked?: boolean };

export function marksPerQuestion(test: { totalMarks: number; totalQuestions: number }) {
  return test.totalQuestions ? test.totalMarks / test.totalQuestions : 1;
}

export function scoreAttempt(
  test: { totalMarks: number; totalQuestions: number; negativeMarking?: number },
  questions: { _id: unknown; correctIndex: number }[],
  selections: Record<string, number | null | undefined>,
  marked: string[] = [],
) {
  const per = marksPerQuestion(test);
  const neg = test.negativeMarking ?? 0;
  let correct = 0, incorrect = 0, skipped = 0;
  const answers: ScoredAnswer[] = questions.map((q) => {
    const id = String(q._id);
    const sel = selections[id];
    const has = typeof sel === "number" && sel >= 0 && sel <= 3;
    const ok = has && sel === q.correctIndex;
    if (!has) skipped++;
    else if (ok) correct++;
    else incorrect++;
    return { question: id, selected: has ? sel! : null, correct: !!ok, marked: marked.includes(id) };
  });
  const maxScore = round2(questions.length * per);
  const score = round2(correct * per - incorrect * neg);
  const attempted = correct + incorrect;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  return { answers, correct, incorrect, skipped, score, maxScore, accuracy };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Demo ranking: real attempts on this test are blended with a simulated candidate pool so a new
 * deployment still shows believable All-India / State ranks.
 * shortcut: simulated pool, replace with rank over real attempts once there is enough traffic.
 */
export function simulatedRank(testId: string, scorePct: number, betterRealAttempts: number) {
  const seed = [...testId].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);
  const pool = 1200 + (seed % 900);
  // logistic curve: 50% → middle of pool, 90% → top ~3%
  const beatFraction = 1 / (1 + Math.exp(-(scorePct - 50) / 11));
  const rank = Math.max(1, Math.round(pool * (1 - beatFraction)) + betterRealAttempts + 1);
  const totalCandidates = pool + betterRealAttempts + 1;
  const stateRank = Math.max(1, Math.ceil(rank / 11));
  return { rank: Math.min(rank, totalCandidates), stateRank, totalCandidates };
}
