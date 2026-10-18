"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocal } from "@/lib/useLocal";
import type { Doc } from "@/lib/writing/docs";
import { CATEGORIES, type Category, type Goals, type Issue, type Speller } from "@/lib/writing/types";
import { applyIssue, checkText, computeStats, fmtMin } from "@/lib/writing/check";
import { loadSpeller } from "@/lib/writing/speller";
import { track, EVENTS } from "@/lib/analytics";
const colorOf = (c: Category) => CATEGORIES.find(x => x.id === c)!.color;
function Ring({ score }: { score: number | null }) {
  const r = 34, c = 2 * Math.PI * r, v = score ?? 0; const col = score === null ? "#C9CDD3" : score >= 90 ? "#1DA67A" : score >= 70 ? "#E8A317" : "#E5484D";
  return <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={score === null ? "No score yet" : `Overall score ${score}`}><circle cx="46" cy="46" r={r} fill="none" stroke="#E6E8EB" strokeWidth="8" /><circle cx="46" cy="46" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(c * v) / 100} ${c}`} transform="rotate(-90 46 46)" style={{ transition: "stroke-dasharray .4s" }} /><text x="46" y="52" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1C2024" data-testid="score">{score ?? "—"}</text></svg>;
}
export function Editor({ userId, docId }: { userId: string; docId: string }) {
  const [docs, setDocs, ready] = useLocal<Doc[]>(userId, "docs", []); const [dict, setDict] = useLocal<string[]>(userId, "dict", []);
  const doc = docs.find(d => d.id === docId); const [speller, setSpeller] = useState<Speller | null>(null); const [active, setActive] = useState<string | null>(null); const [filter, setFilter] = useState<Category | "all">("all");
  const ta = useRef<HTMLTextAreaElement>(null); const cards = useRef<Record<string, HTMLElement | null>>({}); const [text, setText] = useState(""); const loaded = useRef(false);
  useEffect(() => { loadSpeller().then(setSpeller); }, []);
  useEffect(() => { if (ready && doc && !loaded.current) { loaded.current = true; setText(doc.text); } }, [ready, doc]);
  const update = (p: Partial<Doc>) => setDocs(x => x.map(d => (d.id === docId ? { ...d, ...p, updatedAt: Date.now() } : d)));
  useEffect(() => { if (loaded.current && doc && text !== doc.text) { const t = setTimeout(() => update({ text }), 250); return () => clearTimeout(t); } }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const el = ta.current; if (el) { el.style.height = "auto"; el.style.height = Math.max(el.scrollHeight, 420) + "px"; } }, [text, ready]);
  const ignored = useMemo(() => new Set([...(doc?.ignored ?? []), ...dict.map(w => `spelling:${w.toLowerCase()}`)]), [doc?.ignored, dict]);
  const goals = doc?.goals ?? { formality: "neutral", audience: "general", domain: "general" } as Goals;
  const issues = useMemo(() => (text ? checkText(text, goals, speller, ignored) : []), [text, goals, speller, ignored]);
  const stats = useMemo(() => computeStats(text, issues), [text, issues]);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c.id, issues.filter(i => i.category === c.id).length])) as Record<Category, number>, [issues]);
  const shown = issues.filter(i => filter === "all" || i.category === filter);
  if (!ready) return <main className="gwe"><p className="ids-muted" style={{ padding: 24 }}>Loading…</p></main>;
  if (!doc) return <main className="gwe"><div className="ids-card" style={{ margin: 40, padding: 32 }}><h2>Document not found</h2><Link href="/app">Back to your documents</Link></div></main>;
  const accept = (i: Issue, rep: string) => { track(EVENTS.app_suggestion_accepted, { category: i.category, rule: i.rule, alternative: rep !== i.replacements[0] }); const next = applyIssue(text, i, rep); setText(next); update({ text: next }); setActive(null); const pos = i.start + rep.length; setTimeout(() => { ta.current?.focus(); ta.current?.setSelectionRange(pos, pos); }, 0); };
  const dismiss = (i: Issue) => { track(EVENTS.app_suggestion_dismissed, { category: i.category, rule: i.rule }); update({ ignored: [...doc.ignored, `${i.rule}:${i.text.toLowerCase()}`] }) };
  const caret = () => { const p = ta.current?.selectionStart ?? 0; const hit = issues.find(i => p >= i.start && p <= i.end && ta.current?.selectionStart === ta.current?.selectionEnd); setActive(hit?.id ?? null); if (hit) cards.current[hit.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" }); };
  const focusIssue = (i: Issue) => { setActive(i.id); ta.current?.focus(); ta.current?.setSelectionRange(i.start, i.end); };
  const segs: React.ReactNode[] = []; let pos = 0;
  for (const i of issues) { if (i.start > pos) segs.push(text.slice(pos, i.start)); segs.push(<mark key={i.id} className={"gw__u gw__u--" + i.category + (active === i.id ? " is-active" : "")} data-issue={i.rule}>{text.slice(i.start, i.end)}</mark>); pos = i.end; }
  segs.push(text.slice(pos) + "\n​");
  const setGoal = <K extends keyof Goals>(k: K, v: Goals[K]) => { track(EVENTS.app_goal_changed, { goal: k, value: v }); update({ goals: { ...goals, [k]: v } }); };
  return <div className="gwe"><div className="gwe__top"><Link href="/app" className="iconbtn" style={{ textDecoration: "none", color: "inherit" }}>← Documents</Link>
    <input className="gwe__title" aria-label="Document title" value={doc.title} onChange={e => update({ title: e.target.value })} /><span style={{ flex: 1 }} />
    <span className="ids-muted" style={{ fontSize: 13 }}>{speller ? `${stats.words} words` : "Loading dictionary…"}</span></div>
    <div className="gwe__body">
      <main className="gwe__page"><div className="gwe__paper"><div className="gw__wrap"><div className="gw__mirror" aria-hidden="true" data-testid="mirror">{segs}</div>
        <textarea ref={ta} className="gw__ta" aria-label="Document text" spellCheck={false} placeholder="Start typing or paste your text here…" value={text} onChange={e => setText(e.target.value)} onSelect={caret} onClick={caret} onKeyUp={caret} /></div></div></main>
      <aside className="gwe__panel" aria-label="Writing assistant">
        <div className="gwp__score"><Ring score={stats.score} /><div><b style={{ fontSize: 17 }}>Overall score</b><div className="ids-muted" style={{ fontSize: 13 }}>{stats.score === null ? "Write at least a sentence to get a score." : issues.length ? `${issues.length} suggestion${issues.length === 1 ? "" : "s"} to review.` : "This text looks great!"}</div></div></div>
        <div className="gwp__cats" role="tablist">{[{ id: "all" as const, label: "All", color: "#1C2024" }, ...CATEGORIES].map(c => <button key={c.id} role="tab" aria-selected={filter === c.id} className={"gwp__cat" + (filter === c.id ? " on" : "")} onClick={() => { setFilter(c.id); track(EVENTS.app_suggestions_filtered, { category: c.id }); }} data-testid={`cat-${c.id}`}><i style={{ background: c.color }} />{c.label}<b>{c.id === "all" ? issues.length : counts[c.id]}</b></button>)}</div>
        <div className="gwp__list" data-testid="cards">
          {shown.length === 0 && <p className="ids-muted" style={{ padding: "8px 4px" }}>{text ? "No suggestions here. Nice work." : "Suggestions will appear as you type."}</p>}
          {shown.map(i => <article key={i.id} ref={el => { cards.current[i.id] = el; }} className={"gwc" + (active === i.id ? " is-active" : "")} style={{ borderLeftColor: colorOf(i.category) }} onClick={() => focusIssue(i)} data-testid="card" data-rule={i.rule}>
            <div className="gwc__t" style={{ color: colorOf(i.category) }}>{i.title}</div>
            <div className="gwc__x">{i.rule === "long-sentence" || i.rule === "passive" || i.rule === "repeated-opener" ? <>“{i.text}…”</> : <s>{i.text}</s>}{i.replacements[0] !== undefined && i.rule !== "spelling" && <> → <b>{i.replacements[0] === "" ? "(remove)" : i.replacements[0]}</b></>}</div>
            <p className="gwc__m">{i.message}</p>
            <div className="tb">{i.replacements.slice(0, 3).map((r, k) => <button key={k} className={"gwc__acc" + (k ? " alt" : "")} onClick={e => { e.stopPropagation(); accept(i, r); }}>{r === "" ? "Remove" : r}</button>)}
              {i.rule === "spelling" && <button className="iconbtn" onClick={e => { e.stopPropagation(); setDict(d => [...d, i.text]); track(EVENTS.app_dictionary_word_added); }}>Add to dictionary</button>}
              <button className="iconbtn" onClick={e => { e.stopPropagation(); dismiss(i); }}>Dismiss</button></div></article>)}
        </div>
        <details className="gwp__box" open><summary>Goals</summary>
          <label>Audience<select value={goals.audience} onChange={e => setGoal("audience", e.target.value as Goals["audience"])}><option value="general">General</option><option value="knowledgeable">Knowledgeable</option><option value="expert">Expert</option></select></label>
          <label>Formality<select aria-label="Formality" value={goals.formality} onChange={e => setGoal("formality", e.target.value as Goals["formality"])}><option value="informal">Informal</option><option value="neutral">Neutral</option><option value="formal">Formal</option></select></label>
          <label>Domain<select value={goals.domain} onChange={e => setGoal("domain", e.target.value as Goals["domain"])}><option value="general">General</option><option value="academic">Academic</option><option value="business">Business</option><option value="creative">Creative</option></select></label></details>
        <details className="gwp__box" open><summary>Performance</summary><dl className="gwp__stats" data-testid="stats"><dt>Words</dt><dd>{stats.words}</dd><dt>Characters</dt><dd>{stats.chars}</dd><dt>Sentences</dt><dd>{stats.sentences}</dd><dt>Reading time</dt><dd>{fmtMin(stats.readingMin)}</dd><dt>Speaking time</dt><dd>{fmtMin(stats.speakingMin)}</dd><dt>Readability</dt><dd>{stats.words ? `${stats.flesch} · ${stats.level}` : "—"}</dd><dt>Tone</dt><dd>{stats.tones.length ? stats.tones.join(", ") : "—"}</dd></dl></details>
      </aside></div></div>;
}
