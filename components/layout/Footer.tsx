import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, Youtube, Clock } from "lucide-react";
import Link from "next/link";
import { Bi, T } from "@/components/providers/Providers";
import type { CategoryLite, SettingsLite } from "@/lib/types";
import { LangToggle, NewsletterForm } from "./SiteChrome";
import { Logo } from "./Logo";
import s from "./Footer.module.css";

const SOCIAL = { facebook: Facebook, instagram: Instagram, youtube: Youtube, telegram: Send, linkedin: Linkedin } as const;
const isReal = (v?: string) => !!v && !v.includes("[");

export function Footer({ settings, categories }: { settings: SettingsLite; categories: CategoryLite[] }) {
  const socials = Object.entries(settings.socials ?? {}).filter(([k, v]) => k in SOCIAL && isReal(v) && /^https?:\/\//.test(v));
  return (
    <footer className={s.footer}>
      <div className={`container ${s.top}`}>
        <div className={s.about}>
          <Logo tagline={settings.tagline} onDark logo={settings.logo} />
          <p>
            Drona is a test-practice platform built by a defence officer for aspirants of NDA, CDS, AFCAT, Agniveer, police, SSC and other
            government exams. Practise in real exam conditions, study every explanation, and track your State and All-India rank.
          </p>
          <p className={s.motto}>{settings.motto}</p>
          {socials.length > 0 && (
            <ul className={s.socials} role="list">
              {socials.map(([k, v]) => {
                const I = SOCIAL[k as keyof typeof SOCIAL];
                return (
                  <li key={k}>
                    <a href={v} target="_blank" rel="noopener noreferrer" aria-label={`Drona on ${k}`}>
                      <I size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <nav className={s.col} aria-label="Popular categories">
          <h3>
            <T k="footer.categories" />
          </h3>
          <ul role="list">
            {categories.slice(0, 8).map((c) => (
              <li key={c._id}>
                <Link href={`/exams/${c.slug}`}>
                  <Bi en={c.name} hi={c.nameHi} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={s.col} aria-label="Quick links">
          <h3>
            <T k="footer.quick" />
          </h3>
          <ul role="list">
            <li><Link href="/exams">All exams</Link></li>
            <li><Link href="/e-library">E-Library</Link></li>
            <li><Link href="/current-affairs">Current affairs</Link></li>
            <li><Link href="/about">About Drona</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/sitemap">Sitemap</Link></li>
            {(settings.footerLinks ?? []).map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
          <h3 className={s.legalHead}>
            <T k="footer.legal" />
          </h3>
          <ul role="list">
            <li><Link href="/privacy">Privacy policy</Link></li>
            <li><Link href="/terms">Terms of use</Link></li>
            <li><Link href="/refund">Refund policy</Link></li>
          </ul>
        </nav>

        <div className={s.col}>
          <h3>
            <T k="footer.contact" />
          </h3>
          <ul role="list" className={s.contact}>
            {settings.email && (
              <li><Mail size={17} /><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            )}
            {settings.phone && (
              <li><Phone size={17} /><span>{settings.phone}</span></li>
            )}
            {settings.address && (
              <li><MapPin size={17} /><span>{settings.address}</span></li>
            )}
            {settings.workingHours && (
              <li><Clock size={17} /><span>{settings.workingHours}</span></li>
            )}
          </ul>
          <NewsletterForm />
        </div>
      </div>
      <div className={s.bottom}>
        <div className={`container ${s.bottomInner}`}>
          <p>
            © {new Date().getFullYear()} {settings.siteName}. <T k="footer.rights" />
          </p>
          <LangToggle />
        </div>
      </div>
    </footer>
  );
}
