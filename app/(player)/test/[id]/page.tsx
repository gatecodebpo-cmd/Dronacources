import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { Player } from "@/components/player/Player";
import { canAccessTest } from "@/lib/access";
import { getUser } from "@/lib/auth";
import { dbConnect, plain } from "@/lib/db";
import { Exam, Question, Test } from "@/models";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Test in progress", robots: { index: false } };

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await dbConnect();
  const test = await Test.findOne({ _id: id, status: "PUBLISHED" }).lean<any>();
  if (!test) notFound();
  const user = await getUser();
  if (!(await canAccessTest(user?.id, test))) redirect(`/checkout?test=${id}`);

  // Never send answers or explanations to the browser before submission.
  const [docs, exam] = await Promise.all([
    Question.find({ _id: { $in: test.questions } }).select("text options topic image").lean<any[]>(),
    Exam.findById(test.exam).select("name slug").lean<any>(),
  ]);
  const order = (test.questions ?? []).map(String);
  const questions = order.map((qid: string) => docs.find((d) => String(d._id) === qid)).filter(Boolean);

  return (
    <Player
      test={plain({
        _id: test._id,
        title: test.title,
        type: test.type,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        durationMinutes: test.durationMinutes,
        negativeMarking: test.negativeMarking ?? 0,
        language: test.language,
      })}
      exam={exam ? plain({ name: exam.name, slug: exam.slug }) : null}
      questions={plain(questions)}
      loggedIn={!!user}
    />
  );
}
