// Homepage switches: one live headline, Dale on with his real job and proof,
// the Website Check target in one place, and Which? figures only when read from his live site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as cfg from "../scripts/home-config.mjs";
import { checkTarget, parseWhich, renderHome } from "../scripts/home-build.mjs";

const src = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const render = (o: Partial<Parameters<typeof renderHome>[1]> = {}) =>
  renderHome(src, { daleOn: false, headline: cfg.HEADLINES.A, check: checkTarget(cfg), which: null, town: "", ...o });

test("defaults: headline A live, Dale on, Website Check opens the phone", () => {
  assert.equal(cfg.HEADLINE, "A");
  assert.equal(cfg.DALE_ON, true);
  assert.equal(cfg.CHECK_MODE, "phone");
  assert.equal(cfg.CHECK_TARGETS.phone.href, "tel:+447460038202");
  assert.equal(cfg.DALE_ASSETS["dp-reroof.jpg"], "https://dandproofingandbuilding.co.uk/brand_assets/fb-reroof-ridge-2.jpg");
  assert.equal(cfg.DALE_ASSETS["dp-logo.png"], "https://dandproofingandbuilding.co.uk/brand_assets/logo-dandp-crop.png");
  assert.equal(cfg.DALE_ASSETS["badge-which.png"], "https://dandproofingandbuilding.co.uk/brand_assets/badge-which.png");
  assert.deepEqual(Object.keys(cfg.HEADLINES), ["A", "B", "C", "D"]);
});

test("built page: one H1 with headline A, B to D nowhere on it, eight sections in order", () => {
  const html = render();
  const h1s = html.match(/<h1\b[^>]*>([^<]*)<\/h1>/g) ?? [];
  assert.equal(h1s.length, 1);
  assert.ok(h1s[0].includes(cfg.HEADLINES.A));
  for (const k of ["B", "C", "D"] as const) assert.ok(!html.includes(cfg.HEADLINES[k]), k);
  const ids = [...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["top", "breath", "what", "how", "proof", "measure", "faq", "go"]);
  assert.ok(!html.includes("{{"), "no placeholders left");
});

test("Dale off: no name, photo, figure or site of his in the page", () => {
  const html = render({ which: { rating: "5.0", count: "143" } });
  assert.doesNotMatch(html, /Dale|D&nbsp;&amp;&nbsp;P|D&amp;P|assets\/dale|dandproofingandbuilding|Which\?/);
});

test("sample-trade placeholders are gone from the homepage", () => {
  assert.doesNotMatch(src, /Illustrative images|AI-generated|Sample, for a plumber|assets\/h-1100|assets\/h-1400|Your business/);
  const on = render({ daleOn: true, which: { rating: "5.0", count: "143" } });
  assert.match(on, /assets\/dale\/dp-reroof\.jpg/);
  assert.match(on, /assets\/dale\/dp-logo\.png/);
  assert.match(on, /assets\/dale\/badge-which\.png/);
  assert.match(on, /stamp__card--logo/);
  assert.match(on, /07587 415299/);
  assert.doesNotMatch(on, /frame__bar|frame__logo/);
  assert.match(on, /assets\/dp-old-desktop\.webp/);
  assert.match(on, /assets\/dp-new-desktop\.webp/);
  assert.doesNotMatch(on, /Illustrative images|AI-generated|tarnhale\.clockworkai\.app|aldwyn\.clockworkai\.app/);
});

test("Dale on: his block shows, and the Which? figures appear only when they were read", () => {
  const on = render({ daleOn: true, which: { rating: "5.0", count: "143" } });
  assert.match(on, /5\.0<\/b><span>from 143 reviews/);
  assert.match(on, /See Dale's site/);
  const unread = render({ daleOn: true, which: null });
  assert.doesNotMatch(unread, /from \d+ reviews/);
  assert.match(unread, /See Dale's site/);
  assert.equal(parseWhich("<p>Rated 5.0 from 143 reviews on Which?</p>")?.count, "143");
  assert.equal(parseWhich("no figures here"), null);
});

test("the Website Check target is one switch, used on every Website Check button", () => {
  const html = render();
  const checks = [...html.matchAll(/<a [^>]*data-ev="check"[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.ok(checks.length >= 6);
  for (const a of checks) {
    assert.ok(a.includes('href="tel:+447460038202"') && !a.includes("_blank"), a);
    assert.match(a, /Get your free Website Check|Free Website Check/);
  }
  const dock = html.match(/<nav class="dock"[\s\S]*?<\/nav>/)?.[0] ?? "";
  assert.match(dock, /href="tel:\+447460038202"[^>]*data-where="dock">[\s\S]*?dock__t">Call/);
  assert.match(dock, /href="sms:\+447460038202"[^>]*data-where="dock">[\s\S]*?dock__t">Text/);
  const booked = renderHome(src, { daleOn: true, headline: cfg.HEADLINES.A, check: checkTarget({ ...cfg, CHECK_MODE: "call" }), which: null, town: "" });
  assert.ok([...booked.matchAll(/<a [^>]*data-ev="check"[^>]*>/g)].every((m) => m[0].includes('href="https://cal.com/clockwork-ai/30min"') && m[0].includes('target="_blank"')));
});

test("house rules: no long dashes, no pound signs, no live chat, Autopilot not Automation, no prices, no review schema", () => {
  for (const html of [render(), render({ daleOn: true, which: { rating: "5.0", count: "143" } })]) {
    const text = html.replace(/<style>[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(text, /[–—]|£|live[\s-]?chat|\bAutomation\b/i);
    assert.doesNotMatch(text, /\b\d+\s*(per month|a month|\/mo)\b/i);
    assert.doesNotMatch(html, /AggregateRating|"@type":\s*"Review"|reviewRating/);
    for (const cut of ["02:14", "What's slowing you down", "1948", "Not a trade", "Moneypenny", "HBR"]) assert.ok(!text.includes(cut), cut);
  }
});
