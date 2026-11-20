// End-to-end checks against a running site.  Usage: BASE_URL=http://localhost:3001 npm run test:e2e
// Needs a seeded database (npm run seed). The run unlocks tests, redeems a key and edits a stat,
// so run `npm run seed` afterwards to reset the demo data.
// Uses the installed Microsoft Edge by default; set PW_CHANNEL=chrome (or "" for bundled Chromium) to change.
import { chromium } from "playwright-core";

const B = process.env.BASE_URL || "http://localhost:3000";
const channel = process.env.PW_CHANNEL ?? "msedge";
const results = [];
const errors = [];
const check = (name, ok, info = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${info ? `  (${info})` : ""}`);
};
async function step(name, fn) {
  try {
    await fn();
  } catch (e) {
    check(name, false, String(e.message).split("\n")[0]);
  }
}

const browser = await chromium.launch(channel ? { channel } : {});
const watch = (page, tag) => {
  page.on("pageerror", (e) => errors.push(`${tag}: ${e.message.slice(0, 160)}`));
  page.on("response", (r) => r.status() >= 500 && errors.push(`${tag}: ${r.status()} ${r.url()}`));
};

/* ---------- public pages render, no sideways scroll on phones ---------- */
await step("public pages", async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(p, "pages");
  for (const path of ["/", "/exams", "/exams/defence-police", "/exam/afcat", "/e-library", "/current-affairs", "/about", "/contact", "/privacy", "/login", "/signup"]) {
    const res = await p.goto(B + path, { waitUntil: "networkidle" });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`page ${path} loads at 390px`, res.status() === 200 && overflow <= 0, `status ${res.status()}, overflow ${overflow}px`);
  }
  await p.close();
});

/* ---------- guest takes the free AFCAT mock ---------- */
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
watch(p, "student");
await step("guest test → result", async () => {
  await p.goto(B + "/exam/afcat", { waitUntil: "networkidle" });
  const href = await p.locator('a[href^="/test/"]').first().getAttribute("href");
  await p.goto(B + href, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /start the test/i }).click();
  for (let i = 0; i < 5; i++) {
    await p.getByRole("radio").nth(i % 4).click();
    await p.keyboard.press("ArrowRight");
  }
  await p.getByRole("button", { name: /^submit$/i }).first().click();
  await p.getByRole("dialog").getByRole("button", { name: /submit/i }).click();
  await p.waitForURL(/\/result\//, { timeout: 60000 });
  check("guest test → result", true);
});

/* ---------- student login, checkout, activation key, dashboard ---------- */
await step("student login", async () => {
  await p.goto(B + "/login", { waitUntil: "networkidle" });
  await p.fill('input[name="email"]', "student@drona.demo");
  await p.fill('input[type="password"]', "Student@123");
  await p.locator('main form button[type="submit"]').first().click();
  await p.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 });
  check("student login", true);
});
await step("unlock with coupon (demo checkout)", async () => {
  await p.goto(B + "/exam/afcat", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /unlock ₹/i }).first().click();
  await p.getByRole("dialog").getByRole("link", { name: /continue to unlock/i }).click();
  await p.waitForURL(/checkout/, { timeout: 30000 });
  await p.waitForLoadState("networkidle");
  const coupon = p.locator('input[name="coupon"], input[placeholder*="oupon" i], input[id*="coupon" i]').first();
  if (await coupon.count()) {
    await coupon.fill("DRONA10");
    await p.getByRole("button", { name: /apply/i }).click();
    await p.waitForTimeout(1500);
  }
  await p.getByRole("button", { name: /pay/i }).first().click();
  await p.getByText(/received/i).first().waitFor({ timeout: 30000 });
  check("unlock with coupon (demo checkout)", true);
});
await step("activation key", async () => {
  const redeem = () =>
    p.evaluate(async () => (await fetch("/api/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "DRONA-AF26-086R" }) })).status);
  const first = await redeem();
  const again = await redeem();
  check("activation key redeems once", first === 200 && again >= 400, `first ${first}, reuse ${again}`);
});
await step("student dashboard", async () => {
  await p.goto(B + "/dashboard", { waitUntil: "networkidle" });
  check("student dashboard", /dashboard/i.test(await p.title()));
});
await step("student blocked from admin API", async () => {
  const s = await p.evaluate(async () => (await fetch("/api/admin/stats")).status);
  check("student blocked from admin API", s === 401 || s === 403, `status ${s}`);
});

/* ---------- admin edits a stat; public home reflects it ---------- */
await step("admin edit goes live", async () => {
  const a = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  watch(a, "admin");
  await a.goto(B + "/admin/login", { waitUntil: "networkidle" });
  await a.fill('input[name="email"]', "admin@drona.demo");
  await a.fill('input[type="password"]', "Admin@123");
  await a.locator('button[type="submit"]').click();
  await a.waitForURL((u) => u.pathname === "/admin", { timeout: 30000 });
  const status = await a.evaluate(async () => {
    const l = await (await fetch("/api/admin/stats")).json();
    const st = l.items.find((x) => /student/i.test(x.label));
    return (await fetch("/api/admin/stats/" + st._id, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...st, value: 4321 }) })).status;
  });
  const home = await (await fetch(B + "/")).text();
  check("admin edit goes live", status === 200 && (home.includes("4,321") || home.includes("4321")), `PUT ${status}`);
  for (const path of ["/admin/exams", "/admin/leads", "/admin/settings", "/admin/questions", "/admin/hero", "/admin/keys"]) {
    await a.goto(B + path, { waitUntil: "networkidle" });
    check(`admin ${path} opens`, a.url().endsWith(path));
  }
});

/* ---------- header: lazy nav, search, drawer, light-only theme ---------- */
await step("navigation and search", async () => {
  const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(d, "nav");
  const navCalls = [];
  d.on("request", (r) => r.url().includes("/api/nav") && navCalls.push(1));
  await d.goto(B + "/", { waitUntil: "networkidle" });
  const box = d.locator("#main input[type=search]").first();
  await box.click();
  await box.pressSequentially("afc", { delay: 50 });
  await d.getByRole("option").first().waitFor({ timeout: 15000 });
  check("hero exam search", (await d.getByRole("option").count()) > 0);
  await d.goto(B + "/", { waitUntil: "networkidle" });
  await d.getByRole("button", { name: /^Exams/ }).click();
  await d.getByRole("link", { name: "UPSC NDA" }).first().waitFor({ timeout: 15000 });
  check("mega menu loads groups", true);
  const toggles = await d.getByRole("button", { name: /Switch to (dark|light) mode/ }).count();
  const dp = await browser.newPage({ colorScheme: "dark" });
  await dp.goto(B + "/", { waitUntil: "networkidle" });
  const bg = await dp.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await dp.close();
  check("light theme only (no toggle, light even when OS is dark)", toggles === 0 && bg === "rgb(247, 248, 251)", `toggles ${toggles}, body ${bg}`);

  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watch(m, "drawer");
  await m.goto(B + "/exam/afcat", { waitUntil: "networkidle" });
  await m.getByRole("button", { name: "Menu" }).click();
  const dlg = m.getByRole("dialog");
  await dlg.getByRole("button", { name: /Defence/ }).first().waitFor({ timeout: 15000 });
  await dlg.getByRole("button", { name: /Defence/ }).first().click();
  await dlg.getByRole("link", { name: "Indian Air Force" }).waitFor({ timeout: 5000 });
  check("mobile drawer, two levels", true);
});

/* ---------- right-click blocked on the site, allowed in fields and admin ---------- */
await step("right-click rules", async () => {
  const c = await browser.newPage();
  const ctxMenu = (sel) =>
    c.evaluate((s) => {
      const ev = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      document.querySelector(s).dispatchEvent(ev);
      return ev.defaultPrevented;
    }, sel);
  await c.goto(B + "/", { waitUntil: "networkidle" });
  check("right-click blocked on page", await ctxMenu("h1"));
  await c.goto(B + "/contact", { waitUntil: "networkidle" });
  check("right-click allowed in form fields", !(await ctxMenu("textarea")));
  await c.goto(B + "/admin/login", { waitUntil: "networkidle" });
  check("right-click allowed in admin", !(await ctxMenu("h1, h2")));
});

await browser.close();
check("no page errors or 5xx responses", errors.length === 0, errors.slice(0, 3).join(" | "));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
