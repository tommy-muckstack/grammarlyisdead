export type Category = "correctness" | "clarity" | "engagement" | "delivery";
export const CATEGORIES: { id: Category; label: string; color: string; blurb: string }[] = [
  { id: "correctness", label: "Correctness", color: "#E5484D", blurb: "Spelling, grammar and punctuation" },
  { id: "clarity", label: "Clarity", color: "#2F6FED", blurb: "Concise, easy-to-follow writing" },
  { id: "engagement", label: "Engagement", color: "#1DA67A", blurb: "Vivid, varied word choice" },
  { id: "delivery", label: "Delivery", color: "#8B5CF6", blurb: "Tone and formality" },
];
export type Issue = { id: string; start: number; end: number; category: Category; rule: string; title: string; message: string; text: string; replacements: string[] };
export type Goals = { formality: "informal" | "neutral" | "formal"; audience: "general" | "knowledgeable" | "expert"; domain: "general" | "academic" | "business" | "creative" };
export const DEFAULT_GOALS: Goals = { formality: "neutral", audience: "general", domain: "general" };
export type Speller = { correct(w: string): boolean; suggest(w: string): string[] };
export type Stats = { words: number; chars: number; sentences: number; readingMin: number; speakingMin: number; flesch: number; level: string; tones: string[]; score: number | null };
