import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { ExamCard } from "@/components/cards/Cards";
import { PageHero } from "@/components/layout/PageHero";
import { EmptyState } from "@/components/ui/Misc";
import { Stagger } from "@/components/ui/Reveal";
import { getCategoryPage } from "@/lib/data";
import s from "@/components/exam/Exam.module.css";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ category: string; group: string }> };

async function load(p: P["params"]) {
  const { category, group } = await p;
  const d = await getCategoryPage(category);
  const g = d?.groups.find((x: any) => x.slug === group);
  if (!d || !g) return null;
  return { d, g, exams: d.exams.filter((e: any) => d.groupOf[e._id] === g._id) };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const r = await load(params);
  if (!r) return {};
  return { title: `${r.g.name} Exams – Mock Tests & Quizzes`, description: `Mock tests, previous year papers and free daily quizzes for ${r.g.name} exams on Drona.` };
}

export default async function GroupPage({ params }: P) {
  const r = await load(params);
  if (!r) notFound();
  const { d, g, exams } = r;
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", href: "/" },
          { name: d.category.name, href: `/exams/${d.category.slug}` },
          { name: g.name, href: `/exams/${d.category.slug}/${g.slug}` },
        ]}
        icon={<Layers size={32} />}
        title={g.name}
        sub={`Every ${g.name} exam we cover, with a free first mock and daily quizzes.`}
        compact
      />
      <section className="section">
        <div className="container">
          {exams.length ? (
            <Stagger className={s.examGrid}>
              {exams.map((e: any) => (
                <ExamCard key={e._id} exam={e} />
              ))}
            </Stagger>
          ) : (
            <EmptyState title="Exams coming soon" text="We're adding test series for this group. Write to us if you need it sooner." />
          )}
        </div>
      </section>
    </>
  );
}
