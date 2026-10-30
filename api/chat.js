// server/chat.ts
import { isStepCount, streamText, tool } from "ai";
import { z } from "zod";

// lib/business.ts
var business = {
  name: "Clockwork AI",
  model: "openai/gpt-4.1-mini",
  voice: 'Friendly, plain British English, the way Callum writes on the site. Short. Contractions are fine. No jargon, no American spelling, no emoji, no exclamation marks. Never use an em dash or an en dash. Use a full stop, a comma or a colon instead. Write a range with the word to, as in 3 to 5. Two or three sentences, then stop. You are not Callum himself. Say "Callum" when you mean him.',
  rules: [
    "Answer only from the knowledge below. If it is not there, say you don't have that and point the person to the free audit or a call with Callum.",
    "Never quote a price, setup fee or monthly fee for a website, Foundation, Growth, Autopilot, or any other tier. Never guess a number, in digits or in words. Say Callum goes through pricing on a quick call or in the free audit.",
    "Never invent statistics, testimonials, client names, review scores, case studies or guarantees. If a number is in the knowledge, you may use it only with the source written there, and you must not present it as the visitor's result.",
    "Never say only happy customers are asked for a review. Every customer gets the review link. A problem is flagged to the tradesman as well as the link, never instead of it. Google does not allow review gating.",
    "Callum comes out in person for an on-site content day. He films and photographs the work for the website and the socials, across Manchester, Bolton, Stockport, Cheshire and the North West. That visit is part of the package. Do not offer personal training, workshops, or a half-day as something to book in chat. The services page mentions a practical half day on the admin in the business, separate from the tiers and priced on the call. Do not describe it, sell it or book it. If they ask about that half day, say Callum can cover it on the free call, then come back to websites and the system.",
    "Stay on Clockwork AI: websites, the six-part trades system, the tiers, the free audit, how it works, missed calls, the calculator, and who Callum is. A question about working with businesses that are not trades is on topic. If the question is unrelated, politely decline in one sentence and offer to help with the site.",
    "Do not pretend to be an emergency roofer or plumber. If someone has a leak or anyone is in danger, say you don't send someone out, tell them to keep clear of water near electrics, and to ring a local tradesperson or the emergency services. Then, if they run a trade, offer the audit.",
    "Sample conversations and sample prices on the homepage are illustrations, not fees and not real client messages. Do not repeat those figures.",
    "Do not claim a lead was emailed. You may say it has been passed to Callum only when the saveLead tool says ok.",
    "Never use an em dash or an en dash. Use a full stop, a comma or a colon. Write a range with the word to, as in 3 to 5.",
    "Never write a URL, a domain or a page path. Do not write a web address or a file name. Do not say you cannot give an address or that you cannot paste a link. Name the destination in words: the free audit, book a call, the missed-call calculator, or WhatsApp. If a calculator number is filled in, include the exact words with 2 a day filled in, with 4 a day filled in, or with 6 a day filled in. You may write the phone number 07460 038202.",
    "Never call yourself an AI, a bot, a chatbot, an agent or an assistant, and never name the software behind the system. If asked who or what you are, say: I answer questions on the Clockwork AI site for Callum. For a person, ring Callum on 07460 038202. Never claim to be human. The brand name Clockwork AI is allowed. Describe outcomes: missed calls answered, a chat box on the site, more reviews, less admin, the system. Do not say the visitor owns the website. If they ask when they get the website, say it is handed over from day one if they pay upfront, or after the 12th monthly payment: a full copy of the files and code, or the site moved into an account in their name."
  ],
  knowledge: `
Who. Clockwork AI is Callum Broadfoot, a sole trader in Manchester. There is no company number and no street address published on the site. Phone 07460 038202. Email callum@clockworkai.app. WhatsApp uses the same number. He is 42. He has been on the tools since he was 16, plumbing and heating mostly, and he was a Gas Safe engineer, domestic and commercial. He ran a trades business with several vans, a team of lads and someone in the office: wages, materials, digs when they worked in London, quotes, invoices and people who didn't pay. That admin happened at night, after a day's work. He builds systems that take those jobs off tradespeople. No account managers and no sales team. You deal with him from start to finish.

In person. Callum comes out to trades across Manchester, Bolton, Stockport, Cheshire and the North West. On a content day he films and photographs the work. That footage goes on the website and the socials. The full package is the website, the on-site content day, then missed calls answered and a text back. This visit is not training or a workshop.

Where. Greater Manchester, Manchester, Stockport, Bolton, Cheshire and the North West. Roofers first, because that is the work he can show. The same system is for plumbers, sparks, builders and other businesses that take enquiries, book work, send invoices or chase payment, including offices, clinics, salons, agencies and shops. He will say straight if he cannot help.

Other businesses. If they ask whether you work with businesses other than trades, answer in these words: Clockwork AI is built for trades first (roofers, plumbers, electricians and so on), but Callum is happy to talk to other small local businesses about a website or the system, so leave your details or book the free audit. Do not claim a past non-trade client. Do not invent an example.

What he sells. The full package is the website, an on-site content day, then a six-part system. Fixed setup plus a simple monthly plan, priced on a free call and put in writing before he starts. The website is handed over from day one if they pay upfront, or after the 12th monthly payment: a full copy of the files and code, or the site moved into an account in their name. Do not say they own it. If the monthly payments stop before the 12th, the site comes offline. The domain name stays in the client's name either way. Hosting and care is a separate monthly service you can cancel any month. Missed calls answered, the chat box and review requests run on a monthly plan. If that plan stops, what happens to each system is in the written agreement. The site does not publish tier prices and does not state a minimum term. The client keeps their phone number. They approve the wording before anything goes live, and prices, discounts or anything unusual come to them first. Every message and booking is logged. It works in the apps they already use where possible: phone, WhatsApp, email, calendar and job software. They try it on their own phone before it goes live. It is upfront that it is not the tradesperson. Systems run with backups, including when Callum is ill or away.

Missed-calls calculator. Mention it as the missed-call calculator. Do not write the page address. The visitor types how many calls they miss on a working day, how many minutes each one would take them, and how many days a week they work. The page turns those into hours for a week, a month and a year. The defaults on the page are examples they can change. The result is their arithmetic, not a Clockwork statistic and not a promise. Do not work out a pound figure yourself, and do not say what share of callers ring back. When someone asks about missed calls, how many calls they miss, or what missed calls cost, mention the missed-call calculator. If they have just picked one of the nudge answers, say which number is filled in, in these words, so they can change it:
- "1 to 2" or about 1 or 2 calls a day: with 2 a day filled in
- "3 to 5" or about 3 to 5 calls a day: with 4 a day filled in
- "6+" or 6 or more calls a day: with 6 a day filled in
- "Not sure": they can type their own number. Do not invent a number.
Then offer the free audit or leaving their details.

The free Business Bottleneck Audit. This is the free 30-minute call. No cost and no obligation. Callum looks at missed calls, the website, and reviews, then gives one recommendation: Foundation, Growth, Autopilot, or don't buy anything. Some people take the recommendation and do it themselves, and that is fine. Nothing is priced on the call until he recommends a tier, and even then the price is agreed on the call and written down before work starts. There is a two-minute self-check on the audit page (missed calls, slow quotes, quiet quotes, evening admin, storm or leak calls, reviews, repeated questions, past customers). The ticks stay in the browser. Nothing on that self-check is sent to Callum. Book at the audit page or the booking link.

How a job starts. 1. The free audit. 2. A tier, if it is worth it. 3. He builds it. The website is handed over from day one if they pay upfront, or after the 12th monthly payment: a full copy of the files and code, or the site moved into an account in their name. The system runs on the monthly plan. The client checks it before it goes live.

Three tiers, with no prices on the site.
- Foundation: the website, a chat box on the site, and the Review Accelerator. People can find you, call or message from the page, and every customer gets a thank-you, a Google review link, and a check-in later. The website is handed over from day one if they pay upfront, or after the 12th monthly payment: a full copy of the files and code, or the site moved into an account in their name. The chat box and review requests run on the monthly plan.
- Growth: Foundation, plus missed calls answered and Database Reactivation. Missed and out-of-hours calls get answered, qualified and booked. Old quotes and past customers get a polite follow-up that stops when they reply.
- Autopilot: Growth, plus the Referral Flywheel, the Lifetime Value System, and a monthly review call with Callum.

The six parts.
1. Missed calls answered (Growth and Autopilot). Answers missed and out-of-hours calls in the business name, is upfront that it is not the tradesperson, takes the job, postcode and a photo, checks the diary and books the visit. A storm or leak while someone is on a roof, or at 2am, is marked urgent. The site's sample line for a missed call is: "Sorry we missed you, we're up on a roof. What's the job and your postcode?" The sample leak advice on the site is: don't go on the roof, a bucket under the drip if it's safe, keep clear of electrics near the water. You keep your number. Prices and anything unusual come to the owner first.
2. A chat box on the site (every tier). Website and WhatsApp enquiries. Answers "do you cover...?" in the firm's words. Photos and postcodes land in one list per customer. The owner approves the wording once.
3. Database Reactivation (Growth and Autopilot). Polite follow-ups on quotes that have gone quiet, and a note to past customers, stopped the moment they reply.
4. Review Accelerator (every tier). This is the reviews and aftercare system. It is still part 4, not a seventh part. Once a job is marked done, texts or WhatsApps go out in the tradesman's name. The owner approves the wording first. Same day: a thank-you and a direct Google review link. Every customer gets that link. About 3 days later: one gentle nudge if there is no review yet. About 2 weeks: "Everything still OK with the job?" Any problem reply goes straight to the tradesman. The problem is flagged as well as the review link, never instead of it. Do not say only happy customers are asked. At 2 months and 6 months: "How's things going?" That keeps the firm in mind for referrals and word of mouth. At 12 months: a check-up or service reminder, which can bring repeat work. No discount for a star. Sample same-day line: "Thanks for having us. A Google review would mean a lot. Here's the link." Callum's own words, if they ask why it exists: "When I ran my vans, the job got finished and I was straight onto the next one. The review never got asked for, and the customer never heard from me again. I'd done a great job and nobody knew. Now my system does the bit I never had time for. It thanks the customer, asks for the review, and checks in a few weeks and a few months later to see how things are going. So when their neighbour needs a roofer, or your name comes up at the pub, they remember the one who did a great job and kept in touch." If they ask about reviews, follow-ups, repeat work or referrals, explain this sequence. Do not invent a result, a review score, or a price.
5. Referral Flywheel (Autopilot). Once the job is done, a simple ask to send someone else the firm's way. Not a discount scheme. The owner approves the wording. The 2-month and 6-month check-ins in part 4 keep the firm in mind. This part is the separate ask. Do not say it only goes to happy customers.
6. Lifetime Value System (Autopilot). Servicing reminders, maintenance plans and seasonal check-ins. Gutters before winter. A look at last year's roof before the next storm season. Confirmations and a reminder the night before. Deposits and pay-now links can sit alongside it. The 12-month check-up text is part of the Review Accelerator, not a separate system.

Other hold-ups he can set up, inside that system: quotes drafted from survey notes and photos for the owner to check and send the same day; booking and rescheduling; deposits, stage payments and pay-now links; invoices, deposit requests and receipts; one list for WhatsApp photos and postcodes; details captured once and passed between tools.

How it behaves. A set reply is "when this happens, do that" and cannot cope with the unexpected. What he builds is given a goal, reads what comes in, uses the firm's phone, WhatsApp, email, calendar and job software, and only comes to the owner when it needs them. Three levels of control: Manual wind (it drafts, you send), Hands-off (it runs, you approve the big things), Perpetual (it runs and reports back).

How he works. Measure twice, build once. Never leave a job half done. If it needs you at 10pm, it's broken. Real numbers, or no numbers. Tell people straight, including when something is not worth setting up.

Founding clients. The first five clients get 30% off, in return for a case study, a testimonial and permission to show the work. The figure itself is still agreed on the call. Nothing is priced on the page. Do not say how many of the five are left. That is not published.

Work he will talk about.
- D & P Roofing, Westhoughton, his first case study. He built their new site free, as a demo. It is ready to go live on their own address. The work page compares their current site with the new one, checked 20 and 21 October 2026. Changes he records: tap to call, WhatsApp, Which? score of 5.0 from 142 reviews shown up front, their line "The price we quote is the price you pay", over 20 photos of their own jobs, phone load time from 1.2 seconds to 0.6 seconds (phone-sized screen, fresh cache, faster of two runs), their Westhoughton address and areas set out for Google, and quote requests going to WhatsApp with name, phone, job and postcode. Against five unnamed local roofers, read 21 October 2026: the new site is the only one of the six with that price promise; 142 Which? reviews is the highest count; they also cover building and groundworks; the new site shows 10 years on re-roofs (that is D & P's line, not a Clockwork guarantee); 0.6 seconds was faster than four of the five. He does not name the other firms. There are no result numbers yet. The site says "No results to show yet." Do not invent a quote from Dale or anyone else. Next they have asked for out-of-hours replies. The demo site is linked from the work page.

Facts he may cite, with the source, and never as a promise.
- A third of micro businesses failed to answer incoming calls, and 69% of callers who reached voicemail hung up without leaving a message. Moneypenny, 2016.
- 83% of people who were asked to leave a review went on to leave one. BrightLocal, 2026, a US survey. That is why the review ask exists. It is not a promise of anyone's numbers.

Manchester note, if asked why here. On 21 June 1948 a machine at the University of Manchester, nicknamed the Baby, ran the world's first program stored in a computer's own memory.

Contact. Book a free 30-minute call on the booking link. Or ring or WhatsApp 07460 038202. Evenings are fine. The person on the call is Callum, not a salesperson or a call centre. On the call: how the week runs and where the time goes. They leave with a straight answer on what is worth doing. They need nothing to hand.
`.trim(),
  allowedPrices: [],
  priceStandIn: "something Callum prices on a quick call or in the free audit",
  links: {
    audit: "/clockwork-check",
    auditLabel: "Free Business Bottleneck Audit",
    book: "https://cal.com/clockwork-ai/30min",
    bookLabel: "Book a free 30-minute call",
    phone: "07460 038202",
    phoneHref: "tel:+447460038202",
    whatsapp: "https://wa.me/447460038202?text=Hi%20Callum%2C%20I%20found%20Clockwork%20AI%20online.%20I%27d%20like%20to%20talk%20about%3A%20",
    email: "callum@clockworkai.app"
  },
  lead: {
    notifyName: "Callum Broadfoot",
    notifyEmail: "callum@getclockworkai.com",
    storagePrefix: "leads",
    webhookEnv: "LEAD_NOTIFY_URL"
  },
  limits: {
    windowMs: 10 * 60 * 1e3,
    maxRequests: 24,
    maxUserChars: 600,
    maxMessages: 12,
    maxAssistantChars: 1200
  },
  pages: [
    "/",
    "/about",
    "/book",
    "/clockwork-check",
    "/how-it-works",
    "/missed-calls",
    "/privacy",
    "/roofers",
    "/services",
    "/terms",
    "/work"
  ],
  nudge: {
    text: "Can you afford to miss calls while you're up a ladder or on a job? How many calls do you reckon you miss a day?",
    delayMs: 22e3,
    scroll: 0.45,
    replies: [
      { label: "1 to 2", message: "I reckon I miss 1 to 2 calls a day.", calls: 2 },
      { label: "3 to 5", message: "I reckon I miss 3 to 5 calls a day.", calls: 4 },
      { label: "6+", message: "I reckon I miss 6 or more calls a day.", calls: 6 },
      { label: "Not sure", message: "I'm not sure how many calls I miss a day.", calls: null }
    ]
  },
  calculatorHref: "/missed-calls#calculator",
  widget: {
    title: "Ask Clockwork",
    launcherLabel: "Open the chat",
    greeting: "Hello, this is Clockwork AI. I can answer questions about the site, the six-part system, and the free audit. What do you need?",
    placeholder: "Ask about a website, the audit, or the tiers",
    suggestions: [
      "What's the free audit?",
      "Can you do my roofing site?",
      "How do you help me get more reviews?"
    ],
    formTitle: "Leave your details",
    formSubmit: "Send to Callum"
  }
};

// lib/guard.ts
var buckets = /* @__PURE__ */ new Map();
function clientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : request.headers.get("x-real-ip");
  return ip || "unknown";
}
function takeRateLimit(key, now, windowMs, maxRequests) {
  const current = buckets.get(key);
  if (!current || now >= current.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (current.count >= maxRequests) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((current.reset - now) / 1e3)) };
  }
  current.count += 1;
  return { ok: true };
}
function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
function knownPage(page, pages) {
  if (typeof page !== "string") return void 0;
  const path = page.split("?")[0]?.split("#")[0] ?? "";
  return pages.includes(path) ? path : void 0;
}
function normaliseMessages(input, limits) {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, status: 400, error: "Send a message and I'll answer." };
  }
  if (input.length > limits.maxMessages) {
    return {
      ok: false,
      status: 400,
      error: "That's as far as this chat goes. Book the free audit and Callum will take it from there."
    };
  }
  const messages = [];
  for (const item of input) {
    if (!item || typeof item !== "object") {
      return { ok: false, status: 400, error: "I couldn't read that. Try again." };
    }
    const role = item.role;
    const content = item.content;
    if (role !== "user" && role !== "assistant" || typeof content !== "string") {
      return { ok: false, status: 400, error: "I couldn't read that. Try again." };
    }
    const text = content.replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (role === "user" && text.length > limits.maxUserChars) {
      return {
        ok: false,
        status: 400,
        error: "That message is a bit long. Try a shorter question."
      };
    }
    messages.push({
      role,
      content: role === "assistant" ? text.slice(0, limits.maxAssistantChars) : text
    });
  }
  if (!messages.some((message) => message.role === "user")) {
    return { ok: false, status: 400, error: "Send a message and I'll answer." };
  }
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return { ok: false, status: 400, error: "Send a message and I'll answer." };
  }
  return { ok: true, messages };
}
var WORD_PRICE = /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:[\s-](?:and|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred))*\s+pounds?\b/gi;
var MONTH = "(?:months?|mo(?!nth))";
var MONEY = new RegExp(
  `\xA3\\s?\\d[\\d,]*(?:\\.\\d+)?(?:\\s*billion|\\s*million|\\s*(?:\\/|a |per )${MONTH})?|[$\u20AC]\\s?\\d[\\d,]*(?:\\.\\d+)?(?:\\s*(?:\\/|a |per )${MONTH})?|\\bgbp\\s?\\d[\\d,]*(?:\\.\\d+)?|\\b\\d[\\d,]*(?:\\.\\d+)?\\s*(?:pounds?|quid)\\b|\\b\\d[\\d,]*(?:\\.\\d+)?\\s*(?:\\/|a |per )${MONTH}\\b`,
  "gi"
);
function scrubDashes(text) {
  return text.replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2").replace(/\s*[\u2013\u2014]\s*/g, ", ").replace(/,\s*,/g, ",").replace(/[ \t]{2,}/g, " ");
}
var DEFAULT_LINKS = {
  audit: "/clockwork-check",
  book: "https://cal.com/clockwork-ai/30min",
  whatsapp: "https://wa.me/447460038202",
  phone: "07460 038202",
  calculator: "/missed-calls#calculator"
};
function wordsFor(raw, links) {
  const trimmed = raw.replace(/[.,;:!?]+$/g, "");
  const trailing = raw.slice(trimmed.length);
  let href = trimmed;
  if (/^www\./i.test(href)) href = `https://${href.slice(4)}`;
  else if (!/^https?:\/\//i.test(href) && !href.startsWith("/") && !href.endsWith(".html") && href.includes(".")) {
    href = `https://${href}`;
  }
  let url;
  try {
    url = new URL(href, "https://clockworkai.app");
  } catch {
    return `the page${trailing}`;
  }
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.replace(/\.html$/i, "");
  if (path === links.audit.replace(/\.html$/i, "") || path === "/clockwork-check") return `the free audit${trailing}`;
  if (host === "cal.com" || host === "wa.me") {
    return host === "wa.me" ? `WhatsApp${trailing}` : `book a call${trailing}`;
  }
  if (path === "/missed-calls") {
    const calls = url.searchParams.get("calls");
    if (calls && /^\d{1,2}$/.test(calls)) return `the missed-call calculator, with ${calls} a day filled in${trailing}`;
    return `the missed-call calculator${trailing}`;
  }
  const slug = path.split("/").filter(Boolean).pop()?.replace(/-/g, " ");
  if (slug && slug !== "index" && (host === "clockworkai.app" || raw.startsWith("/"))) {
    return `the ${slug} page${trailing}`;
  }
  if (host === "clockworkai.app") return `this site${trailing}`;
  return `the link${trailing}`;
}
function scrubPaths(text, links = DEFAULT_LINKS) {
  const link = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)|(https?:\/\/[^\s<>)\]]+)|(?<!@)\b(?:www\.)?(?:clockworkai\.app|cal\.com|wa\.me)(?:\/[^\s<>)\]]*)?|(^|[\s(])(\/(?:about|book|clockwork-check|how-it-works|missed-calls|privacy|roofers|services|terms|work)(?:\.html)?(?:\?[^\s<>)\]]*)?(?:#[a-z0-9-]+)?|\/?[a-z0-9-]+(?:\/[a-z0-9-]+)*\.html(?:\?[^\s<>)\]]*)?(?:#[a-z0-9-]+)?)/gi;
  return text.replace(link, (match, label, href, http, lead, path) => {
    if (match.startsWith("[") && label != null && href != null) {
      return /https?:|www\.|\.html|\.com|wa\.me|\//i.test(label) ? wordsFor(href, links) : label;
    }
    if (http) return wordsFor(http, links);
    if (path) return `${lead ?? ""}${wordsFor(path, links)}`;
    return wordsFor(match, links);
  }).replace(/[ \t]{2,}/g, " ").replace(/\s+([.,;:!?])/g, "$1");
}
function incompleteMoney(tail) {
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+b(?:i(?:l(?:l(?:i(?:o(?:n)?)?)?)?)?)?$/i.test(tail)) return !/billion$/i.test(tail);
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s*\/\s*m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  return false;
}
function holdCut(held) {
  let out = held.length;
  for (const index of [
    trailingCut(held),
    bannedHold(held),
    selfRefHold(held),
    articleHold(held),
    priceHold(held),
    completeTermHold(held)
  ]) {
    if (index == null || index >= held.length) continue;
    if (index < out) out = index;
  }
  return widenHold(held, out);
}
function widenHold(held, at) {
  if (at >= held.length) return held.length;
  let cur = at;
  for (let pass = 0; pass < 3; pass++) {
    const article = includeArticle(held, cur);
    const open = extendOpen(held, article);
    const brand = extendBrand(held, open);
    const next = Math.min(article, open, brand);
    if (next >= cur) break;
    cur = next;
  }
  return cur;
}
function extendOpen(held, at) {
  if (at <= 0 || at > held.length) return at;
  const open = held.slice(0, at).match(/open\s+$/i);
  if (!open) return at;
  if (/^a(?:i\b|\b)/i.test(held.slice(at))) return at - open[0].length;
  return at;
}
function includeArticle(held, at) {
  if (at <= 0) return at;
  const match = held.slice(0, at).match(/(^|\s)((?:an|the|a|this))\s+$/i);
  if (!match || match.index == null) return at;
  return match.index + (match[1]?.length ?? 0);
}
function extendBrand(held, at) {
  if (at <= 0 || at > held.length) return at;
  const brand = held.slice(0, at).match(/clockwork\s+$/i);
  if (!brand) return at;
  if (/^a(?:i\b|\b)/i.test(held.slice(at))) return at - brand[0].length;
  return at;
}
function trailingCut(held) {
  const symbol = held.match(/(?:£|\$|€)$/);
  if (symbol?.index != null) return symbol.index;
  const money = held.match(/(?:£|\$|€|\bgbp\s?)\d[\d,]*(?:\.\d*)?(?:\s+\S+){0,3}$/i);
  if (money?.index != null && incompleteMoney(money[0])) return money.index;
  const slashPrice = held.match(/\d[\d,]*\/$/);
  if (slashPrice?.index != null) return slashPrice.index;
  const range = held.match(/\d\s*[\u2013\u2014]\s*\d*$/);
  if (range?.index != null) return range.index;
  const url = held.match(/https?:\/\/\S*$/i) ?? held.match(/https?:?\/?$/i);
  if (url?.index != null) return url.index;
  const bare = held.match(/(?<!@)(?:www\.)?(?:clockworkai\.app|cal\.com|wa\.me)(?:\/\S*)?$/i);
  if (bare?.index != null) return bare.index;
  const path = held.match(/\/[a-z0-9][\w./?#=&%-]*$/i);
  if (path?.index != null && !/^\/(?:months?|mo)(?:[.,;:!?]*)?$/i.test(path[0])) return path.index;
  const file = held.match(/(?:^|\s)([a-z0-9-]+\.h(?:t(?:m(?:l)?)?)?)$/i);
  if (file?.index != null) {
    const at = file.index;
    return held[at] === " " || held[at] === "\n" ? at + 1 : at;
  }
  const apology = apologyCut(held);
  if (apology != null) return apology;
  const brand = held.match(/clockwork\s*$/i);
  if (brand?.index != null) return brand.index;
  const partialBrand = held.match(/([A-Za-z]{1,12})$/);
  if (partialBrand && "clockwork".startsWith(partialBrand[1].toLowerCase()) && partialBrand[1].toLowerCase() !== "clockwork") {
    return partialBrand.index ?? held.length;
  }
  const banned = bannedHold(held);
  if (banned != null) return banned;
  const digits = held.match(/\d[\d,]{0,8}$/);
  if (digits?.index != null) return digits.index;
  return held.length;
}
var APOLOGY_TARGETS = [
  "i can't paste links, but you can",
  "i can't give the exact page address, but you can"
];
function apologyCut(held) {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  const lone = lower.match(/(?:^|\s)(i'?)$/);
  if (lone?.index != null) {
    return lone.index + (lower[lone.index] === " " || lower[lone.index] === "\n" ? 1 : 0);
  }
  const at = lower.lastIndexOf("i can");
  if (at < 0) return null;
  const tail = lower.slice(at);
  if (APOLOGY_TARGETS.some((target) => target.startsWith(tail) && tail.length < target.length)) return at;
  return null;
}
function scrubPrices(text, allowed, standIn) {
  const slots = [];
  let safe = text;
  const phrases = [...allowed].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exact = new RegExp(`${escaped}(?![\\d,.])`, "g");
    safe = safe.replace(exact, (match) => {
      const index = slots.push(match) - 1;
      return `\0${index}\0`;
    });
  }
  safe = safe.replace(MONEY, standIn).replace(WORD_PRICE, standIn);
  return safe.replace(/\u0000(\d+)\u0000/g, (_match, index) => slots[Number(index)] ?? "");
}
function scrubAddressApology(text) {
  return text.replace(
    /I can(?:not|['\u2019]t) give(?: you)? the exact (?:page |web )?address,\s*but you can/gi,
    "You can"
  ).replace(/I can(?:not|['\u2019]t) paste (?:a |the )?links?,?\s*but you can/gi, "You can").replace(/I can(?:not|['\u2019]t) paste (?:a |the )?links?\.?\s*/gi, "").replace(/[ \t]{2,}/g, " ");
}
var BANNED_TERMS = [
  "chatbots",
  "chatbot",
  "automation",
  "chatgpt",
  "openai",
  "open ai",
  "twilio",
  "elevenlabs",
  "eleven labs",
  "vercel",
  "zapier",
  "a.i.",
  "ai",
  "n8n"
];
var PHRASE_HOLD = ["assistants", "assistant", "bots", "bot"];
var ROLE = "assistant|bot|agent|chatbot";
var SELF_REFERENCE = new RegExp(
  `\\b(?:i['\\u2019]m|i am)\\s+an\\s+assistant(?:\\s+(?:${ROLE}))?\\b|\\b(?:i['\\u2019]m|i am)\\s+a\\s+bot(?:\\s+(?:${ROLE}))?\\b|\\b(?:i['\\u2019]m|i am)\\s+an\\s+ai(?:\\s+(?:${ROLE}))?\\b|\\bi am\\s+ai(?:\\s+(?:${ROLE}))?\\b|\\bas\\s+an\\s+ai(?:\\s+(?:${ROLE}))?\\b`,
  "gi"
);
var AI_COMPOUND = /\bai\s+(?:agents?|bots?|assistants?|tools?|chatbots?)\b/gi;
function escapeTerm(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function termTail(term) {
  return `${escapeTerm(term)}(?![\\w-])`;
}
function termSource(term) {
  return `\\b${termTail(term)}`;
}
function scrubBanned(text) {
  const slots = [];
  let safe = text.replace(/clockwork ai/gi, (match) => {
    const index = slots.push(match) - 1;
    return `${index}`;
  });
  safe = safe.replace(SELF_REFERENCE, (match) => /^as\s/i.test(match) ? "on this site" : "I answer questions on this site");
  safe = safe.replace(AI_COMPOUND, "the system");
  const ordered = [...BANNED_TERMS].sort((a, b) => b.length - a.length);
  const phraseBody = ordered.map((term) => termTail(term)).join("|");
  const phrase = new RegExp(`\\b(?:an?|the)\\s+(?:${phraseBody})`, "gi");
  const token = new RegExp(ordered.map(termSource).join("|"), "gi");
  safe = safe.replace(phrase, "the system").replace(token, "the system");
  safe = safe.replace(/\b(?:a|an|the|this)\s+(?=the system\b)/gi, "");
  safe = safe.replace(/(?:\bthe system\b\s*){2,}/gi, "the system ");
  return safe.replace(/\u0001(\d+)\u0001/g, (_match, index) => slots[Number(index)] ?? "");
}
var SELF_CORES = [
  "i'm an assistant",
  "i am an assistant",
  "i'm a bot",
  "i am a bot",
  "i'm an ai",
  "i am an ai",
  "i am ai",
  "as an ai"
];
var SELF_TAILS = ["", " assistant", " bot", " agent", " chatbot"];
var SELF_TARGETS = SELF_CORES.flatMap((core) => SELF_TAILS.map((tail) => core + tail));
var HOLD_TERMS = [
  ...BANNED_TERMS,
  ...PHRASE_HOLD,
  "ai agent",
  "ai agents",
  "ai bot",
  "ai bots",
  "ai assistant",
  "ai assistants",
  "ai tool",
  "ai tools",
  "ai chatbot",
  "ai chatbots"
].map((term) => term.toLowerCase());
var PREFIX_TERMS = [...HOLD_TERMS, "the", "an", "this"];
function selfRefHold(held) {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  let best = null;
  for (const target of SELF_TARGETS) {
    const max = Math.min(lower.length, target.length);
    for (let len = 1; len <= max; len++) {
      if (lower.slice(-len) !== target.slice(0, len)) continue;
      const at = lower.length - len;
      if (at > 0 && /[a-z0-9']/i.test(lower[at - 1] ?? "")) continue;
      if (best == null || at < best) best = at;
    }
  }
  return best;
}
function boundaryBefore(text, at) {
  if (at <= 0) return true;
  return !/[a-z0-9]/i.test(text[at - 1] ?? "");
}
function prefixHold(held, terms) {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  let best = null;
  for (const term of terms) {
    const max = Math.min(lower.length, term.length - 1);
    for (let len = 1; len <= max; len++) {
      if (lower.slice(-len) !== term.slice(0, len)) continue;
      const at = lower.length - len;
      if (!boundaryBefore(lower, at)) continue;
      if (best == null || at < best) best = at;
    }
  }
  return best;
}
function bannedHold(held) {
  return prefixHold(held, PREFIX_TERMS);
}
function articleHold(held) {
  const match = held.match(/(^|[\s([{"'])((?:this|an|the|a))\b(\s*)([A-Za-z][A-Za-z0-9.]*)?$/i);
  if (!match || match.index == null) return null;
  const before = held.slice(0, match.index + (match[1]?.length ?? 0));
  if (/open\s+$/i.test(before)) return null;
  const rest = (match[4] ?? "").toLowerCase();
  if (rest) {
    const waiting = HOLD_TERMS.some((term) => term.startsWith(rest) && term !== rest);
    if (!waiting) return null;
  }
  return match.index + (match[1]?.length ?? 0);
}
var NUMBER_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "fifteen",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
  "hundred",
  "thousand",
  "and"
];
function openNumberChain(words, spaced, hyphen) {
  if (words.length === 0) return false;
  const last = words[words.length - 1]?.toLowerCase() ?? "";
  const prev = words.slice(0, -1).map((word) => word.toLowerCase());
  if (!prev.every((word) => NUMBER_WORDS.includes(word))) return false;
  if (hyphen && NUMBER_WORDS.includes(last)) return true;
  if (last === "pounds") return false;
  if (last === "pound") return !spaced;
  const complete = NUMBER_WORDS.includes(last);
  const proper = NUMBER_WORDS.some((word) => word.startsWith(last) && word !== last);
  const pounds = prev.length > 0 && "pounds".startsWith(last) && !complete;
  if (spaced && !complete) return false;
  return complete || !spaced && (proper || pounds);
}
function wordPriceHold(held) {
  const tail = held.match(/([A-Za-z]+(?:[-\s]+[A-Za-z]+)*)([-\s]*)$/);
  if (!tail || tail.index == null || !tail[1]) return null;
  const words = tail[1].split(/[-\s]+/).filter(Boolean);
  const end = tail[2] ?? "";
  const hyphen = end.endsWith("-");
  const spaced = /\s/.test(end) && !hyphen;
  for (let i = 0; i < words.length; i++) {
    if (!openNumberChain(words.slice(i), spaced, hyphen)) continue;
    let from = 0;
    for (let w = 0; w < i; w++) {
      const at2 = tail[1].indexOf(words[w] ?? "", from);
      from = at2 + (words[w]?.length ?? 0);
    }
    const at = tail[1].indexOf(words[i] ?? "", from);
    return tail.index + at;
  }
  return null;
}
function slashHold(held) {
  const match = held.match(/(?:^|[^\d])(\d[\d,]*\s*\/\s*(?:m(?:o(?:n(?:t(?:h)?)?)?)?)?)$/i);
  if (!match || match.index == null || match[1] == null) return null;
  if (/\/\s*month$/i.test(match[1])) return null;
  return match.index + (match[0].length - match[1].length);
}
function currencyIncomplete(tail) {
  if (/^(?:£|\$|€|gbp\s*)$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s*\/\s*$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s*\/\s*m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+$/i.test(tail)) return true;
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+b(?:i(?:l(?:l(?:i(?:o(?:n)?)?)?)?)?)?$/i.test(tail)) return !/billion$/i.test(tail);
  if (/^(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+m(?:i(?:l(?:l(?:i(?:o(?:n)?)?)?)?)?)?$/i.test(tail)) return !/million$/i.test(tail);
  return false;
}
function currencyHold(held) {
  const match = held.match(/(?:£|\$|€|\bgbp\s?)\d[\d,]*(?:\.\d*)?[^£$€]*$/i) ?? held.match(/(?:£|\$|€|\bgbp\s*)$/i);
  if (!match || match.index == null) return null;
  return currencyIncomplete(held.slice(match.index)) ? match.index : null;
}
function priceHold(held) {
  let best = null;
  for (const at of [wordPriceHold(held), slashHold(held), currencyHold(held)]) {
    if (at != null && (best == null || at < best)) best = at;
  }
  return best;
}
function completeTermHold(held) {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  const terms = [
    ...BANNED_TERMS,
    "ai agent",
    "ai agents",
    "ai bot",
    "ai bots",
    "ai assistant",
    "ai assistants",
    "ai tool",
    "ai tools",
    "ai chatbot",
    "ai chatbots"
  ];
  let best = null;
  for (const term of terms) {
    if (!lower.endsWith(term)) continue;
    const at = lower.length - term.length;
    if (!boundaryBefore(lower, at)) continue;
    if (best == null || at < best) best = at;
  }
  return best;
}
function scrubReply(text, allowed, standIn, links) {
  return scrubBanned(scrubAddressApology(scrubPaths(scrubDashes(scrubPrices(text, allowed, standIn)), links)));
}
function createPriceStream(allowed, standIn, links) {
  let held = "";
  const push = (chunk) => {
    held += chunk;
    const cut = holdCut(held);
    const ready = held.slice(0, cut);
    held = held.slice(cut);
    return scrubReply(ready, allowed, standIn, links);
  };
  const flush = () => {
    const rest = scrubReply(held, allowed, standIn, links);
    held = "";
    return rest;
  };
  return { push, flush };
}
function isValidContact(value) {
  const text = value.trim();
  if (text.length < 6 || text.length > 120) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 && /^[+\d][\d\s()-]+$/.test(text);
}
function cleanLine(value, max) {
  return value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

// lib/leads.ts
import { createHash } from "node:crypto";
import { put } from "@vercel/blob";

// lib/mail.ts
import { connect as connectTls } from "node:tls";
var SMTP_HOST = "smtp.gmail.com";
var SMTP_PORT = 465;
function summariseTranscript(input) {
  if (!Array.isArray(input)) return "No transcript was included.";
  const lines = [];
  for (const item of input.slice(-8)) {
    if (!item || typeof item !== "object") continue;
    const role = item.role;
    const content = item.content;
    if (role !== "user" && role !== "assistant" || typeof content !== "string") continue;
    const text = content.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
    if (!text) continue;
    lines.push(`${role === "user" ? "Visitor" : "Assistant"}: ${text}`);
  }
  if (!lines.length) return "No transcript was included.";
  return lines.join("\n");
}
function readSmtpSettings(env = process.env) {
  const user = env.LEAD_SMTP_USER?.trim() ?? "";
  const pass = env.LEAD_SMTP_PASSWORD?.replace(/\s+/g, "") ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user) || pass.length < 8) return null;
  return { host: SMTP_HOST, port: SMTP_PORT, user, pass };
}
function oneLine(value, max) {
  return value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function plainBlock(value, max) {
  return value.replace(/[\u0000-\u0009\u000b-\u001f]+/g, " ").trim().slice(0, max);
}
function encodeSubject(subject) {
  const clean = oneLine(subject, 180);
  if (/^[\x20-\x7e]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}
function replyAddress(contact) {
  const clean = oneLine(contact, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : void 0;
}
function buildLeadEmail(to, from, lead, summary) {
  const name = oneLine(lead.name, 80) || "Unknown";
  const business2 = oneLine(lead.business, 80) || "Not given";
  const contact = oneLine(lead.contact, 120) || "Not given";
  const need = oneLine(lead.need, 400) || "Not given";
  const page = oneLine(lead.page ?? "", 80) || "Not recorded";
  const arrived = lead.source === "chat-form" ? "Details form" : "Chat";
  const recent = plainBlock(summary, 1800) || "No transcript was included.";
  const subject = scrubDashes(`New chat lead: ${name}`);
  const text = scrubDashes(
    [
      "New chat lead",
      "",
      `Name: ${name}`,
      `Business: ${business2}`,
      `Contact: ${contact}`,
      `What they need: ${need}`,
      `Page: ${page}`,
      `How it arrived: ${arrived}`,
      "",
      "Recent messages:",
      recent
    ].join("\n")
  );
  return {
    from: oneLine(from, 120),
    to: oneLine(to, 120),
    subject,
    text,
    replyTo: replyAddress(contact)
  };
}
function leadEmailSource(mail) {
  const headers = [
    `From: Clockwork chat <${mail.from}>`,
    `To: ${mail.to}`,
    `Subject: ${encodeSubject(mail.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit"
  ];
  if (mail.replyTo) headers.push(`Reply-To: ${mail.replyTo}`);
  const body = mail.text.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").split("\r\n").map((line) => line.startsWith(".") ? `.${line}` : line).join("\r\n");
  return `${headers.join("\r\n")}\r
\r
${body}\r
`;
}
var SmtpReader = class {
  buffer = "";
  waiters = [];
  constructor(socket) {
    socket.on("data", (chunk) => {
      this.buffer += chunk.toString("utf8");
      this.drain();
    });
  }
  drain() {
    while (this.waiters.length) {
      const nl = this.buffer.indexOf("\n");
      if (nl < 0) return;
      const line = this.buffer.slice(0, nl).replace(/\r$/, "");
      this.buffer = this.buffer.slice(nl + 1);
      this.waiters.shift()?.(line);
    }
  }
  line() {
    const nl = this.buffer.indexOf("\n");
    if (nl >= 0) {
      const line = this.buffer.slice(0, nl).replace(/\r$/, "");
      this.buffer = this.buffer.slice(nl + 1);
      return Promise.resolve(line);
    }
    return new Promise((resolve) => this.waiters.push(resolve));
  }
  async reply() {
    const lines = [];
    for (; ; ) {
      const line = await this.line();
      lines.push(line);
      if (/^\d{3} /.test(line) || lines.length === 1 && /^\d{3}$/.test(line)) {
        return { code: Number(line.slice(0, 3)), text: lines.join("\n") };
      }
      if (!/^\d{3}-/.test(line)) {
        return { code: Number(line.slice(0, 3)) || 0, text: lines.join("\n") };
      }
    }
  }
};
async function expectCode(reply, code) {
  if (reply.code !== code) throw new Error(`smtp ${reply.code}`);
}
async function submitSmtp(reply, write, settings, mail) {
  await expectCode(await reply(), 220);
  write("EHLO clockworkai.app");
  await expectCode(await reply(), 250);
  const token = Buffer.from(`\0${settings.user}\0${settings.pass}`, "utf8").toString("base64");
  write(`AUTH PLAIN ${token}`);
  await expectCode(await reply(), 235);
  write(`MAIL FROM:<${settings.user}>`);
  await expectCode(await reply(), 250);
  write(`RCPT TO:<${mail.to}>`);
  await expectCode(await reply(), 250);
  write("DATA");
  await expectCode(await reply(), 354);
  write(`${leadEmailSource(mail)}.`);
  await expectCode(await reply(), 250);
  write("QUIT");
}
function withTimeout(work, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("smtp-timeout")), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
async function sendSmtpMail(settings, mail, tlsOptions = {}) {
  const socket = connectTls({
    host: settings.host,
    port: settings.port,
    servername: /[a-z]/i.test(settings.host) ? settings.host : void 0,
    timeout: 8e3,
    rejectUnauthorized: tlsOptions.rejectUnauthorized !== false
  });
  const reader = new SmtpReader(socket);
  const write = (command) => {
    socket.write(`${command}\r
`);
  };
  try {
    await withTimeout(
      new Promise((resolve, reject) => {
        socket.once("secureConnect", () => resolve());
        socket.once("error", reject);
      }),
      8e3
    );
    await withTimeout(submitSmtp(() => reader.reply(), write, settings, mail), 8e3);
  } finally {
    socket.end();
    socket.destroy();
  }
}
async function emailLead(to, lead, summary, deps = {}) {
  const settings = deps.settings === void 0 ? readSmtpSettings() : deps.settings;
  if (!settings) {
    console.info("lead email: SMTP is not configured");
    return false;
  }
  const mail = buildLeadEmail(to, settings.user, lead, summary);
  try {
    await (deps.send ?? sendSmtpMail)(settings, mail);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "error";
    console.error("lead email failed", message.split(settings.pass).join("[redacted]"));
    return false;
  }
}

// lib/leads.ts
function validateLead(input, source, knownPage2) {
  const name = cleanLine(typeof input.name === "string" ? input.name : "", 80);
  const trade = cleanLine(typeof input.business === "string" ? input.business : "", 80);
  const contact = cleanLine(typeof input.contact === "string" ? input.contact : "", 120);
  const need = cleanLine(typeof input.need === "string" ? input.need : "", 400);
  if (name.length < 2) return { ok: false, error: "I need a name." };
  if (trade.length < 2) return { ok: false, error: "I need the business or trade." };
  if (!isValidContact(contact)) return { ok: false, error: "I need a phone number or email." };
  if (need.length < 2) return { ok: false, error: "I need a short note on what they want." };
  return {
    ok: true,
    lead: { name, business: trade, contact, need, page: knownPage2, source }
  };
}
function pathname(prefix, lead) {
  const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const hash = createHash("sha256").update(`${lead.contact.toLowerCase()}
${lead.need.toLowerCase()}`).digest("hex").slice(0, 16);
  return `${prefix}/${day}/${hash}.json`;
}
async function notify(config, lead) {
  const emailed = await emailLead(config.lead.notifyEmail, lead, lead.summary || "No transcript was included.");
  const hooked = await notifyWebhook(config, lead);
  console.info(`lead notice emailed=${emailed} webhook=${hooked}`);
  return emailed || hooked;
}
async function notifyWebhook(config, lead) {
  const url = process.env[config.lead.webhookEnv];
  if (!url) return false;
  let target;
  try {
    target = new URL(url);
  } catch {
    console.error("lead notify: LEAD_NOTIFY_URL is not a URL");
    return false;
  }
  if (target.protocol !== "https:") {
    console.error("lead notify: LEAD_NOTIFY_URL must be https");
    return false;
  }
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: config.lead.notifyName,
        email: config.links.email,
        ...lead,
        receivedAt: (/* @__PURE__ */ new Date()).toISOString()
      }),
      signal: AbortSignal.timeout(4e3)
    });
    if (!response.ok) {
      console.error(`lead notify: webhook responded ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("lead notify: webhook failed", error instanceof Error ? error.name : "error");
    return false;
  }
}
async function saveLead(config, lead) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    console.error("lead storage: Blob is not connected");
    return { ok: false, error: "storage-not-configured" };
  }
  const record = {
    ...lead,
    summary: lead.summary || "No transcript was included.",
    notifyName: config.lead.notifyName,
    savedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    await put(pathname(config.lead.storagePrefix, lead), JSON.stringify(record), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60
    });
  } catch (error) {
    console.error("lead storage: put failed", error instanceof Error ? error.name : "error");
    return { ok: false, error: "storage-failed" };
  }
  const notified = await notify(config, lead);
  console.info(`lead stored source=${lead.source} notified=${notified}`);
  return { ok: true, notified };
}

// lib/prompt.ts
function buildInstructions(config, page) {
  const rules = config.rules.map((rule) => `- ${rule}`).join("\n");
  const where = page ? `The visitor is reading ${pageLabel(page)}.` : "You do not know which page they are on.";
  return [
    `You answer questions on the ${config.name} website.`,
    "The visitor sees every word you write. Answer them directly. Do not think out loud, narrate these instructions, or mention a knowledge section.",
    `Voice: ${config.voice}`,
    where,
    `Rules:
${rules}`,
    `Knowledge, and only this knowledge:
${config.knowledge}`,
    [
      "Lead capture.",
      "When someone shows interest in a website, a tier, the audit, a quote, or working together, your next reply must ask for four things in one short message: their name, their business or trade, a phone number or email, and what they need. Mention the free audit in that same message. Do not wait for them to offer the details.",
      "When you have all four, call saveLead before you confirm. Do not call it with blanks or guesses. Do not say Callum has their details unless saveLead returns ok.",
      "After a successful save, tell them Callum has their details and will be in touch. Offer the free audit and book a call, in those words. Do not write the addresses. Buttons appear under your message.",
      `Phone: ${config.links.phone}. You may write that number. Do not write a web address for the audit, the booking page, WhatsApp or the calculator.`,
      "If saveLead fails, do not say the details were saved. Give them the phone number, and mention WhatsApp and book a call.",
      "If they are only asking a question, answer it. Do not demand their details first.",
      "If they have just said how many calls they miss, follow the missed-call instructions before you ask for details."
    ].join(" "),
    `If a price slips out, it will be replaced with: "${config.priceStandIn}". Prefer to say that yourself, with no number.`,
    missedCallInstructions(config)
  ].join("\n\n");
}
function pageLabel(page) {
  const file = page.split("/").filter(Boolean).pop() ?? "";
  const slug = file.replace(/\.html$/i, "").replace(/-/g, " ");
  if (!slug || slug === "index") return "the home page";
  return `the ${slug} page`;
}
function missedCallInstructions(config) {
  const lines = config.nudge.replies.map((reply) => {
    const filled = reply.calls == null ? "They can type their own number. Do not invent one." : `Say with ${reply.calls} a day filled in.`;
    return `- ${reply.label}: ${filled}`;
  }).join("\n");
  return [
    "Missed-call answers.",
    "If they tell you how many calls they miss, do not calculate a pound amount.",
    "Acknowledge the answer in one sentence. Mention the missed-call calculator in those words. Say it is a rough estimate they can edit. Do not write the address.",
    lines,
    "Then offer the free audit or leaving their details."
  ].join("\n");
}
function publicWidget(config) {
  return {
    title: config.widget.title,
    launcherLabel: config.widget.launcherLabel,
    greeting: config.widget.greeting,
    placeholder: config.widget.placeholder,
    suggestions: config.widget.suggestions,
    formTitle: config.widget.formTitle,
    formSubmit: config.widget.formSubmit,
    auditHref: config.links.audit,
    auditLabel: config.links.auditLabel,
    bookHref: config.links.book,
    bookLabel: config.links.bookLabel,
    phoneHref: config.links.phoneHref,
    phone: config.links.phone,
    whatsappHref: config.links.whatsapp,
    nudge: config.nudge,
    calculatorHref: config.calculatorHref
  };
}

// server/chat.ts
var maxDuration = 30;
var leadSchema = z.object({
  name: z.string().describe("The visitor's name"),
  business: z.string().describe("Their business or trade"),
  contact: z.string().describe("A phone number or email address they gave"),
  need: z.string().describe("What they want help with, in their words")
});
function json(body, status = 200, extra) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", ...extra }
  });
}
function limited(retryAfter) {
  return json(
    { error: "You've sent quite a few messages. Give it a minute, or book the free audit." },
    429,
    { "retry-after": String(retryAfter) }
  );
}
function GET() {
  return Response.json(publicWidget(business), {
    headers: { "cache-control": "public, max-age=300" }
  });
}
async function POST(request) {
  if (!sameOrigin(request)) {
    return json({ error: "Open the chat on the site and try again." }, 403);
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 24e3) {
    return json({ error: "That message is a bit long. Try a shorter question." }, 413);
  }
  const limit = takeRateLimit(
    clientKey(request),
    Date.now(),
    business.limits.windowMs,
    business.limits.maxRequests
  );
  if (!limit.ok) return limited(limit.retryAfter);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "I couldn't read that. Try again." }, 400);
  }
  if (!body || typeof body !== "object") {
    return json({ error: "I couldn't read that. Try again." }, 400);
  }
  const page = knownPage(body.page, business.pages);
  const leadBody = body.lead;
  if (leadBody && typeof leadBody === "object") {
    const parsed = validateLead(leadBody, "chat-form", page);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const saved = await saveLead(business, {
      ...parsed.lead,
      summary: summariseTranscript(body.messages)
    });
    if (!saved.ok) {
      return json(
        {
          error: "I couldn't save that just now. Book the free audit, or WhatsApp Callum, and he'll take it from there."
        },
        503
      );
    }
    return json({
      ok: true,
      notified: saved.notified,
      message: `${parsed.lead.name}, that's with Callum. He'll use it to reply. The free audit is linked below if you want the 30-minute call as well.`
    });
  }
  const messages = normaliseMessages(body.messages, business.limits);
  if (!messages.ok) return json({ error: messages.error }, messages.status);
  const model = process.env.AI_GATEWAY_MODEL || business.model;
  let savedLead = false;
  const result = streamText({
    model,
    instructions: buildInstructions(business, page),
    messages: messages.messages,
    maxOutputTokens: 280,
    temperature: 0.2,
    reasoning: "none",
    stopWhen: isStepCount(4),
    tools: {
      saveLead: tool({
        description: "Save a lead for Callum once the visitor has given their name, business or trade, phone or email, and what they need. Call this before confirming.",
        inputSchema: leadSchema,
        execute: async (input) => {
          const parsed = validateLead(input, "chat-tool", page);
          if (!parsed.ok) return { ok: false, error: parsed.error };
          const saved = await saveLead(business, {
            ...parsed.lead,
            summary: summariseTranscript(messages.messages)
          });
          savedLead = saved.ok;
          if (!saved.ok) {
            return {
              ok: false,
              error: "The details could not be stored. Ask them to book the free audit or use WhatsApp."
            };
          }
          return {
            ok: true,
            notified: saved.notified,
            note: "Stored for Callum. Do not say it was emailed. Offer the free audit."
          };
        }
      })
    },
    onError({ error }) {
      console.error("chat model error", error instanceof Error ? error.name : "error");
    }
  });
  const guard = createPriceStream(business.allowedPrices, business.priceStandIn, {
    audit: business.links.audit,
    book: business.links.book,
    whatsapp: business.links.whatsapp,
    phone: business.links.phone,
    calculator: business.calculatorHref
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let wrote = false;
      try {
        for await (const delta of result.textStream) {
          const next = guard.push(delta);
          if (!next) continue;
          wrote = true;
          controller.enqueue(encoder.encode(next));
        }
        const tail = guard.flush();
        if (tail) {
          wrote = true;
          controller.enqueue(encoder.encode(tail));
        }
        if (!wrote) {
          const fallback = savedLead ? "Thanks. That's with Callum. The free audit is linked below if you'd like the 30-minute call as well." : "Sorry, I missed that. Ask me about the free audit, or book a call with Callum.";
          controller.enqueue(encoder.encode(fallback));
        }
      } catch (error) {
        console.error("chat stream error", error instanceof Error ? error.name : "error");
        if (!wrote) {
          controller.enqueue(
            encoder.encode(
              "Sorry, I can't answer just now. Book the free audit, or ring Callum on 07460 038202."
            )
          );
        }
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no"
    }
  });
}
export {
  GET,
  POST,
  maxDuration
};
