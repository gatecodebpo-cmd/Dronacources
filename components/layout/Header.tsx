"use client";
import { AnimatePresence, m } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ActivationKeyButton } from "@/components/flows/ActivationKey";
import { Bi, useLang, useTheme } from "@/components/providers/Providers";
import { buttonClass } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Overlay";
import type { NavData } from "@/lib/data";
import { useNav } from "@/lib/useNav";
import { Skeleton } from "@/components/ui/Misc";
import { Icon } from "@/lib/icons";
import { cx } from "@/lib/utils";
import { ExamSearch } from "./ExamSearch";
import { Logo } from "./Logo";
import s from "./Header.module.css";

const LINKS = [
  { href: "/e-library", k: "nav.elibrary" },
  { href: "/current-affairs", k: "nav.currentAffairs" },
  { href: "/about", k: "nav.about" },
  { href: "/contact", k: "nav.contact" },
] as const;

export function Header({ tagline, logo }: { tagline: string; logo?: string }) {
  const { t } = useLang();
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const nav = useNav(mega || drawer);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => (setMega(false), setDrawer(false)), [pathname]);

  const role = (session?.user as any)?.role as string | undefined;
  const dashHref = role && role !== "STUDENT" ? "/admin" : "/dashboard";

  return (
    <header className={cx(s.header, scrolled && s.scrolled)}>
      <div className={cx("container", s.bar)}>
        <Logo tagline={tagline} logo={logo} />

        <nav className={s.nav} aria-label="Main">
          <button className={cx(s.navLink, mega && s.navActive)} aria-expanded={mega} aria-controls="mega" onClick={() => setMega((m) => !m)}>
            {t("nav.exams")} <ChevronDown size={16} className={s.chev} />
          </button>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={cx(s.navLink, pathname.startsWith(l.href) && s.navActive)}>
              {t(l.k)}
            </Link>
          ))}
        </nav>

        <div className={s.actions}>
          <button className={s.iconBtn} onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"}>
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          {session ? (
            <Link href={dashHref} className={cx(buttonClass({ variant: "outline", size: "sm" }), s.desktopOnly)}>
              <LayoutDashboard size={16} /> {t("nav.dashboard")}
            </Link>
          ) : (
            <Link href="/login" className={cx(buttonClass({ variant: "ghost", size: "sm" }), s.desktopOnly)}>
              {t("nav.login")}
            </Link>
          )}
          <Link href="/exam/afcat" className={cx(buttonClass({ variant: "primary", size: "sm" }), s.startFree)}>
            {t("nav.startFree")}
          </Link>
          <button className={cx(s.iconBtn, s.menuBtn)} onClick={() => setDrawer(true)} aria-label={t("nav.menu")} aria-expanded={drawer}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>{mega && (nav ? <MegaPanel key="mega" nav={nav} onClose={() => setMega(false)} /> : <div key="mega-loading" className={s.mega}><div className={cx("container", s.megaInner)} aria-busy="true" aria-label="Loading exams"><Skeleton h={48} w="min(560px, 100%)" r={12} /><div style={{ display: "grid", gap: 10, marginTop: 24 }}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={18} w={260} />)}</div></div></div>)}</AnimatePresence>

      <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" title={<Logo tagline={tagline} logo={logo} />} className={s.drawer}>
        {nav ? <MobileMenu nav={nav} session={!!session} dashHref={dashHref} onNavigate={() => setDrawer(false)} /> : <div style={{ display: "grid", gap: 12 }} aria-busy="true" aria-label="Loading menu">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} h={40} r={10} />)}</div>}
      </Drawer>
    </header>
  );
}

function MegaPanel({ nav, onClose }: { nav: NavData; onClose: () => void }) {
  const { t } = useLang();
  const [cat, setCat] = useState(nav.categories.find((c) => c.slug === "defence-police")?._id ?? nav.categories[0]?._id);
  const ref = useRef<HTMLDivElement>(null);
  const current = nav.categories.find((c) => c._id === cat);
  const groups = nav.groups.filter((g) => g.category === cat);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest("[aria-controls=mega]") && onClose();
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => (document.removeEventListener("keydown", onKey), document.removeEventListener("mousedown", onDown));
  }, [onClose]);

  return (
    <m.div
      id="mega"
      ref={ref}
      className={s.mega}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cx("container", s.megaInner)}>
        <div className={s.megaSearch}>
          <ExamSearch exams={nav.exams} autoFocus onNavigate={onClose} />
          <Link href="/exams" className={buttonClass({ variant: "outline", size: "sm" })} onClick={onClose}>
            {t("nav.allExams")}
          </Link>
        </div>
        <div className={s.megaGrid}>
          <ul className={s.catList} role="list">
            {nav.categories.map((c) => (
              <li key={c._id}>
                <button
                  className={cx(s.catBtn, c._id === cat && s.catActive)}
                  onMouseEnter={() => setCat(c._id)}
                  onFocus={() => setCat(c._id)}
                  onClick={() => setCat(c._id)}
                >
                  <Icon name={c.icon} size={18} />
                  <span>
                    <Bi en={c.name} hi={c.nameHi} />
                  </span>
                  <ChevronRight size={15} className={s.catChev} />
                </button>
              </li>
            ))}
          </ul>
          <div className={s.groupPane}>
            {current && (
              <>
                <div className={s.groupHead}>
                  <h3>
                    <Bi en={current.name} hi={current.nameHi} />
                  </h3>
                  <Link href={`/exams/${current.slug}`} onClick={onClose} className={s.seeAll}>
                    {t("common.viewAll")} ({current.examCount})
                  </Link>
                </div>
                {groups.length ? (
                  <ul className={s.groupGrid} role="list">
                    {groups.map((g) => (
                      <li key={g._id}>
                        <Link href={`/exams/${current.slug}/${g.slug}`} onClick={onClose} className={s.groupLink}>
                          {g.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={s.groupEmpty}>Open the category to see every exam we cover here.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </m.div>
  );
}

const listV = { show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } } };
const itemV = { hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } };

function MobileMenu({ nav, session, dashHref, onNavigate }: { nav: NavData; session: boolean; dashHref: string; onNavigate: () => void }) {
  const { t, lang, setLang } = useLang();
  const [level, setLevel] = useState<string | null>(null);
  const cat = nav.categories.find((c) => c._id === level);

  return (
    <div className={s.mobile}>
      <ExamSearch exams={nav.exams} onNavigate={onNavigate} />
      <AnimatePresence mode="wait" initial={false}>
        {!cat ? (
          <m.ul key="l1" className={s.mList} variants={listV} initial="hidden" animate="show" exit={{ opacity: 0, x: -30 }}>
            <m.li variants={itemV}>
              <p className={s.mLabel}>{t("nav.exams")}</p>
            </m.li>
            {nav.categories.slice(0, 12).map((c) => (
              <m.li key={c._id} variants={itemV}>
                <button className={s.mItem} onClick={() => setLevel(c._id)}>
                  <Icon name={c.icon} size={18} />
                  <span>
                    <Bi en={c.name} hi={c.nameHi} />
                  </span>
                  <ChevronRight size={18} />
                </button>
              </m.li>
            ))}
            <m.li variants={itemV}>
              <Link href="/exams" className={s.mItem} onClick={onNavigate}>
                <span>{t("nav.allExams")}</span>
                <ChevronRight size={18} />
              </Link>
            </m.li>
            <m.li variants={itemV} className={s.mDivider} />
            {LINKS.map((l) => (
              <m.li key={l.href} variants={itemV}>
                <Link href={l.href} className={s.mItem} onClick={onNavigate}>
                  <span>{t(l.k)}</span>
                </Link>
              </m.li>
            ))}
            <m.li variants={itemV} className={s.mDivider} />
            <m.li variants={itemV} className={s.mButtons}>
              <ActivationKeyButton className={buttonClass({ variant: "outline", block: true })} />
              {session ? (
                <>
                  <Link href={dashHref} className={buttonClass({ variant: "secondary", block: true })} onClick={onNavigate}>
                    <LayoutDashboard size={18} /> {t("nav.dashboard")}
                  </Link>
                  <button className={buttonClass({ variant: "ghost", block: true })} onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut size={18} /> {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link href="/login" className={buttonClass({ variant: "secondary", block: true })} onClick={onNavigate}>
                  <UserRound size={18} /> {t("nav.login")}
                </Link>
              )}
              <button className={buttonClass({ variant: "ghost", block: true })} onClick={() => setLang(lang === "en" ? "hi" : "en")}>
                {lang === "en" ? "हिन्दी में देखें" : "View in English"}
              </button>
            </m.li>
          </m.ul>
        ) : (
          <m.ul key={cat._id} className={s.mList} variants={listV} initial="hidden" animate="show" exit={{ opacity: 0, x: 30 }}>
            <m.li variants={itemV}>
              <button className={s.mBack} onClick={() => setLevel(null)}>
                <ChevronLeft size={18} /> {t("nav.back")}
              </button>
            </m.li>
            <m.li variants={itemV}>
              <Link href={`/exams/${cat.slug}`} className={cx(s.mItem, s.mStrong)} onClick={onNavigate}>
                <Icon name={cat.icon} size={18} />
                <span>
                  <Bi en={cat.name} hi={cat.nameHi} /> · {t("common.viewAll")}
                </span>
              </Link>
            </m.li>
            {nav.groups
              .filter((g) => g.category === cat._id)
              .map((g) => (
                <m.li key={g._id} variants={itemV}>
                  <Link href={`/exams/${cat.slug}/${g.slug}`} className={s.mItem} onClick={onNavigate}>
                    <span>{g.name}</span>
                    <ChevronRight size={18} />
                  </Link>
                </m.li>
              ))}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
