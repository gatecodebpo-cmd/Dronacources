import type { Metadata } from "next";
import Image from "next/image";
import { InView } from "@/components/ui/InView";
import { getSettings } from "@/lib/data";
import { SvgIcon } from "@/lib/icons";
import { breadcrumbLd, JsonLd } from "@/lib/seo";
import s from "@/components/content/About.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About Drona",
  description: "Drona – A Defence Officer's Enterprise. Realistic exam practice for defence and government exam aspirants.",
  alternates: { canonical: "/about" },
};

const STEPS = [
  { icon: "Trophy", title: "Perform", text: "Take timed mock tests." },
  { icon: "BarChart3", title: "Analyse", text: "Review your results." },
  { icon: "Target", title: "Improve", text: "Focus on weaker topics." },
];
const RESOURCES = ["Previous-year papers", "Daily quizzes", "Test series", "English and Hindi"];

export default async function AboutPage() {
  const settings = await getSettings();
  const dir = settings.director;
  // name without the "[full name – confirm]" placeholder note
  const dirName = dir?.name?.replace(/\s*\[[^\]]*\]\s*$/, "").trim();
  const letter = settings.directorMessage;

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", href: "/" }, { name: "About", href: "/about" }])} />

      <section className={s.hero}>
        <div className={`container ${s.heroGrid}`}>
          {dir?.photo && (
            <figure className={s.person}>
              <div className={s.photo}>
                <Image src={dir.photo} alt={dirName || "Director, Drona"} fill priority sizes="(max-width: 700px) 80vw, 320px" />
              </div>
              {dirName && <figcaption>{dirName}</figcaption>}
            </figure>
          )}
          <div className={s.heroCopy}>
            <h1 className={s.title}>
              About <span>Drona</span>
            </h1>
            <p className={s.lead}>Practice for defence and government exams.</p>
            <p className={s.mission}>Make realistic exam practice accessible to every aspirant.</p>
          </div>
        </div>
      </section>

      <section className={s.how} aria-labelledby="how">
        <div className="container">
          <h2 id="how" className={s.centerTitle}>
            How practice works
          </h2>
          <InView className={s.steps}>
            <span className={s.line} aria-hidden />
            <ol>
              {STEPS.map((st) => (
                <li key={st.title}>
                  <span className={s.circle}>
                    <SvgIcon name={st.icon} size={38} strokeWidth={1.75} />
                  </span>
                  <h3>{st.title}</h3>
                  <p>{st.text}</p>
                </li>
              ))}
            </ol>
          </InView>
        </div>
      </section>

      <section className={s.resources} aria-labelledby="resources">
        <div className={`container ${s.resourcesRow}`}>
          <h2 id="resources">Practice resources</h2>
          <ul role="list">
            {RESOURCES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {letter?.body && (
        <section className={s.letterSection} aria-labelledby="letter">
          <div className="container">
            <InView className={s.letterCard}>
              <h2 id="letter">{letter.title}</h2>
              <div className={s.letter}>
                {letter.body.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {letter.name && <p className={s.signoff}>{letter.name}</p>}
              </div>
            </InView>
          </div>
        </section>
      )}
    </>
  );
}
