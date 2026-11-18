import type { Metadata } from "next";
import Link from "next/link";
import { Map } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { getCategories, getExams, getPosts, getProducts } from "@/lib/data";
import s from "@/components/content/Content.module.css";

export const revalidate = 300;
export const metadata: Metadata = { title: "Sitemap", description: "Every page on Drona in one place.", alternates: { canonical: "/sitemap" } };

export default async function SitemapPage() {
  const [cats, exams, posts, products] = await Promise.all([getCategories(), getExams(), getPosts(), getProducts()]);
  const byCat = (slug: string) => exams.filter((e) => e.category?.slug === slug);
  return (
    <>
      <PageHero crumbs={[{ name: "Home", href: "/" }, { name: "Sitemap", href: "/sitemap" }]} icon={<Map size={32} />} title="Sitemap" compact />
      <section className="section" style={{ paddingTop: "var(--sp-10)" }}>
        <div className={`container ${s.sitemapGrid}`}>
          <nav aria-label="Main pages">
            <h2>Pages</h2>
            <ul>
              {[
                ["/", "Home"], ["/exams", "All exams"], ["/e-library", "E-Library"], ["/current-affairs", "Current affairs"], ["/about", "About"],
                ["/contact", "Contact"], ["/login", "Log in"], ["/signup", "Sign up"], ["/privacy", "Privacy policy"], ["/terms", "Terms of use"], ["/refund", "Refund policy"],
              ].map(([h, l]) => (
                <li key={h}><Link href={h!}>{l}</Link></li>
              ))}
            </ul>
          </nav>
          {cats.filter((c) => byCat(c.slug).length).map((c) => (
            <nav key={c._id} aria-label={c.name}>
              <h2><Link href={`/exams/${c.slug}`}>{c.name}</Link></h2>
              <ul>
                {byCat(c.slug).map((e) => (
                  <li key={e._id}><Link href={`/exam/${e.slug}`}>{e.name}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="E-Library">
            <h2>E-Library</h2>
            <ul>
              {products.map((p: any) => (
                <li key={p._id}><Link href={`/e-library/${p.slug}`}>{p.title}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Articles">
            <h2>Articles</h2>
            <ul>
              {posts.map((p: any) => (
                <li key={p._id}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
