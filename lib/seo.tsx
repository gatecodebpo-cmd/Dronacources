import { SITE_URL } from "./utils";

/** Renders schema.org JSON-LD. `<` is escaped so CMS text can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const orgLd = (s: { siteName: string; tagline: string; email?: string; logo?: string; socials?: Record<string, string> }) => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: s.siteName,
  slogan: s.tagline,
  url: SITE_URL,
  email: s.email,
  logo: s.logo ? new URL(s.logo, SITE_URL).toString() : undefined,
  sameAs: Object.values(s.socials ?? {}).filter((v) => /^https?:\/\//.test(v)),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

export const breadcrumbLd = (items: { name: string; href: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: new URL(it.href, SITE_URL).toString() })),
});

export const courseLd = (c: { name: string; description?: string; url: string }) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: c.name,
  description: c.description,
  url: new URL(c.url, SITE_URL).toString(),
  provider: { "@type": "Organization", name: "Drona", sameAs: SITE_URL },
});

export const stripHtml = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
