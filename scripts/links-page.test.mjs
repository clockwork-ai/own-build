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
    `/work?${utm}`,
    `/?${utm}`,
    `/book?${utm}`,
  ]);
  assert.match(html, /Get your free Website Check/);
  assert.match(html, /See my work/);
  assert.match(html, /Visit the website/);
  assert.match(html, /Contact or call/);
  assert.equal(html.includes('id="offer"'), false);
  assert.equal(html.includes("data-hide-at"), false);
  assert.equal(html.includes("a.opt[hidden]"), false);
  assert.doesNotMatch(html, /Foundation offer/);
  assert.match(html, /content="Free Website Check, my work, and how to reach me\. Proof over promises\."/);
  assert.match(html, /href="\/privacy\?utm_source=ig&amp;utm_medium=social&amp;utm_content=links_page"/);
  assert.match(html, /href="\/terms\?utm_source=ig&amp;utm_medium=social&amp;utm_content=links_page"/);
});

test("contact is call or text on 07460 038202, with no WhatsApp number", () => {
  assert.match(html, /href="tel:\+447460038202"/);
  assert.match(html, /href="sms:\+447460038202"/);
  assert.match(html, /Call or text/);
  assert.match(html, /07460 038202/);
  assert.match(html, /href="mailto:callum@getclockworkai.com"/);
  assert.equal(html.includes("0735" + "9"), false);
  assert.doesNotMatch(html, /wa\.me|whatsapp/i);
  const visible = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(visible, /Call or text 07460 038202/);
  for (const href of [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])) {
    if (/^(tel:|sms:|mailto:)/.test(href)) assert.equal(href.includes("utm_"), false, href);
  }
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
  assert.equal(html.includes("£"), false);
  assert.equal(/vat/i.test(html), false);
  assert.doesNotMatch(html, /twilio/i);
});
