import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar, WhatsAppFab } from "@/components/layout/SiteChrome";
import { PageTransition } from "@/components/layout/PageTransition";
import { getAnnouncement, getCategories, getNavData, getSettings } from "@/lib/data";
import { waLink } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, categories, ann] = await Promise.all([getSettings(), getNavData(), getCategories(), getAnnouncement()]);
  const wa = waLink(settings.whatsappNumber);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {ann && <AnnouncementBar id={`${ann._id}-${ann.updatedAt}`} text={ann.text} link={ann.link} />}
      <Header nav={nav} tagline={settings.tagline} logo={settings.logo} />
      <main id="main">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer settings={settings} categories={categories} />
      {wa && <WhatsAppFab href={wa} />}
    </>
  );
}
