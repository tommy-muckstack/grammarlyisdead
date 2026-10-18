"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocal } from "@/lib/useLocal";
import { newDoc, SAMPLE_TEXT, type Doc } from "@/lib/writing/docs";
import { track, EVENTS } from "@/lib/analytics";
export function Dashboard({ userId }: { userId: string }) {
  const [docs, setDocs, ready] = useLocal<Doc[]>(userId, "docs", []); const router = useRouter();
  const create = (title: string, text: string) => { const d = newDoc(title, text); track(EVENTS.app_document_created, { sample: text === SAMPLE_TEXT }); setDocs(x => [d, ...x]); setTimeout(() => router.push(`/app/docs/${d.id}`), 60); };
  const sorted = [...docs].sort((a, b) => b.updatedAt - a.updatedAt);
  return <main className="gwd"><div className="gwd__head"><h1 className="ids-h1" style={{ fontSize: "var(--ids-type-3xl)" }}>My documents</h1>
    <div className="tb"><button className="ids-btn ids-btn--secondary" onClick={() => create("Follow-up email (sample)", SAMPLE_TEXT)}>Try a sample</button><button className="ids-btn ids-btn--primary" onClick={() => create("Untitled document", "")}>+ New document</button></div></div>
    {ready && docs.length === 0 && <div className="ids-card" style={{ padding: 40, textAlign: "center" }} data-testid="empty"><h2>Write with confidence</h2><p className="ids-muted">Start a document, or paste in some text, and get spelling, grammar, clarity and tone suggestions as you type. Everything is checked in your browser.</p><button className="ids-btn ids-btn--primary" onClick={() => create("Untitled document", "")}>New document</button></div>}
    <div className="gwd__grid" data-testid="docs">{sorted.map(d => <div key={d.id} className="ids-card gwd__card"><Link href={`/app/docs/${d.id}`} className="gwd__link"><h3>{d.title || "Untitled document"}</h3><p className="ids-muted">{d.text.trim().slice(0, 140) || "Empty document"}</p></Link>
      <div className="gwd__meta"><span className="ids-muted">{(d.text.match(/\S+/g) ?? []).length} words · {new Date(d.updatedAt).toLocaleDateString()}</span><button className="iconbtn" aria-label={`Delete ${d.title}`} onClick={() => { if (confirm(`Delete “${d.title}”?`)) { setDocs(x => x.filter(q => q.id !== d.id)); track(EVENTS.app_document_deleted); } }}>Delete</button></div></div>)}</div>
  </main>;
}
