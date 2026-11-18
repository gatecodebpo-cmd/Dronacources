import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ResultView } from "@/components/student/ResultView";
import { getUser, STAFF } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { Attempt, Exam, Question, Test } from "@/models";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your result", robots: { index: false, follow: false } };

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await dbConnect();
  const attempt = await Attempt.findById(id).lean<any>();
  if (!attempt) notFound();

  if (attempt.user) {
    const user = await getUser();
    if (!user) redirect(`/login?callbackUrl=/result/${id}`);
    if (String(attempt.user) !== user.id && !STAFF.includes(user.role)) notFound();
  }

  const test = await Test.findById(attempt.test).select("title type exam totalMarks totalQuestions durationMinutes negativeMarking").lean<any>();
  const [exam, questions] = await Promise.all([
    test ? Exam.findById(test.exam).select("name slug").lean<any>() : null,
    Question.find({ _id: { $in: attempt.answers.map((a: any) => a.question) } }).lean<any[]>(),
  ]);

  const review = attempt.answers
    .map((a: any) => {
      const q = questions.find((x) => String(x._id) === String(a.question));
      return q && { _id: String(q._id), text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, topic: q.topic || "General", selected: a.selected ?? null, correct: !!a.correct };
    })
    .filter(Boolean);

  const topics = Object.values(
    review.reduce((m: Record<string, { topic: string; correct: number; total: number }>, r: any) => {
      m[r.topic] ??= { topic: r.topic, correct: 0, total: 0 };
      m[r.topic]!.total++;
      if (r.correct) m[r.topic]!.correct++;
      return m;
    }, {}),
  );

  return (
    <ResultView
      attempt={plain({
        _id: attempt._id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        correct: attempt.correct,
        incorrect: attempt.incorrect,
        skipped: attempt.skipped,
        accuracy: attempt.accuracy,
        timeTakenSec: attempt.timeTakenSec,
        rank: attempt.rank,
        stateRank: attempt.stateRank,
        totalCandidates: attempt.totalCandidates,
        completedAt: attempt.completedAt,
      })}
      test={test ? plain({ _id: test._id, title: test.title, durationMinutes: test.durationMinutes }) : null}
      exam={exam ? plain({ name: exam.name, slug: exam.slug }) : null}
      review={plain(review)}
      topics={topics as any}
    />
  );
}
