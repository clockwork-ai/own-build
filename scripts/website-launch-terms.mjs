// Single source for the Foundation launch terms draft.
// Change a figure here, run `node scripts/website-launch-terms.mjs`, and the
// page at website-launch-terms.html follows. The build writes the same file.
//
// The page is a draft preview. It does not replace the homepage, the services
// page, the roofers page, or the current website terms.

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
  description: "Draft terms for one selected trade business. A Foundation case-study offer. The website setup fee is waived. Not in force.",
  robots: "noindex, nofollow",
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
  noticeDays: 30,
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
  separateHosting: "Hosting and care is a separate monthly service you can cancel any month.",
  noMinimumOnCurrentTerms: "These website terms don't set a minimum term, and they don't publish a price.",
  siteOffline: "If you stop the monthly payments before the 12th, the site comes offline.",
  domainInYourName: "The domain name is in your name either way.",
  handover: "If you pay monthly, that happens after your 12th monthly payment.",
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

export function openItems(terms = websiteLaunchTerms) {
  return [
    {
      id: "missed-payment",
      title: "A missed payment",
      text: "What happens if a payment is missed is not agreed. This page does not set a consequence for that.",
    },
    {
      id: "advertising-rules",
      title: "Advertising rules and a postal address",
      text: "The UK advertising rules for this kind of selection (the CAP Code) have not been reviewed. I do not claim legal clearance. There is no independent judge. I choose, and I write down why. No postal address is published. Whether one has to be published is part of that review. I am not inventing an address.",
    },
    {
      id: "case-study",
      title: "Case-study participation",
      text: "This is a Foundation case-study offer. What you must do for the case study, and what permission is asked for photos, words or the finished site, is not settled. A public mention still needs a separate yes, and what that yes covers is not listed. This page does not give blanket permission to publicise the business. A testimonial is not compulsory. No penalty is set.",
    },
    {
      id: "privacy",
      title: "Privacy, publicity, and the social links",
      text: "The privacy page does not yet describe these direct messages, the written selection record, or a separate publicity consent. What a publicity yes would cover is not listed. The Facebook and Instagram addresses are not in the site files, so this page does not link to an account.",
    },
    {
      id: "materials",
      title: "The materials, and a late delivery",
      text: "The list of materials is not fixed, and what happens if they arrive late is not agreed.",
    },
    {
      id: "same-words",
      title: "The post and this page use the same words",
      text: "Any post that points here has to say Foundation, and it has to use this price. A layout that only says the website setup fee is waived, and does not say Foundation, does not match this draft.",
    },
  ];
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
  const items = openItems(terms);

  const toc = [
    ["offer", "The offer"],
    ["scope", "Foundation"],
    ["price", "The price"],
    ["payments", "Payments"],
    ["apply", "Who can apply"],
    ["selection", "Selection"],
    ["timing", "Timing"],
    ["agreement", "If we go ahead"],
    ["privacy", "Privacy"],
    ["law", "Platforms and the law"],
    ["open", "Still open"],
  ];

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(terms.title)}</title>
<meta name="description" content="${escapeHtml(terms.description)}">
<meta name="robots" content="${escapeHtml(terms.robots)}">
<link rel="canonical" href="${escapeHtml(terms.canonical)}">
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
  body.launch-terms .draft-flag {
    margin: 0 0 4px;
    padding: 14px 16px;
    border: 1px solid color-mix(in oklab, var(--sc-accent) 65%, transparent);
    border-radius: 16px;
    background: color-mix(in oklab, #17191D 92%, transparent);
    max-width: 68ch;
  }
  body.launch-terms .draft-flag p { margin: 8px 0 0; max-width: 62ch; line-height: 1.55; color: var(--sc-ink); }
  body.launch-terms .draft-flag p:first-child { margin-top: 0; }
  body.launch-terms .draft-flag strong { color: var(--sc-accent); font-weight: 500; }
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
  body.launch-terms .open-list { margin: 0; padding-left: 1.25rem; max-width: 68ch; }
  body.launch-terms .open-list li { margin: 0 0 20px; padding-left: 0.35rem; }
  body.launch-terms .open-list li::marker { color: var(--sc-accent); font-family: var(--sc-font-mono); }
  body.launch-terms .open-list h3 {
    margin: 0 0 6px;
    font-family: var(--sc-font-display);
    font-size: clamp(1.35rem, 2vw, 1.7rem);
    font-weight: 400;
    line-height: 1.15;
    color: var(--sc-ink);
  }
  body.launch-terms .open-list p {
    margin: 0;
    max-width: 62ch;
    line-height: 1.65;
    color: color-mix(in oklab, var(--sc-ink) 90%, transparent);
  }
  body.launch-terms a:focus-visible { outline: 2px solid var(--sc-accent); outline-offset: 3px; border-radius: 4px; }
  body.launch-terms .prose p,
  body.launch-terms .launch-note,
  body.launch-terms .open-list p { overflow-wrap: break-word; }
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
        <div class="draft-flag" role="note">
          <p><strong>Draft preview. Not in force.</strong></p>
          <p>A direct message does not accept this, and it does not create a contract. The window dates are set. Other points on this page are still open. This page does not replace the <a href="/terms">current website terms</a>.</p>
        </div>
        <span class="sc-label">Foundation case-study offer</span>
        <h1 class="sc-display">Foundation <em>only.</em></h1>
        <p class="lede">One selected trade business. This is a Foundation case-study offer. The website setup fee is waived for the Foundation package, and for nothing above it. Draft prepared ${escapeHtml(draftDate)}.</p>
        <p class="launch-price"><b>${monthly}</b> <span>per month</span></p>
        <p class="launch-note">${escapeHtml(price)}</p>
        <p class="launch-limit"><strong>Foundation only.</strong> The waived setup fee does not cover Growth, Autopilot, an upgrade, or an extra we agree separately.</p>
        <div class="cta-row"><a class="linkline" href="#offer">Read the draft</a></div>
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
        <p>This is a Foundation case-study offer. It is the Foundation package. It is not a website sold on its own, outside Foundation.</p>
      </div>
      <div data-sc-in>
        <dl class="facts">
          <div><dt>Package</dt><dd>Foundation case-study offer. Foundation only. Not Growth. Not Autopilot. Not an upgrade.</dd></div>
          <div><dt>Setup fee</dt><dd>Waived for the one selected trade business. The waiver does not cover Growth, Autopilot, an upgrade, or any extra agreed separately.</dd></div>
          <div><dt>Monthly price</dt><dd>${escapeHtml(price)} I am not VAT registered, so nothing is added for VAT. I am not publishing a VAT number.</dd></div>
          <div><dt>Who</dt><dd>One trade business that is not already a client. The owner, or someone the owner has authorised. No site, or a site that is missing or weak.</dd></div>
          <div><dt>How to apply</dt><dd>A direct message on the Facebook or Instagram post. That is the only way to apply.</dd></div>
          <div><dt>Domain</dt><dd>You buy and renew it yourself, and you pay your domain company. The £1,188 is the Clockwork fees only.</dd></div>
        </dl>
        <div class="prose" style="margin-top:18px">
          <p>This draft is run by ${escapeHtml(terms.promoterName)}, trading as ${escapeHtml(terms.tradingAs)}, a sole trader in ${escapeHtml(terms.place)}. I am not publishing a street address or a company number. Questions about the draft: email <a href="mailto:${escapeHtml(terms.email)}">${escapeHtml(terms.email)}</a> or ring <a href="tel:${escapeHtml(terms.phoneTel)}">${escapeHtml(terms.phoneDisplay)}</a>. A call or an email is not an application.</p>
          <p>Any post that points here has to say Foundation, and it has to use this price. A layout that only says the website setup fee is waived, and does not say Foundation, does not match this draft.</p>
          <p>Several points are still open. They are listed at the end. Do not treat this page as live terms while they are open.</p>
        </div>
        <nav aria-label="On this draft">
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
        <h2 class="sc-display h2-md">The proposed Foundation price.</h2>
        <p>For this promotion only. The other pages still do not publish a plan price.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>${escapeHtml(price)}</p>
        <p>I am not VAT registered. No VAT is added. I am not publishing a VAT number, and I am not publishing the usual setup fee. The setup fee is waived for the one selected business. Waiving it does not remove the monthly price.</p>
        <p><strong>Confirmed.</strong> Routine care is included in the ${monthly} a month. That is keeping the site working, and small corrections. Hosting is included in the ${monthly} a month as well. Two rounds of changes to the website are included.</p>
        <p><strong>Confirmed.</strong> You buy and renew the domain yourself, in a registrar account in your name that you control, and you pay that company directly. You can keep a domain you already have. You do not have to buy a new one. I help you point the domain to Vercel so the website shows, and I leave any email records you already have in place.</p>
        <p>Setting up your Google profile is included. That is not an email inbox. Website hosting is not a business email subscription. No email package and no email price are included. If you want help with email, I quote that separately, and it happens only if you accept the quote. It is not a condition of this offer.</p>
        <p>This figure is not a Growth price and not an Autopilot price. The <a href="/services">services page</a>, the <a href="/roofers">roofers page</a> and the <a href="/">homepage</a> still say the plans are priced on a call. This page does not change them. The chat on this site does not quote this price.</p>
      </div>
    </div>
  </section>

  <section id="payments" data-title="Payments" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">How the ${terms.paymentCount} payments work.</h2>
        <p>The payment dates, hosting, routine care, two rounds of changes, stopping, and the domain arrangement are confirmed. The domain fee is not part of the £1,188.</p>
      </div>
      <div class="prose" data-sc-in>
        <p><strong>Confirmed.</strong> There are ${terms.paymentCount} payments of ${monthly}. The total of the Clockwork fees is ${formatPounds(totalPounds(terms))}. I will not ask for them as one sum at the start. The first payment is due on the day the website actually goes live, once you have approved that go-live. It is not due earlier, on a day when you only agree a future go-live date. Each of the other ${laterPayments} payments is due monthly from that actual go-live date. Domain purchase and renewal are paid separately by you.</p>
        <p>If go-live falls on a day that a later month does not have, which calendar date is used then is an implementation detail. That date is not fixed here.</p>
        <p><strong>Confirmed.</strong> If you stop during the ${terms.paymentCount} payments, the ones still to come stay due one month at a time. I will not ask for the rest as one lump sum. After the 12th payment, it carries on month to month until one of us gives ${terms.noticeDays} days' notice in writing. When that notice ends it, hosting and routine care stop, and you can move the website elsewhere.</p>
        <p>What happens if a payment is missed is not agreed. This page does not set a consequence for that.</p>
        <p>The <a href="/terms">current website terms</a> still say ${quote(terms.separateHosting)} That general page is not rewritten here. For this promotion, hosting and routine care are included in the ${monthly}, and stopping works as set out above.</p>
      </div>
    </div>
  </section>

  <section id="apply" data-title="Who can apply" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Who can apply, and how.</h2>
        <p>One application. Direct message only. No payment, and no like, tag, share or follow.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>You can apply if you are the owner of a trade business, or the owner has authorised you to apply and to agree the work. New means the business is not already a client of mine. The business has no website, or the website it has is missing or weak. I have not published a score for weak. That judgement is part of the selection, and I write the reason down.</p>
        <p>One application per business. A second message does not make a second application. This draft sets no geographical limit.</p>
        <p>The only way to apply is a direct message on the Facebook or Instagram post this promotion is attached to. A phone call, an email, a booking, or a message on this website is not an application. I do not ask you to like, tag, share or follow anything. Do not send payment.</p>
        <p>In the direct message, send the business name, the trade, the town or city, the current website address or the fact there is not one, and what you need. That is the lot.</p>
      </div>
    </div>
  </section>

  <section id="selection" data-title="Selection" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">How I select one business.</h2>
        <p>Need, fit and readiness. A written record. Not a random draw.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>I select one trade business. I look at need, fit and readiness, and I keep a written record of why. It is not a competition, and it is not a random draw. There is no independent judge. I do not publish the name.</p>
        <p>I contact the selected business privately by ${escapeHtml(selectBy)}. That is ${terms.selectWithinWorkingDays} working days after the close: ${escapeHtml(selectionDays)}. They have ${terms.acceptWithinWorkingDays} working days from the day I contact them to accept in writing, by email to <a href="mailto:${escapeHtml(terms.email)}">${escapeHtml(terms.email)}</a>. If they do not accept in that time, I may select another eligible business in the same way.</p>
        <p>I do not announce the selected business on ${escapeHtml(selectBy)}, or on any fixed day. A public mention happens only after they have accepted, and only with a separate yes to publicity. What that yes covers, and what taking part in the case study requires, is not settled. This page does not make a testimonial compulsory, and it does not set a penalty.</p>
        <p>A working day in this draft means a day other than a Saturday, a Sunday, or a bank holiday in England and Wales.</p>
        <p>Messaging me does not mean you will be selected. If only one business messages, I still do not have to select it. If nobody fits, I select nobody. I do not automatically message the businesses that are not selected, and I do not add anyone to a marketing list.</p>
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
        <p>If you accept in writing, you send the materials I ask for within ${terms.materialsCalendarDays} calendar days of that acceptance. The list of materials is not fixed on this page. What happens if they arrive late is not agreed.</p>
        <p>The current website terms say ${quote(terms.domainInYourName)} For this promotion you hold the registrar account and you pay the domain company. I help point the website, and I leave existing email records in place. I do not take the domain into an account of mine. They also say ${quote(terms.handover)} You then receive a full copy of the files and code, or I move the site into an account in your name. I do not say you own the website before that handover. ${escapeHtml(terms.siteOffline)} This draft does not change that handover.</p>
        <p>Where this draft and the current website terms differ, publishing this draft does not override them. The written agreement we both sign is the one that would choose. Until that agreement exists, the current website terms stand.</p>
      </div>
    </div>
  </section>

  <section id="privacy" data-title="Privacy" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">What I do with the message.</h2>
        <p>The business details in the direct message, and nothing extra for a publicity yes.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>I ask for the business name, the trade, the town or city, the current website or the fact there is not one, and what you need. I use that to read the enquiry, decide whether to select the business, keep the written record of the decision, and reply about this promotion. I do not add you to a marketing list.</p>
        <p>A direct message is not permission to publicise your business, your name, your photos or your site. Publicity needs a separate yes, in writing, later. You can say no. Saying no does not change the selection. What that yes would cover is not listed yet.</p>
        <p>How I handle personal details on the rest of this site is on the <a href="/privacy">privacy page</a>. That page does not yet describe this promotion, these direct messages, or a separate publicity consent. Your rights on that page still apply, including asking me for a copy, a correction or a deletion.</p>
      </div>
    </div>
  </section>

  <section id="law" data-title="Platforms and the law" class="block ground-2 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Platforms, and the law.</h2>
        <p>I run this. Meta does not. The advertising-rules check is still open.</p>
      </div>
      <div class="prose" data-sc-in>
        <p>This promotion is run by me, ${escapeHtml(terms.promoterName)}, trading as ${escapeHtml(terms.tradingAs)}. It is not sponsored, endorsed or administered by, or associated with, Meta, Facebook or Instagram. They are not responsible for it.</p>
        <p>As far as their terms and the law allow, Meta, Facebook and Instagram are released from claims arising out of this promotion. That release still has to be checked against their current terms before this page is published for real.</p>
        <p>The UK advertising rules for this kind of selection have not been reviewed. This draft is not legal clearance. There is no independent judge.</p>
        <p>These draft terms are meant to be governed by the law of England and Wales. The courts of England and Wales would hear a dispute about them. If you are a consumer, you keep any mandatory rights your local law gives you. Nothing here removes a right that the law does not let me remove.</p>
        <p>This is a draft prepared on ${escapeHtml(draftDate)}. It is not in force. If I change the draft, I will change that date. The version on this address is the draft under review, not a set of terms you can accept by message.</p>
      </div>
    </div>
  </section>

  <section id="open" data-title="Still open" class="block ground-1 trim">
    <div class="sc-wrap split">
      <div class="block__head sticky" data-sc-in>
        <h2 class="sc-display h2-md">Still open, before this can apply.</h2>
        <p>This page is not live terms while these points are unsettled.</p>
      </div>
      <div data-sc-in>
        <ol class="open-list">
          ${items.map((item) => `<li id="open-${escapeHtml(item.id)}"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></li>`).join("")}
        </ol>
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
