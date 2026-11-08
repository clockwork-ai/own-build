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
  assert.equal(terms.revisionRounds, 2);
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
  assert.equal(terms.materialsCalendarDays, 14);
  assert.equal(terms.catchUpDays, 14);
  assert.equal(terms.publicityMonths, 24);
  assert.equal(terms.publicityPlaces, "the Clockwork AI website, my Facebook and my Instagram");
  assert.equal(
    priceSentence(),
    "£99 per month. 12 monthly payments of £99. £1,188 total Clockwork fees over 12 months, not payable upfront. Domain purchase and renewal are paid separately by you. No VAT added.",
  );
});

test("states the agreed price, the 12 payments, and the missed-payment rule", () => {
  assert.match(html, /<h2 class="sc-display h2-md">The Foundation price\.<\/h2>/);
  assert.doesNotMatch(html, /proposed/);
  assert.match(html, /There are 12 payments of £99\./);
  assert.match(html, /The total of the Clockwork fees is £1,188\. I will not ask for them as one sum at the start\./);
  assert.match(html, /The first payment is due on the day the website actually goes live, once you have approved that go-live\./);
  assert.match(html, /It is not due earlier, on a day when you only agree a future go-live date\./);
  assert.match(html, /Each of the other 11 payments is due monthly from that actual go-live date\./);
  assert.match(html, /If a later month does not have that day, that payment is due on the last day of that month\./);
  assert.match(html, /Routine care is included in the £99 a month\./);
  assert.match(html, /Hosting is included in the £99 a month as well\./);
  assert.match(html, /Two rounds of changes to the website are included\./);
  assert.match(html, /the ones still to come stay due one month at a time\. I will not bring them forward, and I will not ask for the rest as one lump sum\./);
  assert.match(html, /carries on month to month until one of us gives 30 days' notice/);
  assert.match(html, /hosting and routine care stop, and you can move the website elsewhere/);
  assert.match(html, /If a payment is missed, I email you at the address you used to accept\./);
  assert.match(html, /You then have 14 days from that email to pay what is overdue\./);
  assert.match(html, /I take the website offline until you have paid the overdue payments\./);
  assert.match(html, /When those overdue payments are cleared, I put the website back online\./);
  assert.match(html, /The monthly payments that are not yet due stay due on their own dates\./);
  assert.match(html, /For this offer that does not apply in that form\./);
  assert.doesNotMatch(html, /What happens if a payment is missed is not agreed/);
  assert.doesNotMatch(html, /late fee|interest on|suspended after|grace period/i);
  assert.match(html, /You buy and renew the domain yourself, in a registrar account in your name that you control, and you pay that company directly\./);
  assert.match(html, /You can keep a domain you already have\. You do not have to buy a new one\./);
  assert.match(html, /I help you point the domain to Vercel so the website shows, and I leave any email records you already have in place\./);
  assert.match(html, /Setting up your Google profile is included\. That is not an email inbox\./);
  assert.match(html, /Website hosting is not a business email subscription\./);
  assert.match(html, /No email package and no email price are included\./);
  assert.match(html, /It is not a condition of this offer\./);
  assert.doesNotMatch(html, /compulsory extra|all-in|all in|premium name|which ending the name uses|only a recommendation|Whether a domain is included is not agreed/i);
  assert.equal((html.match(/£1,188 total(?! Clockwork fees)/g) || []).length, 0);
  assert.match(html, /Wednesday 18 November 2026 at 20:00 Europe\/London/);
  assert.match(html, /Monday 23 November 2026/);
  assert.match(html, /The Review Accelerator, for every customer/);
});

test("the committed page matches the single source", () => {
  assert.equal(read(terms.file), html);
});

test("the draft is Foundation only, at a stable address, and not indexed yet", () => {
  assert.equal(terms.path, "/website-launch-terms");
  assert.equal(terms.canonical, "https://clockworkai.app/website-launch-terms");
  assert.match(html, /<title>Foundation case-study offer \| Clockwork AI<\/title>/);
  assert.match(html, /This is a Foundation case-study offer\./);
  assert.doesNotMatch(html, /noindex|nofollow/);
  assert.match(html, /<link rel="canonical" href="https:\/\/clockworkai\.app\/website-launch-terms">/);
  assert.match(html, /<html lang="en-GB">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /<h1 class="sc-display">Foundation <em>only\.<\/em><\/h1>/);
  assert.match(html, /Foundation case-study offer/);
  assert.match(html, /The waived setup fee has this condition\./);
  assert.match(html, /you permit me to show your business name, the finished website, and screenshots of that website which we have each agreed/);
  assert.match(html, /I do not show a screenshot until you have agreed that exact screenshot\./);
  assert.match(html, /It covers those three things only\./);
  assert.match(html, /I show them only on the Clockwork AI website, my Facebook and my Instagram\./);
  assert.match(html, /I do not use them in paid advertising\./);
  assert.match(html, /I do not let anyone else use them, unless you agree to that further use in writing\./);
  assert.match(html, /The permission lasts 24 months from the day the website actually goes live\./);
  assert.match(html, /I do not keep a right to carry on showing them\./);
  assert.match(html, /Your own website stays yours\./);
  assert.match(html, /Taking them down does not create a charge\./);
  assert.doesNotMatch(html, /I do not name a place or a period|paid ads|perpetual|archive|revok/i);
  assert.match(html, /A testimonial is voluntary\./);
  assert.match(html, /I do not show your customers' private details\./);
  assert.match(html, /This is not a blanket permission\./);
  assert.match(html, /I do not ask for any other case-study material\./);
  assert.match(html, /No penalty is set, and the setup fee is not put back on\./);
  assert.ok(html.indexOf('id="condition"') < html.indexOf('id="apply"'));
  assert.doesNotMatch(html, /you must give a testimonial|penalty for refusing|blanket permission to publicise the business is given|the setup fee is reinstated|case study might ask|not settled/i);
  assert.match(html, /It is not a website sold on its own, outside Foundation\./);
  assert.match(html, /class="launch-limit"><strong>Foundation only\.<\/strong> The waived setup fee does not cover Growth, Autopilot, an upgrade, or an extra we agree separately\./);
  assert.equal(html.split(priceSentence()).length - 1, 3);
  assert.match(html, /No VAT is added/);
  assert.match(html, /I am not VAT registered/);
  assert.match(html, /Domain purchase and renewal are paid separately by you/);
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
  for (const line of [terms.separateHosting, terms.siteOffline, terms.domainInYourName, terms.handover]) {
    assert.ok(currentTerms.includes(line), line);
    assert.ok(html.includes(line), line);
  }
  assert.ok(currentTerms.includes(terms.noMinimumOnCurrentTerms));
  assert.doesNotMatch(html, /does not choose|Which Foundation description applies|happy customers are asked/);
  for (const file of ["index.html", "services.html", "roofers.html", "terms.html", "how-it-works.html", "pages.js", "lib/business.ts"]) {
    assert.equal(read(file).includes("website-launch-terms"), false, file);
    assert.doesNotMatch(read(file), /£99/);
  }
  const sitemap = read("sitemap.xml");
  assert.equal((sitemap.match(/website-launch-terms/g) || []).length, 1);
  assert.match(sitemap, /<loc>https:\/\/clockworkai\.app\/website-launch-terms<\/loc>/);
  assert.doesNotMatch(sitemap, /demos\/|tarnhale/);
  const privacy = read("privacy.html");
  assert.match(privacy, /id="foundation-offer"/);
  assert.match(privacy, /href="\/website-launch-terms"/);
  assert.match(privacy, /direct message on the Facebook or Instagram post for that offer/);
  assert.match(privacy, /business name, the trade, the town or city/);
  assert.match(privacy, /I don't add you to a marketing list, and I don't automatically message the businesses that aren't selected/);
  assert.match(privacy, /I don't send that message through the booking service/);
  assert.match(privacy, /for 24 months from the day the website goes live/);
  assert.match(privacy, /I don't keep a right to carry on showing them/);
  assert.match(privacy, /I don't use them in paid advertising/);
  assert.match(privacy, /unless you agree to that further use in writing/);
  assert.match(privacy, /I delete those details within 12 months/);
  assert.match(privacy, /for as long as the law requires for tax/);
  assert.match(privacy, /screenshots we have each agreed/);
  assert.match(privacy, /A testimonial is your choice/);
  assert.match(privacy, /I don't include your customers' private details/);
  assert.match(privacy, /I don't ask for any other case-study material/);
  assert.doesNotMatch(privacy, /£|Mailchimp|Stripe|Notion|Google Drive|Blob|consent|postal address/);
  assert.match(privacy, /Last updated 8 November 2026/);
  assert.match(privacy, /If an enquiry doesn't turn into work, I delete your details within 12 months/);
});

test("keeps the promotion rules that are already decided", () => {
  assert.match(html, /direct message on the Facebook or Instagram post/);
  assert.match(html, /I do not ask you to like, tag, share or follow anything/);
  assert.match(html, /I take on one paying client\./);
  assert.match(html, /where the business is a genuine fit/);
  assert.match(html, /We discuss the work in private\./);
  assert.match(html, /That written acceptance is the agreement to the paid work\./);
  assert.match(html, /It is not a competition, and it is not a random draw/);
  assert.doesNotMatch(html, /\bpromotion\b|\bcompetition winner\b|\bdraw a winner\b/i);
  assert.match(html, /3 working days after the close/);
  assert.match(html, /5 working days from the day I contact them to accept in writing/);
  assert.match(html, /Within 14 calendar days of accepting in writing, you send/);
  for (const line of terms.materials) assert.ok(html.includes(line), line);
  assert.match(html, /you do not have to create them in those 14 days/);
  assert.match(html, /I do not charge a fee for the wait/);
  assert.match(html, /If the website does not go live, the first payment is not due/);
  assert.match(html, /I do not ask for a testimonial, for extra photos, or for any other case-study material/);
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
  assert.match(html, /It is not a separate optional yes\./);
  assert.match(html, /these terms take precedence over the general website terms where they differ/);
  assert.match(html, /hosting and routine care are included in the £99/);
  assert.match(html, /there are 12 monthly payments/);
  assert.match(html, /I will not bring them forward or ask for them as one lump sum/);
  assert.match(html, /you have 14 days from that email to pay what is overdue/);
  assert.match(html, /I put it back when the overdue payments are cleared/);
  assert.match(html, /until 30 days' notice in writing/);
  assert.match(html, /you buy and hold the domain yourself and pay the domain company/);
  assert.doesNotMatch(html, /publishing this draft does not override them|the current website terms stand/);
  assert.doesNotMatch(html, /illustration|not approved|13 November|16 November/i);
  assert.match(html, /These terms cover this offer only\./);
  assert.doesNotMatch(html, /\bdraft\b|proposed|still open|not in force|not settled|not agreed|publicity consent|legal clearance|Confirmed\./i);
  assert.match(html, /not payable upfront|not payable as one sum|will not ask for them as one sum/);
  assert.match(html, /will not ask for the rest as one lump sum/);
  assert.match(html, /A direct message is an enquiry\. It is not a contract/);
  assert.match(html, /I do not automatically message the businesses that are not selected/);
  assert.match(html, /These terms set no geographical limit/);
  assert.match(html, /not already a client of mine/);
  assert.match(html, /callum@getclockworkai\.com/);
  assert.match(html, /07460 038202/);
  assert.match(html, /Callum Broadfoot/);
  assert.match(html, /I am not publishing a VAT number, a street address or a company number/);
  assert.match(html, /href="\/privacy#foundation-offer"/);
  assert.match(html, /I delete those details within 12 months/);
  assert.match(html, /I do not send the message through the booking service/);
  assert.match(html, /I do not contact them about Growth, Autopilot, or another offer/);
  assert.match(html, /not sponsored, endorsed or administered by, or associated with, Meta, Facebook or Instagram/);
  assert.match(html, /law of England and Wales/);
  assert.match(html, /no independent judge/i);
  assert.doesNotMatch(html, /id="open-/);
  assert.match(read("privacy.html"), /callum@getclockworkai\.com/);
  assert.match(read("terms.html"), /07460 038202/);
  assert.doesNotMatch(read("terms.html"), /£99|website-launch-terms|14 days from that email/);
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
  assert.doesNotMatch(html, /correspondence address|address to follow|\[address\]|CAP Code|legally cleared|legal clearance/i);
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
