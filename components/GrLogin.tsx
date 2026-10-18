"use client";
import { useState } from "react";
import Link from "next/link";
import type { FirebaseClientConfig } from "@/lib/isdead-auth/config";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, authErrorMessage } from "@/lib/isdead-auth/client";
import { BP } from "@/lib/basepath";
import { Logo } from "@/components/Logo";
import { trackNow, EVENTS } from "@/lib/analytics";

const G = <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h6.2a5.3 5.3 0 01-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.4z" /><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0012 23.5z" /><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 010-4.4v-3H1.8a11.5 11.5 0 000 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 001.8 6.8l3.8 3A6.9 6.9 0 0112 5.4z" /></svg>;
const Chev = () => <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden><path d="M1.5 1l5 5-5 5" fill="none" stroke="#6b6b76" strokeWidth="1.3" /></svg>;
const NAV = ["Documents", "Authoring tools", "Style", "Analytics", "Apps", "Brand tone settings"];
function Backdrop() {
  return <div className="grl-bg" aria-hidden>
    <aside><div className="grl-bglogo" />{NAV.map((n, i) => <div key={n} className={i === 0 ? "on" : ""}><i />{n}</div>)}</aside>
    <section><h2>Documents</h2><div className="grl-new">New</div><div className="grl-cards">{Array.from({ length: 6 }).map((_, i) => <div key={i}><u /><i /><i /><i /></div>)}</div></section>
  </div>;
}
export function GrLogin({ config, demo, to, signup = false }: { config: FirebaseClientConfig | null; demo: boolean; to: string; signup?: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(signup ? "signup" : "signin");
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [note, setNote] = useState("");
  const session = `${BP}/api/session`;
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(""); setNote(""); try { await f(); } catch (e) { setErr(authErrorMessage(e)); } finally { setBusy(false); } };
  const submit = (e: React.FormEvent) => { e.preventDefault();
    if (!config) { setErr("Sign-in isn't configured on this deployment yet."); return; }
    if (mode === "reset") return run(async () => { await resetPassword(config, email); setNote("If that email has an account, a reset link is on its way."); setMode("signin"); });
    if (step === 1) { setStep(2); return; }
    run(async () => { if (mode === "signup") { await signUpWithEmail(config, session, email, password); await trackNow(EVENTS.app_signed_up, { method: "password" }); } else { await signInWithEmail(config, session, email, password); await trackNow(EVENTS.app_signed_in, { method: "password" }); } window.location.assign(to); }); };
  const google = () => run(async () => { await signInWithGoogle(config!, session); await trackNow(EVENTS.app_signed_in, { method: "google" }); window.location.assign(to); });
  const provider = (icon: React.ReactNode, label: string, on: () => void) => <button type="button" className="grl-prov" disabled={busy || !config} onClick={on}>{icon}<span>{label}</span><Chev /></button>;
  const swap = (m: typeof mode) => (e: React.MouseEvent) => { e.preventDefault(); setMode(m); setStep(1); setErr(""); };
  return <main className="grl">
    <Backdrop />
    <Link href="/" className="grl-toplogo"><Logo size={22} /></Link>
    <section className="grl-modal">
      <div className="grl-head"><h1>{mode === "signup" ? "Sign up" : mode === "reset" ? "Reset password" : "Sign in"}</h1>
        {mode === "signup" ? <a href="#" onClick={swap("signin")}>I have an account</a> : mode === "reset" ? <a href="#" onClick={swap("signin")}>Back to sign in</a> : <a href="#" onClick={swap("signup")}>I don&apos;t have an account</a>}</div>
      {mode === "signup" && <>{provider(G, "Continue with Google", google)}<div className="grl-or">Or</div></>}
      <form onSubmit={submit}>
        <label className="grl-field"><span>{mode === "signup" ? "Work or school email" : "Email"}</span><input type="email" required autoComplete="email" placeholder={mode === "signup" ? "Work or school email" : "Email"} value={email} onChange={e => setEmail(e.target.value)} readOnly={step === 2} aria-label="Email" /></label>
        {step === 2 && mode === "signin" && <label className="grl-field"><span>Password</span><input type="password" required minLength={6} autoFocus placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" aria-label="Password" /></label>}
        {mode === "signup" && step === 2 && <label className="grl-field"><span>Password</span><input type="password" required minLength={6} autoFocus placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" aria-label="Password" /></label>}
        <button className="grl-cta" disabled={busy}>{mode === "signup" ? "Agree and Sign up" : mode === "reset" ? "Send reset link" : step === 1 ? "Continue" : "Sign in"}</button>
      </form>
      {mode === "signin" && <><a href="#" className="grl-cant" onClick={swap("reset")}>Can&apos;t sign in?</a>
        {provider(G, "Sign in with Google", google)}</>}
      {err && <p role="alert" className="grl-err">{err}</p>}{note && <p role="status" className="grl-note">{note}</p>}
      <p className="grl-legal">Grammarly is part of Superhuman, Inc. By continuing, you agree to the Superhuman <a href="#">ToS</a> and <a href="#">Privacy Policy</a>. California residents, see our <a href="#">CA Notice at Collection</a>.</p>
      <p className="grl-legal">This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.</p>
      {mode === "signup" && <p className="grl-legal">You also agree to receive product-related marketing emails from Grammarly, which you can unsubscribe from at any time.</p>}
    </section>
    <div className="grl-extra">{!config && <p role="status" className="grl-note">Sign-in not configured. Email and Google sign-in turn on once Firebase is set up.</p>}{demo && <button type="button" className="grl-demo" onClick={async () => { const r = await fetch(`${BP}/api/session/demo`, { method: "POST" }); if (r.ok) window.location.assign(to); }}>Use the demo account</button>}</div>
    <p className="grl-oss">GrammarlyIsDead is an independent open-source project, not affiliated with or endorsed by Grammarly or Superhuman.</p>
  </main>;
}
