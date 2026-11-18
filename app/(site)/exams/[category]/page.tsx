import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Layers } from "lucide-react";
import { ExamCard } from "@/components/cards/Cards";
import { PageHero } from "@/components/layout/PageHero";
import { Bi, T } from "@/components/providers/Providers";
import { EmptyState, SectionHead } from "@/components/ui/Misc";
import { Stagger } from "@/components/ui/Reveal";
import { getCategoryPage } from "@/lib/data";
import { Icon } from "@/lib/icons";
import s from "@/components/exam/Exam.module.css";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await getCategoryPage((await params).category);
  if (!d) return {};
  return {
    title: d.category.seo?.title || `${d.category.name} Mock Tests`,
    description: d.category.seo?.description || d.category.description,
    alternates: { canonical: `/exams/${d.category.slug}` },
  };
}

export default async function CategoryPage({ params }: P) {
  const d = await getCategoryPage((await params).category);
  if (!d) notFound();
  const { category: c, groups, exams } = d;
  const popular = exams.filter((e: any) => e.isPopular);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "All exams", href: "/exams" }, { name: c.name, href: `/exams/${c.slug}` }]}
        icon={<Icon name={c.icon} size={34} />}
        title={<Bi en={c.name} hi={c.nameHi} />}
        sub={c.description}
      >
        <p className={s.heroMeta}>
          <strong>{exams.length}</strong> exams{groups.length > 0 && <> · <strong>{groups.length}</strong> exam groups</>}
        </p>
      </PageHero>

      {groups.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title="Exam groups" sub="Choose a recruiting body or force to see its exams." />
            <Stagger className={s.groupGrid} gap={0.02}>
              {groups.map((g: any) => (
                <Link key={g._id} href={`/exams/${c.slug}/${g.slug}`} className={s.groupCard}>
                  <span className={s.groupIcon}>
                    <Layers size={18} />
                  </span>
                  <span className={s.groupName}>
                    {g.name}
                    <small>
                      {g.examCount} {g.examCount === 1 ? "exam" : "exams"}
                    </small>
                  </span>
                  <ChevronRight size={18} className={s.groupChev} />
                </Link>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="section section-tint">
        <div className="container">
          <SectionHead title={popular.length ? <T k="home.popular" /> : "Exams"} />
          {exams.length ? (
            <Stagger className={s.examGrid}>
              {(popular.length ? popular : exams).map((e: any) => (
                <ExamCard key={e._id} exam={e} />
              ))}
            </Stagger>
          ) : (
            <EmptyState title="Exams coming soon" text="We're adding test series for this category. Check back shortly or write to us with the exam you need." />
          )}
          {popular.length > 0 && popular.length < exams.length && (
            <div style={{ marginTop: "var(--sp-12)" }}>
              <SectionHead title="All exams in this category" />
              <div className={s.examGrid}>
                {exams.filter((e: any) => !e.isPopular).map((e: any) => (
                  <ExamCard key={e._id} exam={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
