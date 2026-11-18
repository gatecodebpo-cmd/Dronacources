// Admin module registry: plain data shared by the generic list/form UI and the generic API.
import { sectionRoles } from "./access";

export type FieldType =
  | "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "ref" | "refs" | "image" | "date" | "datetime"
  | "strings" | "objects" | "colour" | "icon" | "password" | "options4";

export type Field = {
  name: string; // dot path, e.g. "seo.title"
  label: string;
  type: FieldType;
  required?: boolean;
  options?: (string | { value: string; label: string })[];
  num?: boolean; // select whose values are numbers
  ref?: string; // resource key for ref/refs
  of?: Field[]; // sub-fields for "objects"
  hint?: string;
  section?: string;
  wide?: boolean;
};

export type Column = { key: string; label: string; format?: "bool" | "date" | "datetime" | "money" | "badge" | "image" | "pct" | "count"; sortable?: boolean };

export type Resource = {
  key: string;
  label: string;
  singular: string;
  model: string;
  group: "Catalogue" | "Commerce" | "People" | "Website";
  labelField: string;
  fields: Field[];
  columns: Column[];
  searchFields: string[];
  filters?: string[];
  sort: string;
  baseFilter?: Record<string, unknown>;
  defaults?: Record<string, unknown>;
  noCreate?: boolean;
  noEdit?: boolean;
  reorderable?: boolean;
  csv?: string[]; // export columns (dot paths, populated refs allowed)
  importable?: boolean;
  description?: string;
};

const seo: Field[] = [
  { name: "seo.title", label: "SEO title", type: "text", section: "SEO" },
  { name: "seo.description", label: "SEO description", type: "textarea", section: "SEO" },
];
const TEST_TYPES = ["MOCK", "TOPIC_WISE", "PREVIOUS_YEAR", "QUIZ", "CURRENT_AFFAIRS"];
const LANGS = ["English", "Hindi", "Bilingual"];

const list: Resource[] = [
  {
    key: "categories", label: "Categories", singular: "Category", model: "Category", group: "Catalogue", labelField: "name",
    description: "Top-level exam categories shown on the home page and in the Exams menu.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "nameHi", label: "Name (Hindi)", type: "text" },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "Used in the URL: /exams/<slug>" },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "order", label: "Order", type: "number" },
      { name: "isActive", label: "Active", type: "boolean" },
      ...seo,
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "slug", label: "Slug" },
      { key: "order", label: "Order", sortable: true },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["name", "nameHi", "slug"], filters: ["isActive"], sort: "order", defaults: { isActive: true },
  },
  {
    key: "groups", label: "Exam Groups", singular: "Exam group", model: "ExamGroup", group: "Catalogue", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "ref", ref: "categories", required: true },
      { name: "parentGroup", label: "Parent group", type: "ref", ref: "groups" },
      { name: "order", label: "Order", type: "number" },
      { name: "isActive", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "category", label: "Category" },
      { key: "order", label: "Order", sortable: true },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["name", "slug"], filters: ["category", "isActive"], sort: "order", defaults: { isActive: true },
  },
  {
    key: "exams", label: "Exams", singular: "Exam", model: "Exam", group: "Catalogue", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, section: "Basics" },
      { name: "slug", label: "Slug", type: "text", required: true, section: "Basics", hint: "/exam/<slug>" },
      { name: "category", label: "Category", type: "ref", ref: "categories", required: true, section: "Basics" },
      { name: "group", label: "Exam group", type: "ref", ref: "groups", required: true, section: "Basics" },
      { name: "icon", label: "Icon", type: "icon", section: "Basics" },
      { name: "level", label: "Level", type: "text", section: "Basics" },
      { name: "shortDescription", label: "Short description", type: "textarea", wide: true, section: "Basics" },
      { name: "languages", label: "Languages", type: "strings", section: "Basics" },
      { name: "bannerImage", label: "Banner image", type: "image", section: "Basics" },
      { name: "isPopular", label: "Popular", type: "boolean", section: "Visibility" },
      { name: "showOnHome", label: "Show on home page", type: "boolean", section: "Visibility" },
      { name: "isActive", label: "Active", type: "boolean", section: "Visibility" },
      { name: "order", label: "Order", type: "number", section: "Visibility" },
      { name: "overview", label: "Overview", type: "richtext", wide: true, section: "Content" },
      { name: "examPattern", label: "Exam pattern", type: "richtext", wide: true, section: "Content" },
      { name: "syllabus", label: "Syllabus", type: "richtext", wide: true, section: "Content" },
      { name: "eligibility", label: "Eligibility", type: "richtext", wide: true, section: "Content" },
      { name: "features", label: "Feature list", type: "strings", wide: true, section: "Content" },
      { name: "faqs", label: "FAQs", type: "objects", wide: true, section: "Content", of: [
        { name: "q", label: "Question", type: "text", required: true },
        { name: "a", label: "Answer", type: "textarea", required: true },
      ] },
      ...seo,
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "category", label: "Category" },
      { key: "group", label: "Group" },
      { key: "isPopular", label: "Popular", format: "bool" },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["name", "slug"], filters: ["category", "isPopular", "isActive"], sort: "order", defaults: { isActive: true, features: [] },
  },
  {
    key: "tests", label: "Tests", singular: "Test", model: "Test", group: "Catalogue", labelField: "title",
    description: "Mock, topic-wise, previous-year and current-affairs tests. Daily quizzes have their own module.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "exam", label: "Exam", type: "ref", ref: "exams", required: true },
      { name: "type", label: "Type", type: "select", options: TEST_TYPES.filter((t) => t !== "QUIZ"), required: true },
      { name: "totalQuestions", label: "Total questions", type: "number", required: true },
      { name: "totalMarks", label: "Total marks", type: "number", required: true },
      { name: "durationMinutes", label: "Duration (minutes)", type: "number", required: true },
      { name: "negativeMarking", label: "Negative marks per wrong answer", type: "number" },
      { name: "language", label: "Language", type: "select", options: LANGS },
      { name: "isFree", label: "Free", type: "boolean", hint: "Off = locked behind Unlock" },
      { name: "price", label: "Unlock price (₹)", type: "number" },
      { name: "publishDate", label: "Publish date", type: "datetime" },
      { name: "status", label: "Status", type: "select", options: ["PUBLISHED", "DRAFT"] },
      { name: "order", label: "Order", type: "number" },
      { name: "questions", label: "Questions", type: "refs", ref: "questions", wide: true },
    ],
    columns: [
      { key: "title", label: "Title", sortable: true },
      { key: "exam", label: "Exam" },
      { key: "type", label: "Type", format: "badge" },
      { key: "isFree", label: "Free", format: "bool" },
      { key: "price", label: "Price", format: "money", sortable: true },
      { key: "questions", label: "Qs", format: "count" },
      { key: "status", label: "Status", format: "badge" },
    ],
    searchFields: ["title"], filters: ["exam", "type", "isFree", "status"], sort: "-createdAt",
    baseFilter: { type: { $ne: "QUIZ" } }, defaults: { type: "MOCK", status: "PUBLISHED", language: "English", isFree: false, price: 49 },
  },
  {
    key: "quizzes", label: "Daily Quizzes", singular: "Daily quiz", model: "Test", group: "Catalogue", labelField: "title",
    description: "Free daily quizzes. Schedule one by setting when it goes live.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true, hint: "e.g. AFCAT Quiz (18 Nov 2026)" },
      { name: "exam", label: "Exam", type: "ref", ref: "exams", required: true },
      { name: "publishDate", label: "Goes live at", type: "datetime", required: true },
      { name: "totalQuestions", label: "Questions", type: "number", required: true },
      { name: "totalMarks", label: "Marks", type: "number", required: true },
      { name: "durationMinutes", label: "Minutes", type: "number", required: true },
      { name: "status", label: "Status", type: "select", options: ["PUBLISHED", "DRAFT"] },
      { name: "isFree", label: "Free", type: "boolean" },
      { name: "questions", label: "Questions", type: "refs", ref: "questions", wide: true },
    ],
    columns: [
      { key: "title", label: "Title", sortable: true },
      { key: "exam", label: "Exam" },
      { key: "publishDate", label: "Goes live", format: "datetime", sortable: true },
      { key: "questions", label: "Qs", format: "count" },
      { key: "status", label: "Status", format: "badge" },
    ],
    searchFields: ["title"], filters: ["exam", "status"], sort: "-publishDate",
    baseFilter: { type: "QUIZ" }, defaults: { type: "QUIZ", isFree: true, totalQuestions: 20, totalMarks: 20, durationMinutes: 10, status: "PUBLISHED", language: "English" },
  },
  {
    key: "questions", label: "Question Bank", singular: "Question", model: "Question", group: "Catalogue", labelField: "text",
    fields: [
      { name: "text", label: "Question", type: "textarea", required: true, wide: true },
      { name: "options", label: "Options", type: "options4", required: true, wide: true },
      { name: "correctIndex", label: "Correct option", type: "select", num: true, required: true, options: [
        { value: "0", label: "A" }, { value: "1", label: "B" }, { value: "2", label: "C" }, { value: "3", label: "D" },
      ] },
      { name: "topic", label: "Topic", type: "select", options: ["English", "General Knowledge", "Reasoning", "Mathematics", "Defence Awareness"] },
      { name: "difficulty", label: "Difficulty", type: "select", options: ["EASY", "MEDIUM", "HARD"] },
      { name: "language", label: "Language", type: "select", options: LANGS },
      { name: "explanation", label: "Explanation", type: "textarea", wide: true },
      { name: "image", label: "Image", type: "image" },
    ],
    columns: [
      { key: "text", label: "Question" },
      { key: "topic", label: "Topic", sortable: true },
      { key: "difficulty", label: "Difficulty", format: "badge" },
      { key: "language", label: "Language" },
    ],
    searchFields: ["text", "topic", "explanation"], filters: ["topic", "difficulty"], sort: "-createdAt",
    defaults: { difficulty: "MEDIUM", language: "English", options: ["", "", "", ""], correctIndex: 0 },
    csv: ["text", "options.0", "options.1", "options.2", "options.3", "correctIndex", "explanation", "topic", "difficulty", "language"],
    importable: true,
  },
  {
    key: "products", label: "Products & Pricing", singular: "Product", model: "Product", group: "Commerce", labelField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["VIDEO_COURSE", "ELIBRARY", "BUNDLE"], required: true },
      { name: "thumbnail", label: "Thumbnail", type: "image" },
      { name: "mrp", label: "MRP (₹)", type: "number", required: true },
      { name: "salePrice", label: "Sale price (₹)", type: "number", required: true },
      { name: "validityDays", label: "Validity (days)", type: "number" },
      { name: "shelf", label: "E-Library collection", type: "text", hint: "Must match a name in Site Settings → E-Library collections" },
      { name: "isActive", label: "Active", type: "boolean" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "includes", label: "What's included", type: "objects", wide: true, of: [
        { name: "label", label: "Item", type: "text", required: true },
        { name: "count", label: "Count", type: "number" },
      ] },
      { name: "exams", label: "Linked exams", type: "refs", ref: "exams", wide: true },
    ],
    columns: [
      { key: "thumbnail", label: "", format: "image" },
      { key: "title", label: "Title", sortable: true },
      { key: "type", label: "Type", format: "badge" },
      { key: "mrp", label: "MRP", format: "money", sortable: true },
      { key: "salePrice", label: "Price", format: "money", sortable: true },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["title", "slug"], filters: ["type", "isActive"], sort: "createdAt", defaults: { isActive: true, validityDays: 365, type: "ELIBRARY" },
  },
  {
    key: "coupons", label: "Coupons", singular: "Coupon", model: "Coupon", group: "Commerce", labelField: "code",
    fields: [
      { name: "code", label: "Code", type: "text", required: true, hint: "Stored in capitals" },
      { name: "type", label: "Type", type: "select", options: ["PERCENT", "FLAT"], required: true },
      { name: "value", label: "Value", type: "number", required: true, hint: "Percent or ₹ amount" },
      { name: "expiry", label: "Expires on", type: "date" },
      { name: "usageLimit", label: "Usage limit (0 = unlimited)", type: "number" },
      { name: "usedCount", label: "Times used", type: "number" },
    ],
    columns: [
      { key: "code", label: "Code", sortable: true },
      { key: "type", label: "Type", format: "badge" },
      { key: "value", label: "Value" },
      { key: "expiry", label: "Expires", format: "date", sortable: true },
      { key: "usedCount", label: "Used" },
    ],
    searchFields: ["code"], filters: ["type"], sort: "-createdAt", defaults: { type: "PERCENT", usageLimit: 0, usedCount: 0 },
  },
  {
    key: "keys", label: "Activation Keys", singular: "Activation key", model: "ActivationKey", group: "Commerce", labelField: "code",
    fields: [
      { name: "code", label: "Code", type: "text", required: true },
      { name: "product", label: "Unlocks product", type: "ref", ref: "products" },
      { name: "status", label: "Status", type: "select", options: ["UNUSED", "REDEEMED"] },
      { name: "redeemedBy", label: "Redeemed by", type: "ref", ref: "students" },
      { name: "redeemedAt", label: "Redeemed at", type: "datetime" },
      { name: "tests", label: "Unlocks tests", type: "refs", ref: "tests", wide: true },
    ],
    columns: [
      { key: "code", label: "Code", sortable: true },
      { key: "product", label: "Product" },
      { key: "tests", label: "Tests", format: "count" },
      { key: "status", label: "Status", format: "badge" },
      { key: "redeemedBy", label: "Redeemed by" },
      { key: "redeemedAt", label: "Redeemed", format: "date" },
    ],
    searchFields: ["code"], filters: ["status", "product"], sort: "-createdAt", defaults: { status: "UNUSED" },
    csv: ["code", "status", "product.title", "redeemedBy.email", "redeemedAt"],
  },
  {
    key: "orders", label: "Orders", singular: "Order", model: "Order", group: "Commerce", labelField: "_id", noCreate: true,
    fields: [
      { name: "status", label: "Status", type: "select", options: ["PENDING", "PAID", "FAILED", "REFUNDED"] },
      { name: "user", label: "Student", type: "ref", ref: "students" },
      { name: "product", label: "Product", type: "ref", ref: "products" },
      { name: "test", label: "Test", type: "ref", ref: "tests" },
      { name: "amount", label: "Amount (₹)", type: "number" },
      { name: "coupon", label: "Coupon", type: "text" },
      { name: "gateway", label: "Gateway", type: "text" },
    ],
    columns: [
      { key: "user", label: "Student" },
      { key: "product", label: "Product" },
      { key: "test", label: "Test" },
      { key: "amount", label: "Amount", format: "money", sortable: true },
      { key: "status", label: "Status", format: "badge" },
      { key: "createdAt", label: "Date", format: "datetime", sortable: true },
    ],
    searchFields: ["coupon", "status"], filters: ["status"], sort: "-createdAt", csv: ["_id", "user.email", "product.title", "test.title", "amount", "coupon", "status", "createdAt"],
  },
  {
    key: "students", label: "Students", singular: "Student", model: "User", group: "People", labelField: "email",
    description: "Open a student to see their attempts or unlock tests and products manually.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "state", label: "State", type: "text" },
      { name: "password", label: "Password", type: "password", hint: "Leave blank to keep the current password" },
      { name: "streak", label: "Quiz streak (days)", type: "number" },
      { name: "examInterests", label: "Exam interests", type: "refs", ref: "exams", wide: true },
      { name: "unlockedTests", label: "Unlocked tests", type: "refs", ref: "tests", wide: true, section: "Access" },
      { name: "purchasedProducts", label: "Purchased products", type: "refs", ref: "products", wide: true, section: "Access" },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "phone", label: "Phone" },
      { key: "unlockedTests", label: "Unlocked", format: "count" },
      { key: "streak", label: "Streak", sortable: true },
      { key: "createdAt", label: "Joined", format: "date", sortable: true },
    ],
    searchFields: ["name", "email", "phone"], sort: "-createdAt", baseFilter: { role: "STUDENT" }, defaults: { role: "STUDENT" },
    csv: ["name", "email", "phone", "state", "streak", "createdAt"],
  },
  {
    key: "attempts", label: "Attempts & Results", singular: "Attempt", model: "Attempt", group: "People", labelField: "_id", noCreate: true, noEdit: true,
    fields: [
      { name: "user", label: "Student", type: "ref", ref: "students" },
      { name: "test", label: "Test", type: "ref", ref: "tests" },
    ],
    columns: [
      { key: "user", label: "Student" },
      { key: "test", label: "Test" },
      { key: "score", label: "Score", sortable: true },
      { key: "accuracy", label: "Accuracy", format: "pct", sortable: true },
      { key: "rank", label: "AIR", sortable: true },
      { key: "completedAt", label: "Completed", format: "datetime", sortable: true },
    ],
    searchFields: [], filters: ["user", "test"], sort: "-completedAt",
  },
  {
    key: "leads", label: "Leads", singular: "Lead", model: "Lead", group: "People", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "examInterest", label: "Exam interest", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] },
      { name: "sourcePage", label: "Source page", type: "text" },
      { name: "message", label: "Message", type: "textarea", wide: true },
      { name: "notes", label: "Notes", type: "objects", wide: true, of: [
        { name: "text", label: "Note", type: "textarea", required: true },
        { name: "by", label: "By", type: "text" },
      ] },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "phone", label: "Phone" },
      { key: "examInterest", label: "Interest" },
      { key: "status", label: "Status", format: "badge" },
      { key: "createdAt", label: "Received", format: "datetime", sortable: true },
    ],
    searchFields: ["name", "phone", "email", "examInterest", "message"], filters: ["status"], sort: "-createdAt", defaults: { status: "NEW" },
    csv: ["name", "phone", "email", "examInterest", "status", "sourcePage", "message", "createdAt"],
  },
  {
    key: "users", label: "Staff Users", singular: "Staff user", model: "User", group: "People", labelField: "email",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "role", label: "Role", type: "select", options: ["ADMIN", "EDITOR", "SUPPORT"], required: true, hint: "Editor: content only. Support: leads, students, orders." },
      { name: "password", label: "Password", type: "password", hint: "At least 8 characters. Leave blank when editing to keep it." },
    ],
    columns: [
      { key: "name", label: "Name", sortable: true },
      { key: "email", label: "Email" },
      { key: "role", label: "Role", format: "badge" },
      { key: "createdAt", label: "Added", format: "date" },
    ],
    searchFields: ["name", "email"], filters: ["role"], sort: "name", baseFilter: { role: { $in: ["ADMIN", "EDITOR", "SUPPORT"] } }, defaults: { role: "EDITOR" },
  },
  {
    key: "hero", label: "Hero Slides", singular: "Hero slide", model: "HeroSlide", group: "Website", labelField: "heading", reorderable: true,
    description: "The first active slide is the home page hero. Drag to reorder.",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true, wide: true },
      { name: "subheading", label: "Subheading", type: "textarea", wide: true },
      { name: "ctaLabel", label: "Button label", type: "text" },
      { name: "ctaLink", label: "Button link", type: "text" },
      { name: "image", label: "Image", type: "image" },
      { name: "isActive", label: "Active", type: "boolean" },
    ],
    columns: [
      { key: "heading", label: "Heading" },
      { key: "ctaLabel", label: "Button" },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["heading"], sort: "order", defaults: { isActive: true },
  },
  {
    key: "stats", label: "Stats", singular: "Stat", model: "Stat", group: "Website", labelField: "label", reorderable: true,
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", hint: "e.g. + or X" },
      { name: "icon", label: "Icon", type: "icon" },
    ],
    columns: [
      { key: "label", label: "Label" },
      { key: "value", label: "Value" },
      { key: "suffix", label: "Suffix" },
    ],
    searchFields: ["label"], sort: "order",
  },
  {
    key: "testimonials", label: "Testimonials", singular: "Testimonial", model: "Testimonial", group: "Website", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "exam", label: "Exam", type: "text", required: true },
      { name: "rank", label: "Rank / result", type: "text" },
      { name: "rating", label: "Rating (1–5)", type: "select", num: true, options: ["5", "4", "3", "2", "1"] },
      { name: "photo", label: "Photo", type: "image" },
      { name: "isDemo", label: "Demo record", type: "boolean" },
      { name: "quote", label: "Quote", type: "textarea", required: true, wide: true },
    ],
    columns: [
      { key: "photo", label: "", format: "image" },
      { key: "name", label: "Name", sortable: true },
      { key: "exam", label: "Exam" },
      { key: "rank", label: "Rank" },
      { key: "rating", label: "Rating" },
    ],
    searchFields: ["name", "exam", "quote"], sort: "createdAt", defaults: { rating: 5, isDemo: false },
  },
  {
    key: "toppers", label: "Toppers", singular: "Topper", model: "Topper", group: "Website", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "exam", label: "Exam", type: "text", required: true },
      { name: "rank", label: "Rank", type: "text", required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "photo", label: "Photo", type: "image" },
      { name: "isDemo", label: "Demo record", type: "boolean" },
    ],
    columns: [
      { key: "photo", label: "", format: "image" },
      { key: "name", label: "Name", sortable: true },
      { key: "exam", label: "Exam" },
      { key: "rank", label: "Rank" },
      { key: "year", label: "Year", sortable: true },
    ],
    searchFields: ["name", "exam"], sort: "-year", defaults: { isDemo: false, year: new Date().getFullYear() },
  },
  {
    key: "faculty", label: "Faculty", singular: "Faculty member", model: "Faculty", group: "Website", labelField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "photo", label: "Photo", type: "image" },
      { name: "isDemo", label: "Demo record", type: "boolean" },
      { name: "socials.linkedin", label: "LinkedIn URL", type: "text" },
      { name: "socials.youtube", label: "YouTube URL", type: "text" },
      { name: "bio", label: "Bio", type: "textarea", wide: true },
    ],
    columns: [
      { key: "photo", label: "", format: "image" },
      { key: "name", label: "Name", sortable: true },
      { key: "role", label: "Role" },
    ],
    searchFields: ["name", "role"], sort: "createdAt", defaults: { isDemo: false },
  },
  {
    key: "blog", label: "Blog & Current Affairs", singular: "Post", model: "BlogPost", group: "Website", labelField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: [{ value: "BLOG", label: "Blog / guide" }, { value: "CURRENT_AFFAIRS", label: "Current affairs" }] },
      { name: "category", label: "Category", type: "text" },
      { name: "author", label: "Author", type: "text" },
      { name: "publishedAt", label: "Published", type: "datetime" },
      { name: "readMinutes", label: "Read time (minutes)", type: "number" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "tags", label: "Tags", type: "strings" },
      { name: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { name: "body", label: "Body", type: "richtext", wide: true },
      ...seo,
    ],
    columns: [
      { key: "coverImage", label: "", format: "image" },
      { key: "title", label: "Title", sortable: true },
      { key: "type", label: "Type", format: "badge" },
      { key: "category", label: "Category" },
      { key: "publishedAt", label: "Published", format: "date", sortable: true },
    ],
    searchFields: ["title", "category", "author"], filters: ["type"], sort: "-publishedAt", defaults: { type: "BLOG", readMinutes: 4 },
  },
  {
    key: "faqs", label: "FAQs", singular: "FAQ", model: "FAQ", group: "Website", labelField: "question", reorderable: true,
    fields: [
      { name: "question", label: "Question", type: "text", required: true, wide: true },
      { name: "answer", label: "Answer", type: "textarea", required: true, wide: true },
      { name: "group", label: "Group", type: "text" },
    ],
    columns: [
      { key: "question", label: "Question" },
      { key: "group", label: "Group" },
    ],
    searchFields: ["question", "answer"], sort: "order", defaults: { group: "General" },
  },
  {
    key: "announcements", label: "Announcements", singular: "Announcement", model: "Announcement", group: "Website", labelField: "text",
    description: "The newest active announcement within its dates shows in the bar above the header.",
    fields: [
      { name: "text", label: "Text", type: "text", required: true, wide: true },
      { name: "link", label: "Link", type: "text" },
      { name: "isActive", label: "Active", type: "boolean" },
      { name: "startDate", label: "Starts", type: "date" },
      { name: "endDate", label: "Ends", type: "date" },
      { name: "image", label: "Image", type: "image" },
    ],
    columns: [
      { key: "text", label: "Text" },
      { key: "startDate", label: "Starts", format: "date" },
      { key: "endDate", label: "Ends", format: "date" },
      { key: "isActive", label: "Active", format: "bool" },
    ],
    searchFields: ["text"], sort: "-createdAt", defaults: { isActive: true },
  },
  {
    key: "pages", label: "Pages", singular: "Page", model: "Page", group: "Website", labelField: "title",
    description: "About, privacy, terms and refund pages.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true, hint: "about, privacy, terms or refund" },
      { name: "body", label: "Body", type: "richtext", wide: true },
      ...seo,
    ],
    columns: [
      { key: "title", label: "Title" },
      { key: "slug", label: "Slug" },
      { key: "updatedAt", label: "Updated", format: "datetime", sortable: true },
    ],
    searchFields: ["title", "slug"], sort: "slug",
  },
  {
    key: "settings", label: "Site Settings", singular: "Site settings", model: "SiteSettings", group: "Website", labelField: "siteName", noCreate: true,
    fields: [
      { name: "siteName", label: "Site name", type: "text", required: true, section: "Brand" },
      { name: "tagline", label: "Tagline", type: "text", section: "Brand" },
      { name: "motto", label: "Motto", type: "text", section: "Brand" },
      { name: "logo", label: "Logo", type: "image", section: "Brand" },
      { name: "favicon", label: "Favicon", type: "image", section: "Brand" },
      { name: "colours.primary", label: "Primary (navy)", type: "colour", section: "Colours" },
      { name: "colours.primaryLight", label: "Primary light", type: "colour", section: "Colours" },
      { name: "colours.accent", label: "Accent (gold)", type: "colour", section: "Colours" },
      { name: "colours.olive", label: "Secondary accent (olive)", type: "colour", section: "Colours" },
      { name: "email", label: "Email", type: "text", section: "Contact" },
      { name: "phone", label: "Phone", type: "text", section: "Contact" },
      { name: "whatsappNumber", label: "WhatsApp number", type: "text", section: "Contact", hint: "Digits with country code, e.g. 919876543210" },
      { name: "workingHours", label: "Working hours", type: "text", section: "Contact" },
      { name: "address", label: "Address", type: "textarea", section: "Contact", wide: true },
      { name: "mapEmbed", label: "Map embed URL", type: "text", section: "Contact", wide: true, hint: "Google Maps embed URL (https://www.google.com/maps?...&output=embed)" },
      { name: "socials.facebook", label: "Facebook", type: "text", section: "Social" },
      { name: "socials.instagram", label: "Instagram", type: "text", section: "Social" },
      { name: "socials.youtube", label: "YouTube", type: "text", section: "Social" },
      { name: "socials.telegram", label: "Telegram", type: "text", section: "Social" },
      { name: "socials.linkedin", label: "LinkedIn", type: "text", section: "Social" },
      { name: "elibraryCollections", label: "E-Library collections (in display order)", type: "strings", wide: true, section: "E-Library" },
      { name: "services", label: "Services shown on the home page", type: "objects", wide: true, section: "Services", of: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "text", label: "One-line description", type: "text" },
        { name: "href", label: "Link", type: "text" },
        { name: "icon", label: "Icon", type: "icon" },
        { name: "featured", label: "Show as a large card", type: "boolean" },
      ] },
      { name: "director.name", label: "Name", type: "text", section: "Director profile" },
      { name: "director.role", label: "Role", type: "text", section: "Director profile" },
      { name: "director.photo", label: "Photo", type: "image", section: "Director profile" },
      { name: "director.story", label: "Story (blank lines separate paragraphs)", type: "textarea", wide: true, section: "Director profile" },
      { name: "directorMessage.title", label: "Title", type: "text", section: "Letter to aspirants" },
      { name: "directorMessage.name", label: "Signed by", type: "text", section: "Letter to aspirants" },
      { name: "directorMessage.photo", label: "Photo", type: "image", section: "Letter to aspirants" },
      { name: "directorMessage.body", label: "Message", type: "textarea", wide: true, section: "Letter to aspirants" },
      { name: "seoDefaults.title", label: "Default title", type: "text", section: "SEO", wide: true },
      { name: "seoDefaults.description", label: "Default description", type: "textarea", section: "SEO", wide: true },
      { name: "seoDefaults.ogImage", label: "Social share image", type: "image", section: "SEO" },
      { name: "footerLinks", label: "Extra footer links", type: "objects", section: "Footer", wide: true, of: [
        { name: "label", label: "Label", type: "text", required: true },
        { name: "href", label: "Link", type: "text", required: true },
      ] },
    ],
    columns: [{ key: "siteName", label: "Site" }],
    searchFields: [], sort: "createdAt",
  },
];

export const RESOURCES: Record<string, Resource> = Object.fromEntries(list.map((r) => [r.key, r]));
export const RESOURCE_LIST = list;
export const GROUPS = ["Catalogue", "Commerce", "People", "Website"] as const;

export const resourceRoles = (key: string) => sectionRoles(key);

export const fieldOf = (r: Resource, name: string) => r.fields.find((f) => f.name === name);
