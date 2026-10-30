import assert from "node:assert/strict";
import { test } from "node:test";
import { createPriceStream, scrubBanned } from "./guard.ts";
import { business } from "./business.ts";
const standIn = business.priceStandIn, allowed = business.allowedPrices;
const run = (c: string[]) => { const s = createPriceStream(allowed, standIn); let o = ""; for (const x of c) o += s.push(x); return o + s.flush(); };
function rng(seed: number) { let x = seed; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
const rsplit = (t: string, r: () => number) => { const o: string[] = []; let i = 0; while (i < t.length) { const n = 1 + Math.floor(r() * 5); o.push(t.slice(i, i + n)); i += n; } return o; };
const fixed = (t: string, n: number) => t.match(new RegExp(`[\\s\\S]{1,${n}}`, "g")) ?? [];
function variants(t: string): [string, string][] {
  const v: [string, string][] = [["whole", run([t])], ["1", run(fixed(t, 1))], ["2", run(fixed(t, 2))], ["3", run(fixed(t, 3))]];
  for (let s = 1; s <= 200; s++) v.push([`r${s}`, run(rsplit(t, rng(s)))]);
  // also offset splits
  for (const n of [2, 3, 4]) for (let off = 1; off < n; off++) v.push([`${n}+${off}`, run([t.slice(0, off), ...fixed(t.slice(off), n)])]);
  return v;
}
const TERMS = ["chatbots","chatbot","automation","ChatGPT","OpenAI","open ai","Open AI","Twilio","ElevenLabs","eleven labs","Eleven Labs","Vercel","Zapier","a.i.","A.I.","AI","n8n","AI agent","AI agents","AI bot","AI bots","AI assistant","AI assistants","AI tool","AI tools","AI chatbot"];
const SELF = ["I'm an AI","I\u2019m an AI","I am an AI","I am AI","as an AI","as an AI assistant","I am a bot","I'm a bot","I'm an assistant","I am an assistant","I'm an AI assistant","I am a bot agent","I am an AI chatbot","I am an assistant bot"];
const KEEP = ["She is an assistant manager at the depot.","Talk to the estate agent.","Book a travel agent.","It will not sound like a robot.","both of the bottom rows","Fill the bottle.","Ask the agent.","Tell me about it.","We use tools on the van.","We use apps on the phone.","Welcome to Clockwork today.","Clockwork AI answers questions.","Pick plan A","Pick plan A.","Option A","A",
 "Go to open air events.","The opening is at nine.","Eleven men came.","Eleven labourers came.","A twill jacket.","A vertical drop.","A nice day. Make a plan.","Zap the bugs, zap it.","The boiler is old. A plan helps. This week we start.","the boiler","a plan","this week","an apple","an hour","this is fine","a airy room","The vertical vent.","Twice a week.","Vertex and Zapped and Openly.","Chat about it, chats and chatter.","Automatic doors.","Autopilot plan.","Bots? No. Botany yes. Bottom row.","Aim high, air, aisle, aid.","Assist me, assistance, assistants' union?","Open","Eleven","Eleven l","Twil","Verc","na","n8","n8x","the","a","an","this","th","Clockwork","Clockwork A","Clockwork AI","open a","open ai-free"];
const bad = /\bAI\b|\bbots?\b|chatbots?|chatgpt|openai|open ai|twilio|eleven\s?labs|vercel|zapier|n8n|\ba\.i\.|automation|\bassistants?\b|\bagents?\b|\btools?\b/i;
const dbl = /\b(the|a|an|this)\s+the system\b|the system\s+the system|\b(a|an|this)\s+(on this site|I answer)/i;
test("harness", () => {
  const out: Record<string, string[]> = { termLeak: [], termDouble: [], termInconsistent: [], selfLeak: [], selfInconsistent: [], keepFail: [] };
  for (const term of TERMS) for (const ctx of [`We use ${term} today.`, `It is a ${term} thing.`, `Built with the ${term}.`, `an ${term}`, `${term}`, `Ask ${term}`, `x ${term}.`]) {
    const vs = variants(ctx); const w = vs[0][1];
    for (const [k, o] of vs) {
      if (bad.test(o)) { out.termLeak.push(`${k}|${ctx}|${o}`); break; }
    }
    for (const [k, o] of vs) if (dbl.test(o)) { out.termDouble.push(`${k}|${ctx}|${o}`); break; }
    for (const [k, o] of vs) if (o !== w) { out.termInconsistent.push(`${k}|${ctx}|${o}|whole:${w}`); break; }
  }
  for (const p of SELF) for (const ctx of [`Hello. ${p}. Bye.`, `${p}`, `Hi, ${p} here`]) {
    const vs = variants(ctx); const w = vs[0][1];
    for (const [k, o] of vs) if (bad.test(o) || /\bI am\b.*\bAI\b/.test(o)) { out.selfLeak.push(`${k}|${ctx}|${o}`); break; }
    for (const [k, o] of vs) if (o !== w) { out.selfInconsistent.push(`${k}|${ctx}|${o}|whole:${w}`); break; }
  }
  for (const t of KEEP) for (const [k, o] of variants(t)) if (o !== t) { out.keepFail.push(`${k}|${JSON.stringify(t)}|${JSON.stringify(o)}`); break; }
  for (const [k, v] of Object.entries(out)) console.log(k, v.length, JSON.stringify(v.slice(0, 12), null, 1));
  // price + 11bn
  const l = "Late payments cost almost 11 billion pounds a year, UK Government, July 2026.";
  for (const [k, o] of variants(l)) assert.equal(o, l, k);
  const p = "Autopilot is £149 a month. Foundation 99/month. Sample £2,840. one hundred pounds. £11 billion a year. 30% off. Ring 07460 038202.";
  const res = variants(p).filter(([k]) => /^(whole|1|2|3)$/.test(k)).map(([k, o]) => [k, /£|149|99\/month|2,840|hundred pounds|11 billion/.test(o), /30% off/.test(o) && /07460 038202/.test(o)]);
  console.log("PRICE", JSON.stringify(res), run([p]));
  console.log("END", JSON.stringify(["Pick plan A", "A", "Open", "Eleven l", "Clockwork A", "th", "n8", "Twil"].map((x) => [x, run([...x])])));
  for (const [k, v] of Object.entries(out)) assert.equal(v.length, 0, k);
  for (const row of res) {
    assert.equal(row[1], false, String(row[0]));
    assert.equal(row[2], true, String(row[0]));
  }
});
