import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Check, KeyRound, ShieldCheck, ShoppingCart } from "lucide-react";
import { ActivationKeyButton } from "@/components/flows/ActivationKey";
import { Breadcrumbs } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { getProduct } from "@/lib/data";
import { Icon } from "@/lib/icons";
import { JsonLd } from "@/lib/seo";
import { inr, pctOff, SITE_URL } from "@/lib/utils";
import s from "@/components/content/Content.module.css";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.description?.slice(0, 160), alternates: { canonical: `/e-library/${p.slug}` } };
}

const TYPE_LABEL: Record<string, string> = { VIDEO_COURSE: "Video course", ELIBRARY: "E-Library", BUNDLE: "Bundle" };

export default async function ProductPage({ params }: P) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const off = pctOff(p.mrp, p.salePrice);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.title,
          description: p.description,
          offers: { "@type": "Offer", price: p.salePrice, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE_URL}/e-library/${p.slug}` },
        }}
      />
      <section className="section" style={{ paddingTop: "var(--sp-8)" }}>
        <div className="container">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "E-Library", href: "/e-library" }, { name: p.title, href: `/e-library/${p.slug}` }]} />
          <div className={s.productLayout}>
            <div className={s.productMedia}>
              {p.thumbnail && <Image src={p.thumbnail} alt={p.title} fill priority sizes="(max-width: 900px) 100vw, 600px" unoptimized={p.thumbnail.endsWith(".svg")} />}
              {off > 0 && <span className={s.offBadge}>{off}% OFF</span>}
            </div>
            <div className={s.productInfo}>
              <Badge tone="gold">{TYPE_LABEL[p.type] ?? p.type}</Badge>
              <h1>{p.title}</h1>
              <p className={s.lead}>{p.description}</p>
              <div className={s.priceBlock}>
                <strong>{inr(p.salePrice ?? 0)}</strong>
                {off > 0 && (
                  <>
                    <s>{inr(p.mrp)}</s>
                    <Badge tone="success">Save {inr((p.mrp ?? 0) - (p.salePrice ?? 0))}</Badge>
                  </>
                )}
              </div>
              {!!p.includes?.length && (
                <div className={s.includesBox}>
                  <h2>What's included</h2>
                  <ul>
                    {p.includes.map((i: any) => (
                      <li key={i.label}>
                        <Check size={18} strokeWidth={2.5} />
                        <span>
                          <strong>{i.count}</strong> {i.label}
                        </span>
                      </li>
                    ))}
                    <li>
                      <CalendarClock size={18} />
                      <span>
                        <strong>{p.validityDays ?? 365} days</strong> access
                      </span>
                    </li>
                  </ul>
                </div>
              )}
              <div className={s.ctaRow}>
                <Link href={`/checkout?product=${p.slug}`} className={buttonClass({ size: "lg" })}>
                  <ShoppingCart size={20} /> Buy now for {inr(p.salePrice ?? 0)}
                </Link>
                <ActivationKeyButton className={buttonClass({ variant: "outline", size: "lg" })}>
                  <KeyRound size={18} /> Have a key?
                </ActivationKeyButton>
              </div>
              <p className={s.secure}>
                <ShieldCheck size={16} /> Instant access after payment. Digital products follow our <Link href="/refund">refund policy</Link>.
              </p>
              {!!p.exams?.length && (
                <div className={s.forExams}>
                  <h2>Useful for</h2>
                  <div>
                    {p.exams.map((e: any) => (
                      <Link key={e._id} href={`/exam/${e.slug}`} className={s.examPill}>
                        <Icon name={e.icon} size={16} /> {e.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
