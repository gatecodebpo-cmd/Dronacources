import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpenCheck } from "lucide-react";
import { ExamBrowser } from "@/components/exam/ExamBrowser";
import { PageHero } from "@/components/layout/PageHero";
import { CardSkeleton } from "@/components/ui/Misc";
import { getCategories, getExams } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "All Exams – Mock Tests & Free Quizzes",
  description: "Browse every exam on Drona: defence, police, SSC, banking, railway, teaching and more. Free first mock and daily quizzes for each.",
  alternates: { canonical: "/exams" },
};

export default async function ExamsPage() {
  const [exams, categories] = await Promise.all([getExams(), getCategories()]);
  return (
    <>
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "All exams", href: "/exams" }]}
        icon={<BookOpenCheck size={34} />}
        title="All exams"
        sub="Pick your exam to see its pattern, syllabus, mock tests, topic tests, previous year papers and daily quizzes."
      />
      <section className="section" style={{ paddingTop: "var(--sp-10)" }}>
        <div className="container">
          <Suspense fallback={<div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>{Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}</div>}>
            <ExamBrowser exams={exams} categories={categories} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
