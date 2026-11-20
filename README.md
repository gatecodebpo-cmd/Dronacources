# Drona – website and admin panel (demo)

A full redesign of [dronacourses.com](https://dronacourses.com): the public exam-practice site plus an admin panel that controls every piece of public content.

- **Stack:** Next.js 15 (App Router, TypeScript), plain CSS (design tokens in `app/globals.css` + CSS Modules), Framer Motion, Lucide icons, Recharts, MongoDB + Mongoose, NextAuth (credentials).
- **Everything public comes from MongoDB.** Edit it in `/admin` and the site updates immediately.

---

## 1. Setup

Requirements: Node.js 20+ and a MongoDB Atlas database (the free tier is enough).

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run seed                 # wipes the database and loads the demo data
npm run dev                  # http://localhost:3000
```

### `.env.local`

| Variable | What it is |
|---|---|
| `MONGODB_URI` | Atlas connection string, including the database name, e.g. `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/dronacourses` |
| `NEXTAUTH_SECRET` | Any long random string. Generate one with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The site's base URL: `http://localhost:3000` locally, your domain in production |

In Atlas, allow your IP (or `0.0.0.0/0` for Vercel) under **Network Access**.

### Demo accounts (created by `npm run seed`)

| Role | Email | Password | Can access |
|---|---|---|---|
| Admin | `admin@drona.demo` | `Admin@123` | Everything |
| Editor | `editor@drona.demo` | `Editor@123` | Content modules only |
| Support | `support@drona.demo` | `Support@123` | Leads, students, orders, attempts |
| Student | `student@drona.demo` | `Student@123` | Public site and student dashboard |

**Coupons:** `DRONA10` (10% off), `WELCOME50` (₹50 off).

**Activation keys** (each works once; run the seed again to reset them):
- `DRONA-BOOK-00RS`, `-01TX`, `-02W2`, `-03Y7`, `-050C` unlock the *CDS AFCAT SSC Guides* bundle.
- `DRONA-AF26-062H`, `-074M`, `-086R`, `-098W`, `-0AB1` unlock AFCAT Mock Tests 2–4.

---

## 2. What's inside

```
app/
  (site)/          public pages: home, exams, exam/[slug], e-library, current-affairs, blog,
                   about, contact, legal pages, sitemap, login/signup, dashboard, checkout, result
  (player)/test/   full-screen test player (no site header/footer)
  admin/           /admin/login and the admin panel (one generic module page per resource)
  api/             leads, subscribe, attempts, checkout, activate, signup, me/*, admin/*
  globals.css      design tokens: colours, type scale, spacing, radius, shadows, z-index, motion
components/
  ui/              Button, Badge/Chip, Tabs, Accordion, Modal/Drawer, Toast, Skeleton, Field,
                   Table/Pagination, EmptyState, Carousel, Reveal, CountUp, Magnetic
  cards/           the 10-card system (exam, category, test, quiz, product, stat,
                   testimonial, topper, post, feature)
  layout/          header + mega menu + mobile drawer, footer, page hero, exam search
  home/ exam/ content/ player/ student/ admin/
lib/               db connection, auth, data queries, scoring, i18n dictionary, SEO helpers
models/            all Mongoose schemas
scripts/seed.ts    demo data (scripts/data/* holds questions, exam write-ups and articles)
```

### Things worth knowing

- **Caching:** public pages are statically generated and refresh every 5 minutes. Every admin save also calls `revalidatePath("/", "layout")`, so changes show at once.
- **Ranks are simulated.** State and All-India ranks blend real attempts with a simulated candidate pool (`lib/scoring.ts`), so a new site still shows believable ranks. The result page says the rank is estimated.
- **Demo tests reuse a 40-question bank.** A test listed as 100 questions (AFCAT) plays the 40 available questions, and the instructions screen says so.
- **Payments are demo only.** Checkout is clearly labelled "Demo mode – no real payment" and marks the order PAID straight away.
- **Placeholder data.** Phone, address, working hours, YouTube/Instagram links and the director's name are marked `[Demo data – confirm with client]`. Testimonials, toppers and faculty are flagged `isDemo` and show a "Demo data" badge in the admin.
- **Languages:** all interface labels switch between English and Hindi (`lib/i18n.ts`). Content stays in English, except category names (`nameHi`).
- **Icons** come from one cached sprite, `public/icons.svg`. After adding an icon name to `lib/icons.tsx`, run `npm run icons` to rebuild it.
- **Navigation data** (mega menu and exam search) loads from `/api/nav` the first time the menu opens or a search box gets focus, instead of being embedded in every page.
- **Production build beside a running dev server:** `NEXT_DIST_DIR=.next-prod npm run build`, then `NEXT_DIST_DIR=.next-prod npx next start -p 3001`. Add `ANALYZE=true` to the build for the bundle analyzer.
- **Uploads** are saved to `public/uploads`. This works locally but **not on Vercel**, whose filesystem is read-only. See the deployment notes below.

---

## Tests

- `npm test`: typecheck plus the admin path-helper self-check.
- `npm run test:e2e`: 32 browser checks against a running site (pages at phone width, free test → result, login, coupon checkout, activation key, dashboard, role protection, admin edit going live, search, menus, light-only theme, right-click rules). Point it at a server with `BASE_URL=http://localhost:3001 npm run test:e2e`. It uses the installed Microsoft Edge (`PW_CHANNEL=chrome` for Chrome).
- The e2e run changes demo data (unlocks tests, redeems a key, edits a stat), so run `npm run seed` afterwards.

---

## 3. Deploying (Vercel + MongoDB Atlas)

1. Push the project to GitHub. `.env.local` is git-ignored; keep it that way.
2. In Atlas: **Network Access → Add IP → `0.0.0.0/0`** (Vercel has no fixed IPs). Use a database user that only has access to this database.
3. In Vercel: **New Project → import the repo**. Under **Environment Variables**, add `MONGODB_URI`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (`https://your-domain`).
4. Deploy. Run `npm run seed` once from your machine against the production `MONGODB_URI` if the database is empty.
5. **Image uploads in production:** move uploads to object storage (Cloudinary, S3 or Vercel Blob) before the admin is used for real. The only file to change is `app/api/admin/upload/route.ts`.

The build downloads Google Fonts. If `next build` fails with an error in `next/font`, that is a network hiccup; run it again.

---

## 4. Client demo walkthrough (about 10 minutes)

Open two windows: the public site, and `/admin` logged in as `admin@drona.demo`.

1. **Home page.** Point out the hero: the motto animating in sequence, the live exam search (type "nda"), and the test-and-result card composition built in code. Scroll through the stats counting up, the category grid, Perform → Analyse → Improve, the free quiz carousel, the result-analytics preview, toppers and the director's letter.
2. **Navigation.** Open **Exams** in the header: categories on the left, groups on the right, search on top. Narrow the window to show the mobile drawer with its two levels.
3. **Exam page.** Go to **AFCAT**. Show the sticky sub-nav, the pattern and syllabus, and the animated tabs (Mock / Topic-Wise / Previous Year / Quizzes / Current Affairs). Click **Unlock ₹49** on Mock 2: the price and what's included are shown before checkout. This fixes a gap on the old site.
4. **Free test.** Start **AFCAT Mock Test 1**. Show the instructions screen, the timer ring, the colour-coded palette, mark for review, keys 1–4, and the submit confirmation.
5. **Result.** Show the score ring, accuracy, State and All-India rank, the answer breakdown chart, topic-wise bars and the question-by-question review with explanations. Score 70% or more for the confetti.
6. **Log in and buy.** Log in as `student@drona.demo`, unlock Mock 3 with coupon `DRONA10`, and show the demo payment success. The test is now open on the exam page.
7. **Activation key.** Click **Activation Key** in the header and redeem `DRONA-AF26-074M`. Mocks 2–4 unlock. Entering the same key again is refused.
8. **Student dashboard.** Show the streak, average score, recent attempts, recommended tests and purchased items.
9. **Admin dashboard.** Switch to the admin window: KPIs, charts, recent leads. Open **Leads** and drag a lead from *New* to *Contacted*, adding a note.
10. **Live edits.** In the admin:
    - change the **Hero Slides** heading;
    - change the **Stats** "Students" value;
    - edit an **Exam's** overview in the rich-text editor;
    - change the accent colour in **Site Settings** (watch the live preview).

    Refresh the public site: every change is already live. Then log in as `editor@drona.demo` to show that Leads, Orders and Settings are hidden from editors.

Run `npm run seed` after a rehearsal to put the demo data back.
