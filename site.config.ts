import type { Site } from "@/lib/site-types";
const GH = "https://github.com/tommy-muckstack/grammarlyisdead";
export const site: Site = {
  slug: "grammarlyisdead", name: "GrammarlyIsDead", replaces: "Grammarly", theme: "grammarly",
  glyph: "M16.5 9 A5 5 0 1 0 17 13 H12.5",
  nav: [{ label: "Product", id: "product" }, { label: "Solutions", id: "solutions" }, { label: "Resources", id: "resources" }, { label: "Pricing", id: "pricing" }],
  cta: "Start writing, it's free",
  hero: { variant: "center", eyebrow: "Free · Open source · Private by design", title: ["Write with confidence.", "Every suggestion, free."], subtitle: "Spelling, grammar, clarity, engagement and tone feedback as you type, with every check running in your browser. No word limits, no premium suggestions, no account needed to read what's wrong.",
    primary: { label: "Open the editor", href: "/login" }, secondary: { label: "See pricing", href: "/#pricing" }, shot: "editor.png", shotAlt: "The GrammarlyIsDead editor with colored underlines in an email and a panel of suggestions" },
  audience: "Used for emails, essays, reports, cover letters, posts and anything you'd like to sound right before you send it",
  stepsTitle: "Better writing in four moves",
  steps: [{ t: "Write", d: "Type or paste. Checks run as you go, right in the page, and nothing leaves your device." }, { t: "Review", d: "Colored underlines mark correctness, clarity, engagement and delivery issues." }, { t: "Accept", d: "Take a fix with one click, dismiss what you disagree with, or add a word to your dictionary." }, { t: "Tune", d: "Set audience, formality and domain goals and watch the suggestions follow." }],
  rows: [
    { id: "product", k: "Correctness", h: "Catch the mistakes spellcheck misses", p: "A full English dictionary with suggestions, plus rules for a/an, its/it's, their/there/they're, subject-verb agreement, repeated words, capitalization and punctuation spacing.", img: "editor.png", alt: "An email with red underlines on misspellings and grammar mistakes and matching suggestion cards", cta: "Check some writing" },
    { id: "clarity", k: "Clarity", h: "Say it in fewer, better words", p: "Wordy phrases, passive voice and very long sentences are flagged with shorter alternatives. A readability score, reading time and speaking time update as you write.", img: "clarity.png", alt: "The clarity tab listing wordy phrases and passive voice with shorter replacements", cta: "Tighten a draft" },
    { id: "delivery", k: "Tone and delivery", h: "Sound the way you mean to sound", p: "Pick a formality goal and contractions or slang are flagged when they don't fit. The tone detector tells you whether a message reads friendly, confident, urgent or worried.", img: "formal.png", alt: "Formal goal selected, with contractions and slang flagged under Delivery", cta: "Set your goals" },
    { id: "private", k: "Private", h: "Your writing stays yours", p: "The dictionary and every rule run in your browser. Documents are saved on your device and are never used to train anything. Nothing is uploaded to check it.", img: "dashboard.png", alt: "A list of saved documents", cta: "See your documents" },
  ],
  statsTitle: "Real numbers, no fine print",
  stats: [{ b: "$0", s: "for every plan we replace" }, { b: "4 kinds", s: "correctness, clarity, engagement, delivery" }, { b: "0 bytes", s: "of your text sent to a server" }, { b: "Apache-2.0", s: "self-host it, fork it, change it" }],
  integrations: { title: "Where you write", text: "Use it in the web editor today. A browser extension and an API are on the roadmap. Rules are plain data you can read and extend." },
  pricing: { title: "What you'd pay for a writing assistant", vendor: "Grammarly", asOf: "October 2026", plans: [{ name: "Pro (billed yearly)", perSeatMonth: 12, note: "per member, per month" }, { name: "Pro (billed monthly)", perSeatMonth: 30, note: "per member, per month" }], seats: 5,
    footnote: "Grammarly Pro is $12 per member per month billed yearly ($144 a year) or $30 billed monthly, up to 149 seats; larger teams are quoted separately. The free plan limits suggestion types and AI prompts. Self-hosting has your own hosting costs; a small instance fits in free tiers.", featuresTitle: "Every suggestion, no plan gates",
    features: [{ name: "Spelling, grammar and punctuation", plan: "Free" }, { name: "Clarity and conciseness suggestions", plan: "Pro" }, { name: "Tone detection and formality goals", plan: "Pro" }, { name: "Readability score and speaking time", plan: "Pro" }, { name: "Passive voice and long-sentence flags", plan: "Pro" }, { name: "Personal dictionary", plan: "Free" }] },
  finalCta: { title: "Your next email can read better.", sub: "Paste it in, review the suggestions, send with confidence. No card, no limits." },
  footer: [
    { title: "Product", links: [{ label: "Correctness", href: "/#product" }, { label: "Clarity", href: "/#clarity" }, { label: "Delivery", href: "/#delivery" }, { label: "Pricing", href: "/#pricing" }] },
    { title: "Get started", links: [{ label: "Log in", href: "/login" }, { label: "Try the demo account", href: "/login" }, { label: "Price comparison", href: "/#pricing" }] },
    { title: "Open source", links: [{ label: "GitHub", href: GH }, { label: "Apache-2.0 license", href: GH + "/blob/main/LICENSE" }, { label: "Dictionary licence", href: GH + "/blob/main/public/dict/LICENSE-dictionary-en.txt" }] },
    { title: "More IsDead apps", links: [{ label: "CalendlyIsDead", href: "/calendlyisdead" }, { label: "CanvaIsDead", href: "/canvaisdead" }, { label: "TypeformIsDead", href: "/typeformisdead" }, { label: "DocuSignIsDead", href: "/docusignisdead" }] },
  ],
  trademark: "GrammarlyIsDead is an independent open-source project. It is not affiliated with, endorsed by or sponsored by Grammarly, Inc. Grammarly is a trademark of its owner.",
  repo: GH,
};
