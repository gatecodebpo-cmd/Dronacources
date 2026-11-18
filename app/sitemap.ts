import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import { BlogPost, Category, Exam, Product } from "@/models";
import { SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  const [cats, exams, posts, products] = await Promise.all([
    Category.find({ isActive: true }).select("slug updatedAt").lean<any[]>(),
    Exam.find({ isActive: true }).select("slug updatedAt").lean<any[]>(),
    BlogPost.find().select("slug updatedAt").lean<any[]>(),
    Product.find({ isActive: true }).select("slug updatedAt").lean<any[]>(),
  ]);
  const u = (p: string, lastModified?: Date, priority = 0.6) => ({ url: `${SITE_URL}${p}`, lastModified, priority });
  return [
    u("/", undefined, 1),
    u("/exams", undefined, 0.9),
    u("/e-library", undefined, 0.8),
    u("/current-affairs", undefined, 0.8),
    ...["/about", "/contact", "/sitemap", "/privacy", "/terms", "/refund"].map((p) => u(p, undefined, 0.4)),
    ...cats.map((c) => u(`/exams/${c.slug}`, c.updatedAt, 0.7)),
    ...exams.map((e) => u(`/exam/${e.slug}`, e.updatedAt, 0.8)),
    ...products.map((p) => u(`/e-library/${p.slug}`, p.updatedAt, 0.6)),
    ...posts.map((p) => u(`/blog/${p.slug}`, p.updatedAt, 0.5)),
  ];
}
