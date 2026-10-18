// Analytics taxonomy for the shared IsDead PostHog project 666931 (contract: yourappisdead/ANALYTICS.md, see docs/ANALYTICS.md).
// Super properties: product (this app's slug), surface ("landing" = logged-out marketing pages, "app" = the working product
// and anything it publishes), platform ("web"). Page views are PostHog's built-in $pageview.
// Events are `app_<object>_<action>` (or `landing_<object>_<action>` for marketing CTAs); the product name lives in
// `product`, never in an event name. Never send user content (titles, URLs, emails, text) as properties.
export const APP = "grammarlyisdead" as const;
export type Surface = "landing" | "app";
export const EVENTS = {
  app_signed_up: "app_signed_up",       // method ("password" | "google")
  app_signed_in: "app_signed_in",       // method ("password" | "google")
  app_signed_out: "app_signed_out",
  app_document_created: "app_document_created",       // sample (bool)
  app_document_deleted: "app_document_deleted",
  app_suggestion_accepted: "app_suggestion_accepted", // category, rule (enum ids), alternative (bool: not the first replacement)
  app_suggestion_dismissed: "app_suggestion_dismissed", // category, rule
  app_dictionary_word_added: "app_dictionary_word_added", // (never the word)
  app_goal_changed: "app_goal_changed",               // goal ("audience" | "formality" | "domain"), value (enum)
  app_suggestions_filtered: "app_suggestions_filtered", // category ("all" | category id)
  landing_cta_clicked: "landing_cta_clicked", // target (nav_pricing | nav_login | nav_signup | hero_signup | hero_google | plan_free | plan_pro | plan_enterprise | footer_try_free)
} as const;
export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export const EVENT_PREFIXES = ["app_", "landing_"] as const;
/** Super properties every event carries (yourappisdead/ANALYTICS.md §1). */
export const superProps = (surface: Surface) => ({ product: APP, surface, platform: "web" as const });
/** Super properties older IsDead taxonomies persisted in the shared yourappisdead.com cookie. Unregistered at boot. */
export const LEGACY_PROPS = ["app", "app_family", "base_path", "suite_id", "app_id", "schema_version", "source", "site_id", "environment"] as const;
