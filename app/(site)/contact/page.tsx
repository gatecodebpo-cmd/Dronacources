import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/content/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import { IconBox } from "@/components/ui/Misc";
import { getExams, getSettings } from "@/lib/data";
import { waLink } from "@/lib/utils";
import s from "@/components/content/Content.module.css";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Contact Drona",
  description: "Questions about tests, payments or activation keys? Message Drona on WhatsApp, email dronacourses@gmail.com or use the contact form.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [settings, exams] = await Promise.all([getSettings(), getExams({ isPopular: true })]);
  const wa = waLink(settings.whatsappNumber);
  const safeMap = settings.mapEmbed && /^https:\/\/(www\.)?google\.[a-z.]+\/maps/.test(settings.mapEmbed) ? settings.mapEmbed : null;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]}
        icon={<MessageCircle size={34} />}
        title="Talk to us"
        sub="Ask about a test series, a payment or an activation key."
      />
      <section className="section">
        <div className={`container ${s.contactGrid}`}>
          <div className={s.contactCards}>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={s.contactCard}>
                <IconBox tone="success">
                  <MessageCircle size={22} />
                </IconBox>
                <div>
                  <strong>WhatsApp</strong>
                  <span>Fastest reply. Tap to start a chat.</span>
                </div>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className={s.contactCard}>
                <IconBox tone="gold">
                  <Mail size={22} />
                </IconBox>
                <div>
                  <strong>Email</strong>
                  <span>{settings.email}</span>
                </div>
              </a>
            )}
            {settings.phone && (
              <div className={s.contactCard}>
                <IconBox>
                  <Phone size={22} />
                </IconBox>
                <div>
                  <strong>Phone</strong>
                  <span>{settings.phone}</span>
                </div>
              </div>
            )}
            {settings.address && (
              <div className={s.contactCard}>
                <IconBox tone="olive">
                  <MapPin size={22} />
                </IconBox>
                <div>
                  <strong>Address</strong>
                  <span>{settings.address}</span>
                </div>
              </div>
            )}
            {settings.workingHours && (
              <div className={s.contactCard}>
                <IconBox tone="info">
                  <Clock size={22} />
                </IconBox>
                <div>
                  <strong>Working hours</strong>
                  <span>{settings.workingHours}</span>
                </div>
              </div>
            )}
          </div>
          <div className={s.formCard}>
            <h2>Send us a message</h2>
            <p style={{ color: "var(--color-muted)" }}>Share your number and the exam you're preparing for, and we'll suggest the right test series.</p>
            <ContactForm exams={[...exams.map((e) => e.name), "Other"]} />
          </div>
        </div>
        {safeMap && (
          <div className="container">
            <iframe src={safeMap} className={s.map} title="Drona office location on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
      </section>
    </>
  );
}
