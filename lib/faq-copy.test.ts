// Pins the fair-question copy on the homepage, services, missed calls and the booking page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import * as cfg from "../scripts/home-config.mjs";
import { checkTarget, renderHome } from "../scripts/home-build.mjs";

const read = (name: string) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

const home = renderHome(read("index.html"), {
  daleOn: false,
  headline: cfg.HEADLINES.A,
  check: checkTarget(cfg),
  which: null,
  town: "",
});
const services = read("services.html");
const missed = read("missed-calls.html");
const book = read("book.html");

function answer(html: string, question: string): string {
  const q = question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = html.match(new RegExp(`<details><summary>${q}</summary><p>([\\s\\S]*?)</p></details>`));
  assert.ok(found, question);
  return found[1];
}

test("homepage fair questions: the new cost answer, the missed-call question, and the held domain answer", () => {
  assert.equal(
    answer(home, "What does it cost?"),
    'Flat monthly, no per-minute charges. There\'s a fixed setup and a monthly plan, both priced on your free call, so you know the full cost before anything starts. The minimum term is in my <a href="/terms">terms</a>.',
  );
  assert.equal(
    answer(home, "What happens if I miss a call when I'm on a job?"),
    "Jess, my AI phone line, answers. She takes the caller's details and gets you to ring them back. You get those details after the call, so you know who's waiting.",
  );
  assert.equal(
    answer(home, "Do I own my domain?"),
    "Yes. The domain is in your name and stays yours. I hold access to look after it, nothing more. If you ever leave, it goes with you.",
  );
  const block = home.match(/<section id="faq"[\s\S]*?<\/section>/)?.[0] ?? "";
  const summaries = [...block.matchAll(/<summary>(.*?)<\/summary>/g)].map((match) => match[1]);
  assert.deepEqual(summaries, [
    "What happens if I miss a call when I'm on a job?",
    "Do I own my domain?",
    "How long does it take?",
    "Do I have to do anything, or need tech skills?",
    "Will I keep my phone number?",
    "What does it cost?",
  ]);
  assert.equal(home.split("What happens if I miss a call when I'm on a job?").length - 1, 1);
});

test("homepage closing call to action names the written Website Check and a separate call", () => {
  const go = home.match(/<section id="go"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(go, /<span class="label">Start here<\/span>/);
  assert.match(go, /<h2 id="go-h" class="h2">Start with the free Website Check\.<\/h2>/);
  assert.match(go, /<p class="lede">A written check of your website, emailed to you within 5 working days\. It's free, with no obligation\.<\/p>/);
  assert.match(go, /<a class="btn btn--primary" href="\/website-check"[^>]*>Get your free Website Check<\/a>/);
  assert.match(go, /<a class="btn btn--ghost" href="\/book"[^>]*>Book a free 30-minute call<\/a>/);
  assert.match(go, />Call 07460 038202</);
  assert.doesNotMatch(go, /See what your website is costing you/);
});

test("services fair questions: the new cost and website answers, and the held tie-in answer", () => {
  assert.equal(
    answer(services, "What does it cost?"),
    "Flat monthly, no per-minute charges. The setup and the monthly plan are priced on your free call. I don't publish plan prices here.",
  );
  assert.equal(
    answer(services, "When do I get the website?"),
    "Usually a few weeks from the call to going live. You get a date on the call and a private preview to check before anything changes.",
  );
  assert.equal(
    answer(services, "Am I tied in for a set number of months?"),
    'The minimum term and notice are set out in my <a href="/terms">terms</a>. The detail goes in writing before you start.',
  );
});

test("missed calls has the new section above fair questions, and no clockwork-check link", () => {
  const section = missed.match(/<section id="off-tools"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(section, /<h2 class="sc-display">When you can't get to the phone\.<\/h2>/);
  assert.match(
    section,
    /<p>Jess is an AI phone line\. When you're on a job, she answers, takes the details and gets you to ring them back\. You get the caller's details after the call, so you know who to ring when you're off the tools\.<\/p>/,
  );
  const sectionAt = missed.indexOf('id="off-tools"');
  const questionsAt = missed.indexOf('id="faq"');
  assert.ok(sectionAt > 0 && questionsAt > sectionAt);
  assert.equal(
    answer(missed, "Will customers know it isn't me?"),
    "It is upfront that it isn't you, and only says what you've approved. You try it on your own phone before it goes live.",
  );
  assert.equal(missed.includes("/clockwork-check"), false);
  assert.match(missed, /<a class="btn btn--primary" href="\/website-check">Get your free Website Check<\/a>/);
  assert.match(missed, /<a href="\/website-check">Free Website Check<\/a>/);
  assert.equal(missed.includes("panel--key"), false);
  assert.equal(missed.includes("Jess is the receptionist"), false);
  assert.equal(missed.includes("When you need the phone answered, not just a text back."), false);
  assert.equal(missed.includes("See how a real call went"), false);
  assert.equal(missed.split("Jess").length - 1, 1);
});

test("the booking page calls the 30 minute slot a call, not a Website Check", () => {
  assert.equal(
    answer(book, "Is it really free?"),
    "Yes. It's a free 30-minute call, with no cost and no obligation.",
  );
  const beforeFooter = book.slice(0, book.indexOf("<footer"));
  assert.doesNotMatch(beforeFooter, /Website Check|free check/i);
  assert.match(beforeFooter, /Book a call/);
  assert.match(beforeFooter, /a free 30-minute call/);
  assert.doesNotMatch(book, /within 5 working days/);
});

test("no built page links Website Check text to /clockwork-check", () => {
  const root = new URL("..", import.meta.url);
  const pages = readdirSync(root).filter((name) => name.endsWith(".html") && name !== "clockwork-check.html");
  const hits: string[] = [];
  const take = (file: string, html: string) => {
    for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      const href = match[1].match(/href="([^"]*)"/)?.[1] ?? "";
      const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (/website check/i.test(text) && href.includes("/clockwork-check")) hits.push(`${file}: ${text} -> ${href}`);
    }
  };
  for (const name of pages) take(name, readFileSync(new URL(`../${name}`, import.meta.url), "utf8"));
  take("built homepage", home);
  take("chat/widget.js", readFileSync(new URL("../chat/widget.js", import.meta.url), "utf8"));
  const nav = readFileSync(new URL("../pages.js", import.meta.url), "utf8");
  const row = nav.match(/\['([^']+)', 'Free Website Check', '11:00'\]/);
  assert.equal(row?.[1], "/website-check");
  assert.equal(readFileSync(new URL("../lib/business.ts", import.meta.url), "utf8").includes('audit: "/website-check"'), true);
  assert.deepEqual(hits, []);
});

test("the changed pages contain no em or en dash", () => {
  for (const [name, html] of [
    ["homepage", home],
    ["services", services],
    ["missed-calls", missed],
    ["book", book],
  ] as const) {
    assert.doesNotMatch(html, /[–—]/, name);
  }
});
