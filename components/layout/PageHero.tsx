import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { breadcrumbLd, JsonLd } from "@/lib/seo";
import s from "./PageHero.module.css";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, onDark }: { items: Crumb[]; onDark?: boolean }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <nav aria-label="Breadcrumb" className={s.crumbs} data-dark={onDark || undefined}>
        <ol>
          {items.map((c, i) => (
            <li key={c.href}>
              {i < items.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
              {i < items.length - 1 && <ChevronRight size={14} aria-hidden />}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/** Dark navy banner used at the top of inner pages. */
export function PageHero({ crumbs, title, sub, icon, children, compact }: { crumbs?: Crumb[]; title: ReactNode; sub?: ReactNode; icon?: ReactNode; children?: ReactNode; compact?: boolean }) {
  return (
    <section className={s.hero} data-compact={compact || undefined}>
      <span className={s.pattern} aria-hidden />
      <div className={`container ${s.inner}`}>
        {crumbs && <Breadcrumbs items={crumbs} onDark />}
        <div className={s.titleRow}>
          {icon && <span className={s.icon}>{icon}</span>}
          <div>
            <h1>{title}</h1>
            {sub && <p className={s.sub}>{sub}</p>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
