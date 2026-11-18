import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-devanagari", display: "swap", preload: false });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B1F3A" },
    { media: "(prefers-color-scheme: dark)", color: "#0A120D" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seoDefaults?.title || `${s.siteName} – ${s.tagline}`;
  const description =
    s.seoDefaults?.description ||
    "Mock tests, free daily quizzes, previous year papers and an e-library for NDA, CDS, AFCAT, Agniveer, police, SSC and other government exams.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${s.siteName}` },
    description,
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: { type: "website", siteName: s.siteName, title, description, images: s.seoDefaults?.ogImage ? [s.seoDefaults.ogImage] : undefined, locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Sets data-theme before first paint to avoid a light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem('drona-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;if(localStorage.getItem('drona-lang')==='hi')document.documentElement.lang='hi'}catch(e){}})();`;

const safeColour = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : null);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const c = s.colours ?? {};
  const vars = [
    ["--color-primary", safeColour(c.primary)],
    ["--color-primary-light", safeColour(c.primaryLight)],
    ["--color-accent", safeColour(c.accent)],
    ["--color-olive", safeColour(c.olive)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return (
    <html lang="en" className={`${body.variable} ${deva.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {vars && <style dangerouslySetInnerHTML={{ __html: `:root{${vars}}` }} />}
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
