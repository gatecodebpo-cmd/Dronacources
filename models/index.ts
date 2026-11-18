import mongoose, { Schema, model, models, type Model } from "mongoose";

const { ObjectId } = Schema.Types;
const seo = { title: String, description: String };
const opts = { timestamps: true };

function m(name: string, schema: Schema): Model<any> {
  return (models[name] as Model<any>) || model(name, schema);
}

export const Category = m(
  "Category",
  new Schema(
    {
      name: { type: String, required: true },
      nameHi: String,
      slug: { type: String, required: true, unique: true, index: true },
      icon: { type: String, default: "BookOpen" },
      description: String,
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      seo,
    },
    opts,
  ),
);

export const ExamGroup = m(
  "ExamGroup",
  new Schema(
    {
      category: { type: ObjectId, ref: "Category", required: true, index: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      parentGroup: { type: ObjectId, ref: "ExamGroup", index: true },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    },
    opts,
  ),
);

export const Exam = m(
  "Exam",
  new Schema(
    {
      group: { type: ObjectId, ref: "ExamGroup", required: true, index: true },
      category: { type: ObjectId, ref: "Category", required: true, index: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      shortDescription: String,
      overview: String,
      examPattern: String,
      syllabus: String,
      eligibility: String,
      languages: { type: [String], default: ["English"] },
      level: String,
      bannerImage: String,
      icon: { type: String, default: "GraduationCap" },
      features: [String],
      faqs: [{ q: String, a: String }],
      isPopular: { type: Boolean, default: false, index: true },
      showOnHome: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      seo,
    },
    opts,
  ),
);

export const TEST_TYPES = ["MOCK", "TOPIC_WISE", "PREVIOUS_YEAR", "QUIZ", "CURRENT_AFFAIRS"] as const;
export const Test = m(
  "Test",
  new Schema(
    {
      exam: { type: ObjectId, ref: "Exam", required: true, index: true },
      type: { type: String, enum: TEST_TYPES, required: true, index: true },
      title: { type: String, required: true },
      totalQuestions: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      durationMinutes: { type: Number, default: 10 },
      language: { type: String, default: "English" },
      negativeMarking: { type: Number, default: 0 }, // marks deducted per wrong answer
      isFree: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      questions: [{ type: ObjectId, ref: "Question" }],
      publishDate: { type: Date, default: Date.now, index: true },
      status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "PUBLISHED" },
      order: { type: Number, default: 0 },
    },
    opts,
  ),
);

export const Question = m(
  "Question",
  new Schema(
    {
      text: { type: String, required: true },
      options: {
        type: [String],
        validate: [(v: string[]) => v.length === 4, "A question needs exactly 4 options"],
      },
      correctIndex: { type: Number, min: 0, max: 3, required: true },
      explanation: String,
      topic: { type: String, index: true },
      difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
      language: { type: String, default: "English" },
      image: String,
    },
    opts,
  ),
);

export const Product = m(
  "Product",
  new Schema(
    {
      type: { type: String, enum: ["VIDEO_COURSE", "ELIBRARY", "BUNDLE"], required: true },
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      thumbnail: String,
      description: String,
      includes: [{ label: String, count: Number }],
      mrp: Number,
      salePrice: Number,
      validityDays: { type: Number, default: 365 },
      shelf: { type: String, index: true }, // E-Library collection, e.g. "NDA Foundation Books"
      exams: [{ type: ObjectId, ref: "Exam", index: true }],
      isActive: { type: Boolean, default: true },
    },
    opts,
  ),
);

export const Coupon = m(
  "Coupon",
  new Schema(
    {
      code: { type: String, required: true, unique: true, uppercase: true, trim: true },
      type: { type: String, enum: ["PERCENT", "FLAT"], required: true },
      value: { type: Number, required: true },
      expiry: Date,
      usageLimit: { type: Number, default: 0 }, // 0 = unlimited
      usedCount: { type: Number, default: 0 },
    },
    opts,
  ),
);

export const ActivationKey = m(
  "ActivationKey",
  new Schema(
    {
      code: { type: String, required: true, unique: true, uppercase: true, trim: true },
      product: { type: ObjectId, ref: "Product" },
      tests: [{ type: ObjectId, ref: "Test" }],
      status: { type: String, enum: ["UNUSED", "REDEEMED"], default: "UNUSED", index: true },
      redeemedBy: { type: ObjectId, ref: "User" },
      redeemedAt: Date,
    },
    opts,
  ),
);

export const ROLES = ["ADMIN", "EDITOR", "SUPPORT", "STUDENT"] as const;
export const User = m(
  "User",
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      phone: String,
      passwordHash: { type: String, required: true, select: false },
      role: { type: String, enum: ROLES, default: "STUDENT", index: true },
      examInterests: [{ type: ObjectId, ref: "Exam" }],
      language: { type: String, default: "en" },
      unlockedTests: [{ type: ObjectId, ref: "Test" }],
      purchasedProducts: [{ type: ObjectId, ref: "Product" }],
      streak: { type: Number, default: 0 },
      state: String,
    },
    opts,
  ),
);

export const Attempt = m(
  "Attempt",
  new Schema(
    {
      user: { type: ObjectId, ref: "User", index: true },
      test: { type: ObjectId, ref: "Test", required: true, index: true },
      answers: [{ question: { type: ObjectId, ref: "Question" }, selected: Number, correct: Boolean, marked: Boolean }],
      score: Number,
      maxScore: Number,
      correct: Number,
      incorrect: Number,
      skipped: Number,
      accuracy: Number,
      timeTakenSec: Number,
      rank: Number,
      totalCandidates: Number,
      stateRank: Number,
      completedAt: { type: Date, default: Date.now, index: true },
    },
    opts,
  ),
);

export const Order = m(
  "Order",
  new Schema(
    {
      user: { type: ObjectId, ref: "User", index: true },
      product: { type: ObjectId, ref: "Product" },
      test: { type: ObjectId, ref: "Test" },
      amount: Number,
      coupon: String,
      status: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING", index: true },
      gateway: { type: String, default: "DEMO" },
    },
    opts,
  ),
);

export const HeroSlide = m(
  "HeroSlide",
  new Schema(
    {
      heading: String,
      subheading: String,
      image: String,
      ctaLabel: String,
      ctaLink: String,
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    },
    opts,
  ),
);

export const Stat = m(
  "Stat",
  new Schema({ label: String, value: Number, suffix: String, icon: String, order: { type: Number, default: 0 } }, opts),
);

export const Testimonial = m(
  "Testimonial",
  new Schema(
    { name: String, photo: String, exam: String, rank: String, quote: String, rating: { type: Number, default: 5 }, isDemo: Boolean },
    opts,
  ),
);

export const Topper = m(
  "Topper",
  new Schema({ name: String, photo: String, exam: String, rank: String, year: Number, isDemo: Boolean }, opts),
);

export const Faculty = m(
  "Faculty",
  new Schema(
    {
      name: String,
      role: String,
      bio: String,
      photo: String,
      socials: { linkedin: String, youtube: String },
      isDemo: Boolean,
    },
    opts,
  ),
);

export const BlogPost = m(
  "BlogPost",
  new Schema(
    {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      type: { type: String, enum: ["BLOG", "CURRENT_AFFAIRS"], default: "BLOG", index: true },
      category: String,
      coverImage: String,
      excerpt: String,
      body: String,
      author: String,
      tags: [String],
      readMinutes: { type: Number, default: 4 },
      publishedAt: { type: Date, default: Date.now, index: true },
      seo,
    },
    opts,
  ),
);

export const FAQ = m(
  "FAQ",
  new Schema({ question: String, answer: String, group: { type: String, default: "General" }, order: { type: Number, default: 0 } }, opts),
);

export const Announcement = m(
  "Announcement",
  new Schema(
    { text: String, link: String, image: String, startDate: Date, endDate: Date, isActive: { type: Boolean, default: true } },
    opts,
  ),
);

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
export const Lead = m(
  "Lead",
  new Schema(
    {
      name: { type: String, required: true },
      phone: String,
      email: String,
      examInterest: String,
      message: String,
      sourcePage: String,
      status: { type: String, enum: LEAD_STATUSES, default: "NEW", index: true },
      notes: [{ text: String, by: String, at: { type: Date, default: Date.now } }],
    },
    opts,
  ),
);

export const Page = m(
  "Page",
  new Schema({ slug: { type: String, required: true, unique: true, index: true }, title: String, body: String, seo }, opts),
);

export const SiteSettings = m(
  "SiteSettings",
  new Schema(
    {
      siteName: String,
      tagline: String,
      motto: String,
      logo: String,
      favicon: String,
      colours: { primary: String, primaryLight: String, accent: String, olive: String },
      email: String,
      phone: String,
      whatsappNumber: String,
      address: String,
      mapEmbed: String,
      workingHours: String,
      socials: { facebook: String, instagram: String, youtube: String, telegram: String, linkedin: String },
      directorMessage: { title: String, body: String, name: String, photo: String },
      director: { name: String, role: String, photo: String, story: String },
      elibraryCollections: [String],
      services: [{ title: String, text: String, href: String, icon: String, featured: Boolean }],
      seoDefaults: { title: String, description: String, ogImage: String },
      footerLinks: [{ label: String, href: String }],
    },
    opts,
  ),
);

export const Subscriber = m(
  "Subscriber",
  new Schema({ email: { type: String, required: true, unique: true, lowercase: true, trim: true } }, opts),
);

export { mongoose };
