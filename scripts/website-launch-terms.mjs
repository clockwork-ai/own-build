// Single source for the Foundation launch terms draft.
// Change a figure here, run `node scripts/website-launch-terms.mjs`, and the
// page at website-launch-terms.html follows. The build writes the same file.
//
// The page is the Foundation case-study offer. It does not replace the
// homepage, the services page, the roofers page, or the current website terms.

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const websiteLaunchTerms = {
  path: "/website-launch-terms",
  file: "website-launch-terms.html",
  canonical: "https://clockworkai.app/website-launch-terms",
  title: "Foundation case-study offer | Clockwork AI",
  description: "Terms for one paying trade business. A Foundation case-study offer. The website setup fee is waived.",
  draftDateISO: "2026-11-08",
  pageHour: "16:00",
  promoterName: "Callum Broadfoot",
  tradingAs: "Clockwork AI",
  place: "Manchester",
  email: "callum@getclockworkai.com",
  phoneDisplay: "07460 038202",
  phoneTel: "+447460038202",
  monthlyPounds: 99,
  paymentCount: 12,
  revisionRounds: 2,
  selectedCount: 1,
  openDateISO: "2026-11-08",
  closeDateISO: "2026-11-18",
  closeTime: "20:00",
  selectByDateISO: "2026-11-23",
  selectionWorkingDates: ["2026-11-19", "2026-11-20", "2026-11-23"],
  timeZone: "Europe/London",
  windowCalendarDays: 10,
  selectWithinWorkingDays: 3,
  acceptWithinWorkingDays: 5,
  materialsCalendarDays: 14,
  catchUpDays: 14,
  noticeDays: 30,
  // 24 months is approved. The start is not. Go-live is used because that is
  // when the finished website exists. Do not treat the start as Callum's choice.
  publicityMonths: 24,
  publicityPlaces: "the Clockwork AI website, my Facebook and my Instagram",
  materials: [
    "The business name, as it should appear on the website",
    "The trade, and the services to go on the pages",
    "The area you cover",
    "The phone number and the email address for the website",
    "A logo, if you already have one",
    "Photos you already have and want used on the website, if you have any",
    "Access to a domain you already hold, if you have one",
    "Access to your Google profile, if you have one",
  ],
  foundationIncludes: [
    "A mobile site, up to five pages",
    "One tap to call, text or email you",
    "Your reviews up front",
    "Your Google profile set up properly",
    "A chat box on your site",
    "The Review Accelerator, for every customer",
  ],
  roofersEveryCustomer: "every customer gets a thank-you, a Google review link, and a check-in later.",
  servicesGrowth: "Missed calls texted back and Database Reactivation, on top of Foundation.",
  roofersGrowth: "Foundation, plus missed calls texted back and Database Reactivation. Missed and out-of-hours calls get texted back and booked, and old quotes get a follow-up.",
  servicesAutopilot: "The Referral Flywheel, the Lifetime Value System, and a monthly review call, on top of Growth.",
  roofersAutopilot: "Growth, plus the Referral Flywheel, the Lifetime Value System, and a monthly review call with me.",
};

export function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function addCalendarDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPounds(amount) {
  const whole = Math.abs(Math.trunc(amount));
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `£${grouped}`;
}

export function totalPounds(terms = websiteLaunchTerms) {
  return terms.monthlyPounds * terms.paymentCount;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function weekdayName(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function dated(iso) {
  return `${weekdayName(iso)} ${formatDate(iso)}`;
}

export function closeCandidateISO(terms = websiteLaunchTerms) {
  return terms.closeDateISO;
}

export function priceSentence(terms = websiteLaunchTerms) {
  const monthly = formatPounds(terms.monthlyPounds);
  const total = formatPounds(totalPounds(terms));
  const n = terms.paymentCount;
  return `${monthly} per month. ${n} monthly payments of ${monthly}. ${total} total Clockwork fees over ${n} months, not payable upfront. Domain purchase and renewal are paid separately by you. No VAT added.`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function list(items) {
  return `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function quote(text) {
  return `<q>${escapeHtml(text)}</q>`;
}

function renderPage(terms) {
  const monthly = formatPounds(terms.monthlyPounds);
  const price = priceSentence(terms);
  const draftDate = formatDate(terms.draftDateISO);
  const openOn = dated(terms.openDateISO);
  const closeOn = dated(terms.closeDateISO);
  const selectBy = dated(terms.selectByDateISO);
  const selectionDays = terms.selectionWorkingDates.map(dated).join(", ");
  const laterPayments = terms.paymentCount - 1;

  const toc = [
    ["offer", "The offer"],
    ["scope", "Foundation"],
    ["price", "The price"],
    ["payments", "Payments"],
    ["support", "Support"],
    ["condition", "The condition"],
    ["apply", "Who can enquire"],
    ["selection", "One client"],
    ["timing", "Timing"],
    ["agreement", "If we go ahead"],
    ["exit", "When it ends"],
    ["privacy", "Privacy"],
    ["law", "Platforms and the law"],
  ];

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(terms.title)}</title>
<meta name="description" content="${escapeHtml(terms.description)}">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Clockwork AI">
<meta property="og:title" content="${escapeHtml(terms.title)}">
<meta property="og:description" content="${escapeHtml(terms.description)}">
<meta property="og:url" content="${escapeHtml(terms.canonical)}">
<meta property="og:image" content="https://clockworkai.app/assets/og-movement.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0E0F12">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="scrollcraft.css">
<link rel="stylesheet" href="pages.css">
<style>
  body.launch-terms .phero { min-height: 0; padding-bottom: clamp(2rem, 6vh, 4rem); }
  body.launch-terms .terms-flag {
    margin: 0 0 4px;
    padding: 14px 16px;
    border: 1px solid color-mix(in oklab, var(--sc-accent) 65%, transparent);
    border-radius: 16px;
    background: color-mix(in oklab, #17191D 92%, transparent);
    max-width: 68ch;
  }
  body.launch-terms .terms-flag p { margin: 8px 0 0; max-width: 62ch; line-height: 1.55; color: var(--sc-ink); }
  body.launch-terms .terms-flag p:first-child { margin-top: 0; }
  body.launch-terms .terms-flag strong { color: var(--sc-accent); font-weight: 500; }
  body.launch-terms .launch-price {
    margin: 22px 0 0;
    font-family: var(--sc-font-display);
    font-weight: 400;
    font-size: clamp(3.2rem, 10vw, 5rem);
    line-height: 0.9;
    letter-spacing: -0.02em;
    color: var(--sc-ink);
  }
  body.launch-terms .launch-price b { font-weight: 400; color: var(--sc-accent); }
  body.launch-terms .launch-price span {
    display: block;
    margin-top: 8px;
    font-family: var(--sc-font-text);
    font-size: 1.05rem;
    letter-spacing: 0;
    color: var(--sc-ink);
  }
  body.launch-terms .launch-note,
  body.launch-terms .launch-limit {
    margin: 12px 0 0;
    max-width: 38ch;
    line-height: 1.5;
    color: color-mix(in oklab, var(--sc-ink) 90%, transparent);
  }
  body.launch-terms .launch-limit { margin-top: 16px; }
  body.launch-terms .launch-limit strong { color: var(--sc-ink); font-weight: 500; }
  body.launch-terms .btn--apply {
    background: var(--sc-accent);
    color: var(--sc-accent-ink);
    box-shadow: var(--sc-e2), inset 0 1px 0 rgba(255,255,255,.35);
  }
  @media (hover: hover) and (pointer: fine) {
    body.launch-terms .btn--apply:hover { background: #D8C7A3; }
  }
  body.launch-terms .toc { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 18px; padding: 0; margin: 8px 0 0; }
  body.launch-terms .toc a { display: inline-flex; align-items: center; min-height: 44px; }
  body.launch-terms .plain-list { list-style: none; margin: 0 0 16px; padding: 0; max-width: 62ch; }
  body.launch-terms .plain-list li {
    position: relative;
    margin: 0;
    padding: 11px 0 11px 18px;
    border-top: 1px solid var(--sc-hairline);
    line-height: 1.5;
    color: color-mix(in oklab, var(--sc-ink) 90%, transparent);
  }
  body.launch-terms .plain-list li:last-child { border-bottom: 1px solid var(--sc-hairline); }
  body.launch-terms .plain-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1.15em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sc-accent);
  }
  body.launch-terms .subhead {
    margin: 28px 0 12px;
    font-family: var(--sc-font-display);
    font-size: clamp(1.6rem, 3vw, 2.1rem);
    font-weight: 400;
    line-height: 1.1;
    color: var(--sc-ink);
  }
  body.launch-terms .scope-kicker {
    margin: 0 0 8px;
    font: 500 0.74rem/1.6 var(--sc-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--sc-accent);
  }
  body.launch-terms .prose q { quotes: none; font-style: italic; color: var(--sc-ink); }
  body.launch-terms a:focus-visible { outline: 2px solid var(--sc-accent); outline-offset: 3px; border-radius: 4px; }
  body.launch-terms .prose p,
  body.launch-terms .launch-note { overflow-wrap: break-word; }
  @media (max-width: 860px) {
    body.launch-terms { --dock-h: calc(64px + env(safe-area-inset-bottom, 0px)); }
    body.launch-terms .pdial { order: 0; width: min(46vw, 180px); }
    body.launch-terms .dock .btn--apply { flex: 1 1 auto; }
    body.launch-terms .phero h1 { max-width: 11ch; }
  }
  @media (prefers-reduced-motion: reduce) {
    body.launch-terms [data-sc-in] { opacity: 1; transform: none; }
  }
</style>
<noscript><style>[data-sc-in]{opacity:1!important;transform:none!important}</style></noscript>
<!-- Privacy-friendly analytics by Plausible -->
<script async src="https://plausible.io/js/pa-FCHwsquUovwXaNBtHYdiJ.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init()
</script>
</head>
<body class="launch-terms" data-hour="${escapeHtml(terms.pageHour)}">
<a class="skip" href="#main">Skip to content</a>
<span data-sc-progress></span>
<div class="sc-grain" aria-hidden="true"></div>

<header class="bar">
  <a class="bar__logo" href="/" aria-label="Clockwork AI, home"><img src="assets/logo-lockup.svg" alt="Clockwork AI" width="200" height="40"></a>
  <div class="bar__right">
    <nav class="subdial" aria-label="Site">
      <button class="subdial__btn" type="button" aria-expanded="false" aria-controls="dialmenu">
        <svg viewBox="0 0 40 40" aria-hidden="true" id="subdialsvg">
          <circle cx="20" cy="20" r="18.5" fill="#0E0F12" stroke="rgba(232,238,214,.28)"/>
          <g id="subticks" stroke="rgba(232,238,214,.55)" stroke-width="1" stroke-linecap="round"></g>
          <g id="submarks" fill="#CBB892"></g>
          <line id="subhour" x1="20" y1="20" x2="20" y2="11.5" stroke="#E8EED6" stroke-width="1.8" stroke-linecap="round"/>
          <line id="submin" x1="20" y1="20" x2="20" y2="6.5" stroke="#E8EED6" stroke-width="1.1" stroke-linecap="round"/>
          <circle cx="20" cy="20" r="1.8" fill="#CBB892"/>
        </svg>
        <span class="subdial__time" id="subtime">${escapeHtml(terms.pageHour)}</span>
        <span class="subdial__label" aria-hidden="true">Menu</span>
        <span class="sr">Open the menu</span>
      </button>
      <ol class="subdial__menu" id="dialmenu"></ol>
    </nav>
    <a class="bar__tel" href="/work#found">Reviews</a>
    <a class="bar__tel" href="tel:${escapeHtml(terms.phoneTel)}">${escapeHtml(terms.phoneDisplay)}</a>
    <a class="btn btn--apply" href="#offer">The offer</a>
  </div>
</header>

<main id="main">
  <section class="phero" id="top">
    <div class="phero__plate" aria-hidden="true"><img src="assets/02-kitchen.webp" alt="" style="object-position:75% 40%"></div>
    <div class="sc-wrap phero__inner">
      <div data-sc-in data-sc-stagger="70">
        <div class="terms-flag" role="note">
          <p><strong>These terms cover this offer only.</strong></p>
          <p>A direct message does not accept them, and it does not create a contract. I take on one paying client, where the business is a genuine fit. We discuss the work in private. The terms apply once we have both agreed in writing, and the work is paid as set out here. They do not replace the <a href="/terms">website terms</a> for any other work.</p>
        </div>
        <span class="sc-label">Foundation case-study offer</span>
        <h1 class="sc-display">Foundation <em>only.</em></h1>
        <p class="lede">One paying trade business. This is a Foundation case-study offer. The website setup fee is waived for the Foundation package, and for nothing above it. Dated ${escapeHtml(draftDate)}.</p>
        <p class="launch-price"><b>${monthly}</b> <span>per month</span></p>
        <p class="launch-note">${escapeHtml(price)}</p>
        <p class="launch-limit"><strong>Foundation only.</strong> The waived setup fee does not cover Growth, Autopilot, an upgrade, or an extra we agree separately.</p>
        <div class="cta-row"><a class="linkline" href="#offer">Read the terms</a></div>
      </div>
      <div class="pdial" aria-hidden="true">
        <svg viewBox="0 0 200 200" data-dial="hero" data-hour="${escapeHtml(terms.pageHour)}">
          <circle cx="100" cy="100" r="97" fill="rgba(9,10,13,.55)" stroke="rgba(232,238,214,.22)" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="66" fill="none" stroke="rgba(232,238,214,.08)" stroke-width="0.4"/>
        </svg>
        <div class="pdial__read"><b>${escapeHtml(terms.pageHour)}</b><span>Foundation</span></div>
        <div class="pdial__glass"></div>
      </div>
    </div>
  </section>

  <section id="offer" data-title="The offer" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Foundation, and nothing above it.</h2>
        <p>This is a Foundation case-study offer. I am taking on one paying client. It is the Foundation package. It is not a website sold on its own, outside Foundation. It is not a competition.</p>
      </div>
      <div data-sc-in>
        <dl class="facts">
          <div><dt>Package</dt><dd>Foundation case-study offer. One paying client. Foundation only. Not Growth. Not Autopilot. Not an upgrade.</dd></div>
          <div><dt>Setup fee</dt><dd>Waived for that one paying client, on the condition below. The waiver does not cover Growth, Autopilot, an upgrade, or any extra agreed separately.</dd></div>
          <div><dt>Condition</dt><dd>You permit me to show your business name, the finished website, and screenshots we have each agreed, only on ${escapeHtml(terms.publicityPlaces)}, for ${terms.publicityMonths} months from go-live. Read that before you enquire.</dd></div>
          <div><dt>Monthly price</dt><dd>${escapeHtml(price)} I am not VAT registered, so nothing is added for VAT. I am not publishing a VAT number.</dd></div>
          <div><dt>Who</dt><dd>One trade business that is not already a client, and that is a genuine fit. The owner, or someone the owner has authorised. No site, or a site that is missing or weak.</dd></div>
          <div><dt>How to enquire</dt><dd>A direct message on the Facebook or Instagram post. That is the only way to enquire. The message is not the agreement.</dd></div>
          <div><dt>Domain</dt><dd>You buy and renew it yourself, and you pay your domain company. The £1,188 is the Clockwork fees only.</dd></div>
        </dl>
        <div class="prose" style="margin-top:18px">
          <p>This offer is run by ${escapeHtml(terms.promoterName)}, trading as ${escapeHtml(terms.tradingAs)}, a sole trader in ${escapeHtml(terms.place)}. I am not VAT registered, and I am not publishing a VAT number, a street address or a company number. Questions: email <a href="mailto:${escapeHtml(terms.email)}">${escapeHtml(terms.email)}</a> or ring <a href="tel:${escapeHtml(terms.phoneTel)}">${escapeHtml(terms.phoneDisplay)}</a>. A call or an email is not an enquiry.</p>
          <p>The launch post names Foundation and this monthly price.</p>
        </div>
        <nav aria-label="On this page">
          <ol class="toc">
            ${toc.map(([id, label]) => `<li><a href="#${id}">${escapeHtml(label)}</a></li>`).join("")}
          </ol>
        </nav>
      </div>
    </div>
  </section>

  <section id="scope" data-title="Foundation" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">What Foundation includes.</h2>
        <p>The same list on the homepage, the services page and the roofers page.</p>
      </div>
      <div class="prose" data-sc-in>
        ${list(terms.foundationIncludes)}
        <p>That is Foundation. The <a href="/#what">homepage</a>, the <a href="/services">services page</a> and the <a href="/roofers">roofers page</a> use this list. The site is the pages, the way to get in touch, the reviews on the page, and the Google profile. The chat box and the Review Accelerator sit with that site. Every customer gets a thank-you, a Google review link, and a check-in later. There is no incentive for a star.</p>
        <h3 class="subhead">Outside the waiver.</h3>
        <p>The waived setup fee and the monthly price cover Foundation only. They do not cover Growth, Autopilot, an upgrade, or an extra we agree separately. Each of those is optional. It needs its own quote and your written acceptance. It is not a condition of this offer.</p>
        <p>Growth adds missed calls texted back and Database Reactivation. The services page says ${quote(terms.servicesGrowth)} The roofers page says ${quote(terms.roofersGrowth)}</p>
        <p>Autopilot adds the Referral Flywheel, the Lifetime Value System, and a monthly review call. The services page says ${quote(terms.servicesAutopilot)} The roofers page says ${quote(terms.roofersAutopilot)}</p>
      </div>
    </div>
  </section>

  <section id="price" data-title="The price" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">The Foundation price.</h2>
        <p>For this offer only. The other pages still do not publish a plan price.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>${escapeHtml(price)}</p>
        <p>I am not VAT registered. No VAT is added. I am not publishing a VAT number, and I am not publishing the usual setup fee. The setup fee is waived for the one paying client. Waiving it does not remove the monthly price.</p>
        <p>Routine care is included in the ${monthly} a month. That is keeping the site working, and small corrections. Hosting is included in the ${monthly} a month as well. Two rounds of changes to the website are included.</p>
        <p>You buy and renew the domain yourself, in a registrar account in your name that you control, and you pay that company directly. You can keep a domain you already have. You do not have to buy a new one. I help you point the domain to Vercel so the website shows, and I leave any email records you already have in place.</p>
        <p>Setting up your Google profile is included. That is not an email inbox. Website hosting is not a business email subscription. No email package and no email price are included. If you want help with email, I quote that separately, and it happens only if you accept the quote. It is not a condition of this offer.</p>
        <p>This figure is not a Growth price and not an Autopilot price. The <a href="/services">services page</a>, the <a href="/roofers">roofers page</a> and the <a href="/">homepage</a> still say the plans are priced on a call. This page does not change them. The chat on this site does not quote this price.</p>
      </div>
    </div>
  </section>

  <section id="payments" data-title="Payments" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">How the ${terms.paymentCount} payments work.</h2>
        <p>Hosting, routine care and two rounds of changes are included. The domain fee is not part of the £1,188.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>There are ${terms.paymentCount} payments of ${monthly}. The total of the Clockwork fees is ${formatPounds(totalPounds(terms))}. I will not ask for them as one sum at the start. The first payment is due on the day the website actually goes live, once you have approved that go-live. It is not due earlier, on a day when you only agree a future go-live date. Each of the other ${laterPayments} payments is due monthly from that actual go-live date. Domain purchase and renewal are paid separately by you.</p>
        <p>If a later month does not have that day, that payment is due on the last day of that month.</p>
        <p>If you stop during the ${terms.paymentCount} payments, the ones still to come stay due one month at a time. I will not bring them forward, and I will not ask for the rest as one lump sum. After the 12th payment, it carries on month to month until one of us gives ${terms.noticeDays} days' notice in writing. When that notice ends it, hosting and routine care stop, and you can move the website elsewhere.</p>
        <p>If a payment is missed, I email you at the address you used to accept. You then have ${terms.catchUpDays} days from that email to pay what is overdue. If it is still unpaid at the end of those ${terms.catchUpDays} days, I take the website offline until you have paid the overdue payments. When those overdue payments are cleared, I put the website back online. The monthly payments that are not yet due stay due on their own dates. I will not bring them forward, and I will not ask for them as one lump sum.</p>
        <p>For this offer, hosting and routine care are included in the ${monthly} a month during the paid term. Stopping, notice and moving the website away work as set out above, not as a service you can cancel any month.</p>
      </div>
    </div>
  </section>

  <section id="support" data-title="Support" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">How to reach me about the work.</h2>
        <p>Email only, in working hours. These times are aims, not guarantees.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>Write to <a href="mailto:${escapeHtml(terms.email)}">${escapeHtml(terms.email)}</a>. That is the support address until I have a dedicated mailbox. I am the person who covers support.</p>
        <p>I aim to read support email Monday to Friday, excluding bank holidays in England and Wales. I do not offer evening or weekend cover. A working day means a day other than a Saturday, a Sunday, or a bank holiday in England and Wales.</p>
        <p>If your message is urgent and I receive it before 16:00 on a working day, I aim to acknowledge it the same working day. For other support messages I aim to acknowledge them within two working days. I also aim to fix a routine fault within five working days of that acknowledgement, where the fix is in my hands. I do not promise those times in every case.</p>
      </div>
    </div>
  </section>

  <section id="condition" data-title="The condition" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">The condition of the waiver.</h2>
        <p>Read this before you enquire or accept.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>The waived setup fee has this condition. If you are the client I take on, and you accept, you permit me to show your business name, the finished website, and screenshots of that website which we have each agreed. I do not show a screenshot until you have agreed that exact screenshot.</p>
        <p>That permission comes with the setup-fee waiver. It is not a separate optional yes. It covers those three things only. I show them only on ${escapeHtml(terms.publicityPlaces)}. I do not use them in paid advertising. I do not let anyone else use them, unless you agree to that further use in writing.</p>
        <p>The permission lasts ${terms.publicityMonths} months from the day the website actually goes live. At the end of those ${terms.publicityMonths} months I take them off ${escapeHtml(terms.publicityPlaces)}. I do not keep a right to carry on showing them. Your own website stays yours. Ending the case study does not, by itself, take your website offline. Taking them down does not create a charge.</p>
        <p>A testimonial is voluntary. I do not show your customers' private details. This is not a blanket permission. I do not ask for any other case-study material. No penalty is set, and the setup fee is not put back on.</p>
      </div>
    </div>
  </section>

  <section id="apply" data-title="Who can apply" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Who can enquire, and how.</h2>
        <p>One business. Direct message only. No payment with the message, and no like, tag, share or follow.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>You can enquire if you are the owner of a trade business, or the owner has authorised you to enquire and to agree the work. New means the business is not already a client of mine. The business has no website, or the website it has is missing or weak. I have not published a score for weak. That judgement is part of choosing a genuine fit, and I write the reason down.</p>
        <p>One enquiry per business. A second message does not make a second enquiry. These terms set no geographical limit.</p>
        <p>The only way to enquire is a direct message on the Facebook or Instagram post this offer is attached to. A phone call, an email, a booking, or a message on this website is not an enquiry. I do not ask you to like, tag, share or follow anything. Do not send payment with the message. The monthly price is paid only if we agree the work in writing.</p>
        <p>In the direct message, send the business name, the trade, the town or city, the current website address or the fact there is not one, and what you need. That is the lot.</p>
      </div>
    </div>
  </section>

  <section id="selection" data-title="Selection" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">How I choose one client.</h2>
        <p>A genuine fit. A private discussion. Paid work, agreed in writing.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>I take on one paying client. I choose the trade business that is a genuine fit. I look at need, fit and readiness, and I keep a written record of why. It is not a competition, and it is not a random draw. There is no independent judge. I do not publish who has been selected before they accept.</p>
        <p>I contact the selected business privately by ${escapeHtml(selectBy)}. That is ${terms.selectWithinWorkingDays} working days after the close: ${escapeHtml(selectionDays)}. We discuss the work in private. They have ${terms.acceptWithinWorkingDays} working days from the day I contact them to accept in writing, by email to <a href="mailto:${escapeHtml(terms.email)}">${escapeHtml(terms.email)}</a>. That written acceptance is the agreement to the paid work. If they do not accept in that time, I may choose another eligible business in the same way.</p>
        <p>I do not announce the selected business on ${escapeHtml(selectBy)}, or on any fixed day. If you accept, the condition of the setup-fee waiver is the one above. A testimonial is voluntary. I do not ask for any other case-study material.</p>
        <p>A working day in these terms means a day other than a Saturday, a Sunday, or a bank holiday in England and Wales.</p>
        <p>Messaging me does not mean you will be selected. If only one business messages, I still do not have to select it. If nobody fits, I select nobody. You pay the monthly price. I do not automatically message the businesses that are not selected, and I do not add anyone to a marketing list. I do not contact them about Growth, Autopilot, or another offer.</p>
      </div>
    </div>
  </section>

  <section id="timing" data-title="Timing" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">When the window runs.</h2>
        <p>${terms.windowCalendarDays} calendar days. It opens when the launch post is published, and it closes at ${escapeHtml(terms.closeTime)} on ${escapeHtml(closeOn)}.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>The launch post is planned for ${escapeHtml(openOn)}. The enquiry window opens when that post is published. It does not open before the post. This page is not the post, and it does not start the window. I am not treating the window as already open.</p>
        <p>The window closes on ${escapeHtml(closeOn)} at ${escapeHtml(terms.closeTime)} ${escapeHtml(terms.timeZone)}. On that date, ${escapeHtml(terms.timeZone)} is GMT. From ${escapeHtml(openOn)} to that close is ${terms.windowCalendarDays} calendar days. The close does not move.</p>
      </div>
    </div>
  </section>

  <section id="agreement" data-title="If we go ahead" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">When a contract exists.</h2>
        <p>Not when you send the message. Only when we both agree in writing.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>A direct message is an enquiry. It is not a contract. Being selected is not a contract. Nothing on this page is an offer you accept by sending a message. A contract exists only when we have both agreed in writing. Until then I do not have to go ahead, and you do not have to go ahead.</p>
        <h3 class="subhead">What you send me.</h3>
        <p>Within ${terms.materialsCalendarDays} calendar days of accepting in writing, you send:</p>
        ${list(terms.materials)}
        <p>If you do not have a logo, photos, a domain, or a Google profile, you do not have to create them in those ${terms.materialsCalendarDays} days. If you need a domain, you buy it yourself before the website goes live, and you pay your domain company.</p>
        <p>I do not ask for a testimonial, for extra photos, or for any other case-study material.</p>
        <p>If something on that list arrives after the ${terms.materialsCalendarDays} days, I do not charge a fee for the wait. I start the website once I have the business name, the trade and the services, the area, and the phone number and email. The first payment stays due on the day the website actually goes live, once you have approved that go-live. It is not due on the day the materials were due. If the website does not go live, the first payment is not due.</p>
        <p>The domain stays in your registrar account, and you pay the domain company. I help point the website, and I leave existing email records in place. I do not take the domain into an account of mine. During the paid term I host the website. When notice ends, hosting and routine care stop, and you move the website away. The default handover is a copy of the website files you are entitled to, which are the pages and assets I built for you. I move the live project into an account in your name only if we agreed that in writing before we signed. This is not a blanket handover of all the code I use.</p>
        <p>The <a href="/terms#term">website terms</a> set a 12-month minimum from the day the website actually goes live, once you have approved that go-live, then month to month until one of us gives 30 days' notice in writing. If you stop during the 12 months, the payments still to come stay due one month at a time. I will not bring them forward, and I will not ask for the rest as one lump sum. I host the website during the paid term. The <a href="/terms#exit">exit section</a> sets out the standard exit pack. The default is a copy of the website files you are entitled to. I move the live project into an account in your name only if we agreed that in writing before we signed. There is no Clockwork fee for the agreed handover during the notice period. You pay any third-party costs. For this offer, the website is taken offline only as set out under payments, and I put it back when the overdue payments are cleared.</p>
        <p>For this offer only, once we have both agreed in writing, these terms take precedence over the general website terms where they differ. They do not change the general offers on the rest of this site. For this offer the differences are: hosting and routine care are included in the £99; there are 12 monthly payments; if you stop during those 12, the ones left stay due monthly, and I will not bring them forward or ask for them as one lump sum; if a payment is missed I email you, you have ${terms.catchUpDays} days from that email to pay what is overdue, I take the website offline only if it is still unpaid, and I put it back when the overdue payments are cleared; after the 12th payment it carries on month to month until 30 days' notice in writing; and you buy and hold the domain yourself and pay the domain company.</p>
        <p>For this offer those differences also include the support aims set out under support, and the exit pack set out under when it ends. The default handover is a file copy, not a move of the live project, unless we agreed that move in writing before we signed.</p>
      </div>
    </div>
  </section>

  <section id="exit" data-title="When it ends" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">When the work ends.</h2>
        <p>The standard exit pack. No Clockwork handover fee.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>I host the website during the paid term. When notice ends, hosting and routine care stop, and you move the website away.</p>
        <p>The standard exit pack is this. The domain stays in your registrar account. You keep your Google profile, your social accounts, your phone, and your content and photos. You receive a copy of the website files you are entitled to, which are the pages and assets I built for you. You also receive a written list of accounts, renewals and DNS notes needed to keep mail and the site working. I keep shared platform code, tools and intellectual property. This is not a blanket handover of all the code I use.</p>
        <p>The default is that file copy. I move the live project into an account in your name only if we agreed that in writing before we signed.</p>
        <p>There is no Clockwork fee for the agreed handover during the notice period. You pay any third-party costs, such as a new host or a domain or email charge.</p>
        <p>Accounts used for your business stay in your name. I work as a delegate on those accounts, and I keep labels for them in my vault. I do not treat those logins as mine.</p>
      </div>
    </div>
  </section>

  <section id="privacy" data-title="Privacy" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">What I do with the message.</h2>
        <p>The enquiry, and the written record of the decision.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>I ask for the business name, the trade, the town or city, the current website or the fact there is not one, and what you need. I use that to read the enquiry, decide whether the business is a genuine fit, keep the written record of the decision, and reply about this offer. I do not ask for anything else in the message. I do not add you to a marketing list. I do not automatically message the businesses that are not selected, and I do not contact them about another offer.</p>
        <p>You send the message on Facebook or Instagram, and I read it there. I do not send the message through the booking service on this website. If I email you about the decision, that email is handled in the same way as any other email.</p>
        <p>A message that does not turn into work is an enquiry. I delete those details within 12 months. If you become a client, I keep your details while we work together. I keep invoices and tax records for six years. After handover is confirmed, I remove my delegated access and I delete or anonymise operational notes that are not needed for tax or a live dispute. I keep or take down case-study material only in line with the written permission. That is the same keeping rule as on the <a href="/privacy#keep">privacy page</a>. You can ask me for a copy, a correction or a deletion, as that page says. I aim to acknowledge that request within two working days, and I aim to answer it within a month.</p>
        <p>A direct message is not permission to show your business. If you are the client I take on, and you accept in writing, you permit me to show your business name, the finished website, and screenshots we have each agreed. I do not show a screenshot until you have agreed that exact screenshot. I show them only on ${escapeHtml(terms.publicityPlaces)}, for ${terms.publicityMonths} months from the day the website actually goes live, and then I take them off. I do not use them in paid advertising, and I do not let anyone else use them unless you agree to that further use in writing. A testimonial is voluntary. I do not show your customers' private details. I do not ask for any other case-study material.</p>
      </div>
    </div>
  </section>

  <section id="law" data-title="Platforms and the law" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Platforms, and the law.</h2>
        <p>I run this. Meta does not.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>This offer is run by me, ${escapeHtml(terms.promoterName)}, trading as ${escapeHtml(terms.tradingAs)}. It is not sponsored, endorsed or administered by, or associated with, Meta, Facebook or Instagram. They are not responsible for it.</p>
        <p>As far as their terms and the law allow, Meta, Facebook and Instagram are released from claims arising out of this offer.</p>
        <p>These terms are governed by the law of England and Wales. The courts of England and Wales hear a dispute about them. If you are a consumer, you keep any mandatory rights your local law gives you. Nothing here removes a right that the law does not let me remove.</p>
        <p>These terms are dated ${escapeHtml(draftDate)}. If I change them, I will change that date. A direct message does not accept them.</p>
      </div>
    </div>
    <footer class="foot">
      <img src="assets/logo-lockup.svg" alt="Clockwork AI" width="100" height="20">
      <span>Proof over promises · Manchester and the North West · © 2026 Clockwork AI</span>
      <nav aria-label="Footer">
        <a href="/how-it-works">How it works</a>
        <a href="/services">Services</a>
        <a href="/roofers">Roofers</a>
        <a href="/work">My work</a>
        <a href="/work#found">Reviews</a>
        <a href="/about">About</a>
        <a href="/missed-calls">Missed calls</a>
        <a href="/book">Book a call</a>
        <a href="mailto:${escapeHtml(terms.email)}">Email</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="${escapeHtml(terms.path)}" aria-current="page">Foundation terms</a>
      </nav>
    </footer>
  </section>
</main>

<nav class="dock" aria-label="Contact">
  <a class="btn btn--ghost dock__icon" href="tel:${escapeHtml(terms.phoneTel)}" aria-label="Call ${escapeHtml(terms.phoneDisplay)}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg><span class="dock__t">Call</span></a>
  <a class="btn btn--ghost dock__icon" href="mailto:${escapeHtml(terms.email)}" aria-label="Email Callum">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/></svg><span class="dock__t">Email</span></a>
  <a class="btn btn--apply" href="#offer">The offer</a>
</nav>

<script src="scrollcraft.js"></script>
<script src="pages.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

export function websiteLaunchTermsHtml(terms = websiteLaunchTerms) {
  return renderPage(terms).split("\n").map((line) => {
    if (line.includes("£") && !/client-safe:\s*ignore/i.test(line)) {
      return `${line} <!-- client-safe: ignore -->`;
    }
    return line;
  }).join("\n");
}

export function writeWebsiteLaunchTerms(dir, terms = websiteLaunchTerms) {
  const file = path.join(dir, terms.file);
  writeFileSync(file, websiteLaunchTermsHtml(terms));
  return file;
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const written = writeWebsiteLaunchTerms(root);
  console.log(written);
}
