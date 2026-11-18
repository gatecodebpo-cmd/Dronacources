export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export const pctOff = (mrp?: number, sale?: number) => (mrp && sale && mrp > sale ? Math.round(((mrp - sale) / mrp) * 100) : 0);

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const fmtDate = (d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(d).toLocaleDateString("en-IN", opts);

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

/** wa.me needs digits only, with country code. Assumes India (91) when a 10-digit number is given. */
export function waLink(phone?: string, text = "Hi Drona, I need help choosing a test series.") {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const full = digits.length === 10 ? "91" + digits : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

export const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const TEST_TYPE_LABEL: Record<string, string> = {
  MOCK: "Mock Test",
  TOPIC_WISE: "Topic-Wise",
  PREVIOUS_YEAR: "Previous Year",
  QUIZ: "Daily Quiz",
  CURRENT_AFFAIRS: "Current Affairs",
};
