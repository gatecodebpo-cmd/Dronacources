// Edge-safe (used by middleware): plain data only.
const CONTENT = [
  "categories", "groups", "exams", "tests", "questions", "quizzes", "products", "hero", "stats",
  "testimonials", "toppers", "faculty", "blog", "faqs", "announcements", "pages",
];
const SUPPORT = ["leads", "students", "orders", "attempts"];

export function sectionRoles(section: string): string[] {
  if (section === "" || section === "profile") return ["ADMIN", "EDITOR", "SUPPORT"];
  if (CONTENT.includes(section)) return ["ADMIN", "EDITOR"];
  if (SUPPORT.includes(section)) return ["ADMIN", "SUPPORT"];
  return ["ADMIN"]; // coupons, keys, settings, users and anything new
}
