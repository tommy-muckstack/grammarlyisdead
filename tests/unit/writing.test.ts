import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import nspell from "nspell";
import { checkText, computeStats, sentences, countSyllables, applyIssue, detectTones } from "@/lib/writing/check";
import { DEFAULT_GOALS, type Goals, type Speller } from "@/lib/writing/types";
let sp: Speller; beforeAll(() => { sp = nspell(fs.readFileSync("public/dict/en.aff"), fs.readFileSync("public/dict/en.dic")); });
const rules = (t: string, g: Goals = DEFAULT_GOALS, s: Speller | null = null) => checkText(t, g, s).map(i => i.rule);
const fixed = (t: string, g: Goals = DEFAULT_GOALS, s: Speller | null = null) => { let out = t; for (const i of checkText(t, g, s).reverse()) if (i.replacements[0] !== undefined) out = applyIssue(out, i, i.replacements[0]); return out; };
describe("correctness", () => {
  it("repeated words (but not 'had had')", () => { expect(fixed("This is is a test.")).toBe("This is a test."); expect(rules("She had had enough.")).not.toContain("repeated-word"); });
  it("a / an", () => { expect(fixed("I ate a apple and an banana.")).toBe("I ate an apple and a banana."); expect(rules("A university, an hour, a user, an MBA, a one-off, an honest man.")).not.toContain("a-an"); });
  it("homophones and idioms", () => {
    expect(fixed("Its a good day and your welcome.")).toBe("It's a good day and you're welcome.");
    expect(fixed("Their is a problem and they could of left.")).toBe("There is a problem and they could have left.");
    expect(fixed("She loves there own house, alot.")).toBe("She loves their own house, a lot.");
    expect(fixed("This is better then that.")).toBe("This is better than that.");
    expect(fixed("Irregardless, it works.")).toBe("Regardless, it works.");
  });
  it("subject-verb agreement", () => { expect(fixed("He don't know. They is late. I has a plan. You was right.")).toBe("He doesn't know. They are late. I have a plan. You were right."); expect(rules("They was been there")).not.toContain("subject-verb"); });
  it("capitalises i and sentence starts, but respects abbreviations", () => {
    expect(fixed("i think i'm done. we left.")).toBe("I think I'm done. We left.");
    expect(rules("We met Dr. smith and e.g. bob came.")).not.toContain("capitalize"); expect(rules("Version 1.2 is out. see you.")).toContain("capitalize");
  });
  it("spacing and punctuation", () => { expect(fixed("Hello  world , this is fine.Okay,great")).toBe("Hello world, this is fine. Okay, great"); expect(rules("It costs 1,000 dollars.")).not.toContain("space-after-comma"); });
  it("ignores URLs, emails and code", () => { expect(checkText("Visit www.example.com,or mail bob@x.com. Use `alot`.", DEFAULT_GOALS, sp)).toEqual([]); });
  it("spelling with suggestions, skipping names, acronyms and the ignore list", () => {
    const iss = checkText("I definately recieve teh mesage from Zorblax and NASA.", DEFAULT_GOALS, sp).filter(i => i.rule === "spelling"); expect(iss.map(i => i.text)).toEqual(["definately", "recieve", "teh", "mesage"]);
    expect(iss[0]!.replacements).toContain("definitely"); expect(iss[1]!.replacements).toContain("receive"); expect(iss[2]!.replacements[0]).toBe("the");
    expect(checkText("The mesage arrived.", DEFAULT_GOALS, sp, new Set(["spelling:mesage"]))).toEqual([]);
    expect(checkText("Teh cat.", DEFAULT_GOALS, sp)[0]!.replacements[0]).toBe("The");
  });
});
it("plural pronouns with singular verbs", () => { expect(fixed("We needs help and they goes home. I likes it.")).toBe("We need help and they go home. I like it."); });
describe("clarity, engagement and delivery", () => {
  it("wordy phrases and plain words", () => { expect(fixed("In order to win, we utilize a large number of tools.")).toBe("To win, we use many tools."); expect(rules("We utilize it.", { ...DEFAULT_GOALS, formality: "formal" })).not.toContain("formal-word"); });
  it("passive voice but not adjectives", () => { expect(rules("The report was written by Ana.")).toContain("passive"); expect(rules("We are excited and she was tired.")).not.toContain("passive"); });
  it("long sentences", () => { const s = "Start " + "and then more ".repeat(15) + "finish."; expect(rules(s)).toContain("long-sentence"); expect(rules("Short one.")).not.toContain("long-sentence"); });
  it("intensifiers and fillers", () => { expect(fixed("It was very good. Basically it works.")).toBe("It was excellent. It works."); });
  it("repeated sentence openers", () => { expect(rules("We ran. We hid. We won.")).toContain("repeated-opener"); expect(rules("We ran. They hid. We won.")).not.toContain("repeated-opener"); });
  it("formality goal drives contractions and slang", () => {
    expect(rules("We can't go.", { ...DEFAULT_GOALS, formality: "formal" })).toContain("contraction"); expect(rules("We can't go.")).not.toContain("contraction");
    expect(fixed("We can't go, it's late.", { ...DEFAULT_GOALS, formality: "formal" })).toBe("We cannot go, it is late.");
    expect(rules("We're gonna go.", { ...DEFAULT_GOALS, formality: "informal" })).not.toContain("slang"); expect(rules("We're gonna go.")).toContain("slang");
  });
  it("shouting and exclamation overuse", () => { expect(fixed("This is URGENT now.")).toBe("This is Urgent now."); expect(rules("A! B! C! D! E!")).toContain("exclamation"); });
  it("higher-priority issues win overlaps", () => { const i = checkText("it is very very good", DEFAULT_GOALS); expect(new Set(i.map(x => x.start)).size).toBe(i.length); expect(i.every((x, k) => k === 0 || x.start >= i[k - 1]!.end)).toBe(true); });
});
describe("stats", () => {
  it("syllables, sentences, tone, score", () => {
    expect(countSyllables("beautiful")).toBe(3); expect(countSyllables("the")).toBe(1);
    expect(sentences("One. Two! Three? Dr. Who is here.").length).toBe(4);
    expect(detectTones("Thanks so much, I really appreciate it. Please reply asap.")).toEqual(["Friendly", "Urgent"].slice(0, 2));
    const clean = "The team shipped the new editor today. It runs fast and the notes are easy to read."; const c = computeStats(clean, checkText(clean, DEFAULT_GOALS, sp)); expect(c.score).toBe(100); expect(c.words).toBe(17);
    const messy = "i definately recieve alot of mesages in order to fix teh stuff."; const t = checkText(messy, DEFAULT_GOALS, sp); expect(computeStats(messy, t).score!).toBeLessThan(70);
    expect(computeStats("Hi.", []).score).toBeNull();
  });
});
