import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  addCalendarDays,
  closeCandidateISO,
  dated,
  formatDate,
  formatPounds,
  openItems,
  weekdayName,
  priceSentence,
  totalPounds,
  websiteLaunchTerms,
  websiteLaunchTermsHtml,
} from "./website-launch-terms.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const terms = websiteLaunchTerms;
const html = websiteLaunchTermsHtml();

test("centralises the approved price and the agreed window dates", () => {
  assert.equal(terms.monthlyPounds, 99);
  assert.equal(terms.paymentCount, 12);
  assert.equal(terms.selectedCount, 1);
  assert.equal(totalPounds(), 1188);
  assert.equal(formatPounds(99), "£99");
  assert.equal(formatPounds(1188), "£1,188");
  assert.equal(addCalendarDays("2026-11-08", 10), "2026-11-18");
  assert.equal(addCalendarDays("2026-11-25", 10), "2026-12-05");
  assert.equal(terms.openDateISO, "2026-11-08");
  assert.equal(terms.closeDateISO, "2026-11-18");
  assert.equal(closeCandidateISO(), terms.closeDateISO);
  assert.equal(addCalendarDays(terms.openDateISO, terms.windowCalendarDays), terms.closeDateISO);
  assert.equal(weekdayName(terms.openDateISO), "Sunday");
  assert.equal(weekdayName(terms.closeDateISO), "Wednesday");
  assert.equal(weekdayName(terms.selectByDateISO), "Monday");
  assert.deepEqual(terms.selectionWorkingDates.map(weekdayName), ["Thursday", "Friday", "Monday"]);
  assert.equal(dated(terms.openDateISO), "Sunday 8 November 2026");
  assert.equal(dated(terms.closeDateISO), "Wednesday 18 November 2026");
  assert.equal(dated(terms.selectByDateISO), "Monday 23 November 2026");
  assert.equal(terms.closeTime, "20:00");
  assert.equal(terms.windowCalendarDays, 10);
  assert.equal(terms.selectWithinWorkingDays, 3);
  assert.equal(terms.acceptWithinWorkingDays, 5);
  assert.equal(
    priceSentence(),
    "£99 per month. 12-month minimum. 12 monthly payments of £99. £1,188 total over 12 months, not payable upfront. No VAT added.",
  );
});

test("the committed page matches the single source", () => {
  assert.equal(read(terms.file), html);
});

test("the draft is Foundation only, at a stable address, and not indexed yet", () => {
  assert.equal(terms.path, "/website-launch-terms");
  assert.equal(terms.canonical, "https://clockworkai.app/website-launch-terms");
  assert.match(html, /<title>Foundation launch terms \| Clockwork AI<\/title>/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/clockworkai\.app\/website-launch-terms">/);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /<h1 class="sc-display">Foundation <em>only\.<\/em><\/h1>/);
  assert.match(html, /Foundation package only/);
  assert.match(html, /It is not a website sold on its own, outside Foundation\./);
  assert.match(html, /class="launch-limit"><strong>Foundation only\.<\/strong> The waived setup fee does not cover Growth, Autopilot, an upgrade, or an extra we agree separately\./);
  assert.equal(html.split(priceSentence()).length - 1, 3);
  assert.match(html, /No VAT is added/);
  assert.match(html, /I am not VAT registered/);
  assert.match(html, /There are no compulsory extras/);
  assert.match(html, /own quote and your written acceptance/);
});

test("the same Foundation list is on the homepage, services, roofers and the draft", () => {
  const home = read("index.html");
  const services = read("services.html");
  const roofers = read("roofers.html");
  const currentTerms = read("terms.html");
  const knowledge = read("lib/business.ts");
  for (const line of terms.foundationIncludes) {
    for (const [name, file] of [["home", home], ["services", services], ["roofers", roofers], ["draft", html]]) {
      assert.ok(file.includes(line), `${name} missing ${line}`);
    }
  }
  assert.match(knowledge, /mobile site of up to five pages/);
  assert.match(knowledge, /chat box on the site and the Review Accelerator/);
  assert.match(knowledge, /Never quote a price/);
  assert.doesNotMatch(services, /happy customers are asked/);
  assert.doesNotMatch(home, /A review request after every job|A quoting and job app|A page for each service and town|Monthly posts made from your own jobs/);
  assert.doesNotMatch(home, /£/);
  assert.doesNotMatch(services, /£/);
  assert.doesNotMatch(roofers, /£/);
  assert.doesNotMatch(currentTerms, /£99/);
  assert.match(home, /Missed calls texted back/);
  assert.match(home, /Database Reactivation/);
  assert.match(home, /The Referral Flywheel/);
  assert.match(home, /The Lifetime Value System/);
  assert.match(home, /A monthly review call/);
  for (const line of [terms.servicesGrowth, terms.servicesAutopilot]) {
    assert.ok(services.includes(line), line);
    assert.ok(html.includes(line), line);
  }
  for (const line of [terms.roofersGrowth, terms.roofersAutopilot, terms.roofersEveryCustomer]) {
    assert.ok(roofers.includes(line), line);
  }
  for (const line of [terms.separateHosting, terms.noMinimumOnCurrentTerms, terms.siteOffline, terms.domainInYourName, terms.handover]) {
    assert.ok(currentTerms.includes(line), line);
    assert.ok(html.includes(line), line);
  }
  assert.doesNotMatch(html, /does not choose|Which Foundation description applies|happy customers are asked/);
  for (const file of ["index.html", "services.html", "roofers.html", "terms.html", "privacy.html", "how-it-works.html", "sitemap.xml", "pages.js", "lib/business.ts"]) {
    assert.equal(read(file).includes("website-launch-terms"), false, file);
  }
});

test("keeps the promotion rules that are already decided", () => {
  assert.match(html, /direct message on the Facebook or Instagram post/);
  assert.match(html, /I do not ask you to like, tag, share or follow anything/);
  assert.match(html, /It is not a competition, and it is not a random draw/);
  assert.match(html, /3 working days after the close/);
  assert.match(html, /5 working days from the day I contact them to accept in writing/);
  assert.match(html, /within 14 calendar days of that acceptance/);
  assert.match(html, /30 days' notice in writing/);
  assert.match(html, /10 calendar days/);
  assert.match(html, /Sunday 8 November 2026/);
  assert.match(html, /Wednesday 18 November 2026 at 20:00 Europe\/London/);
  assert.match(html, /On that date, Europe\/London is GMT/);
  assert.match(html, /Monday 23 November 2026/);
  assert.match(html, /Thursday 19 November 2026, Friday 20 November 2026, Monday 23 November 2026/);
  assert.match(html, /does not open before the post/);
  assert.match(html, /This page is not the post/);
  assert.match(html, /not treating the window as already open/);
  assert.match(html, /I do not announce the selected business on Monday 23 November 2026/);
  assert.match(html, /only after they have accepted, and only with a separate yes to publicity/);
  assert.doesNotMatch(html, /illustration|not approved|13 November|16 November/i);
  assert.match(html, /Draft preview\. Not in force\./);
  assert.equal(openItems().some((item) => item.id === "publication-date"), false);
  assert.match(html, /not payable upfront|not payable as one sum|will not ask for them as one sum/);
  assert.match(html, /will not ask for the rest as one lump sum/);
  assert.match(html, /A direct message is an enquiry\. It is not a contract/);
  assert.match(html, /I do not automatically message the businesses that are not selected/);
  assert.match(html, /This draft sets no geographical limit/);
  assert.match(html, /not already a client of mine/);
  assert.match(html, /callum@getclockworkai\.com/);
  assert.match(html, /07460 038202/);
  assert.match(html, /Callum Broadfoot/);
  assert.match(html, /I am not publishing a street address or a company number/);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /separate yes, in writing/);
  assert.match(html, /not sponsored, endorsed or administered by, or associated with, Meta, Facebook or Instagram/);
  assert.match(html, /law of England and Wales/);
  assert.match(html, /not legal clearance/);
  assert.match(html, /no independent judge/i);
  assert.match(read("privacy.html"), /callum@getclockworkai\.com/);
  assert.match(read("terms.html"), /07460 038202/);
  for (const item of openItems()) {
    assert.match(html, new RegExp(`id="open-${item.id}"`));
    assert.ok(html.includes(item.title));
  }
});

test("does not market a free website, a prize, or a second way to apply", () => {
  assert.doesNotMatch(html, /free website/i);
  assert.doesNotMatch(html, /\bprize\b/i);
  assert.doesNotMatch(html, /\bwinner\b/i);
  assert.doesNotMatch(html, /\bwin\b/i);
  assert.doesNotMatch(html, /guaranteed selection/i);
  assert.doesNotMatch(html, /live chat/i);
  assert.doesNotMatch(html, /ChatGPT|artificial intelligence/i);
  assert.doesNotMatch(html, /cal\.com|wa\.me|07359|data-open-chat|<form[\s>]|type="submit"/i);
  assert.doesNotMatch(html, /Book a free/i);
  assert.doesNotMatch(html, /\u2013|\u2014/);
  const withoutBrand = html.replaceAll("Clockwork AI", "");
  assert.doesNotMatch(withoutBrand, /(?<![\w-])AI(?![\w-])/);
  assert.doesNotMatch(html, /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/);
});

test("keeps the page readable without a script and with one heading ladder", () => {
  assert.match(html, /<a class="skip" href="#main">Skip to content<\/a>/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<noscript><style>\[data-sc-in\]\{opacity:1!important/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
  for (let i = 1; i < headings.length; i += 1) {
    assert.ok(headings[i] <= headings[i - 1] + 1, `heading jump at ${i}: ${headings[i - 1]} to ${headings[i]}`);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image[0], /\balt="/);
  }
  for (const link of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)) {
    const text = link[0].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const label = link[0].match(/aria-label="([^"]*)"/);
    assert.ok(text.length > 0 || (label && label[1].trim().length > 0), link[0].slice(0, 120));
  }
  for (const [index, line] of html.split("\n").entries()) {
    if (line.includes("£")) assert.match(line, /client-safe:\s*ignore/, `line ${index + 1}`);
  }
});
