import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { T } from "@/components/providers/Providers";
import { buttonClass } from "@/components/ui/Button";
import { ExamSearch } from "@/components/layout/ExamSearch";
import type { NavExam } from "@/lib/data";
import s from "./Hero.module.css";

type Slide = { heading?: string; subheading?: string; ctaLabel?: string; ctaLink?: string; image?: string };

export function Hero({ slide, tagline, motto, exams }: { slide?: Slide; tagline: string; motto: string; exams: NavExam[] }) {
  const words = motto.split(/\s*[·|•]\s*/).filter(Boolean);
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <div className={`container ${s.grid}`}>
        <div className={s.copy}>
          <p className={s.tagline}>{tagline}</p>
          <h1 id="hero-title" className={s.title}>
            {slide?.heading || "Crack Your Dream Defence & Government Exam"}
          </h1>
          {slide?.subheading && <p className={s.sub}>{slide.subheading}</p>}
          <div className={s.search}>
            <ExamSearch exams={exams} variant="glass" />
          </div>
          <div className={s.ctas}>
            <Link href={slide?.ctaLink || "/exam/afcat"} className={buttonClass({ size: "lg" })}>
              {slide?.ctaLabel || <T k="hero.startMock" />}
            </Link>
            <Link href="/exams" className={buttonClass({ variant: "onDark", size: "lg" })}>
              <T k="hero.explore" /> <ArrowRight size={18} />
            </Link>
          </div>
          <p className={s.motto}>
            <span className="sr-only">{motto}</span>
            {words.map((w, i) => (
              <span key={w} aria-hidden style={{ animationDelay: `${300 + i * 250}ms` }}>
                {w}
              </span>
            ))}
          </p>
        </div>

        <figure className={s.media}>
          <Image
            src={slide?.image || "/brand/nda-khadakwasla.jpg"}
            alt="Sudan Block, the main building of the National Defence Academy, Khadakwasla"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 520px"
          />
          <figcaption>A path to your dream academy</figcaption>
        </figure>
      </div>
    </section>
  );
}
