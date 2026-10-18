"use client";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useEffect } from "react";
import { BP } from "@/lib/basepath";
import { identify, resetIdentity, trackNow, EVENTS } from "@/lib/analytics";
export function AppHeader({ user, children }: { user: { id: string; name: string; email: string; demo: boolean; guest?: boolean }; children?: React.ReactNode }) {
  // Signed-in Firebase users are identified by uid; guests and the demo account only get an account_type super property.
  useEffect(() => { identify(user.id, user.guest ? "guest" : user.demo ? "demo" : "firebase"); }, [user.id, user.guest, user.demo]);
  const signOut = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = e.currentTarget; await trackNow(EVENTS.app_signed_out); resetIdentity(); f.submit(); };
  return <header className="app-hd"><Link href="/app" style={{ color: "inherit", textDecoration: "none" }}><Logo size={26} /></Link>
    <div className="app-hd__mid">{children}</div>
    <div className="app-hd__user"><span className="ids-muted" style={{ fontSize: 13 }}>{user.guest ? "Guest · sign in to keep your work" : user.demo ? "Demo account" : user.email}</span>
      <form method="post" action={`${BP}/api/session/logout`} onSubmit={signOut}><button className="ids-btn ids-btn--ghost ids-btn--sm">Sign out</button></form></div></header>;
}
