import { LegalPage, legalMeta } from "@/components/content/LegalPage";

export const revalidate = 300;
export const generateMetadata = () => legalMeta("privacy");

export default function Page() {
  return <LegalPage slug="privacy" />;
}
