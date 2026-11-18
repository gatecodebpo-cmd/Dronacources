import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CheckCircle2, ClipboardList, FileQuestion, Gauge, Languages, PlayCircle, Sparkles } from "lucide-react";
import { ExamCard, ProductCard } from "@/components/cards/Cards";
import { BottomCta, ExamSubNav, ExamTests } from "@/components/exam/ExamClient";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { Bi, T } from "@/components/providers/Providers";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/Misc";
import { Reveal } from "@/components/ui/Reveal";
import { getExamPage } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { courseLd, faqLd, JsonLd, stripHtml } from "@/lib/seo";
import s from "@/components/exam/Exam.module.css";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await getExamPage((await params).slug);
  if (!d) return {};
  const e = d.exam;
  const title = e.seo?.title || `${e.name} Mock Test Series`;
  const description = e.seo?.description || e.shortDescription || stripHtml(e.overview).slice(0, 160);
  return { title, description, alternates: { canonical: `/exam/${e.slug}` }, openGraph: { title, description, type: "website" } };
}

export default async function ExamPage({ params }: P) {
  const d = await getExamPage((await params).slug);
  if (!d) notFound();
  const { exam: e, tests, related, products } = d;
  const mocks = tests.filter((t: any) => t.type !== "QUIZ");
  const quizzes = tests.filter((t: any) => t.type === "QUIZ");
  const firstFree = tests.find((t: any) => t.isFree && t.type === "MOCK") ?? tests.find((t: any) => t.isFree);
  const faqs = (e.faqs ?? []).map((f: any) => ({ q: f.q, a: f.a }));

  const sections = [
    { id: "overview", k: "exam.overview" as const, html: e.overview },
    { id: "pattern", k: "exam.pattern" as const, html: e.examPattern },
    { id: "syllabus", k: "exam.syllabus" as const, html: e.syllabus },
  ].filter((x) => x.html);
  const nav = [...sections.map(({ id, k }) => ({ id, k })), { id: "tests", k: "exam.tests" as const }, ...(faqs.length ? [{ id: "faq", k: "exam.faq" as const }] : [])];

  return (
    <>
      <JsonLd data={courseLd({ name: `${e.name} Mock Test Series`, description: e.shortDescription, url: `/exam/${e.slug}` })} />
      {faqs.length > 0 && <JsonLd data={faqLd(faqs)} />}

      <section className={s.examHero}>
        <span className={s.examHeroPattern} aria-hidden />
        <div className="container">
          <Breadcrumbs
            onDark
            items={[
              { name: "Home", href: "/" },
              { name: e.category?.name ?? "Exams", href: `/exams/${e.category?.slug ?? ""}` },
              ...(e.group ? [{ name: e.group.name, href: `/exams/${e.category?.slug}/${e.group.slug}` }] : []),
              { name: e.name, href: `/exam/${e.slug}` },
            ]}
          />
          <div className={s.examHeroGrid}>
            <div>
              <div className={s.examTitleRow}>
                <span className={s.examIcon}>
                  <Icon name={e.icon} size={34} />
                </span>
                <div>
                  <div className={s.badgeRow}>
                    {e.isPopular && <Badge tone="gold" icon={<Sparkles />}>Popular</Badge>}
                    <Badge tone="navy">
                      <Bi en={e.category?.name ?? ""} hi={e.category?.nameHi} />
                    </Badge>
                  </div>
                  <h1>{e.name}</h1>
                </div>
              </div>
              {e.shortDescription && <p className={s.examLead}>{e.shortDescription}</p>}
              <ul className={s.quickStats} role="list">
                <li><ClipboardList size={18} /><strong>{mocks.length}</strong> tests</li>
                <li><FileQuestion size={18} /><strong>{quizzes.length}</strong> quizzes</li>
                <li><Languages size={18} />{(e.languages ?? ["English"]).join(", ")}</li>
                {e.level && <li><Gauge size={18} />{e.level}</li>}
              </ul>
              <div className={s.heroCtas}>
                {firstFree && (
                  <Link href={`/test/${firstFree._id}`} className={buttonClass({ size: "lg" })}>
                    <PlayCircle size={20} /> <T k="hero.startMock" />
                  </Link>
                )}
                <a href="#tests" className={buttonClass({ variant: "onDark", size: "lg" })}>
                  See all tests
                </a>
              </div>
            </div>
            {!!e.features?.length && (
              <ul className={s.featureBox} role="list" aria-label="What you get">
                {e.features.map((f: string) => (
                  <li key={f}>
                    <CheckCircle2 size={18} /> {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <ExamSubNav sections={nav} />

      <div className={`container ${s.examBody}`}>
        <div className={s.examMain}>
          {sections.map((x) => (
            <Reveal key={x.id} as="section">
              <div id={x.id} className={s.block}>
                <h2>
                  <T k={x.k} />
                </h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: x.html }} />
              </div>
            </Reveal>
          ))}
          {e.eligibility && (
            <Reveal as="section">
              <div className={s.block}>
                <h2>Eligibility</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: e.eligibility }} />
              </div>
            </Reveal>
          )}

          <section id="tests" className={s.block}>
            <h2>
              <T k="exam.tests" />
            </h2>
            <ExamTests examId={e._id} examName={e.name} tests={tests} products={products} />
          </section>

          {faqs.length > 0 && (
            <section id="faq" className={s.block}>
              <h2>
                <T k="exam.faq" />
              </h2>
              <Accordion items={faqs} />
            </section>
          )}
        </div>

        <aside className={s.aside}>
          <div className={s.asideCard}>
            <BadgeCheck size={28} className={s.asideIcon} />
            <h3>Start with a free mock</h3>
            <p>Take the first full-length test free. See your rank, then unlock more tests from ₹49 each.</p>
            {firstFree && (
              <Link href={`/test/${firstFree._id}`} className={buttonClass({ block: true })}>
                <T k="common.startFree" />
              </Link>
            )}
          </div>
          {products.map((p: any) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead title={<T k="exam.related" />} />
            <div className={s.examGrid}>
              {related.map((r: any) => (
                <ExamCard key={r._id} exam={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {firstFree && <BottomCta href={`/test/${firstFree._id}`} label="Start free mock test" />}
    </>
  );
}
