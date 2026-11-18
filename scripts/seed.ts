/* eslint-disable no-console */
// `npm run seed` – wipes the database and fills it with demo data. Reads MONGODB_URI from .env.local.
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  ActivationKey, Announcement, Attempt, BlogPost, Category, Coupon, Exam, ExamGroup, FAQ, Faculty, HeroSlide, Lead, Order, Page,
  Product, Question, SiteSettings, Stat, Subscriber, Test, Testimonial, Topper, User,
} from "../models";
import { scoreAttempt, simulatedRank } from "../lib/scoring";
import { connectWithDnsFallback } from "../lib/db";
import { slugify } from "../lib/utils";
import { questions as Q } from "./data/questions";
import { detailedExams, lightExams, type SeedExam } from "./data/exams";
import * as C from "./data/content";

const DEMO = "[Demo data – confirm with client]";
const FEATURES = [
  "Real-time Test Experience",
  "Most Relevant Exam Questions",
  "Detailed & Accurate Explanations",
  "Exam-centric Quality Content",
  "Performance Analysis with State & All-India Rank",
  "Re-attempt & Improve Weak Areas",
];

/* ---------- deterministic pseudo-random so every seed run looks the same ---------- */
let rs = 42;
const rand = () => ((rs = (rs * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)]!;
const daysAgo = (d: number, h = 9) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  x.setHours(h, 0, 0, 0);
  return x;
};

/* ---------- generated SVG artwork (covers, thumbnails) ---------- */
const OUT = path.join(process.cwd(), "public", "uploads", "demo");
function svgArt(file: string, opts: { from: string; to: string; label: string; glyph: "book" | "play" | "news" | "target" | "chart" | "shield" }) {
  const glyphs = {
    book: `<path d="M560 250h120a40 40 0 0 1 40 40v200a30 30 0 0 0-30-30H560Z M560 250H440a40 40 0 0 0-40 40v200a30 30 0 0 1 30-30h130Z" fill="none" stroke="#F5A524" stroke-width="14" stroke-linejoin="round"/>`,
    play: `<circle cx="560" cy="370" r="110" fill="none" stroke="#F5A524" stroke-width="14"/><path d="M530 315v110l90-55Z" fill="#F5A524"/>`,
    news: `<rect x="440" y="260" width="240" height="220" rx="24" fill="none" stroke="#F5A524" stroke-width="14"/><path d="M480 310h160M480 350h160M480 390h100M480 430h120" stroke="#F5A524" stroke-width="12" stroke-linecap="round"/>`,
    target: `<circle cx="560" cy="370" r="120" fill="none" stroke="#F5A524" stroke-width="12"/><circle cx="560" cy="370" r="70" fill="none" stroke="#F5A524" stroke-width="12"/><circle cx="560" cy="370" r="22" fill="#F5A524"/>`,
    chart: `<path d="M450 470V380M520 470V320M590 470V350M660 470V270" stroke="#F5A524" stroke-width="34" stroke-linecap="round"/>`,
    shield: `<path d="M560 240l120 46v88c0 76-51 131-120 152-69-21-120-76-120-152v-88Z" fill="none" stroke="#F5A524" stroke-width="14" stroke-linejoin="round"/><path d="M560 300l45 80h-30v55h-30v-55h-30Z" fill="#F5A524"/>`,
  };
  const contours = Array.from({ length: 9 }, (_, i) => `<ellipse cx="${180 + i * 6}" cy="${560 - i * 4}" rx="${120 + i * 70}" ry="${70 + i * 42}" fill="none" stroke="#fff" stroke-opacity="${0.12 - i * 0.01}" stroke-width="2"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 700" width="1120" height="700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${opts.from}"/><stop offset="1" stop-color="${opts.to}"/></linearGradient><radialGradient id="r" cx=".8" cy=".2" r=".6"><stop offset="0" stop-color="#F5A524" stop-opacity=".28"/><stop offset="1" stop-color="#F5A524" stop-opacity="0"/></radialGradient></defs><rect width="1120" height="700" fill="url(#g)"/><rect width="1120" height="700" fill="url(#r)"/>${contours}${glyphs[opts.glyph]}<text x="60" y="640" font-family="Poppins,Segoe UI,Arial,sans-serif" font-size="34" font-weight="600" fill="#fff" fill-opacity=".85">${opts.label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text></svg>`;
  fs.writeFileSync(path.join(OUT, file), svg);
  return `/uploads/demo/${file}`;
}

/* ---------- categories ---------- */
const CATEGORIES: [string, string, string, string][] = [
  ["E-Library", "ई-लाइब्रेरी", "Library", "Books, revision notes and guides for every major exam."],
  ["Defence & Police", "रक्षा और पुलिस", "Shield", "NDA, CDS, AFCAT, Agniveer, CAPF and every state police force."],
  ["SSC", "एसएससी", "ClipboardCheck", "CGL, CHSL, MTS, GD, CPO, Stenographer and Selection Post."],
  ["Civil Services", "सिविल सेवा", "Landmark", "UPSC and State PSC prelims practice."],
  ["Government Exams", "सरकारी परीक्षाएँ", "Building2", "Central and state recruitment exams, plus core skills like English."],
  ["CUET", "सीयूईटी", "GraduationCap", "CUET UG domain and general test practice."],
  ["Banking", "बैंकिंग", "Banknote", "IBPS, SBI and RBI exams."],
  ["Medical", "मेडिकल", "Stethoscope", "NEET and nursing entrance tests."],
  ["Law, Arts & Commerce", "लॉ, आर्ट्स और कॉमर्स", "Gavel", "CLAT, AILET and university entrances."],
  ["Engineering Entrance", "इंजीनियरिंग प्रवेश", "Cpu", "JEE and state CETs such as KCET."],
  ["Management", "मैनेजमेंट", "Briefcase", "CAT, MAT and other MBA entrances."],
  ["Professional Certification Courses", "प्रोफेशनल सर्टिफ़िकेशन", "BadgeCheck", "NISM and other certification exams."],
  ["Teaching", "शिक्षण", "Presentation", "CTET, state TETs and KVS."],
  ["Computer & Information Technology", "कंप्यूटर और आईटी", "Monitor", "CCC, O Level and computer awareness."],
  ["Graduate Engineering", "ग्रेजुएट इंजीनियरिंग", "Wrench", "GATE and engineering services."],
  ["Railway", "रेलवे", "TrainFront", "RRB NTPC, Group D, ALP and JE."],
  ["PSUs & Research", "पीएसयू और रिसर्च", "FlaskConical", "ISRO, DRDO and PSU recruitment."],
  ["Finance", "फ़ाइनेंस", "Wallet", "CA Foundation and finance exams."],
  ["Insurance", "बीमा", "Umbrella", "LIC, NIACL and other insurance exams."],
  ["School Level – All India", "स्कूल स्तर – अखिल भारतीय", "School", "NTSE, Olympiads and Sainik School entrance."],
  ["School Level – State Boards", "स्कूल स्तर – राज्य बोर्ड", "BookOpen", "Board exam practice for state syllabi."],
  ["Foreign Education", "विदेश शिक्षा", "Globe2", "IELTS, TOEFL, GRE and GMAT."],
  ["Professional Courses", "प्रोफेशनल कोर्स", "ScrollText", "CS, CMA and other professional programmes."],
  ["Designing", "डिज़ाइनिंग", "Palette", "NID, NIFT and UCEED."],
  ["IT Placement Papers", "आईटी प्लेसमेंट पेपर्स", "Code2", "TCS, Infosys, Wipro and Accenture tests."],
  ["Driving License", "ड्राइविंग लाइसेंस", "Car", "Learner's licence test practice."],
];

const DEFENCE_GROUPS = [
  "UPSC NDA", "UPSC CDS", "Indian Air Force", "Indian Army", "Indian Navy", "Territorial Army", "Coast Guard", "CAPF", "BSF", "CRPF", "CISF",
  "Assam Rifles", "Intelligence Bureau", "SSB", "MES", "IMU CET", "Delhi Police", "UP Police", "Bihar Police", "MP Police", "Rajasthan Police",
  "Haryana Police", "Punjab Police", "Maharashtra Police", "Karnataka State Police", "Kerala Police", "Telangana Police", "AP Police",
  "West Bengal Police", "Odisha Police", "Assam Police", "Jharkhand Police", "Chhattisgarh Police", "HP Police", "J&K Police", "Goa Police",
  "Meghalaya Police", "Ladakh Police", "Puducherry Police", "TNUSRB",
];
const SSC_GROUPS = ["CGL", "CHSL", "MTS", "GD", "CPO", "Stenographer", "Selection Post"];

// [category slug, group name, exam name, icon, popular]
const EXTRA_EXAMS: [string, string, string, string, boolean?][] = [
  ["government-exams", "English Skills", "Vocabulary", "Languages", true],
  ["government-exams", "English Skills", "English Grammar", "PenTool", true],
  ["engineering-entrance", "State CETs", "KCET", "Cpu", true],
  ["engineering-entrance", "JEE", "JEE Main", "Calculator"],
  ["civil-services", "UPSC", "UPSC CSE Prelims", "Landmark"],
  ["civil-services", "State PSC", "UPPSC PCS Prelims", "Landmark"],
  ["cuet", "CUET UG", "CUET UG General Test", "GraduationCap"],
  ["banking", "IBPS", "IBPS PO", "Banknote"],
  ["banking", "SBI", "SBI Clerk", "Banknote"],
  ["medical", "NEET", "NEET UG", "Stethoscope"],
  ["law-arts-commerce", "CLAT", "CLAT UG", "Gavel"],
  ["management", "MBA Entrances", "CAT", "Briefcase"],
  ["professional-certification-courses", "NISM", "NISM Series V-A", "BadgeCheck"],
  ["teaching", "CTET", "CTET Paper 1", "Presentation"],
  ["computer-information-technology", "NIELIT", "CCC", "Monitor"],
  ["graduate-engineering", "GATE", "GATE CSE", "Wrench"],
  ["railway", "RRB", "RRB NTPC", "TrainFront"],
  ["railway", "RRB", "RRB Group D", "TrainFront"],
  ["psus-research", "ISRO", "ISRO Scientist/Engineer", "FlaskConical"],
  ["finance", "ICAI", "CA Foundation", "Wallet"],
  ["insurance", "LIC", "LIC AAO", "Umbrella"],
  ["school-level-all-india", "Sainik School", "AISSEE Class 9", "School"],
  ["school-level-state-boards", "UP Board", "UP Board Class 10", "BookOpen"],
  ["foreign-education", "English Proficiency", "IELTS Academic", "Globe2"],
  ["professional-courses", "ICSI", "CS Executive", "ScrollText"],
  ["designing", "NID", "NID DAT", "Palette"],
  ["it-placement-papers", "TCS", "TCS NQT", "Code2"],
  ["driving-license", "RTO", "Learner's Licence Test", "Car"],
];

function lightContent(name: string, catName: string): Partial<SeedExam> {
  return {
    shortDescription: `Mock tests and daily quizzes for ${name}, with explanations and rank analysis.`,
    overview: `<p>Practise for ${name} with full-length mock tests that follow the latest pattern, daily quizzes and topic-wise drills. Every question comes with a worked explanation, and your result shows accuracy, time spent and an All-India rank.</p><p>This series is part of Drona's ${catName} catalogue. More tests are added through the year.</p>`,
    examPattern: `<p>Refer to the latest official notification for the exact pattern. Our mocks mirror the published section-wise structure and marking scheme.</p>`,
    syllabus: `<ul><li>General awareness and current affairs</li><li>Reasoning and aptitude</li><li>Subject knowledge as per notification</li><li>English language</li></ul>`,
    eligibility: `<ul><li>As per the official notification for ${name}.</li></ul>`,
    languages: ["English", "Hindi"],
    level: "As per notification",
    faqs: [
      { q: `Is the first ${name} mock free?`, a: "Yes. The first mock and every daily quiz are free. Create an account to save your results." },
      { q: "Do I get explanations?", a: "Every question has a detailed explanation that you can review after submitting." },
    ],
  };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing – create .env.local first.");
  await connectWithDnsFallback(uri);
  console.log("Connected. Clearing collections…");
  const all = [ActivationKey, Announcement, Attempt, BlogPost, Category, Coupon, Exam, ExamGroup, FAQ, Faculty, HeroSlide, Lead, Order, Page, Product, Question, SiteSettings, Stat, Subscriber, Test, Testimonial, Topper, User];
  await Promise.all(all.map((M) => M.deleteMany({})));
  await Promise.all(all.map((M) => M.syncIndexes()));

  fs.mkdirSync(OUT, { recursive: true });

  /* settings */
  await SiteSettings.create({
    siteName: "Drona",
    tagline: "A Defence Officer's Enterprise",
    motto: "Perform · Analyse · Improve",
    email: "dronacourses@gmail.com",
    phone: `+91 98765 43210 ${DEMO}`,
    whatsappNumber: "919876543210",
    address: `Dehradun, Uttarakhand, India ${DEMO}`,
    workingHours: `Mon–Sat, 9:00 am – 7:00 pm ${DEMO}`,
    mapEmbed: "https://www.google.com/maps?q=Dehradun%2C%20Uttarakhand&output=embed",
    colours: { primary: "#0B1F3A", primaryLight: "#16335C", accent: "#F5A524", olive: "#5B6B3A" },
    socials: { facebook: "https://www.facebook.com/share/16ENir9at2/", youtube: `${DEMO} YouTube URL`, instagram: `${DEMO} Instagram URL`, telegram: "", linkedin: "" },
    directorMessage: { ...C.directorMessage },
    director: { ...C.director },
    elibraryCollections: C.elibraryCollections,
    services: C.services,
    seoDefaults: {
      title: "Drona – Mock Tests for NDA, CDS, AFCAT, Police & SSC",
      description: "Real exam-style mock tests, free daily quizzes, previous year papers and an e-library for defence, police, SSC and government exams. Perform · Analyse · Improve.",
    },
    footerLinks: [],
  });

  await Stat.insertMany([
    { label: "Students", value: 4000, suffix: "+", icon: "Users", order: 1 },
    { label: "Questions Attempted", value: 92000, suffix: "+", icon: "ClipboardCheck", order: 2 },
    { label: "Exams", value: 1600, suffix: "+", icon: "BookOpenCheck", order: 3 },
    { label: "Better Selection Chances", value: 16, suffix: "X", icon: "Target", order: 4 },
  ]);

  await HeroSlide.insertMany([
    {
      heading: "Crack Your Dream Defence & Government Exam",
      // copy from the current dronacourses.com homepage
      subheading: "Take a leap in your career by unlocking an extensive collection of test series covering the top exams of India, including NDA, CDS and AFCAT.",
      ctaLabel: "Start Free Mock Test",
      ctaLink: "/exam/afcat",
      order: 1,
      isActive: true,
    },
  ]);

  /* categories + groups */
  const cats = await Category.insertMany(
    CATEGORIES.map(([name, nameHi, icon, description], i) => ({ name, nameHi, icon, description, slug: slugify(name).replace(/-and-/g, "-"), order: i + 1, seo: { title: `${name} Mock Tests & Quizzes`, description } })),
  );
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const defence = catBySlug["defence-police"]!;
  const ssc = catBySlug["ssc"]!;

  const groupDocs = await ExamGroup.insertMany([
    ...DEFENCE_GROUPS.map((name, i) => ({ category: defence._id, name, slug: slugify(name), order: i })),
    ...SSC_GROUPS.map((name, i) => ({ category: ssc._id, name, slug: slugify(`ssc ${name}`), order: i })),
    ...[...new Set(EXTRA_EXAMS.map((e) => `${e[0]}|${e[1]}`))].map((k, i) => {
      const [cs, g] = k.split("|") as [string, string];
      return { category: catBySlug[cs]!._id, name: g, slug: slugify(`${cs} ${g}`), order: i };
    }),
  ]);
  const groupKey = (catId: unknown, name: string) => groupDocs.find((g) => String(g.category) === String(catId) && g.name === name)!;

  /* questions */
  const qDocs = await Question.insertMany(Q.map((q) => ({ ...q, language: "English" })));
  const qIds = qDocs.map((q) => q._id);
  const byTopic = (t: string) => qDocs.filter((q) => q.topic === t).map((q) => q._id);
  const rotate = (n: number, size: number) => Array.from({ length: size }, (_, i) => qIds[(n * 7 + i) % qIds.length]!);

  /* exams */
  const POPULAR = new Set(["afcat", "upsc-nda", "upsc-cds", "iaf-agniveervayu", "delhi-police-mts", "ssc-chsl", "territorial-army-officer", "ima"]);
  const examRows: any[] = [];
  for (const [i, e] of [...detailedExams, ...lightExams].entries()) {
    const cat = e.category === "ssc" ? ssc : defence;
    examRows.push({
      ...e,
      group: groupKey(cat._id, e.group)._id,
      category: cat._id,
      features: FEATURES,
      isPopular: POPULAR.has(e.slug),
      showOnHome: POPULAR.has(e.slug),
      order: i,
      seo: { title: `${e.name} Mock Test Series 2026`, description: e.shortDescription },
      _detailed: i < detailedExams.length,
    });
  }
  // a practice series for every defence/SSC group that has no detailed exam yet
  const covered = new Set(examRows.map((r) => String(r.group)));
  for (const g of groupDocs.filter((g) => [String(defence._id), String(ssc._id)].includes(String(g.category)) && !covered.has(String(g._id)))) {
    const isSsc = String(g.category) === String(ssc._id);
    const name = isSsc ? `SSC ${g.name}` : /police|tnusrb/i.test(g.name) ? `${g.name} Constable` : `${g.name} Recruitment`;
    examRows.push({
      name,
      slug: slugify(name),
      group: g._id,
      category: g.category,
      icon: isSsc ? "ClipboardCheck" : /police|tnusrb/i.test(g.name) ? "Siren" : "Shield",
      features: FEATURES,
      order: 100,
      ...lightContent(name, isSsc ? "SSC" : "Defence & Police"),
    });
  }
  for (const [cs, gname, name, icon, popular] of EXTRA_EXAMS) {
    const cat = catBySlug[cs]!;
    examRows.push({ name, slug: slugify(name), group: groupKey(cat._id, gname)._id, category: cat._id, icon, isPopular: !!popular, features: FEATURES, order: popular ? 50 : 100, ...lightContent(name, cat.name) });
  }
  const exams = await Exam.insertMany(examRows.map(({ _detailed, ...r }) => r));
  const examBySlug = Object.fromEntries(exams.map((e) => [e.slug, e]));
  console.log(`Exams: ${exams.length}`);

  /* tests */
  const tests: any[] = [];
  const mk = (exam: any, t: any) => tests.push({ exam: exam._id, language: "English", status: "PUBLISHED", publishDate: daysAgo(30), ...t });
  const quizzes = (exam: any, n: number, offset = 0) => {
    for (let d = 0; d < n; d++) {
      const date = daysAgo(d, 0);
      const label = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      mk(exam, { type: "QUIZ", title: `${exam.name} Quiz (${label})`, totalQuestions: 20, totalMarks: 20, durationMinutes: 10, isFree: true, price: 0, questions: rotate(d + offset, 20), publishDate: date, order: d });
    }
  };
  const topicTests = (exam: any, topics: string[]) =>
    topics.forEach((t, i) => {
      const qs = byTopic(t);
      mk(exam, { type: "TOPIC_WISE", title: `${t} – Topic Test`, totalQuestions: qs.length, totalMarks: qs.length * 2, durationMinutes: 10, negativeMarking: 0.5, isFree: false, price: 29, questions: qs, order: i });
    });

  const afcat = examBySlug["afcat"]!;
  for (let i = 1; i <= 10; i++)
    mk(afcat, { type: "MOCK", title: `AFCAT Mock Test ${i}`, totalQuestions: 100, totalMarks: 300, durationMinutes: 120, negativeMarking: 1, isFree: i === 1, price: i === 1 ? 0 : 49, questions: qIds, order: i });
  quizzes(afcat, 7);
  topicTests(afcat, ["English", "Reasoning"]);
  mk(afcat, { type: "PREVIOUS_YEAR", title: "AFCAT 2025 (Feb) – Memory-Based Paper", totalQuestions: 100, totalMarks: 300, durationMinutes: 120, negativeMarking: 1, isFree: false, price: 39, questions: qIds, order: 1 });
  mk(afcat, { type: "CURRENT_AFFAIRS", title: "Defence Current Affairs – Monthly Test", totalQuestions: 16, totalMarks: 16, durationMinutes: 12, isFree: true, price: 0, questions: [...byTopic("Defence Awareness"), ...byTopic("General Knowledge")], order: 1 });

  for (const [n, e] of detailedExams.entries()) {
    if (e.slug === "afcat") continue;
    const exam = examBySlug[e.slug]!;
    for (let i = 1; i <= 3; i++)
      mk(exam, { type: "MOCK", title: `${exam.name} Mock Test ${i}`, totalQuestions: 40, totalMarks: 80, durationMinutes: 45, negativeMarking: 0.5, isFree: i === 1, price: i === 1 ? 0 : 49, questions: qIds, order: i });
    topicTests(exam, e.category === "ssc" ? ["Mathematics", "English"] : ["Mathematics", "General Knowledge"]);
    mk(exam, { type: "PREVIOUS_YEAR", title: `${exam.name} 2025 – Previous Year Paper`, totalQuestions: 40, totalMarks: 80, durationMinutes: 45, negativeMarking: 0.5, isFree: false, price: 39, questions: qIds, order: 1 });
    quizzes(exam, 3, n);
    if (e.category !== "ssc")
      mk(exam, { type: "CURRENT_AFFAIRS", title: "Defence Current Affairs – Monthly Test", totalQuestions: 8, totalMarks: 8, durationMinutes: 8, isFree: true, price: 0, questions: byTopic("Defence Awareness"), order: 1 });
  }
  for (const exam of exams.filter((x) => !detailedExams.some((d) => d.slug === x.slug))) {
    mk(exam, { type: "MOCK", title: `${exam.name} Mock Test 1`, totalQuestions: 40, totalMarks: 80, durationMinutes: 45, negativeMarking: 0.5, isFree: true, price: 0, questions: qIds, order: 1 });
    mk(exam, { type: "MOCK", title: `${exam.name} Mock Test 2`, totalQuestions: 40, totalMarks: 80, durationMinutes: 45, negativeMarking: 0.5, isFree: false, price: 49, questions: qIds, order: 2 });
    quizzes(exam, 1, exams.indexOf(exam));
  }
  const testDocs = await Test.insertMany(tests);
  console.log(`Tests: ${testDocs.length}`);
  const afcatTests = testDocs.filter((t) => String(t.exam) === String(afcat._id));
  const afcatMock = (n: number) => afcatTests.find((t) => t.title === `AFCAT Mock Test ${n}`)!;

  /* products */
  const products = await Product.insertMany([
    {
      type: "BUNDLE",
      title: "CDS AFCAT SSC Guides",
      slug: "cds-afcat-ssc-guides",
      shelf: "CDS AFCAT Books",
      thumbnail: svgArt("cds-afcat-ssc-guides.svg", { from: "#0B1F3A", to: "#1E4A7A", label: "CDS · AFCAT · SSC Guides", glyph: "play" }),
      description:
        "Everything you need to prepare for CDS and AFCAT in one pack: a full video course on reasoning and quantitative aptitude, three e-books covering English, General Knowledge and Defence Awareness, and 25 practice quizzes.",
      includes: [
        { label: "Video Course", count: 1 },
        { label: "E-Library Books", count: 3 },
        { label: "Quizzes", count: 25 },
      ],
      mrp: 1199,
      salePrice: 201,
      validityDays: 365,
      exams: [examBySlug["upsc-cds"]!._id, afcat._id],
    },
    {
      type: "ELIBRARY",
      title: "NDA Foundation Books",
      slug: "nda-foundation-books",
      shelf: "NDA Foundation Books",
      thumbnail: svgArt("nda-foundation-books.svg", { from: "#16335C", to: "#5B6B3A", label: "NDA Foundation", glyph: "book" }),
      description: "Chapter-wise NDA Mathematics and General Ability Test notes with solved examples and practice sets, written for Class 11–12 students starting their NDA preparation.",
      includes: [
        { label: "E-Books", count: 4 },
        { label: "Practice Sets", count: 12 },
      ],
      mrp: 799,
      salePrice: 249,
      exams: [examBySlug["upsc-nda"]!._id],
    },
    {
      type: "ELIBRARY",
      title: "Quantitative Analysis & Reasoning Book",
      slug: "quantitative-analysis-reasoning-book",
      shelf: "Quantitative Analysis & Reasoning",
      thumbnail: svgArt("quant-reasoning.svg", { from: "#0B1F3A", to: "#2F5D50", label: "Quant & Reasoning", glyph: "chart" }),
      description: "Shortcut methods, 1,200 solved questions and topic-wise drills for arithmetic, data interpretation and logical reasoning, useful for every defence, SSC and banking exam.",
      includes: [
        { label: "E-Book", count: 1 },
        { label: "Solved Questions", count: 1200 },
      ],
      mrp: 499,
      salePrice: 149,
      exams: [afcat._id, examBySlug["ssc-cgl"]!._id, examBySlug["ssc-chsl"]!._id],
    },
    {
      type: "ELIBRARY",
      title: "UPSC / State PCS",
      slug: "upsc-state-pcs",
      shelf: "UPSC",
      thumbnail: svgArt("upsc-state-pcs.svg", { from: "#1E2430", to: "#16335C", label: "UPSC / State PCS", glyph: "shield" }),
      description: "Concise notes on Polity, History, Geography and Economy aligned to the UPSC and State PCS prelims syllabus, with previous year questions mapped to each chapter.",
      includes: [
        { label: "E-Books", count: 5 },
        { label: "PYQ Sets", count: 10 },
      ],
      mrp: 999,
      salePrice: 299,
      exams: [examBySlug["upsc-cse-prelims"]!._id],
    },
    {
      type: "ELIBRARY",
      title: "CUET Revision Notes",
      slug: "cuet-revision-notes",
      shelf: "CUET",
      thumbnail: svgArt("cuet-revision-notes.svg", { from: "#16335C", to: "#7C3A2D", label: "CUET Revision Notes", glyph: "book" }),
      description: "One-page revision notes for the CUET UG General Test: quantitative reasoning, logical reasoning, general awareness and language.",
      includes: [
        { label: "E-Book", count: 1 },
        { label: "Mock Tests", count: 3 },
      ],
      mrp: 399,
      salePrice: 99,
      exams: [examBySlug["cuet-ug-general-test"]!._id],
    },
  ]);

  await Coupon.insertMany([
    { code: "DRONA10", type: "PERCENT", value: 10, expiry: daysAgo(-180), usageLimit: 0 },
    { code: "WELCOME50", type: "FLAT", value: 50, expiry: daysAgo(-90), usageLimit: 500 },
  ]);

  const keyCode = (i: number) => `DRONA-${i < 5 ? "BOOK" : "AF26"}-${(1000 + i * 1373).toString(36).toUpperCase().padStart(4, "0")}`;
  await ActivationKey.insertMany(
    Array.from({ length: 10 }, (_, i) => (i < 5 ? { code: keyCode(i), product: products[0]!._id } : { code: keyCode(i), tests: [afcatMock(2)._id, afcatMock(3)._id, afcatMock(4)._id] })),
  );

  /* people */
  const hash = (p: string) => bcrypt.hash(p, 10);
  const [admin, , , student] = await User.insertMany([
    { name: "Drona Admin", email: "admin@drona.demo", passwordHash: await hash("Admin@123"), role: "ADMIN" },
    { name: "Content Editor", email: "editor@drona.demo", passwordHash: await hash("Editor@123"), role: "EDITOR" },
    { name: "Support Desk", email: "support@drona.demo", passwordHash: await hash("Support@123"), role: "SUPPORT" },
    {
      name: "Aarav Sharma",
      email: "student@drona.demo",
      phone: "9810012345",
      passwordHash: await hash("Student@123"),
      role: "STUDENT",
      examInterests: [afcat._id, examBySlug["upsc-cds"]!._id],
      unlockedTests: [afcatMock(2)._id],
      streak: 4,
      state: "Uttarakhand",
    },
  ]);
  const NAMES = ["Priya Nair", "Rohit Yadav", "Simran Kaur", "Arjun Reddy", "Neha Gupta", "Vikram Singh Rathore", "Ananya Das", "Karan Mehta", "Pooja Patil", "Mohd. Faizan", "Sneha Iyer", "Rahul Verma"];
  const studentPw = await hash("Student@123");
  const others = await User.insertMany(
    NAMES.map((n, i) => ({ name: n, email: `${slugify(n).replace(/-/g, ".")}@example.com`, passwordHash: studentPw, role: "STUDENT", streak: i % 6, createdAt: daysAgo(30 - i * 2) })),
  );

  /* attempts – spread over 14 days so admin charts have shape */
  const playable = testDocs.filter((t) => t.isFree && t.questions.length);
  const attemptRows: any[] = [];
  const makeAttempt = (user: any, test: any, skill: number, when: Date) => {
    const qs = qDocs.filter((q) => test.questions.some((id: any) => String(id) === String(q._id)));
    const sel: Record<string, number | null> = {};
    qs.forEach((q) => {
      const r = rand();
      sel[String(q._id)] = r < 0.12 ? null : r < skill ? q.correctIndex : (q.correctIndex + 1 + Math.floor(rand() * 3)) % 4;
    });
    const sc = scoreAttempt(test, qs, sel);
    const pct = sc.maxScore ? Math.max(0, (sc.score / sc.maxScore) * 100) : 0;
    const rk = simulatedRank(String(test._id), pct, 0);
    attemptRows.push({ user: user._id, test: test._id, ...sc, timeTakenSec: Math.round(test.durationMinutes * 60 * (0.55 + rand() * 0.4)), ...rk, completedAt: when, createdAt: when });
  };
  makeAttempt(student, afcatMock(1), 0.72, daysAgo(3, 18));
  makeAttempt(student, afcatTests.find((t) => t.type === "QUIZ")!, 0.8, daysAgo(0, 8));
  makeAttempt(student, testDocs.find((t) => t.title === "UPSC CDS Mock Test 1")!, 0.6, daysAgo(6, 20));
  for (let d = 0; d < 14; d++) {
    const n = 3 + Math.floor(rand() * 6) + (d < 4 ? 3 : 0);
    for (let k = 0; k < n; k++) makeAttempt(pick(others), pick(playable), 0.4 + rand() * 0.45, daysAgo(d, 7 + Math.floor(rand() * 14)));
  }
  await Attempt.insertMany(attemptRows);

  await Order.insertMany([
    { user: student._id, test: afcatMock(2)._id, amount: 49, status: "PAID", createdAt: daysAgo(5) },
    { user: others[0]!._id, product: products[0]!._id, amount: 201, status: "PAID", createdAt: daysAgo(2) },
    { user: others[3]!._id, product: products[1]!._id, amount: 249, coupon: "DRONA10", status: "PAID", createdAt: daysAgo(4) },
    { user: others[5]!._id, test: afcatMock(5)._id, amount: 49, status: "PAID", createdAt: daysAgo(1) },
    { user: others[7]!._id, product: products[2]!._id, amount: 99, coupon: "WELCOME50", status: "PAID", createdAt: daysAgo(8) },
    { user: others[9]!._id, product: products[0]!._id, amount: 201, status: "FAILED", createdAt: daysAgo(3) },
  ]);

  await Lead.insertMany([
    { name: "Harsh Vardhan", phone: "9876501234", email: "harsh.v@example.com", examInterest: "AFCAT", message: "Is the AFCAT series updated for the 2026 pattern?", sourcePage: "/contact", status: "NEW", createdAt: daysAgo(0) },
    { name: "Ritika Bansal", phone: "9811122233", examInterest: "SSC CGL", message: "Do you have Hindi medium tests for CGL?", sourcePage: "/contact", status: "NEW", createdAt: daysAgo(1) },
    { name: "Gurpreet Singh", phone: "9915566778", examInterest: "Punjab Police", message: "Need practice tests for Punjab Police constable.", sourcePage: "/exam/punjab-police-constable", status: "CONTACTED", notes: [{ text: "Called, shared demo link.", by: "Support Desk" }], createdAt: daysAgo(2) },
    { name: "Ayesha Khan", email: "ayesha.k@example.com", examInterest: "NDA", message: "My son is in class 12. Which NDA product should we buy?", sourcePage: "/e-library", status: "CONVERTED", notes: [{ text: "Bought NDA Foundation Books.", by: "Support Desk" }], createdAt: daysAgo(4) },
    { name: "Deepak Chauhan", phone: "9456712345", examInterest: "Agniveer", message: "Activation key from book not working.", sourcePage: "/contact", status: "CLOSED", notes: [{ text: "Key was mistyped; redeemed on call.", by: "Support Desk" }], createdAt: daysAgo(6) },
    { name: "Lakshmi Menon", phone: "9447001122", examInterest: "Kerala Police", message: "Are Kerala Police tests available in Malayalam?", sourcePage: "/contact", status: "NEW", createdAt: daysAgo(0) },
    { name: "Sourav Ghosh", email: "sourav.g@example.com", examInterest: "CDS", message: "Please share the CDS test schedule.", sourcePage: "/exam/upsc-cds", status: "CONTACTED", createdAt: daysAgo(3) },
    { name: "Manish Tiwari", phone: "9935012345", examInterest: "UP Police", message: "Want group discount for 20 students at my academy.", sourcePage: "/contact", status: "NEW", createdAt: daysAgo(1) },
  ]);

  /* content */
  const glyphFor = (p: (typeof C.blogPosts)[number]) => (p.type === "CURRENT_AFFAIRS" ? "news" : /analy/i.test(p.title) ? "chart" : /ssb|interview/i.test(p.title) ? "shield" : "target");
  const tones: [string, string][] = [["#0B1F3A", "#1E4A7A"], ["#16335C", "#5B6B3A"], ["#0B1F3A", "#7C3A2D"], ["#1E2430", "#1E4A7A"], ["#16335C", "#2F5D50"], ["#0B1F3A", "#16335C"]];
  await BlogPost.insertMany(
    C.blogPosts.map((p, i) => ({
      ...p,
      coverImage: svgArt(`post-${p.slug}.svg`, { from: tones[i % tones.length]![0], to: tones[i % tones.length]![1], label: p.category, glyph: glyphFor(p) }),
      publishedAt: daysAgo(i * 2 + (p.type === "CURRENT_AFFAIRS" ? 0 : 1)),
      seo: { title: p.title, description: p.excerpt },
    })),
  );
  // Legal and About text are drafts written for the demo, not the client's own wording.
  const DRAFT = '<p><strong>[Draft for the demo – Drona to review and replace with its own wording.]</strong></p>';
  await Page.insertMany(C.pages.map((p) => ({ ...p, body: DRAFT + p.body, seo: { title: p.title } })));
  await Testimonial.insertMany(C.testimonials.map((t) => ({ ...t, isDemo: true })));
  await Topper.insertMany(C.toppers.map((t) => ({ ...t, isDemo: true })));
  await Faculty.insertMany(C.faculty.map((f) => ({ ...f, isDemo: true })));
  await FAQ.insertMany(C.faqs.map((f, i) => ({ ...f, order: i })));
  await Announcement.create({ ...C.announcement, isActive: true, startDate: daysAgo(1), endDate: daysAgo(-60) });

  console.log("\nSeed complete.");
  console.log("  Admin   admin@drona.demo / Admin@123");
  console.log("  Editor  editor@drona.demo / Editor@123");
  console.log("  Support support@drona.demo / Support@123");
  console.log("  Student student@drona.demo / Student@123");
  console.log("  Activation keys:", Array.from({ length: 10 }, (_, i) => keyCode(i)).join(", "));
  void admin;
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await mongoose.disconnect();
  process.exit(1);
});
