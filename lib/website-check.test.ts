// The Website Check form: fields, source, consent, homepage buttons, and the copy it must not carry.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mock, test } from "node:test";
import { business } from "./business.ts";
import { knownPage } from "./guard.ts";
import { saveLead, validateWebsiteCheck } from "./leads.ts";
import type { SaveLeadDeps } from "./leads.ts";
import { buildLeadEmail } from "./mail.ts";
import * as cfg from "../scripts/home-config.mjs";
import { checkTarget, renderHome } from "../scripts/home-build.mjs";

const good = {
  name: "Sam Lee",
  business: "Lee Roofing",
  link: "https://leeroofing.example",
  email: "sam@example.com",
  phone: "07700 900123",
  area: "Stockport",
};

const html = readFileSync(new URL("../website-check.html", import.meta.url), "utf8");

function inputTag(id: string): string {
  const tag = html.match(new RegExp(`<input\\b[^>]*\\bid="${id}"[^>]*>`));
  assert.ok(tag, id);
  return tag[0];
}

test("website check becomes a normal lead with source website-check", () => {
  const result = validateWebsiteCheck(good, "/website-check");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.lead.source, "website-check");
  assert.equal(result.lead.name, "Sam Lee");
  assert.equal(result.lead.business, "Lee Roofing");
  assert.equal(result.lead.contact, "sam@example.com");
  assert.equal(result.lead.page, "/website-check");
  assert.match(result.lead.need, /Written Website Check/);
  assert.match(result.lead.need, /Area: Stockport/);
  assert.match(result.lead.need, /Website or Facebook: https:\/\/leeroofing\.example/);
  assert.match(result.lead.need, /Phone: 07700 900123/);
  assert.match(result.lead.summary ?? "", /Website Check request/);
  assert.ok(result.lead.need.length <= 400);
});

test("the page asks for the Website Check fields, and only name, business, email and area are required", () => {
  const name = inputTag("wc-name");
  const businessName = inputTag("wc-business");
  const link = inputTag("wc-link");
  const email = inputTag("wc-email");
  const phone = inputTag("wc-phone");
  const area = inputTag("wc-area");
  assert.match(name, /\brequired\b/);
  assert.match(name, /name="name"/);
  assert.match(html, /for="wc-name">Name</);
  assert.match(businessName, /\brequired\b/);
  assert.match(businessName, /name="business"/);
  assert.match(html, /for="wc-business">Business name</);
  assert.doesNotMatch(link, /\brequired\b/);
  assert.match(link, /name="link"/);
  assert.match(html, /for="wc-link">Website or Facebook link/);
  assert.match(html, /wc-link">Website or Facebook link <span class="wc-opt">\(optional\)<\/span>/);
  assert.match(email, /\brequired\b/);
  assert.match(email, /type="email"/);
  assert.match(email, /name="email"/);
  assert.doesNotMatch(phone, /\brequired\b/);
  assert.match(phone, /type="tel"/);
  assert.match(phone, /name="phone"/);
  assert.match(html, /for="wc-phone">Phone <span class="wc-opt">\(optional\)<\/span>/);
  assert.match(area, /\brequired\b/);
  assert.match(area, /name="area"/);
  assert.match(html, /for="wc-area">Area or postcode</);
});

test("website check needs every required answer, and a bad phone is refused", () => {
  const cases: [Record<string, unknown>, RegExp][] = [
    [{ ...good, name: "" }, /name/],
    [{ ...good, name: "S" }, /name/],
    [{ ...good, business: "" }, /business name/],
    [{ ...good, area: "" }, /area or postcode/],
    [{ ...good, email: "" }, /email address/],
    [{ ...good, email: "not-an-email" }, /email address/],
    [{ ...good, phone: "nope" }, /phone number/],
    [{ ...good, phone: "07700" }, /phone number/],
  ];
  for (const [input, error] of cases) {
    const result = validateWebsiteCheck(input);
    assert.equal(result.ok, false, JSON.stringify(input));
    if (!result.ok) assert.match(result.error, error);
  }
});

test("the link and the phone can be left blank, and the email is the contact", () => {
  const result = validateWebsiteCheck({ ...good, link: "", phone: "  " });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.lead.contact, "sam@example.com");
  assert.match(result.lead.need, /Website or Facebook: none given/);
  assert.doesNotMatch(result.lead.need, /Phone:/);
  assert.match(result.lead.summary ?? "", /Phone: None/);
  assert.match(result.lead.summary ?? "", /Website or Facebook: None/);
});

test("a long link stays inside the 400 character need limit", () => {
  const result = validateWebsiteCheck({ ...good, link: "https://example.com/" + "a".repeat(500), area: "x".repeat(200) });
  assert.equal(result.ok, true);
  if (result.ok) assert.ok(result.lead.need.length <= 400);
});

test("consent links to the privacy page, in the same pattern as register interest", () => {
  assert.match(html, /I'll only use these details to write your Website Check and email it to you\. Nothing else\. <a href="\/privacy">How I handle data<\/a>\./);
});

test("without JavaScript the reveal stays visible", () => {
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  assert.match(head, /<noscript><style>\[data-sc-in\]\{opacity:1 !important;transform:none !important\}<\/style><\/noscript>/);
});

test("the form uses method post, and without JavaScript it gives the call, text and email line", () => {
  assert.match(html, /<form class="wc-form" id="wc-form" method="post" novalidate>/);
  const noscript = html.match(/<noscript><p class="note"[\s\S]*?<\/noscript>/)?.[0] ?? "";
  assert.match(noscript, /<p class="note"/);
  const text = noscript.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  assert.equal(text, "This form needs JavaScript. Call or text 07460 038202, or email callum@getclockworkai.com.");
  assert.match(noscript, /<a href="tel:\+447460038202">07460 038202<\/a>/);
  assert.match(noscript, /<a href="mailto:callum@getclockworkai\.com">callum@getclockworkai\.com<\/a>/);
});

test("the form posts source website-check through the register interest lead route", () => {
  assert.match(html, /fetch\('\/api\/chat'/);
  assert.match(html, /form: 'website-check'/);
  assert.match(html, /page: '\/website-check'/);
  assert.match(html, /name: val\('name'\), business: val\('business'\), link: val\('link'/);
  assert.match(html, /email: val\('email'\), phone: val\('phone'\), area: val\('area'\)/);
  const server = readFileSync(new URL("../server/chat.ts", import.meta.url), "utf8");
  const block = server.slice(server.indexOf('form === "website-check"'));
  assert.match(block, /validateWebsiteCheck\(leadBody, page\)/);
  assert.match(block, /saveLead\(business, parsed\.lead\)/);
  assert.doesNotMatch(block.slice(0, block.indexOf("if (leadBody")), /REGISTER_INTEREST_DEMO|cal\.com|whatsapp/i);
});

test("the page is known to the lead route and listed in the sitemap", () => {
  assert.equal(knownPage("/website-check", business.pages), "/website-check");
  assert.match(readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8"), /<loc>https:\/\/clockworkai\.app\/website-check<\/loc>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/clockworkai\.app\/website-check">/);
});

test("the page says the check is a free written check emailed within 5 working days, including the success state", () => {
  const intro = "The Website Check is a free, written check of your website, sent by email within 5 working days.";
  assert.match(html, /<meta name="description" content="The Website Check is a free, written check of your website, sent by email within 5 working days\.">/);
  assert.match(html, /<meta property="og:description" content="The Website Check is a free, written check of your website, sent by email within 5 working days\.">/);
  assert.equal(html.includes('name="twitter:description"'), false);
  assert.match(html, /<p class="lede">The Website Check is a free, written check of your website, sent by email within 5 working days\.<\/p>/);
  assert.equal(html.split(intro).length - 1, 3);
  assert.match(html, /I'll email you the written Website Check within 5 working days\./);
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ");
  assert.match(visible, /The Website Check is a free, written check of your website, sent by email within 5 working days/);
  assert.match(visible, /written Website Check within 5 working days/);
});

function dealSection(): string {
  const start = html.indexOf('<section id="deal"');
  const end = html.indexOf("</section>", start);
  assert.ok(start > 0 && end > start);
  return html.slice(start, end);
}

function outsideDeal(source: string): string {
  const start = source.indexOf('<section id="deal"');
  const end = source.indexOf("</section>", start);
  assert.ok(start > 0 && end > start);
  return source.slice(0, start) + source.slice(end + "</section>".length);
}

test("under the form, the only number is Call or text 07460 038202", () => {
  assert.match(html, /<p class="wc-reach"><a href="tel:\+447460038202">Call<\/a> or <a href="sms:\+447460038202">text 07460 038202<\/a><\/p>/);
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  assert.match(visible, /Call or text 07460 038202/);
  assert.equal(visible.split("07460 038202").length - 1, 3);
  assert.equal(html.split("+447460038202").length - 1, 5);
});

test("the form and the introduction do not mention a booking, WhatsApp, Twilio or a price", () => {
  const rest = outsideDeal(html);
  const visible = rest
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replaceAll("Call or text 07460 038202", " ");
  assert.doesNotMatch(visible, /\b(call|calls|calling|book|booking|booked)\b/i);
  assert.deepEqual(rest.match(/\bcall\b/gi), ["Call", "Call"]);
  assert.doesNotMatch(html, /\b(book|booking|booked)\b|whatsapp|wa\.me|twilio|cal\.com/i);
  assert.doesNotMatch(rest, /£|per month|a month|\/mo\b/i);
  assert.doesNotMatch(html, /\b(unlock|seamless|elevate|game-changer|leverage)\b/i);
  assert.doesNotMatch(html, /[–—]/);
});

test("the deal section pins the price line, and stays visible without JavaScript", () => {
  const deal = dealSection();
  const approved = "Foundation is £99 a month, with a 12-month minimum, £1,188 in total. No VAT added. Growth and Autopilot are priced on your call. The price you pay is the one in your written agreement.";
  assert.match(deal, /<h2 class="sc-display h2-md">What you pay<\/h2>/);
  assert.doesNotMatch(deal, /what you sign|what stays yours|what you own/i);
  assert.equal(deal.split(approved).length - 1, 1);
  assert.match(deal, /<p>Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\. <a href="tel:\+447460038202">Call<\/a> or <a href="sms:\+447460038202">text 07460 038202<\/a>\.<\/p>/);
  assert.match(deal, /No VAT added/);
  assert.deepEqual(deal.match(/VAT/g), ["VAT"]);
  assert.doesNotMatch(deal, /plus VAT|ex VAT|VAT included|\+\s?VAT/i);
  const oldMobileHead = "0735" + "9";
  const oldMobileTail = "838" + "866";
  assert.doesNotMatch(deal, new RegExp(`${oldMobileHead}\\s*${oldMobileTail}`));
  assert.doesNotMatch(deal, /whatsapp/i);
  const shortLink = ["wa", "me"].join(".");
  assert.doesNotMatch(deal, new RegExp(shortLink.replace(".", "\\."), "i"));
  assert.doesNotMatch(deal, /[–—]/);
  assert.doesNotMatch(deal, /\b(unlock|seamless|elevate|game-changer|leverage)\b/i);
  assert.match(deal, /data-sc-in/);
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  assert.match(head, /<noscript><style>\[data-sc-in\]\{opacity:1 !important;transform:none !important\}<\/style><\/noscript>/);
  const dealAt = html.indexOf('<section id="deal"');
  assert.ok(dealAt > 0 && dealAt < html.indexOf('<script src="scrollcraft.js">'));
});

test("the hero Website Check button opens the form, and the other eight keep their wording and the phone switch", () => {
  assert.equal(cfg.CHECK_MODE, "phone");
  assert.equal(cfg.CHECK_TARGETS.phone.href, "tel:+447460038202");
  const src = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(src, /<a class="btn btn--primary" href="\/website-check" data-ev="check" data-where="hero">Get your free Website Check<\/a>/);
  const home = renderHome(src, {
    daleOn: false,
    headline: cfg.HEADLINES.A,
    check: checkTarget(cfg),
    which: null,
    town: "",
  });
  const checks = [...home.matchAll(/<a [^>]*data-ev="check"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.equal(checks.length, 9);
  const hero = checks.find((anchor) => anchor.includes('data-where="hero"')) ?? "";
  assert.match(hero, /href="\/website-check"/);
  assert.match(hero, /Get your free Website Check/);
  assert.doesNotMatch(hero, /target="_blank"|tel:|sms:|cal\.com/);
  for (const anchor of checks) {
    if (anchor.includes('data-where="hero"')) continue;
    assert.match(anchor, /href="tel:\+447460038202"/);
    assert.doesNotMatch(anchor, /href="\/website-check"|cal\.com/);
  }
  assert.equal(checks.filter((anchor) => anchor.includes("Get your free Website Check")).length, 8);
  const dock = checks.find((anchor) => anchor.includes('data-where="dock"')) ?? "";
  assert.match(dock, /Free Website Check/);
  assert.doesNotMatch(dock, /Get your free Website Check/);
  assert.equal(src.split("Get your free Website Check").length - 1, 8);
  assert.match(src, /data-where="dock">Free Website Check/);
});

test("the notice email is labelled as a Website Check and is not addressed to the submitter", async () => {
  const result = validateWebsiteCheck(good, "/website-check");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const mail = buildLeadEmail(business.lead.notifyEmail, "from@example.com", result.lead, result.lead.summary ?? "");
  assert.equal(mail.to, "callum@getclockworkai.com");
  assert.notEqual(mail.to, good.email);
  assert.equal(mail.replyTo, good.email);
  assert.equal(mail.subject, "New Website Check request: Sam Lee");
  assert.match(mail.text, /How it arrived: Website Check page/);
  assert.match(mail.text, /Area or postcode: Stockport/);
  assert.doesNotMatch(`${mail.subject}\n${mail.text}`, /[–—]/);

  const savedToken = process.env.BLOB_READ_WRITE_TOKEN;
  const savedStore = process.env.BLOB_STORE_ID;
  process.env.BLOB_READ_WRITE_TOKEN = "test-token-not-real";
  delete process.env.BLOB_STORE_ID;
  const email = mock.fn(async () => false);
  const put = mock.fn(async () => ({})) as unknown as SaveLeadDeps["put"];
  const fetchFake = mock.fn(async () => new Response(null, { status: 200 })) as unknown as SaveLeadDeps["fetch"];
  const calls = (fn: unknown) => (fn as ReturnType<typeof mock.fn>).mock;
  try {
    const saved = await saveLead(business, result.lead, { put, email, fetch: fetchFake });
    assert.equal(saved.ok, true);
    assert.equal(calls(email).calls[0]?.arguments[0], business.lead.notifyEmail);
    assert.notEqual(calls(email).calls[0]?.arguments[0], result.lead.contact);
    assert.equal(calls(put).callCount(), 1);
    const [path, body, options] = calls(put).calls[0].arguments as [string, string, { access?: string }];
    assert.match(path, /^leads\/\d{4}-\d{2}-\d{2}\/[0-9a-f]{16}\.json$/);
    assert.equal(options.access, "private");
    const record = JSON.parse(body) as { source?: string; notifyName?: string };
    assert.equal(record.source, "website-check");
    assert.equal(record.notifyName, "Callum Broadfoot");
  } finally {
    if (savedToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = savedToken;
    if (savedStore === undefined) delete process.env.BLOB_STORE_ID;
    else process.env.BLOB_STORE_ID = savedStore;
  }
});
