import type { Metadata } from "next";
import { Suspense } from "react";
import { Library } from "lucide-react";
import { ShelfBrowser } from "@/components/content/ShelfBrowser";
import { PageHero } from "@/components/layout/PageHero";
import { getProducts, getSettings } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "E-Library – Books, Notes & Video Courses",
  description: "Latest editions of books, notes, magazines and video courses for CDS, AFCAT, NDA, UPSC, CUET and more.",
  alternates: { canonical: "/e-library" },
};

export default async function ELibraryPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <>
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "E-Library", href: "/e-library" }]}
        icon={<Library size={34} />}
        title="E-Library"
        sub="Latest editions of books, notes, magazines and video courses."
      />
      <section className="section" style={{ paddingTop: "var(--sp-10)" }}>
        <div className="container">
          <Suspense>
            <ShelfBrowser products={products} shelves={settings.elibraryCollections ?? []} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
