import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage();
const notes = [];
p.on("requestfailed", r => notes.push(`FAILED ${r.failure()?.errorText} ${r.url().slice(0,60)}`));
p.on("response", r => { if (r.url().includes("supabase")) notes.push(`RESP ${r.status()} ${r.url().slice(0,60)}`); });
await p.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
const reach = await p.evaluate(async (u) => {
  try { const r = await fetch(u + "/auth/v1/health"); return "status " + r.status; }
  catch (e) { return "THREW: " + String(e).slice(0, 90); }
}, process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("browser -> Supabase:", reach);
await p.getByRole("button", { name: /^sign in$/i }).click();
await p.waitForTimeout(9000);
console.log("URL:", p.url());
console.log(notes.length ? notes.slice(0,6).join("\n") : "(no supabase traffic seen)");
await b.close();
