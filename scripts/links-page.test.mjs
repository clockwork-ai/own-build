import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const html = read("links.html");
const utm = "utm_source=ig&utm_medium=social&utm_content=links_page";

test("links page points at real routes and carries the Instagram UTMs", () => {
  const buttons = [...html.matchAll(/<a class="opt[^"]*"([^>]*)>/g)].map((match) => match[1]);
  const hrefs = buttons.map((attrs) => {
    const href = attrs.match(/href="([^"]+)"/);
    assert.ok(href, attrs);
    return href[1].replaceAll("&amp;", "&");
  });
  assert.deepEqual(hrefs, [
    `/clockwork-check?${utm}`,
    `/website-launch-terms?${utm}`,
    `/work?${utm}`,
    `/?${utm}`,
    `/book?${utm}`,
  ]);
  assert.match(html, /Get your free Website Check/);
  assert.match(html, /Foundation setup-fee waiver/);
  assert.match(html, /See my work/);
  assert.match(html, /Visit the website/);
  assert.match(html, /Contact or call/);
  assert.match(html, /href="\/privacy\?utm_source=ig&amp;utm_medium=social&amp;utm_content=links_page"/);
  assert.match(html, /href="\/terms\?utm_source=ig&amp;utm_medium=social&amp;utm_content=links_page"/);
});

test("contact details stay on the existing numbers and stay free of UTMs", () => {
  assert.match(html, /href="tel:\+447460038202"/);
  assert.match(html, /07460 038202/);
  assert.match(html, /href="mailto:callum@getclockworkai.com"/);
  assert.match(html, /href="https:\/\/wa\.me\/447359838866\?text=Hi%20Callum%2C%20I%20found%20Clockwork%20AI%20online\.%20I%27d%20like%20to%20talk%20about%3A%20"/);
  assert.match(html, /07359 838866/);
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(tel:|mailto:|https:\/\/wa\.me\/)/.test(href)) assert.equal(href.includes("utm_"), false, href);
  }
});

test("the Foundation offer hides at 20:00 GMT on Wednesday 18 November 2026 and shows no price", () => {
  assert.match(html, /id="offer"/);
  assert.match(html, /data-hide-at="2026-11-18T20:00:00Z"/);
  assert.match(html, /Closes Wednesday 18 November 2026 at 20:00 GMT/);
  assert.match(html, /Number\.isFinite\(close\) && Date\.now\(\) >= close\) offer\.hidden = true/);
  assert.match(html, /a\.opt\[hidden\] \{ display: none !important; \}/);
  const close = Date.parse("2026-11-18T20:00:00Z");
  assert.equal(new Date(close).toISOString(), "2026-11-18T20:00:00.000Z");
  assert.ok(Date.parse("2026-11-18T19:59:59Z") < close);
  assert.ok(Date.now() < close);
  assert.equal(html.includes("£"), false);
  assert.equal(/vat/i.test(html), false);
});

test("the page can be indexed and the sitemap lists it, not the offer terms", () => {
  assert.equal(/noindex/i.test(html), false);
  assert.match(html, /<link rel="canonical" href="https:\/\/clockworkai\.app\/links">/);
  assert.match(html, /Proof over promises/);
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /<loc>https:\/\/clockworkai\.app\/links<\/loc>/);
  assert.equal((sitemap.match(/website-launch-terms/g) || []).length, 0);
  assert.doesNotMatch(html, /—|–/);
  assert.doesNotMatch(html, /\b(bot|agent)s?\b/i);
});
