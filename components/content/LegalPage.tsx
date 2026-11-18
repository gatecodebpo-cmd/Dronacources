import { FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { getPage } from "@/lib/data";
import { fmtDate } from "@/lib/utils";
import s from "./Content.module.css";

/** Shared renderer for /privacy, /terms and /refund (content from the Pages collection). */
export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero crumbs={[{ name: "Home", href: "/" }, { name: page.title, href: `/${slug}` }]} icon={<FileText size={32} />} title={page.title} compact />
      <section className="section" style={{ paddingTop: "var(--sp-10)" }}>
        <div className={`container ${s.legal}`}>
          <p className={s.updated}>Last updated {fmtDate(page.updatedAt)}</p>
          <div className="prose" dangerouslySetInnerHTML={{ __html: page.body ?? "" }} />
        </div>
      </section>
    </>
  );
}

export async function legalMeta(slug: string) {
  const page = await getPage(slug);
  return page ? { title: page.seo?.title || page.title, description: page.seo?.description, alternates: { canonical: `/${slug}` } } : {};
}
