import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PostBrowser } from "@/components/content/ContentClient";
import { PageHero } from "@/components/layout/PageHero";
import { getPosts } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Current Affairs & Exam Guides",
  description: "Daily and weekly current affairs for defence, police and SSC exams, plus preparation strategy guides from Drona's mentors.",
  alternates: { canonical: "/current-affairs" },
};

export default async function CurrentAffairsPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "Current affairs", href: "/current-affairs" }]}
        icon={<Newspaper size={34} />}
        title="Current affairs & guides"
        sub="Exam-relevant news in short digests, plus strategy notes from mentors who have cleared these exams."
      />
      <section className="section" style={{ paddingTop: "var(--sp-10)" }}>
        <div className="container">
          <PostBrowser posts={posts} />
        </div>
      </section>
    </>
  );
}
