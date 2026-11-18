import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { ExamCard, ProductCard, QuizCard } from "@/components/cards/Cards";
import { Bi, T } from "@/components/providers/Providers";
import { Accordion } from "@/components/ui/Accordion";
import { buttonClass } from "@/components/ui/Button";
import { Carousel } from "@/components/ui/Carousel";
import { CountUp } from "@/components/ui/Motion";
import { SectionHead } from "@/components/ui/Misc";
import { Reveal, Stagger } from "@/components/ui/Reveal";
import { getCategories, getHomeData, getNavData, getSettings } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { faqLd, JsonLd, orgLd } from "@/lib/seo";
import s from "@/components/home/Home.module.css";

export const revalidate = 300;

const STEPS = [
  { title: "Perform", text: "Take a full-length mock or a daily quiz in a timed screen that works like the real exam." },
  { title: "Analyse", text: "See your score, accuracy, topic-wise performance and an estimated State and All-India rank." },
  { title: "Improve", text: "Read the explanation for every question, then re-attempt and work on your weak areas." },
];

export default async function HomePage() {
  const [settings, nav, cats, d] = await Promise.all([getSettings(), getNavData(), getCategories(), getHomeData()]);
  const faqs = d.faqs.map((f: any) => ({ q: f.question, a: f.answer }));
  const services = settings.services ?? [];
  const featured = services.filter((x) => x.featured);
  const more = services.filter((x) => !x.featured);
  const dir = settings.director;
  const letter = settings.directorMessage;
  const shelves = settings.elibraryCollections ?? [];

  return (
    <>
      <JsonLd data={orgLd(settings)} />
      {faqs.length > 0 && <JsonLd data={faqLd(faqs)} />}

      <Hero slide={d.slides[0]} tagline={settings.tagline} motto={settings.motto} exams={nav.exams} />

      {/* 1. what Drona offers */}
      {services.length > 0 && (
        <section className={`section ${s.surface}`} aria-labelledby="offer">
          <div className="container">
            <SectionHead title={<span id="offer">Ways to prepare with Drona</span>} sub="Everything Drona offers, in one place." />
            <Stagger className={s.offerGrid}>
              {featured.map((x) => (
                <Link key={x.title} href={x.href || "/"} className={s.offerCard}>
                  <span className={s.offerIcon}>
                    <Icon name={x.icon} size={26} />
                  </span>
                  <h3>
                    {x.title} <ArrowRight size={18} className={s.offerArrow} />
                  </h3>
                  {x.text && <p>{x.text}</p>}
                </Link>
              ))}
            </Stagger>
            {more.length > 0 && (
              <div className={s.alsoRow}>
                <p>Also at Drona</p>
                <ul role="list">
                  {more.map((x) => (
                    <li key={x.title}>
                      <Link href={x.href || "/contact"} className={s.alsoPill}>
                        <Icon name={x.icon} size={16} /> {x.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. pick an exam */}
      <section className="section" aria-labelledby="cats">
        <div className="container">
          <SectionHead
            title={<span id="cats"><T k="home.chooseExam" /></span>}
            sub={<T k="home.chooseExamSub" />}
            action={
              <Link href="/exams" className={s.linkMore}>
                <T k="nav.allExams" /> <ArrowRight size={18} />
              </Link>
            }
          />
          <ul className={s.catPills} role="list">
            {cats
              .filter((c) => c.slug !== "e-library" && (c.examCount ?? 0) > 0)
              .map((c) => (
                <li key={c._id}>
                  <Link href={`/exams/${c.slug}`} className={s.catPill}>
                    <Icon name={c.icon} size={18} />
                    <Bi en={c.name} hi={c.nameHi} />
                    <span className={s.catCount}>{c.examCount}</span>
                  </Link>
                </li>
              ))}
          </ul>
          <h3 className={s.subHead}>
            <T k="home.popular" />
          </h3>
          <Stagger className={`${s.grid4} ${s.popular}`}>
            {d.popular.map((e: any) => (
              <ExamCard key={e._id} exam={e} />
            ))}
          </Stagger>
        </div>
      </section>

      {d.quizzes.length > 0 && (
        <section className={`section ${s.surface}`} aria-labelledby="quizzes">
          <div className="container">
            <SectionHead title={<span id="quizzes"><T k="home.quizzes" /></span>} sub={<T k="home.quizzesSub" />} />
            <Carousel label="Today's free quizzes" itemWidth="min(320px, 82vw)">
              {d.quizzes.map((q: any) => (
                <QuizCard key={q._id} test={q} examName={q.exam?.name} />
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* 3. E-Library */}
      {d.products.length > 0 && (
        <section className="section" aria-labelledby="products">
          <div className="container">
            <SectionHead
              title={<span id="products"><T k="nav.elibrary" /></span>}
              sub="Latest editions of books, notes and video courses."
              action={
                <Link href="/e-library" className={s.linkMore}>
                  Visit the E-Library <ArrowRight size={18} />
                </Link>
              }
            />
            {shelves.length > 0 && (
              <ul className={s.shelves} role="list" aria-label="E-Library collections">
                {shelves.map((sh) => (
                  <li key={sh}>
                    <Link href={`/e-library?shelf=${encodeURIComponent(sh)}`}>{sh}</Link>
                  </li>
                ))}
              </ul>
            )}
            <Stagger className={s.grid4}>
              {d.products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* 4. how it works + the original "path to your dream academy" copy */}
      <section className={`section ${s.surface}`} aria-labelledby="how">
        <div className="container">
          <SectionHead
            title={<span id="how">A path to your dream academy</span>}
            sub="Not just correct answers: get a detailed explanation of every question, re-attempt tests and work on your weak areas."
          />
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.title} className={s.step}>
                <span className={s.stepNum}>{i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </li>
            ))}
          </ol>
          {d.stats.length > 0 && (
            <dl className={s.stats}>
              {d.stats.map((st: any) => (
                <div key={st._id}>
                  <dt>{st.label}</dt>
                  <dd>
                    <CountUp to={st.value} suffix={st.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* 5. the people behind Drona */}
      {dir?.name && (
        <section className="section" aria-labelledby="director">
          <div className={`container ${s.director}`}>
            {dir.photo && (
              <Reveal className={s.dirPhoto}>
                <Image src={dir.photo} alt={dir.name} fill sizes="(max-width: 900px) 100vw, 380px" />
              </Reveal>
            )}
            <Reveal delay={0.1} className={s.dirCopy}>
              <p className={s.dirTag}>{settings.tagline}</p>
              <h2 id="director">{dir.name}</h2>
              {dir.role && <p className={s.dirRole}>{dir.role}</p>}
              <div className={s.dirStory}>
                {(dir.story ?? "").split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <Link href="/about" className={buttonClass({ variant: "outline" })}>
                About Drona <ArrowRight size={18} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {letter?.body && (
        <section className={`section ${s.surface}`} aria-labelledby="letter">
          <div className={`container ${s.letterWrap}`}>
            <h2 id="letter">{letter.title}</h2>
            <div className={s.letter}>
              {letter.body.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className={s.signoff}>{letter.name}</p>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section" aria-labelledby="faq">
          <div className={`container ${s.faqGrid}`}>
            <div>
              <SectionHead title={<span id="faq"><T k="home.faq" /></span>} />
              <p className={s.faqNote}>
                Can't find your answer? <Link href="/contact">Contact us</Link>.
              </p>
            </div>
            <Accordion items={faqs} />
          </div>
        </section>
      )}

      <section className={s.cta} aria-labelledby="cta">
        <div className={`container ${s.ctaInner}`}>
          <div>
            <h2 id="cta">
              <T k="home.ctaTitle" />
            </h2>
            <p>
              <T k="home.ctaSub" />
            </p>
          </div>
          <div className={s.ctaActions}>
            <Link href="/signup" className={buttonClass({ size: "lg" })}>
              <T k="home.ctaBtn" />
            </Link>
            <Link href="/exams" className={buttonClass({ variant: "onDark", size: "lg" })}>
              <T k="hero.explore" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
