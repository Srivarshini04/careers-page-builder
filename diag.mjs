import { chromium } from "playwright";
const S = "/tmp/claude-1000/-home-user-white-carrot/c4f0e39f-9318-4004-ae7d-6ffa4c5bbd89/scratchpad";
const b = await chromium.launch({ channel: "chrome" });
for (const slug of ["northwind-labs", "lumen-health"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/${slug}/careers`, { waitUntil: "domcontentloaded" });
  await p.evaluate(async () => {
    await Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {}))));
    window.scrollTo(0, document.body.scrollHeight);
  });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1000);

  const imgs = await p.locator("main section img").evaluateAll(els =>
    els.map(e => ({ loaded: e.naturalWidth > 0, w: e.naturalWidth })));
  console.log(`${slug}: section images = ${JSON.stringify(imgs)}`);
  const numbered = await p.locator("main section li span.tabular-nums").count();
  const perks = await p.locator("main section li.bg-\\(--brand-primary-soft\\)").count();
  console.log(`  values numbered cards=${numbered}  benefit perk cards=${perks}`);
  await p.screenshot({ path: `${S}/${slug}-careers-full.jpg`, fullPage: true, type: "jpeg", quality: 80 });
  await ctx.close();
}
await b.close();
