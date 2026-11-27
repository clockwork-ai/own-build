// Pins the DJ Stewie B example page: noindex, off every page index, and a date form that never calls the network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
// @ts-ignore plain JS module
import { demoSites } from "../scripts/demo-sites.mjs";

const root = path.join(import.meta.dirname, "..");
const demoDir = path.join(root, "demos", "dj-stewie-b");
const self = path.join(root, "lib", "dj-stewie-b.test.ts");

const html = await readFile(path.join(demoDir, "index.html"), "utf8");
const js = await readFile(path.join(demoDir, "site.js"), "utf8");
const css = await readFile(path.join(demoDir, "style.css"), "utf8");

function insideDemo(file: string) {
  const rel = path.relative(demoDir, file);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

async function walk(dir: string): Promise<string[]> {
  const skip = new Set(["node_modules", ".git", "public"]);
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

test("the page asks crawlers not to index or follow", () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});

test("the page stays out of the sitemap, the nav, llms files and any page index", async () => {
  const sites = (await demoSites()) as { name: string }[];
  assert.equal(sites.some((site) => site.name === "dj-stewie-b"), false);

  const files = await walk(root);
  const indexed = files.filter((file) => {
    if (file === self || insideDemo(file)) return false;
    return /\.(html|xml|txt|md|js|mjs|css|svg|json)$/i.test(file);
  });
  assert.ok(indexed.some((file) => file.endsWith(`${path.sep}sitemap.xml`)));
  assert.ok(indexed.some((file) => file.endsWith(`${path.sep}examples.html`)));
  assert.ok(indexed.some((file) => file.endsWith(`${path.sep}index.html`)));
  const llms = files.filter((file) => /llms/i.test(path.basename(file)) && !insideDemo(file) && file !== self);
  for (const file of [...indexed, ...llms]) {
    const text = await readFile(file, "utf8");
    assert.doesNotMatch(text, /dj-stewie-b/, path.relative(root, file));
  }
});

test("the check my date form makes no network call", () => {
  assert.match(html, /id="check-date"/);
  assert.match(html, /action="#date"/);
  assert.match(html, /onsubmit="event\.preventDefault\(\)"/);
  assert.match(html, /name="date"/);
  assert.match(html, /name="event"/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="number"/);
  assert.match(html, /id="date-input"[^>]*type="text"[^>]*lang="en-GB"[^>]*placeholder="dd\/mm\/yyyy"/);
  assert.doesNotMatch(html, /<form[^>]*method=/i);
  assert.doesNotMatch(html, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|\/api\//);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|\/api\/|https?:|new Audio|HTMLMediaElement/);
  assert.match(js, /preventDefault/);

  const hits: string[] = [];
  const listeners = new Map<string, (event: Record<string, unknown>) => void>();
  const note = { hidden: true, textContent: "" };
  const values: Record<string, string> = {
    date: "08/08/2026",
    event: "Wedding",
    name: "Guest",
    number: "n",
  };
  const form = {
    addEventListener(type: string, fn: (event: Record<string, unknown>) => void) {
      listeners.set(type, fn);
    },
    querySelector(sel: string) {
      const found = sel.match(/name="([^"]+)"/);
      const key = found ? found[1] : "";
      return { value: values[key] ?? "" };
    },
  };
  const doc = {
    getElementById(id: string) {
      if (id === "check-date") return form;
      if (id === "check-date-note") return note;
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  const context: Record<string, unknown> = {
    document: undefined,
    fetch() { hits.push("fetch"); },
    XMLHttpRequest: function () { hits.push("xhr"); },
    WebSocket: function () { hits.push("ws"); },
    EventSource: function () { hits.push("es"); },
    navigator: { sendBeacon() { hits.push("beacon"); return true; } },
  };
  vm.runInNewContext(js, context);
  const api = context.DJStewieDemo as { bindCheckDate: (doc: unknown) => void };
  api.bindCheckDate(doc);

  let prevented = false;
  listeners.get("submit")!({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(note.hidden, false);
  assert.match(note.textContent, /demo/i);
  assert.match(note.textContent, /Nothing has been sent or saved/);
  assert.equal(hits.length, 0);

  values.date = "";
  values.number = "";
  listeners.get("submit")!({ preventDefault() {} });
  assert.match(note.textContent, /Add the date/);
  assert.equal(hits.length, 0);
});

test("reviews are labelled examples, and players are not embeds", () => {
  const reviews = html.match(/<article class="review"[\s\S]*?<\/article>/g) || [];
  assert.equal(reviews.length, 3);
  for (const review of reviews) {
    assert.match(review, /Example review/);
    assert.doesNotMatch(review, /It is not a quote/);
  }
  assert.equal((html.match(/These cards are examples, not real reviews\./g) || []).length, 1);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /id="date-input"[^>]*lang="en-GB"/);
  assert.match(html, /dd\/mm\/yyyy/);
  assert.match(html, /Demo by <a href="https:\/\/clockworkai\.app"[^>]*>Clockwork AI<\/a>/);
  assert.match(html, /noindex, nofollow/);
  const features = html.slice(html.indexOf('class="foot__features"'), html.indexOf("wrap legal"));
  const phone = features.indexOf("AI phone line");
  const chat = features.indexOf("AI chat");
  const person = features.indexOf("It is not a person.");
  assert.ok(phone >= 0 && chat > phone && person > chat);
  const brand = html.slice(html.indexOf('class="foot__brand"'), html.indexOf('class="foot__features"'));
  assert.equal(brand.includes("It is not a person."), false);
  assert.match(css, /\.foot__features \{ grid-template-columns: 1fr 1fr; \}/);
  assert.match(css, /\.foot__once \{ grid-column: 1 \/ -1; \}/);
  assert.doesNotMatch(html, /<(iframe|audio|video|embed|object|blockquote)\b/i);
  assert.doesNotMatch(html, /youtube|youtu\.be|vimeo|soundcloud|mixcloud|spotify|instagram|facebook|tiktok|weddingjam|evepla/i);
  assert.match(html, /Demo by <a href="https:\/\/clockworkai\.app"[^>]*>Clockwork AI<\/a>/);
});

test("copy stays inside the brief: no prices, no other phone numbers, no dashes", () => {
  const blob = html + "\n" + css + "\n" + js;
  assert.equal(blob.includes("\u2014"), false);
  assert.equal(blob.includes("\u2013"), false);
  assert.doesNotMatch(blob, /£|whatsapp|live[\s-]?chat|Jess|07725|642563/i);
  assert.doesNotMatch(blob, /\b(unlock|seamless|elevate|game-changer|leverage)\b/i);
  const phones = blob.match(/\+?\d[\d\s()-]{8,}\d/g) || [];
  assert.ok(phones.length > 0);
  for (const phone of phones) {
    const digits = phone.replace(/\D/g, "").replace(/^44/, "").replace(/^0/, "");
    assert.equal(digits, "7460038202", phone);
  }
});

test("the demo page does not use trade wording", () => {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
  const banned = [
    "trade",
    "tradesman",
    "on the tools",
    "vans",
    "jobs",
    "quotes",
    "clockwork jobs",
    "plumbers",
    "roofers",
    "heating",
    "boilers",
  ];
  for (const word of banned) {
    assert.equal(new RegExp("\\b" + word + "\\b", "i").test(text), false, word);
  }
});
