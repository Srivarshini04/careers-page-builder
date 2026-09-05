/**
 * End-to-end walkthrough of both user journeys against a real dev server and a real
 * Supabase project. Deliberately not mocked — the point is to prove that a save actually
 * reaches Postgres and comes back after a reload.
 *
 * Prerequisites:
 *   1. `npm run dev` running on http://localhost:3000
 *   2. .env.local pointing at a seeded Supabase project
 *   3. `npx playwright install chromium` (or set PW_CHANNEL=chrome to use system Chrome)
 *
 * Run:  npm run test:e2e
 *
 * It mutates demo data on purpose, then restores the seeded state on the way out.
 */

import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const CHANNEL = process.env.PW_CHANNEL;

const passed = [];
const failed = [];

function check(name, ok, detail = "") {
  const line = `${name}${detail ? ` — ${detail}` : ""}`;
  (ok ? passed : failed).push(line);
  console.log(`${ok ? "PASS" : "FAIL"}  ${line}`);
}

const browser = await chromium.launch(CHANNEL ? { channel: CHANNEL } : {});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

/*
 * The embedded YouTube player trips Chrome's permissions-policy warnings for features we
 * neither use nor grant (compute-pressure, and similar). Those come from the third-party
 * iframe, not from this app, so they are filtered out by exact reason rather than by
 * silencing console errors wholesale.
 */
const THIRD_PARTY_NOISE = /Permissions policy violation: (compute-pressure|accelerometer|gyroscope|picture-in-picture)/i;

const problems = [];
page.on("pageerror", (error) => problems.push(String(error)));
page.on("console", (message) => {
  if (message.type() !== "error") return;
  const text = message.text();
  if (!THIRD_PARTY_NOISE.test(text)) problems.push(text);
});

const sectionOrder = () =>
  page
    .locator("li:has(button[aria-expanded]) span.block.truncate")
    .evaluateAll((nodes) =>
      nodes.filter((_, index) => index % 2 === 0).map((node) => node.textContent.trim()),
    );

/**
 * Expands one of the builder's structure groups. Waits for aria-expanded to flip rather
 * than assuming the click landed — the first click after a cold compile can arrive
 * before hydration, and a silent no-op here would fail much later and confusingly.
 */
const openGroup = async (name) => {
  const trigger = page.getByRole("button", { name: new RegExp(`^${name}`, "i") }).first();
  await trigger.waitFor({ state: "visible" });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await trigger.getAttribute("aria-expanded")) === "true") return;
    await trigger.click();
    try {
      await page.waitForFunction(
        (label) => {
          const button = [...document.querySelectorAll("button[aria-expanded]")].find((el) =>
            el.textContent?.trim().toLowerCase().startsWith(label.toLowerCase()),
          );
          return button?.getAttribute("aria-expanded") === "true";
        },
        name,
        { timeout: 4000 },
      );
      return;
    } catch {
      // fall through and retry
    }
  }
  throw new Error(`Could not expand the "${name}" group`);
};

/** The live preview now renders inside an iframe, so it has its own viewport. */
const preview = () => page.frameLocator("iframe[title='Careers page live preview']");

const resultCount = async () =>
  (await page.getByText(/showing \d+ of \d+/i).first().textContent()) ?? "";

try {
  // ---------------------------------------------------------------- recruiter: sign in
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  check(
    "login page loads",
    await page.getByRole("heading", { name: /sign in to your workspace/i }).isVisible(),
  );
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/northwind-labs\/edit/, { timeout: 20000 });
  check("login lands on the company this recruiter owns", page.url().includes("/northwind-labs/edit"));

  // ---------------------------------------------------------------- builder: branding
  await page.waitForSelector("text=Live preview");
  check("save is disabled while there is nothing to save", await page.getByRole("button", { name: /save changes/i }).isDisabled());
  check("structure panel is present", await page.getByRole("heading", { name: /page structure/i }).isVisible());
  const groupStates = await Promise.all(
    ["Branding", "Content", "Sections", "Publish"].map((name) =>
      page.getByRole("button", { name: new RegExp(`^${name}`) }).getAttribute("aria-expanded"),
    ),
  );
  check(
    "every structure group starts collapsed",
    groupStates.every((state) => state === "false"),
    groupStates.join(", "),
  );

  await openGroup("Branding");
  await page.locator("input.font-mono.uppercase").first().fill("#e11d48");
  await page.waitForTimeout(600);
  const heroCta = preview().locator('a[href="#open-roles"]').nth(1);
  const ctaColor = await heroCta.evaluate((el) => getComputedStyle(el).backgroundColor);
  check("brand colour repaints the live preview", ctaColor === "rgb(225, 29, 72)", ctaColor);
  check("unsaved-changes indicator appears", await page.getByText(/unsaved changes/i).isVisible());

  // ---------------------------------------------------------------- builder: hero
  await openGroup("Content");
  await page.locator("#hero-title").fill("Ship infrastructure people actually enjoy.");
  await page.waitForTimeout(400);
  check(
    "hero title updates the preview as you type",
    await preview().locator("h1").first().textContent().then((t) => /ship infrastructure/i.test(t ?? "")),
  );

  // ---------------------------------------------------------------- device preview
  // Each device must give the iframe a real viewport, not a squeezed desktop layout.
  const deviceLayout = async () => ({
    viewport: await preview().locator("body").evaluate(() => window.innerWidth),
    sectionNav: await preview().locator("nav[aria-label='Page sections']").isVisible(),
    jobColumns: (await preview()
      .locator("ul.grid.items-start")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns)).split(" ").length,
  });

  const desktop = await deviceLayout();
  check("desktop preview renders a 1280px viewport", desktop.viewport === 1280 && desktop.sectionNav && desktop.jobColumns === 2, JSON.stringify(desktop));

  await page.getByRole("button", { name: "Tablet" }).click();
  await page.waitForTimeout(900);
  const tablet = await deviceLayout();
  check("tablet preview renders an 834px viewport", tablet.viewport === 834 && !tablet.sectionNav && tablet.jobColumns === 2, JSON.stringify(tablet));

  await page.getByRole("button", { name: "Mobile" }).click();
  await page.waitForTimeout(900);
  const mobileLayout = await deviceLayout();
  check("mobile preview renders a 390px viewport, single column", mobileLayout.viewport === 390 && !mobileLayout.sectionNav && mobileLayout.jobColumns === 1, JSON.stringify(mobileLayout));

  await page.locator("#hero-title").fill("Ship infrastructure people actually enjoy.");
  await page.waitForTimeout(700);
  check(
    "preview still updates live while in mobile mode",
    await preview().locator("h1").first().textContent().then((t) => /ship infrastructure/i.test(t ?? "")),
  );

  await page.getByRole("button", { name: "Desktop" }).click();
  await page.waitForTimeout(700);

  // The preview iframe must be same-origin with a real URL: an about:blank document
  // sends no referrer and YouTube refuses to play (error 153).
  check(
    "preview iframe runs on a real same-origin document",
    await preview().locator("body").evaluate(() => document.URL).then((url) => url.includes("/preview-frame")),
  );
  check(
    "culture video embeds inside the preview",
    (await preview().locator('iframe[title*="culture video"]').count()) === 1,
  );

  check(
    "builder window itself does not scroll",
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1),
  );

  // ---------------------------------------------------------------- builder: sections
  await openGroup("Sections");
  await page.waitForTimeout(300);
  const before = await sectionOrder();

  await page.getByRole("button", { name: /^Hide Benefits and perks$/ }).click();
  await page.waitForTimeout(300);
  check("hiding a section dims it in the preview", (await preview().getByText(/candidates won.t see this section/i).count()) > 0);

  await page.getByRole("button", { name: /^Move What we believe up$/ }).click();
  await page.waitForTimeout(300);
  const after = await sectionOrder();
  check("reorder changes section order", JSON.stringify(before) !== JSON.stringify(after), `${before.join(", ")} -> ${after.join(", ")}`);

  // ---------------------------------------------------------------- persistence
  await page.getByRole("button", { name: /save changes/i }).click();
  await page.getByText(/^Saved$/).waitFor({ timeout: 20000 });
  check("save reports success", true);
  check("save disables again once clean", await page.getByRole("button", { name: /save changes/i }).isDisabled());

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=Live preview");
  await page.waitForTimeout(1200); // let the preview iframe mount after reload
  check(
    "hero title survives a reload",
    await preview().locator("h1").first().textContent().then((t) => /ship infrastructure/i.test(t ?? "")),
  );
  // Groups collapse again on reload, so reopen before reading a control inside one.
  await openGroup("Branding");
  check(
    "brand colour survives a reload",
    (await page.locator("input.font-mono.uppercase").first().inputValue()).toLowerCase() === "#e11d48",
  );
  await openGroup("Sections");
  await page.waitForTimeout(400);
  check("section order survives a reload", JSON.stringify(await sectionOrder()) === JSON.stringify(after));

  // ---------------------------------------------------------------- header navigation
  check(
    "builder links to the public careers page",
    (await page.getByRole("link", { name: /^careers page$/i }).getAttribute("href")) ===
      "/northwind-labs/careers",
  );
  check(
    "builder links to the preview route",
    (await page.getByRole("link", { name: /^preview$/i }).getAttribute("href")) ===
      "/northwind-labs/preview",
  );

  // ---------------------------------------------------------------- preview route
  await page.goto(`${BASE}/northwind-labs/preview`, { waitUntil: "networkidle" });
  check("preview shows the recruiter toolbar", await page.getByRole("link", { name: /back to editor/i }).isVisible());
  check("preview still shows hidden sections, dimmed", (await page.getByText(/candidates won.t see this section/i).count()) > 0);

  // ---------------------------------------------------------------- candidate page
  await page.goto(`${BASE}/northwind-labs/careers`, { waitUntil: "networkidle" });
  check("public page reflects the saved hero", /ship infrastructure/i.test((await page.getByRole("heading", { level: 1 }).textContent()) ?? ""));
  check("hidden section is absent for candidates", (await page.getByRole("heading", { name: "Benefits and perks" }).count()) === 0);
  check("no preview-only markers leak to candidates", (await page.getByText(/candidates won.t see this section/i).count()) === 0);
  check(
    "careers header links back to the company directory",
    (await page.getByRole("link", { name: /browse all companies/i }).getAttribute("href")) === "/",
  );

  // ---------------------------------------------------------------- search and filters
  check("all roles listed by default", /showing 10 of 10/i.test(await resultCount()), (await resultCount()).trim());

  await page.locator("#job-search").fill("front");
  await page.waitForTimeout(300);
  check("title search narrows the list", /showing 1 of 10/i.test(await resultCount()));
  check("search returns the right role", await page.getByRole("heading", { name: "Frontend Engineer" }).isVisible());

  await page.locator("#job-search").fill("");
  await page.locator("#job-location").selectOption("Bengaluru, India");
  await page.waitForTimeout(300);
  check("location filter narrows the list", /showing [1-9] of 10/i.test(await resultCount()), (await resultCount()).trim());

  await page.locator("#job-type").selectOption("Internship");
  await page.waitForTimeout(300);
  check("location and job type combine", /showing 1 of 10/i.test(await resultCount()));
  check("combined filter returns the right role", await page.getByRole("heading", { name: "Software Engineering Intern" }).isVisible());

  await page.locator("#job-search").fill("designer");
  await page.waitForTimeout(300);
  check("impossible combination shows the empty state", (await page.getByText(/no jobs found/i).count()) > 0);

  await page.getByRole("button", { name: /clear all filters/i }).click();
  await page.waitForTimeout(300);
  check("clear filters restores the full list", /showing 10 of 10/i.test(await resultCount()));
  check("clear filters disables when there is nothing to clear", await page.getByRole("button", { name: /^clear filters$/i }).isDisabled());

  // Role detail opens in a native <dialog>: modal semantics, Escape to close.
  await page.getByRole("button", { name: /view role details for Frontend Engineer/i }).click();
  await page.waitForTimeout(300);
  const roleDialog = page.getByRole("dialog");
  check("role detail opens in a modal", await roleDialog.isVisible());
  check(
    "modal shows the full description, not the clamped snippet",
    await roleDialog.getByText(/own the component library/i).isVisible(),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check("Escape closes the role modal", (await page.getByRole("dialog").count()) === 0 || !(await page.getByRole("dialog").isVisible()));

  // ---------------------------------------------------------------- accessibility
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() =>
    document.activeElement ? getComputedStyle(document.activeElement).outlineWidth : "0px",
  );
  check("keyboard focus is visible", outline !== "0px", outline);

  const headingLevels = await page.locator("h1, h2, h3").evaluateAll((els) => els.map((e) => e.tagName));
  check("exactly one h1 on the page", headingLevels.filter((t) => t === "H1").length === 1);

  // ---------------------------------------------------------------- SEO
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsed = jsonLd.map((raw) => JSON.parse(raw));
  check("Organization JSON-LD present", parsed.some((n) => n["@type"] === "Organization"));
  check("one JobPosting per job", parsed.filter((n) => n["@type"] === "JobPosting").length === 10);
  check("JobPosting uses schema.org employmentType", parsed.filter((n) => n["@type"] === "JobPosting").every((n) => /^(FULL_TIME|PART_TIME|CONTRACTOR|INTERN|TEMPORARY|OTHER)$/.test(n.employmentType)));

  const notFound = await page.request.get(`${BASE}/no-such-company/careers`);
  check("unknown slug returns a real 404", notFound.status() === 404, `HTTP ${notFound.status()}`);

  // ---------------------------------------------------------------- mobile
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${BASE}/northwind-labs/careers`, { waitUntil: "networkidle" });
  const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("no horizontal overflow at 375px (careers)", overflow <= 0, `${overflow}px`);

  await mobilePage.locator("#job-search").fill("engineer");
  await mobilePage.waitForTimeout(300);
  check("filters usable on mobile", /showing [1-9] of 10/i.test((await mobilePage.getByText(/showing \d+ of \d+/i).first().textContent()) ?? ""));

  const mobileEditor = await browser.newContext({ viewport: { width: 375, height: 812 }, storageState: await context.storageState() });
  const editorPage = await mobileEditor.newPage();
  await editorPage.goto(`${BASE}/northwind-labs/edit`, { waitUntil: "networkidle" });
  const editorOverflow = await editorPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("no horizontal overflow at 375px (builder)", editorOverflow <= 0, `${editorOverflow}px`);

  // ---------------------------------------------------------------- second tenant
  await page.goto(`${BASE}/lumen-health/careers`, { waitUntil: "networkidle" });
  const lumenColor = await page.locator('a[href="#open-roles"]').nth(1).evaluate((el) => getComputedStyle(el).backgroundColor);
  check("second company renders its own brand colour", lumenColor === "rgb(15, 157, 118)", lumenColor);
  check("second company shows only its own roles", /showing 4 of 4/i.test((await page.getByText(/showing \d+ of \d+/i).first().textContent()) ?? ""));

  // ---------------------------------------------------------------- tenant isolation
  /*
   * Each company has its own recruiter. Signing in as one and opening the other
   * company's builder must be refused — this is the check that would catch a broken
   * RLS policy or a missing ownership guard, so it drives the real UI rather than
   * asserting against the database.
   */
  // These navigations use domcontentloaded, not networkidle: the careers page embeds a
  // YouTube player that keeps connections open, so the network never goes idle.
  const otherTenant = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const otherPage = await otherTenant.newPage();

  await otherPage.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await otherPage.getByRole("button", { name: /^Lumen Health/ }).click();
  await otherPage.getByRole("button", { name: /^sign in$/i }).click();
  await otherPage.waitForURL(/\/lumen-health\/edit/, { timeout: 30000 });
  check("second recruiter lands on their own company", otherPage.url().includes("/lumen-health/edit"));

  // A recruiter route they do not own is refused, and they land on the one thing they
  // are allowed to see — the public page — rather than on a dead end.
  /*
   * The redirect is issued server-side, so the navigation has to be allowed to settle —
   * reading url() straight after domcontentloaded catches the pre-redirect URL.
   */
  const settlesOnCareers = async (path) => {
    await otherPage.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    try {
      await otherPage.waitForURL(/\/northwind-labs\/careers$/, { timeout: 20000 });
      return true;
    } catch {
      return false;
    }
  };

  check(
    "second recruiter is redirected off the other company's builder",
    await settlesOnCareers("/northwind-labs/edit"),
    otherPage.url(),
  );
  check(
    "second recruiter is redirected off the other company's preview",
    await settlesOnCareers("/northwind-labs/preview"),
    otherPage.url(),
  );

  check(
    "the redirected page carries no builder controls",
    (await otherPage.getByRole("link", { name: /^edit page$/i }).count()) === 0 &&
      (await otherPage.getByText(/as its owner/i).count()) === 0,
  );

  await otherPage.goto(`${BASE}/northwind-labs/careers`, { waitUntil: "domcontentloaded" });
  check(
    "the other company's public page is still readable by anyone",
    await otherPage.getByRole("heading", { level: 1 }).isVisible(),
  );
  check(
    "no owner bar on a company this recruiter does not own",
    (await otherPage.getByText(/as its owner/i).count()) === 0,
  );

  await otherPage.goto(`${BASE}/lumen-health/careers`, { waitUntil: "domcontentloaded" });
  check(
    "owner bar appears on the recruiter's own live page",
    (await otherPage.getByText(/as its owner/i).count()) === 1 &&
      (await otherPage.getByRole("link", { name: /^edit page$/i }).getAttribute("href")) ===
        "/lumen-health/edit",
  );

  // Candidates and crawlers are anonymous and must never receive the owner chrome.
  const anonymous = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(`${BASE}/northwind-labs/careers`, { waitUntil: "domcontentloaded" });
  check(
    "anonymous visitors never see the owner bar",
    (await anonymousPage.getByText(/as its owner/i).count()) === 0 &&
      (await anonymousPage.getByRole("link", { name: /^edit page$/i }).count()) === 0,
  );

  await otherPage.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const editLinks = await otherPage.getByRole("link", { name: /edit page/i }).evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")),
  );
  check(
    "directory offers Edit only for the company this recruiter owns",
    editLinks.length === 1 && editLinks[0] === "/lumen-health/edit",
    editLinks.join(", ") || "(none)",
  );

  check("no uncaught console or page errors", problems.length === 0, problems.slice(0, 3).join(" | "));
} finally {
  await browser.close();
  // Leave the demo project exactly as the seed created it.
  await import("./reset-demo-data.mjs");
}

console.log(`\n=== ${passed.length} passed, ${failed.length} failed ===`);
if (failed.length) {
  console.log(failed.map((line) => `  x ${line}`).join("\n"));
}
process.exit(failed.length ? 1 : 0);
