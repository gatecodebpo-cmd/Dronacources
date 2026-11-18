import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, UserRound } from "lucide-react";
import { PostCard } from "@/components/cards/Cards";
import { ReadingProgress, ShareButtons } from "@/components/content/ContentClient";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { Badge, Chip } from "@/components/ui/Badge";
import { SectionHead } from "@/components/ui/Misc";
import { getPost } from "@/lib/data";
import { JsonLd } from "@/lib/seo";
import { fmtDate, SITE_URL } from "@/lib/utils";
import s from "@/components/content/Content.module.css";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = await getPost((await params).slug);
  if (!d) return {};
  const { post } = d;
  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title, description, publishedTime: post.publishedAt, images: post.coverImage && !post.coverImage.endsWith(".svg") ? [post.coverImage] : undefined },
  };
}

export default async function ArticlePage({ params }: P) {
  const d = await getPost((await params).slug);
  if (!d) notFound();
  const { post, related } = d;
  const listHref = "/current-affairs";
  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": post.type === "CURRENT_AFFAIRS" ? "NewsArticle" : "Article",
          headline: post.title,
          datePublished: post.publishedAt,
          author: { "@type": "Person", name: post.author || "Drona" },
          publisher: { "@type": "Organization", name: "Drona" },
          mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        }}
      />
      <article className="section" style={{ paddingTop: "var(--sp-8)" }}>
        <div className="container">
          <div className={s.article}>
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Current affairs", href: listHref }, { name: post.title, href: `/blog/${post.slug}` }]} />
            <header className={s.articleHead}>
              <div>
                <Badge tone={post.type === "CURRENT_AFFAIRS" ? "gold" : "navy"}>{post.category}</Badge>
              </div>
              <h1>{post.title}</h1>
              {post.excerpt && <p className={s.lead}>{post.excerpt}</p>}
              <div className={s.meta}>
                {post.author && (
                  <span>
                    <UserRound size={15} /> {post.author}
                  </span>
                )}
                <span>
                  <CalendarDays size={15} /> <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time>
                </span>
                <span>
                  <Clock size={15} /> {post.readMinutes} min read
                </span>
              </div>
            </header>
            {post.coverImage && (
              <div className={s.cover}>
                <Image src={post.coverImage} alt="" fill priority sizes="(max-width: 820px) 100vw, 780px" unoptimized={post.coverImage.endsWith(".svg")} />
              </div>
            )}
            <div className={`prose ${s.articleBody}`} dangerouslySetInnerHTML={{ __html: post.body ?? "" }} />
            {!!post.tags?.length && (
              <div className={s.tags}>
                {post.tags.map((t: string) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
              </div>
            )}
            <ShareButtons title={post.title} />
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead title="Keep reading" />
            <div className={s.grid3}>
              {related.map((p: any) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
