# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how GrammarlyIsDead follows it.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. No key → analytics is a no-op.
- Reverse proxy through the app's own origin: `/<basePath>/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true` so `/ingest/e/` passes through unchanged).
- `<Analytics />` is mounted once in `app/layout.tsx`; it boots the client, sends PostHog's built-in `$pageview` per route change, and tracks marketing CTAs (`<Link data-cta="...">`) with one delegated click listener. Autocapture and session replay are off.
- posthog-js drops bot/automated-browser traffic. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets automated browsers capture (used by verification scripts); production keeps the bot filter.

## Super properties (every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `grammarlyisdead` | the one property to filter by (the hub sends `yourappisdead`) |
| `surface` | `landing` \| `app` | `landing` = home, pricing, login; `app` = everything under `/app` (dashboard and editor). The app publishes no public pages. |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered once the app shell knows who is signed in |

All IsDead apps share the yourappisdead.com cookie, so the client unregisters other apps' legacy super properties at boot and re-registers ours after `reset()`.

## Privacy (scrub)
`scrub` in `lib/analytics/posthog.tsx` runs as `before_send` on every event, automatic ones included:
- Every property whose key ends in `url`, `referrer` or `pathname` (`$current_url`, `$session_entry_url`, `$initial_referrer`, …), at the top level and inside `$set` / `$set_once` (top-level or nested in `properties`), keeps only origin + path; query strings and hashes are dropped (they can carry user content such as prefilled links).
- The page `title` is dropped (it can be a user's own document or page name).
- `PRIVATE_PATHS` is empty here: no path segment works like a password (only ids and public slugs).
- Heatmaps, web-vitals/performance capture, autocapture and session replay are all off in `init`.
Property names `source`, `app`, `app_id`, `site_id` and `environment` are reserved (legacy shared super properties); use `via` / `origin` instead.

## Identity
Signed-in Firebase users are identified by uid (`identify(uid, "firebase")`, from `components/AppHeader.tsx`). Guests and the
demo account are never identified; only `account_type` is registered. Sign-out tracks `app_signed_out`, then calls `reset()`.

## Events
| event | properties |
| --- | --- |
| `landing_cta_clicked` | `target` (`nav_pricing`, `nav_login`, `nav_signup`, `hero_signup`, `hero_google`, `plan_free`, `plan_pro`, `plan_enterprise`, `footer_try_free`) |
| `app_signed_up` | `method` (`password`) |
| `app_signed_in` | `method` (`password` \| `google`) |
| `app_signed_out` | |
| `app_document_created` | `sample` (bool: "Try a sample") |
| `app_document_deleted` | |
| `app_suggestion_accepted` | `category`, `rule` (enum ids from `lib/writing/rules.ts`), `alternative` (bool: not the first replacement) |
| `app_suggestion_dismissed` | `category`, `rule` |
| `app_dictionary_word_added` | (never the word) |
| `app_goal_changed` | `goal` (`audience` \| `formality` \| `domain`), `value` (the enum chosen) |
| `app_suggestions_filtered` | `category` (`all` or a category id) |

Rules:
- Properties are kinds, counts, ids and booleans only. Never send document text, titles, the flagged word or emails.
- Adding an event = add it to `lib/analytics/taxonomy.ts` (the only place event names are defined) and this table. `tests/unit/analytics.test.ts` rejects names outside `app_` / `landing_` and names containing the product.

## Where the calls live
`lib/analytics/` (client + taxonomy), `components/GrLogin.tsx` (sign-up/sign-in via `trackNow`, sent before the redirect),
`components/AppHeader.tsx` (identify + sign-out), `components/writing/Dashboard.tsx` and `components/writing/Editor.tsx` (product events),
`data-cta` attributes in `components/GrHome.tsx` and `components/GrPricing.tsx`.
