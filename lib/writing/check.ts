import { ABBREV, RULES } from "./rules";
import type { Category, Goals, Issue, Speller, Stats } from "./types";
const URLISH = /\b(?:https?:\/\/|www\.)\S+|[\w.+-]+@[\w-]+\.[\w.-]+|\b[\w-]+\.(?:com|org|net|io|co|dev|app|ai|edu|gov)\b\S*/gi;
const TYPOS: Record<string, string> = { teh: "the", recieve: "receive", definately: "definitely", seperate: "separate", occured: "occurred", untill: "until", wich: "which", becuase: "because", adress: "address", acheive: "achieve", beleive: "believe", wierd: "weird", thier: "their", freind: "friend", tommorow: "tomorrow", goverment: "government", enviroment: "environment", accomodate: "accommodate", noticable: "noticeable", reccomend: "recommend", succesful: "successful", mesage: "message", embarass: "embarrass", publically: "publicly", adn: "and", taht: "that", hte: "the" };
const PRI: Record<Category, number> = { correctness: 0, delivery: 1, clarity: 2, engagement: 3 };
const WEIGHT: Record<Category, number> = { correctness: 4, clarity: 2, engagement: 1.5, delivery: 1.5 };
const protectedRanges = (t: string) => { const out: [number, number][] = []; let m: RegExpExecArray | null; const re = new RegExp(URLISH.source, "gi"); while ((m = re.exec(t))) out.push([m.index, m.index + m[0].length]); const code = /`[^`\n]*`/g; while ((m = code.exec(t))) out.push([m.index, m.index + m[0].length]); return out; };
const inside = (rs: [number, number][], a: number, b: number) => rs.some(([s, e]) => a < e && b > s);
const matchCase = (orig: string, rep: string) => (orig === orig.toUpperCase() && orig.length > 1 ? rep.toUpperCase() : orig[0] === orig[0]!.toUpperCase() ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep);
/** Sentence spans [start,end) for the text (end includes terminal punctuation). */
export function sentences(text: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = []; const re = /[^.!?\n]+(?:[.!?]+(?=\s|$)|$|\n)/g; let m: RegExpExecArray | null;
  let cur: { start: number; end: number } | null = null;
  while ((m = re.exec(text))) { const piece = m[0]; const lead = piece.length - piece.trimStart().length; const s = m.index + lead; const e = m.index + piece.trimEnd().length; if (e <= s) continue;
    if (cur && ABBREV.test(text.slice(cur.start, cur.end)) && !/\n/.test(piece)) { cur.end = e; continue; }
    cur = { start: s, end: e }; out.push(cur); }
  return out;
}
export function countSyllables(w: string) { w = w.toLowerCase().replace(/[^a-z]/g, ""); if (!w) return 0; if (w.length <= 3) return 1; w = w.replace(/eau/g, "a").replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, ""); const m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1); }
export function checkText(text: string, goals: Goals, speller?: Speller | null, ignored: ReadonlySet<string> = new Set()): Issue[] {
  const all: Issue[] = []; const prot = protectedRanges(text); let n = 0;
  const push = (i: Omit<Issue, "id">) => { if (i.end <= i.start || inside(prot, i.start, i.end)) return; if (ignored.has(`${i.rule}:${i.text.toLowerCase()}`)) return; all.push({ ...i, id: `i${n++}` }); };
  for (const r of RULES) { if (r.when && !r.when(goals)) continue; const re = new RegExp(r.re.source, r.re.flags.includes("g") ? r.re.flags : r.re.flags + "g"); let m: RegExpExecArray | null;
    while ((m = re.exec(text))) { if (m[0] === "") { re.lastIndex++; continue; } const reps = r.fix(m); if (r.rule === "repeated-word" && reps.length === 0) continue;
      push({ start: m.index, end: m.index + m[0].length, category: r.category, rule: r.rule, title: r.title, message: r.message, text: m[0], replacements: reps }); } }
  // a / an
  const an = /\b(a|an)\s+([A-Za-z][\w'-]*)/gi; let m: RegExpExecArray | null;
  while ((m = an.exec(text))) { const art = m[1]!, w = m[2]!; const lw = w.toLowerCase(); if (/^[A-Z]{2,}$/.test(w)) continue;
    const vowelSound = /^(?:[aeiou]|hour|honest|honor|honour|heir)/.test(lw) && !/^(?:uni|use|usu|uti|ubiq|euro|one|once|ura|uri|uter)/.test(lw);
    if (art.toLowerCase() === "a" && vowelSound) push({ start: m.index, end: m.index + art.length, category: "correctness", rule: "a-an", title: "“a” vs “an”", message: `Use “an” before a vowel sound (“${w}”).`, text: art, replacements: [matchCase(art, "an")] });
    else if (art.toLowerCase() === "an" && !vowelSound) push({ start: m.index, end: m.index + art.length, category: "correctness", rule: "a-an", title: "“a” vs “an”", message: `Use “a” before a consonant sound (“${w}”).`, text: art, replacements: [matchCase(art, "a")] }); }
  // sentence capitalisation
  const cs = /(^|[.!?]\s+|\n\s*)([a-z])/g;
  while ((m = cs.exec(text))) { const idx = m.index + m[1]!.length; if (m[1] && /^[.!?]/.test(m[1]) && ABBREV.test(text.slice(Math.max(0, idx - 12), idx).trimEnd())) continue; const w = /^[a-z]+/.exec(text.slice(idx))![0]!; if (/^[a-z]$/.test(w) && text[idx + 1] === ")") continue; if (m[1] && !/^[.!?]/.test(m[1]) && !/^\s*$/.test(m[1]) ) continue;
    if (/^\s*\n\s*$/.test(m[1] ?? "") && /[a-z,;:]\s*$/.test(text.slice(0, m.index))) continue; // line wrap mid-sentence
    push({ start: idx, end: idx + 1, category: "correctness", rule: "capitalize", title: "Capitalize the first word", message: "Sentences begin with a capital letter.", text: text[idx]!, replacements: [text[idx]!.toUpperCase()] }); }
  // spelling
  if (speller) { const wre = /[A-Za-z]+(?:['’][A-Za-z]+)*/g; while ((m = wre.exec(text))) { const w = m[0]!; if (w.length < 2 || /^[A-Z]+$/.test(w) || /[A-Z]/.test(w.slice(1))) continue; const prev = text[m.index - 1]; if (prev === "@" || prev === "#" || prev === "_" || /\d/.test(prev ?? "")) continue;
      const sentenceStart = /(^|[.!?]\s+|\n\s*)$/.test(text.slice(0, m.index)); if (/^[A-Z]/.test(w) && !sentenceStart) continue; if (speller.correct(w) || speller.correct(w.replace(/’/g, "'")) || /^[A-Z][a-z]+$/.test(w) && speller.correct(w.toLowerCase())) continue;
      const sug = [...new Set([...(TYPOS[w.toLowerCase()] ? [TYPOS[w.toLowerCase()]!] : []), ...speller.suggest(w.replace(/’/g, "'"))])].slice(0, 4).map(s => matchCase(w, s)); push({ start: m.index, end: m.index + w.length, category: "correctness", rule: "spelling", title: "Misspelled word", message: `“${w}” may be misspelled.`, text: w, replacements: sug }); } }
  // long sentences + repeated openers
  const sents = sentences(text); const wc = (s: string) => (s.match(/[A-Za-z0-9’']+/g) ?? []).length;
  for (const s of sents) { const n2 = wc(text.slice(s.start, s.end)); if (n2 > 40) { const fw = /^[A-Za-z0-9’'-]+/.exec(text.slice(s.start))?.[0] ?? ""; if (fw) push({ start: s.start, end: s.start + fw.length, category: "clarity", rule: "long-sentence", title: "Long sentence", message: `This sentence has ${n2} words. Consider splitting it into two.`, text: fw, replacements: [] }); } }
  for (let i = 2; i < sents.length; i++) { const f = (k: number) => (/^[A-Za-z’']+/.exec(text.slice(sents[k]!.start))?.[0] ?? "").toLowerCase(); const a = f(i - 2); if (a.length > 1 && a === f(i - 1) && a === f(i)) { const w = /^[A-Za-z’']+/.exec(text.slice(sents[i]!.start))![0]!; push({ start: sents[i]!.start, end: sents[i]!.start + w.length, category: "engagement", rule: "repeated-opener", title: "Repetitive sentence start", message: `Three sentences in a row begin with “${w}”. Vary your openings.`, text: w, replacements: [] }); } }
  // exclamation overuse
  const ex = [...text.matchAll(/!+/g)]; if (ex.length >= 4) for (const e of ex.slice(3)) push({ start: e.index!, end: e.index! + e[0].length, category: "delivery", rule: "exclamation", title: "Many exclamation marks", message: "Too many exclamation marks can feel overexcited.", text: e[0], replacements: ["."] });
  // resolve overlaps: keep higher-priority, earlier, longer
  all.sort((a, b) => a.start - b.start || PRI[a.category] - PRI[b.category] || b.end - a.end);
  const kept: Issue[] = []; for (const i of all.sort((a, b) => PRI[a.category] - PRI[b.category] || a.start - b.start)) if (!kept.some(k => i.start < k.end && i.end > k.start)) kept.push(i);
  return kept.sort((a, b) => a.start - b.start).map((i, k) => ({ ...i, id: `i${k}` }));
}
const TONES: Record<string, RegExp> = {
  Friendly: /\b(thanks?|thank you|please|appreciate\w*|happy|glad|welcome|hope|great|wonderful|love|excited|cheers|enjoy\w*)\b/gi,
  Confident: /\b(will|definitely|certainly|sure|clearly|absolutely|proven|confident|guarantee\w*|committed|deliver\w*)\b/gi,
  Urgent: /\b(asap|urgent\w*|immediately|deadline|right away|critical|overdue|today)\b/gi,
  Worried: /\b(concern\w*|worr\w*|afraid|unfortunately|sorry|apolog\w*|problem|issue|delay\w*|regret)\b/gi,
  Formal: /\b(therefore|regarding|sincerely|furthermore|accordingly|hereby|pursuant|kindly|respectfully|moreover)\b/gi,
};
export function detectTones(text: string): string[] { return Object.entries(TONES).map(([k, re]) => [k, (text.match(re) ?? []).length] as const).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k); }
export function computeStats(text: string, issues: Issue[]): Stats {
  const words = text.match(/[A-Za-z0-9’'-]+/g) ?? []; const sents = sentences(text); const syl = words.reduce((a, w) => a + countSyllables(w), 0);
  const flesch = words.length >= 5 && sents.length ? Math.round(206.835 - 1.015 * (words.length / sents.length) - 84.6 * (syl / words.length)) : 0;
  const level = !words.length ? "—" : flesch >= 80 ? "Easy to read" : flesch >= 60 ? "Plain English" : flesch >= 40 ? "Fairly difficult" : "Difficult";
  const weighted = issues.reduce((a, i) => a + WEIGHT[i.category], 0); const score = words.length < 5 ? null : Math.max(0, Math.min(100, Math.round(100 - (weighted / Math.max(words.length, 30)) * 60)));
  return { words: words.length, chars: text.length, sentences: sents.length, readingMin: words.length / 238, speakingMin: words.length / 130, flesch, level, tones: detectTones(text), score };
}
export const fmtMin = (m: number) => (m < 1 / 6 ? "< 10 sec" : m < 1 ? `${Math.round(m * 60)} sec` : `${Math.round(m)} min`);
export function applyIssue(text: string, i: Issue, replacement: string) { return text.slice(0, i.start) + replacement + text.slice(i.end); }
