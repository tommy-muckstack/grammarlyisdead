// Drives the real app (production build, demo account) to capture product shots AND smoke-test the writing assistant end to end.
import fs from "node:fs"; import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("grammarlyisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name) => { await page.screenshot({ path: `${dir}/${name}.png` }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("grammarlyisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.getByTestId("empty").waitFor(); await page.screenshot({ path: `${dir}/dashboard-empty.png` });
  await page.getByRole("button", { name: "Try a sample" }).click(); await page.waitForURL(/\/app\/docs\//); const docUrl = page.url();
  const cards = page.getByTestId("card"); const ta = page.getByLabel("Document text");
  await page.getByText(/\d+ words/).waitFor(); await cards.first().waitFor(); await page.waitForTimeout(400);
  const rules = async () => page.getByTestId("card").evaluateAll(els => els.map(e => e.getAttribute("data-rule")));
  let r = await rules(); for (const must of ["spelling", "its-its", "plural-subject-verb", "wordy", "modal-of", "capitalize", "lowercase-i", "double-space", "your-youre", "passive", "intensifier", "there-their"]) assert.ok(r.includes(must), `sample should trigger ${must}; got ${r.join(",")}`);
  const score0 = Number(await page.getByTestId("score").innerHTML().then(s => s.replace(/<[^>]+>/g, "")));
  // spelling suggestion, highlight, accept
  const spell = page.locator('[data-rule="spelling"]', { hasText: "definately" }); await spell.click(); await page.waitForTimeout(250); assert.ok(await page.locator("mark.is-active").count() >= 1, "caret/selection highlights the issue");
  await save(page, "editor");
  await spell.getByRole("button", { name: "definitely" }).click(); assert.match(await ta.inputValue(), /definitely/); assert.doesNotMatch(await ta.inputValue(), /definately/);
  // clarity filter
  await page.getByTestId("cat-clarity").click(); await page.waitForTimeout(300); assert.ok((await page.getByTestId("card").count()) >= 2); await save(page, "clarity");
  const wordy = page.locator('[data-rule="wordy"]', { hasText: "In order to" }); await wordy.getByRole("button", { name: "To", exact: true }).click(); assert.doesNotMatch(await ta.inputValue(), /In order to/)
  await page.getByTestId("cat-all").click();
  // dismiss + add to dictionary
  const before = await page.getByTestId("card").count(); await page.locator('[data-rule="spelling"]', { hasText: "recomendations" }).getByRole("button", { name: "Add to dictionary" }).click(); assert.equal(await page.getByTestId("card").count(), before - 1);
  await page.locator('[data-rule="intensifier"]').first().getByRole("button", { name: "Dismiss" }).click(); assert.equal(await page.locator('[data-rule="intensifier"]').count(), 0);
  // typing re-checks live
  await ta.click(); await page.keyboard.press("Control+End"); await page.keyboard.type("\n\nWe can't wait, and it's gonna be teh best."); await page.locator('[data-rule="spelling"]', { hasText: "teh" }).waitFor();
  // formality goal drives delivery suggestions
  assert.equal(await page.locator('[data-rule="contraction"]').count(), 0); await page.getByLabel("Formality").selectOption("formal"); await page.waitForTimeout(300); assert.ok((await page.locator('[data-rule="contraction"]').count()) >= 1, "formal flags contractions");
  await page.getByTestId("cat-delivery").click(); await page.waitForTimeout(300); await save(page, "formal"); await page.getByLabel("Formality").selectOption("informal"); await page.waitForTimeout(200); assert.equal(await page.locator('[data-rule="contraction"]').count(), 0);
  await page.getByTestId("cat-all").click();
  // fix everything with first replacement: score rises
  for (let i = 0; i < 40; i++) { const b = page.locator(".gwc__acc").first(); if (!(await b.count())) break; await b.click(); await page.waitForTimeout(40); }
  const score1 = Number(await page.getByTestId("score").innerHTML().then(s => s.replace(/<[^>]+>/g, ""))); assert.ok(score1 > score0, `score improves (${score0} → ${score1})`);
  assert.match(await page.getByTestId("stats").innerText(), /Words\s*\d+/);
  // persistence across reload + dashboard
  await page.waitForTimeout(500); const saved = await ta.inputValue(); await page.reload(); await page.getByText(/\d+ words/).waitFor(); assert.equal(await ta.inputValue(), saved, "document persists");
  await page.goto(base + "/app"); await page.getByTestId("docs").getByText("Follow-up email (sample)").waitFor(); await page.screenshot({ path: `${dir}/dashboard.png` }); fs.copyFileSync(`${dir}/dashboard.png`, `${pub}dashboard.png`);
  // another user context starts empty (per-account storage)
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const m = await c2.newPage();
  await m.goto(base + "/app"); await m.waitForURL(/\/login/);
  await m.goto(base); await m.waitForTimeout(500); await m.screenshot({ path: `${dir}/home-top.png` }); await m.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await m.goto(base + "/#pricing"); await m.waitForTimeout(300); await m.screenshot({ path: `${dir}/home-pricing.png` }); await m.goto(base + "/login"); await m.waitForTimeout(300); await m.screenshot({ path: `${dir}/login.png` });
  console.log("grammarlyisdead shots + smoke OK");
}, {});
