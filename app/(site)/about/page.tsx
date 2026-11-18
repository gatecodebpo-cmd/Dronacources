import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Misc";
import { getAboutData, getSettings } from "@/lib/data";
import h from "@/components/home/Home.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About Drona",
  description: "Drona – A Defence Officer's Enterprise. Test series, video courses, e-books and mentorship for defence and government exam aspirants.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [{ page }, settings] = await Promise.all([getAboutData(), getSettings()]);
  const dir = settings.director;
  const letter = settings.directorMessage;
  return (
    <>
      <PageHero crumbs={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} icon={<ShieldCheck size={34} />} title={page?.title || "About Drona"} sub={settings.tagline} />

      {dir?.name && (
        <section className="section">
          <div className={`container ${h.director}`}>
            {dir.photo && (
              <Reveal className={h.dirPhoto}>
                <Image src={dir.photo} alt={dir.name} fill priority sizes="(max-width: 900px) 100vw, 380px" />
              </Reveal>
            )}
            <Reveal delay={0.1} className={h.dirCopy}>
              <h2>{dir.name}</h2>
              {dir.role && <p className={h.dirRole}>{dir.role}</p>}
              <div className={h.dirStory}>
                {(dir.story ?? "").split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {page?.body && (
        <section className={`section ${h.surface}`}>
          <div className="container">
            <SectionHead title="About Drona" />
            <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
          </div>
        </section>
      )}

      {letter?.body && (
        <section className="section">
          <div className={`container ${h.letterWrap}`}>
            <h2>{letter.title}</h2>
            <div className={h.letter}>
              {letter.body.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className={h.signoff}>{letter.name}</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
