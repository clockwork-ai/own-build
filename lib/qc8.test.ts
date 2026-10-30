import assert from "node:assert/strict";
import { test } from "node:test";
import { createPriceStream } from "./guard.ts";
import { business } from "./business.ts";
const run = (c: string[]) => { const s = createPriceStream(business.allowedPrices, business.priceStandIn); let o = ""; for (const x of c) o += s.push(x); return o + s.flush(); };
function rng(seed: number) { let x = seed; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
const rsplit = (t: string, r: () => number) => { const o: string[] = []; let i = 0; while (i < t.length) { const n = 1 + Math.floor(r() * 5); o.push(t.slice(i, i + n)); i += n; } return o; };
const fixed = (t: string, n: number) => t.match(new RegExp(`[\\s\\S]{1,${n}}`, "g")) ?? [];
const words = (t: string) => t.match(/\s*\S+/g) ?? [];
function variants(t: string): [string, string][] {
  const v: [string, string][] = [["whole", run([t])], ["words", run(words(t))], ["1", run(fixed(t, 1))], ["2", run(fixed(t, 2))], ["3", run(fixed(t, 3))]];
  for (let s = 1; s <= 200; s++) v.push([`r${s}`, run(rsplit(t, rng(s)))]);
  for (const n of [2, 3, 4]) for (let off = 1; off < n; off++) v.push([`${n}+${off}`, run([t.slice(0, off), ...fixed(t.slice(off), n)])]);
  return v;
}
const PRICE = ["one hundred pounds", "fifty pounds", "two hundred and fifty pounds a month", "99/month", "£149 a month", "149 quid", "£11 billion a year", "1,200", "£1,200", "It is £149 a month, honestly.", "Setup is fifty pounds.", "That is 99/month all in."];
const KEEP = ["30% off", "Ring 07460 038202.", "Late payments cost almost 11 billion pounds a year, UK Government, July 2026.", "one of my customers", "fifty years old", "a month later", "per month", "one hundred percent", "2 hours a week", "Monday", "It takes 2 hours a week on Monday.", "I have one of my customers on it, fifty years old, a month later, 2 hours a week, one hundred percent.", "Call 07460 038202 on Monday for 30% off, per month nothing extra.", "two hundred and fifty customers", "Fifty", "one hundred", "one", "Pay 1 of 2 on Monday", "about 20 minutes a day", "twelve months", "99", "1,200 leads"];
test("p", () => {
  let priceLeaks = 0;
  let priceIncons = 0;
  let keepFails = 0;
  for (const t of PRICE) { const bad: string[] = []; const vs = variants(t); for (const [k, o] of vs) if (/£|\b\d[\d,]*(\/month| quid|)\b|pounds|billion|hundred|fifty|quid|\/month|1,200/i.test(o) && !/something Callum/.test(o) || /month$|billion|pounds|quid/.test(o.replace(/something Callum prices on a quick call or in the free audit/g,""))) bad.push(`${k}:${JSON.stringify(o)}`); const w = vs[0][1]; const incons = vs.filter(([, o]) => o !== w).slice(0, 3).map(([k, o]) => `${k}:${JSON.stringify(o)}`); priceLeaks += bad.length; priceIncons += vs.filter(([, o]) => o !== w).length; console.log("PRICE", JSON.stringify(t), "whole=", JSON.stringify(w), "leaks", bad.length, bad.slice(0, 3).join(" || "), "incons", incons.length, incons.join(" || ")); }
  for (const t of KEEP) { const missed = variants(t).filter(([, o]) => o !== t); const bad = missed.slice(0, 3).map(([k, o]) => `${k}:${JSON.stringify(o)}`); keepFails += missed.length; console.log("KEEP", JSON.stringify(t), bad.length ? "FAIL " + bad.join(" || ") : "ok"); }
  assert.equal(priceLeaks, 0);
  assert.equal(priceIncons, 0);
  assert.equal(keepFails, 0);
});
