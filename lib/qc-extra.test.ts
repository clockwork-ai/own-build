import assert from "node:assert/strict";
import { test } from "node:test";
import { createPriceStream, scrubBanned } from "./guard.ts";
import { business } from "./business.ts";

const standIn = business.priceStandIn;
const allowed = business.allowedPrices;

function run(chunks: string[]): string {
  const s = createPriceStream(allowed, standIn);
  let out = "";
  for (const c of chunks) out += s.push(c);
  return out + s.flush();
}
const whole = (t: string) => run([t]);
const chars = (t: string) => run([...t]);
function rng(seed: number) { let x = seed; return () => (x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
function randomSplit(t: string, r: () => number): string[] {
  const out: string[] = []; let i = 0;
  while (i < t.length) { const n = 1 + Math.floor(r() * 5); out.push(t.slice(i, i + n)); i += n; }
  return out;
}

const KEEP = [
  "She is an assistant manager at the depot.",
  "Talk to the estate agent about it.",
  "It will not sound like a robot.",
  "both of the bottom rows",
  "Ask the agent.",
  "Book with a travel agent.",
  "Fill the bottle.",
  "Welcome to Clockwork today.",
  "Clockwork is a business. Clockwork helps.",
  "Tell me about it.",
  "We use tools on the van, and about ten tools.",
  "A ladder, A van, A roof. Ask about A plan.",
  "Clockwork AI answers questions.",
];

test("ordinary words survive: whole, char by char, random", () => {
  const fails: string[] = [];
  for (const t of KEEP) {
    if (whole(t) !== t) fails.push(`whole: ${t} -> ${whole(t)}`);
    if (chars(t) !== t) fails.push(`chars: ${t} -> ${chars(t)}`);
    for (let seed = 1; seed <= 200; seed++) {
      const o = run(randomSplit(t, rng(seed)));
      if (o !== t) { fails.push(`rand${seed}: ${t} -> ${o}`); break; }
    }
  }
  console.log("KEEP FAILS", JSON.stringify(fails, null, 1));
  assert.deepEqual(fails, []);
});

const SELF = [
  "I'm an AI", "as an AI assistant", "I am a bot", "AI agent", "chatbot", "I'm an assistant", "I am an assistant",
  "I am AI", "as an AI", "I\u2019m an AI", "a chatbot", "The chatbots are here", "an AI agent", "this AI bot", "I'm a bot",
  "powered by ChatGPT", "built with OpenAI", "an AI assistant", "AI bot", "AI tools", "the AI",
];
test("self reference scrubbed in every split", () => {
  const leaks: string[] = [];
  const bad = /\bAI\b|\bbot\b|chatbot|assistant|chatgpt|openai|\ba\.i\./i;
  for (const p of SELF) {
    const t = `Hello there. ${p}. Bye.`;
    const variants: [string, string][] = [["whole", whole(t)], ["chars", chars(t)]];
    for (let seed = 1; seed <= 200; seed++) variants.push([`rand${seed}`, run(randomSplit(t, rng(seed)))]);
    for (const [k, o] of variants) if (bad.test(o)) { leaks.push(`${k}: ${p} -> ${o}`); break; }
  }
  console.log("SELF LEAKS", JSON.stringify(leaks, null, 1));
  console.log("SAMPLES", JSON.stringify(SELF.map(p => [p, whole(`Hello. ${p}. Bye.`), chars(`Hello. ${p}. Bye.`)]), null, 1));
  assert.deepEqual(leaks, []);
});

test("lone A and AI splits", () => {
  const cases: [string[], RegExp][] = [
    [["A", "I is here."], /\bAI\b/],
    [["Hello. A", "I helps."], /\bAI\b/],
    [["Clockwork A", "I"], /Clockwork AI/],
    [["I am ", "A", "I."], /\bAI\b/],
    [["I am A", "I."], /\bAI\b/],
    [["I'm an A", "I"], /\bAI\b/],
    [["as an A", "I."], /\bAI\b/],
    [["This is A", "I tech."], /\bAI\b/],
  ];
  const out = cases.map(([c, re]) => [c, run(c), re.test(run(c))] as const);
  console.log("AI SPLITS", JSON.stringify(out));
  // flush
  console.log("END A", JSON.stringify([run(["Pick plan A"]), run(["Option ", "A"]), run(["A"]), run(["Clockwork A"]), run(["Clockwork"]), run(["Clockwork ", "AI"])]));
  assert.equal(run(["Pick plan A"]), "Pick plan A");
  assert.equal(run(["Option ", "A"]), "Option A");
  assert.equal(run(["A"]), "A");
  assert.equal(run(["Clockwork AI"]).includes("Clockwork AI"), true);
  assert.equal(run(["Clockwork ", "A", "I"]).includes("Clockwork AI"), true);
  assert.equal(run(["Clockwork A"]), "Clockwork A");
  for (const [c, re] of cases.filter(([c]) => !c.join("").startsWith("Clockwork"))) assert.equal(re.test(run(c)), false, JSON.stringify(c));
});

test("11 billion stat and price filter", () => {
  const line = "Late payments cost the economy almost 11 billion pounds a year, UK Government, July 2026.";
  console.log("11bn", whole(line), "|", chars(line));
  assert.equal(whole(line), line);
  assert.equal(chars(line), line);
  for (let seed = 1; seed <= 100; seed++) assert.equal(run(randomSplit(line, rng(seed))), line);
  const l2 = "UK businesses lose 38 a day and about 11 billion pounds a year. Autopilot is £149 a month and 20 pounds extra, fifty pounds more.";
  console.log("mix", whole(l2));
  assert.equal(whole(l2).includes("on the call billion"), false);
  assert.equal(whole(l2).includes("£149"), false);
  const l3 = "It costs £11 billion a year.";
  console.log("£11 billion with allowed=[]:", whole(l3));
});
