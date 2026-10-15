import type { Goals } from "./types";
import { DEFAULT_GOALS } from "./types";
export type Doc = { id: string; title: string; text: string; goals: Goals; ignored: string[]; updatedAt: number };
export const newId = () => "d" + Math.random().toString(36).slice(2, 10);
export const SAMPLE_TEXT = `hi Dana,

I wanted to follow up on our meeting yesterday. Its been a busy week and I definately want to make sure we are on the same page. In order to move forward, we needs to finalize the budget by Friday.

The report was written by Marcus last week, and it contains a large number of recomendations that are very good. We could of started earlier but their was a delay with the vendor, which was really frustrating  for everyone.

Please let me know if your available for a quick call tomorrow. i think it would be a great way to wrap things up!

Thanks so much,
Alex`;
export const newDoc = (title = "Untitled document", text = ""): Doc => ({ id: newId(), title, text, goals: { ...DEFAULT_GOALS }, ignored: [], updatedAt: Date.now() });
