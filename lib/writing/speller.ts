import nspell from "nspell";
import { BP } from "@/lib/basepath";
import type { Speller } from "./types";
let p: Promise<Speller> | null = null;
/** Loads the en-US Hunspell dictionary once (public/dict, ~550 KB) and builds a speller. Client only. */
export function loadSpeller(): Promise<Speller> {
  return (p ??= (async () => { const [aff, dic] = await Promise.all([fetch(`${BP}/dict/en.aff`).then(r => r.text()), fetch(`${BP}/dict/en.dic`).then(r => r.text())]); return nspell(aff, dic); })());
}
