# GrammarlyIsDead

Free, open-source Grammarly alternative. Part of the [IsDead series](https://yourappisdead.com). Served at `https://yourappisdead.com/grammarlyisdead`.

**Status: local only** (not pushed, not deployed). Surfaces follow `templates/marketing-site.md` in `@isdead/design`: one marketing page (`/`, price comparison at `#pricing`), `/login`, and the app at `/app`.

## What works
- **Editor** with live, in-browser checking (no text leaves the device): colored underlines mirrored over a plain textarea, a suggestions panel with per-issue Accept / alternatives / Dismiss / Add to dictionary, caret-aware card highlighting.
- **Correctness:** en-US Hunspell dictionary (nspell) with suggestions plus a common-typo table; ~30 grammar and punctuation rules (a/an, its/it's, your/you're, their/there/they're, could-of, then/than, fewer/less, subject-verb agreement, repeated words, capital I, sentence capitalization, spacing). URLs, emails and `code` are skipped.
- **Clarity:** wordy phrases, plainer words, passive voice, very long sentences, filler words. **Engagement:** weak intensifiers ('very good' → 'excellent'), repeated sentence openers. **Delivery:** formality goal (formal flags contractions and slang), ALL CAPS, exclamation overuse.
- **Overview:** overall score, per-category counts and filters, readability (Flesch), reading and speaking time, tone detection (friendly, confident, urgent, worried, formal), goals (audience, formality, domain).
- **Documents:** dashboard, autosave, per-account storage, sample document. 18 unit tests for the engine; Playwright smoke test in `npm run shots`.

## Known gaps
- **No generative AI:** no rewrites, paraphrasing, 'make it shorter' or plagiarism check; suggestions come from rules and a dictionary, so recall is lower than Grammarly's models. Proper nouns are not spell-checked (capitalized mid-sentence words are skipped).
- English (US) only; domain and audience goals are stored but only formality changes rules today.
- Documents live in browser localStorage per account (no cross-device sync yet; Firestore is the next step). No browser extension or desktop app.

## Auth
Shared Firebase project `yourappisdead` (email/password + Google), helpers in `lib/isdead-auth` (vendored from `isdead-design/auth`). The session cookie `isdead_session` has path `/`, so one sign-in covers every IsDead app. Env: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`. Without them, `/login` shows "Sign-in not configured". The single demo account ("Use the demo account") is available outside production or with `DEMO_MODE=1`.

## Develop
```
npm install
npm run dev        # http://localhost:3000/grammarlyisdead
npm test           # unit tests
npm run typecheck
npm run build && npm run shots   # product screenshots + end-to-end smoke test (Playwright)
```
Theme and font: `vendor/isdead-design` (OFL fonts, see `fonts/*/OFL-*.txt`). Not affiliated with Grammarly; all trademarks belong to their owners. Apache-2.0.
