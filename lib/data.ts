import "server-only";
import { cache } from "react";
import { dbConnect, plain } from "./db";
import {
  Announcement, BlogPost, Category, Exam, ExamGroup, FAQ, HeroSlide, Page, Product, SiteSettings, Stat, Test,
} from "@/models";
import type { CategoryLite, ExamLite, SettingsLite } from "./types";

const DEFAULT_SETTINGS: SettingsLite = {
  siteName: "Drona",
  tagline: "A Defence Officer's Enterprise",
  motto: "Perform · Analyse · Improve",
  email: "dronacourses@gmail.com",
};

export const getSettings = cache(async (): Promise<SettingsLite> => {
  await dbConnect();
  const s = await SiteSettings.findOne().lean();
  return s ? { ...DEFAULT_SETTINGS, ...plain(s) } : DEFAULT_SETTINGS;
});

export const getAnnouncement = cache(async () => {
  await dbConnect();
  const now = new Date();
  const a = await Announcement.findOne({
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  })
    .sort({ updatedAt: -1 })
    .lean();
  return a ? plain(a) : null;
});

/** Per-exam test + quiz counts in one aggregate. */
async function testCounts(examIds: unknown[]) {
  const rows = await Test.aggregate([
    { $match: { exam: { $in: examIds }, status: "PUBLISHED" } },
    {
      $group: {
        _id: "$exam",
        tests: { $sum: { $cond: [{ $eq: ["$type", "QUIZ"] }, 0, 1] } },
        quizzes: { $sum: { $cond: [{ $eq: ["$type", "QUIZ"] }, 1, 0] } },
        free: { $sum: { $cond: ["$isFree", 1, 0] } },
      },
    },
  ]);
  return new Map(rows.map((r) => [String(r._id), r]));
}

export async function toExamLite(exams: any[]): Promise<ExamLite[]> {
  const counts = await testCounts(exams.map((e) => e._id));
  return exams.map((e) => {
    const c = counts.get(String(e._id));
    return plain({
      _id: e._id,
      name: e.name,
      slug: e.slug,
      icon: e.icon,
      shortDescription: e.shortDescription,
      isPopular: e.isPopular,
      category: e.category && { name: e.category.name, nameHi: e.category.nameHi, slug: e.category.slug },
      testCount: c?.tests ?? 0,
      quizCount: c?.quizzes ?? 0,
      hasFree: (c?.free ?? 0) > 0,
    });
  });
}

const EXAM_LIST_FIELDS = "name slug icon shortDescription isPopular category group order";

export async function getExams(filter: Record<string, unknown> = {}, limit = 0) {
  await dbConnect();
  const q = Exam.find({ isActive: true, ...filter }).select(EXAM_LIST_FIELDS).populate("category", "name nameHi slug").sort({ order: 1, name: 1 });
  if (limit) q.limit(limit);
  return toExamLite(await q.lean());
}

export const getCategories = cache(async (): Promise<CategoryLite[]> => {
  await dbConnect();
  const [cats, counts] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1 }).lean(),
    Exam.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return plain(cats.map((c: any) => ({ ...c, examCount: map.get(String(c._id)) ?? 0 })));
});

/** Everything the header needs: categories → groups, plus a flat exam index for search. */
export const getNavData = cache(async () => {
  await dbConnect();
  const [cats, groups, exams] = await Promise.all([
    getCategories(),
    ExamGroup.find({ isActive: true }).select("name slug category order").sort({ order: 1, name: 1 }).lean(),
    Exam.find({ isActive: true }).select("name slug category group").populate("category", "name slug").lean(),
  ]);
  return {
    categories: cats.map((c) => ({ _id: c._id, name: c.name, nameHi: c.nameHi, slug: c.slug, icon: c.icon, examCount: c.examCount })),
    groups: plain(groups) as { _id: string; name: string; slug: string; category: string }[],
    exams: plain(exams).map((e: any) => ({ name: e.name, slug: e.slug, category: e.category?.name ?? "" })) as NavExam[],
  };
});
export type NavExam = { name: string; slug: string; category: string };
export type NavData = Awaited<ReturnType<typeof getNavData>>;

export async function getHomeData() {
  await dbConnect();
  const since = new Date(Date.now() - 7 * 864e5);
  const popularIds = await Exam.find({ isActive: true, isPopular: true }).distinct("_id");
  const [slides, stats, popular, quizzes, products, faqs] = await Promise.all([
    HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean(),
    Stat.find().sort({ order: 1 }).lean(),
    getExams({ $or: [{ showOnHome: true }, { isPopular: true }] }, 8),
    Test.find({ type: "QUIZ", status: "PUBLISHED", exam: { $in: popularIds }, publishDate: { $gte: since, $lte: new Date() } })
      .sort({ publishDate: -1 })
      .limit(8)
      .select("title type totalQuestions totalMarks durationMinutes language isFree price publishDate exam")
      .populate("exam", "name slug")
      .lean(),
    Product.find({ isActive: true }).sort({ createdAt: 1 }).limit(4).select("type title slug thumbnail includes mrp salePrice shelf").lean(),
    FAQ.find().sort({ order: 1 }).limit(8).lean(),
  ]);
  return plain({ slides, stats, popular, quizzes, products, faqs });
}

export async function getCategoryPage(slug: string) {
  await dbConnect();
  const cat = await Category.findOne({ slug, isActive: true }).lean<any>();
  if (!cat) return null;
  const [groups, exams] = await Promise.all([
    ExamGroup.find({ category: cat._id, isActive: true }).sort({ order: 1, name: 1 }).lean(),
    Exam.find({ category: cat._id, isActive: true }).select(EXAM_LIST_FIELDS).populate("category", "name nameHi slug").sort({ isPopular: -1, order: 1 }).lean(),
  ]);
  const lite = await toExamLite(exams);
  const byGroup = new Map<string, number>();
  exams.forEach((e: any) => byGroup.set(String(e.group), (byGroup.get(String(e.group)) ?? 0) + 1));
  return plain({
    category: cat,
    groups: groups.map((g: any) => ({ ...g, examCount: byGroup.get(String(g._id)) ?? 0 })),
    exams: lite,
    groupOf: Object.fromEntries(exams.map((e: any) => [String(e._id), String(e.group)])),
  });
}

export async function getExamPage(slug: string) {
  await dbConnect();
  const exam = await Exam.findOne({ slug, isActive: true }).populate("category", "name nameHi slug").populate("group", "name slug").lean<any>();
  if (!exam) return null;
  const [tests, related, products] = await Promise.all([
    Test.find({ exam: exam._id, status: "PUBLISHED", publishDate: { $lte: new Date() } }).select("-questions").sort({ type: 1, order: 1, publishDate: -1 }).lean(),
    getExams({ group: exam.group?._id, _id: { $ne: exam._id } }, 4).then(async (r) => (r.length ? r : getExams({ category: exam.category?._id, _id: { $ne: exam._id } }, 4))),
    Product.find({ isActive: true, exams: exam._id }).lean(),
  ]);
  return plain({ exam, tests, related, products });
}

export const getFaqs = cache(async () => {
  await dbConnect();
  return plain(await FAQ.find().sort({ order: 1 }).lean());
});

export async function getProducts() {
  await dbConnect();
  return plain(await Product.find({ isActive: true }).sort({ createdAt: 1 }).lean());
}

export async function getProduct(slug: string) {
  await dbConnect();
  return plain(await Product.findOne({ slug, isActive: true }).populate("exams", "name slug icon").lean());
}

export async function getPosts(type?: string) {
  await dbConnect();
  return plain(await BlogPost.find(type ? { type } : {}).select("-body").sort({ publishedAt: -1 }).lean());
}

export async function getPost(slug: string) {
  await dbConnect();
  const post = await BlogPost.findOne({ slug }).lean<any>();
  if (!post) return null;
  const related = await BlogPost.find({ _id: { $ne: post._id }, type: post.type }).select("-body").sort({ publishedAt: -1 }).limit(3).lean();
  return plain({ post, related });
}

export async function getPage(slug: string) {
  await dbConnect();
  return plain(await Page.findOne({ slug }).lean());
}

