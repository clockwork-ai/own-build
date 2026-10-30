import type { BusinessConfig } from "./business.ts";

const buckets = new Map<string, { count: number; reset: number }>();

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]?.trim()
    : request.headers.get("x-real-ip");
  return ip || "unknown";
}

export function takeRateLimit(
  key: string,
  now: number,
  windowMs: number,
  maxRequests: number,
): { ok: true } | { ok: false; retryAfter: number } {
  const current = buckets.get(key);
  if (!current || now >= current.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (current.count >= maxRequests) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((current.reset - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

/** Test helper. The live limiter is process-local on purpose. */
export function resetRateLimits(): void {
  buckets.clear();
}

export function sameOrigin(request: Request): boolean {
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

export function knownPage(page: unknown, pages: readonly string[]): string | undefined {
  if (typeof page !== "string") return undefined;
  const path = page.split("?")[0]?.split("#")[0] ?? "";
  return pages.includes(path) ? path : undefined;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function normaliseMessages(
  input: unknown,
  limits: BusinessConfig["limits"],
): { ok: true; messages: ChatTurn[] } | { ok: false; error: string; status: number } {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, status: 400, error: "Send a message and I'll answer." };
  }
  if (input.length > limits.maxMessages) {
    return {
      ok: false,
      status: 400,
      error: "That's as far as this chat goes. Book the free audit and Callum will take it from there.",
    };
  }
  const messages: ChatTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") {
      return { ok: false, status: 400, error: "I couldn't read that. Try again." };
    }
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return { ok: false, status: 400, error: "I couldn't read that. Try again." };
    }
    const text = content.replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (role === "user" && text.length > limits.maxUserChars) {
      return {
        ok: false,
        status: 400,
        error: "That message is a bit long. Try a shorter question.",
      };
    }
    messages.push({
      role,
      content: role === "assistant" ? text.slice(0, limits.maxAssistantChars) : text,
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

const WORD_PRICE =
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)(?:[\s-](?:and|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred))*\s+pounds?(?:\s+(?:a|per)\s+month)?\b/gi;
/** A comma-grouped number with nothing after it, such as 1,200. "1,200 leads" stays. */
const COMMA_NUMBER = /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b(?!\s*[A-Za-z])/g;

const MONTH = "(?:months?|mo(?!nth))";
const MONEY = new RegExp(
  `£\\s?\\d[\\d,]*(?:\\.\\d+)?(?:\\s*billion|\\s*million|\\s*(?:\\/|a |per )${MONTH})?|[$€]\\s?\\d[\\d,]*(?:\\.\\d+)?(?:\\s*(?:\\/|a |per )${MONTH})?|\\bgbp\\s?\\d[\\d,]*(?:\\.\\d+)?|\\b\\d[\\d,]*(?:\\.\\d+)?\\s*(?:pounds?|quid)\\b|\\b\\d[\\d,]*(?:\\.\\d+)?\\s*(?:\\/|a |per )${MONTH}\\b`,
  "gi",
);

/** Turns em and en dashes into plain punctuation. Number ranges become "3 to 5". */
export function scrubDashes(text: string): string {
  return text
    .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[\u2013\u2014]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/[ \t]{2,}/g, " ");
}

export type PathLinks = {
  audit: string;
  book: string;
  whatsapp: string;
  phone: string;
  calculator: string;
};

const DEFAULT_LINKS: PathLinks = {
  audit: "/clockwork-check",
  book: "https://cal.com/clockwork-ai/30min",
  whatsapp: "https://wa.me/447460038202",
  phone: "07460 038202",
  calculator: "/missed-calls#calculator",
};

function wordsFor(raw: string, links: PathLinks): string {
  const trimmed = raw.replace(/[.,;:!?]+$/g, "");
  const trailing = raw.slice(trimmed.length);
  let href = trimmed;
  if (/^www\./i.test(href)) href = `https://${href.slice(4)}`;
  else if (!/^https?:\/\//i.test(href) && !href.startsWith("/") && !href.endsWith(".html") && href.includes(".")) {
    href = `https://${href}`;
  }
  let url: URL;
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

/** Replaces a raw URL or page path with words. Phone numbers and ordinary sentences stay. */
export function scrubPaths(text: string, links: PathLinks = DEFAULT_LINKS): string {
  const link =
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)|(https?:\/\/[^\s<>)\]]+)|(?<!@)\b(?:www\.)?(?:clockworkai\.app|cal\.com|wa\.me)(?:\/[^\s<>)\]]*)?|(^|[\s(])(\/(?:about|book|clockwork-check|how-it-works|missed-calls|privacy|roofers|services|terms|work)(?:\.html)?(?:\?[^\s<>)\]]*)?(?:#[a-z0-9-]+)?|\/?[a-z0-9-]+(?:\/[a-z0-9-]+)*\.html(?:\?[^\s<>)\]]*)?(?:#[a-z0-9-]+)?)/gi;
  return text
    .replace(link, (match, label: string | undefined, href: string | undefined, http: string | undefined, lead: string | undefined, path: string | undefined) => {
      if (match.startsWith("[") && label != null && href != null) {
        return /https?:|www\.|\.html|\.com|wa\.me|\//i.test(label) ? wordsFor(href, links) : label;
      }
      if (http) return wordsFor(http, links);
      if (path) return `${lead ?? ""}${wordsFor(path, links)}`;
      return wordsFor(match, links);
    })
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1");
}

function incompleteMoney(tail: string): boolean {
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+$/i.test(tail)) return true;
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+(?:a|per)\s+m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s+b(?:i(?:l(?:l(?:i(?:o(?:n)?)?)?)?)?)?$/i.test(tail)) return !/billion$/i.test(tail);
  if (/(?:£|\$|€|gbp\s?)\d[\d,]*(?:\.\d*)?\s*\/\s*m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(tail)) return !/month$/i.test(tail);
  return false;
}

function holdCut(held: string): number {
  let out = held.length;
  // trailingCut can return on the first tail it sees. The later checks still
  // run, and the earliest cut wins, so a brand letter or an article cannot
  // release "open " or "AI " before the real term has finished.
  for (const index of [
    trailingCut(held),
    bannedHold(held),
    selfRefHold(held),
    articleHold(held),
    priceHold(held),
    completeTermHold(held),
  ]) {
    if (index == null || index >= held.length) continue;
    if (index < out) out = index;
  }
  return widenHold(held, out);
}

function widenHold(held: string, at: number): number {
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

/** "open " plus a or ai is one term. An article hold must not release "open". */
function extendOpen(held: string, at: number): number {
  if (at <= 0 || at > held.length) return at;
  const open = held.slice(0, at).match(/open\s+$/i);
  if (!open) return at;
  if (/^a(?:i\b|\b)/i.test(held.slice(at))) return at - open[0].length;
  return at;
}

/** Pulls a hold back over a preceding a, an or the, so the article is scrubbed with the word. */
function includeArticle(held: string, at: number): number {
  if (at <= 0) return at;
  const match = held.slice(0, at).match(/(^|\s)((?:an|the|a|this))\s+$/i);
  if (!match || match.index == null) return at;
  return match.index + (match[1]?.length ?? 0);
}

/** Keeps "Clockwork" with a following A or AI so the brand is scrubbed as one phrase. */
function extendBrand(held: string, at: number): number {
  if (at <= 0 || at > held.length) return at;
  const brand = held.slice(0, at).match(/clockwork\s+$/i);
  if (!brand) return at;
  if (/^a(?:i\b|\b)/i.test(held.slice(at))) return at - brand[0].length;
  return at;
}

function trailingCut(held: string): number {
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
  const plain = plainPriceHold(held);
  if (plain != null) return plain;
  const digits = held.match(/\d[\d,]{0,8}$/);
  if (digits?.index != null) return digits.index;
  return held.length;
}

const APOLOGY_TARGETS = [
  "i can't paste links, but you can",
  "i can't give the exact page address, but you can",
];

function apologyCut(held: string): number | null {
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

export function scrubPrices(text: string, allowed: readonly string[], standIn: string): string {
  const slots: string[] = [];
  let safe = text;
  const phrases = [...allowed].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exact = new RegExp(`${escaped}(?![\\d,.])`, "g");
    safe = safe.replace(exact, (match) => {
      const index = slots.push(match) - 1;
      return `\u0000${index}\u0000`;
    });
  }
  safe = safe.replace(MONEY, standIn).replace(WORD_PRICE, standIn).replace(COMMA_NUMBER, standIn);
  return safe.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => slots[Number(index)] ?? "");
}

function scrubAddressApology(text: string): string {
  return text
    .replace(
      /I can(?:not|['\u2019]t) give(?: you)? the exact (?:page |web )?address,\s*but you can/gi,
      "You can",
    )
    .replace(/I can(?:not|['\u2019]t) paste (?:a |the )?links?,?\s*but you can/gi, "You can")
    .replace(/I can(?:not|['\u2019]t) paste (?:a |the )?links?\.?\s*/gi, "")
    .replace(/[ \t]{2,}/g, " ");
}

const BANNED_TERMS = [
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
  "n8n",
];

/** Held only so a self-reference can finish across a chunk. Not blanket-replaced. */
const PHRASE_HOLD = ["assistants", "assistant", "bots", "bot"];

const ROLE = "assistant|bot|agent|chatbot";
const SELF_REFERENCE = new RegExp(
  `\\b(?:i['\\u2019]m|i am)\\s+an\\s+assistant(?:\\s+(?:${ROLE}))?\\b|\\b(?:i['\\u2019]m|i am)\\s+a\\s+bot(?:\\s+(?:${ROLE}))?\\b|\\b(?:i['\\u2019]m|i am)\\s+an\\s+ai(?:\\s+(?:${ROLE}))?\\b|\\bi am\\s+ai(?:\\s+(?:${ROLE}))?\\b|\\bas\\s+an\\s+ai(?:\\s+(?:${ROLE}))?\\b`,
  "gi",
);
const AI_COMPOUND = /\bai\s+(?:agents?|bots?|assistants?|tools?|chatbots?)\b/gi;

function escapeTerm(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termTail(term: string): string {
  return `${escapeTerm(term)}(?![\\w-])`;
}

function termSource(term: string): string {
  return `\\b${termTail(term)}`;
}

/** Replaces self-reference, chatbot, automation and named tools. Ordinary words stay. Clockwork AI stays. */
export function scrubBanned(text: string): string {
  const slots: string[] = [];
  let safe = text.replace(/clockwork ai/gi, (match) => {
    const index = slots.push(match) - 1;
    return `\u0001${index}\u0001`;
  });
  safe = safe.replace(SELF_REFERENCE, (match) => (/^as\s/i.test(match) ? "on this site" : "I answer questions on this site"));
  safe = safe.replace(AI_COMPOUND, "the system");
  const ordered = [...BANNED_TERMS].sort((a, b) => b.length - a.length);
  const phraseBody = ordered.map((term) => termTail(term)).join("|");
  const phrase = new RegExp(`\\b(?:an?|the)\\s+(?:${phraseBody})`, "gi");
  const token = new RegExp(ordered.map(termSource).join("|"), "gi");
  safe = safe.replace(phrase, "the system").replace(token, "the system");
  safe = safe.replace(/\b(?:a|an|the|this)\s+(?=the system\b)/gi, "");
  safe = safe.replace(/(?:\bthe system\b\s*){2,}/gi, "the system ");
  return safe.replace(/\u0001(\d+)\u0001/g, (_match, index: string) => slots[Number(index)] ?? "");
}

const SELF_CORES = [
  "i'm an assistant",
  "i am an assistant",
  "i'm a bot",
  "i am a bot",
  "i'm an ai",
  "i am an ai",
  "i am ai",
  "as an ai",
];
const SELF_TAILS = ["", " assistant", " bot", " agent", " chatbot"];
const SELF_TARGETS = SELF_CORES.flatMap((core) => SELF_TAILS.map((tail) => core + tail));
const HOLD_TERMS = [
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
  "ai chatbots",
].map((term) => term.toLowerCase());
/** Proper prefixes of these stay buffered. "the" and "an" stop "th" + "e" splitting the article. */
const PREFIX_TERMS = [...HOLD_TERMS, "the", "an", "this"];

/** Holds a trailing fragment that could still grow into a self-reference. */
function selfRefHold(held: string): number | null {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  let best: number | null = null;
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

function boundaryBefore(text: string, at: number): boolean {
  if (at <= 0) return true;
  return !/[a-z0-9]/i.test(text[at - 1] ?? "");
}

/** Holds a proper prefix of a banned term, including a single letter, and a spaced term such as "open ai". */
function prefixHold(held: string, terms: readonly string[]): number | null {
  const lower = held.toLowerCase().replace(/\u2019/g, "'");
  let best: number | null = null;
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

function bannedHold(held: string): number | null {
  return prefixHold(held, PREFIX_TERMS);
}

/** Holds a trailing a, an or the until the next word shows whether it belongs to a banned phrase. */
function articleHold(held: string): number | null {
  const match = held.match(/(^|[\s([{"'])((?:this|an|the|a))\b(\s*)([A-Za-z][A-Za-z0-9.]*)?$/i);
  if (!match || match.index == null) return null;
  // "open a" is the start of "open ai", not an article plus a word.
  const before = held.slice(0, match.index + (match[1]?.length ?? 0));
  if (/open\s+$/i.test(before)) return null;
  const rest = (match[4] ?? "").toLowerCase();
  if (rest) {
    const waiting = HOLD_TERMS.some((term) => term.startsWith(rest) && term !== rest);
    if (!waiting) return null;
  }
  return match.index + (match[1]?.length ?? 0);
}

const NUMBER_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "fifteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "hundred",
  "thousand", "and",
];

function openNumberChain(words: string[], spaced: boolean, hyphen: boolean): boolean {
  const w = words.map((word) => word.toLowerCase());
  if (w.length === 0) return false;
  const first = w[0] ?? "";
  const firstComplete = NUMBER_WORDS.includes(first);
  const firstPartial = NUMBER_WORDS.some((word) => word.startsWith(first) && word !== first);
  if (!firstComplete && firstPartial) return w.length === 1 && !spaced && !hyphen;
  if (!firstComplete) return false;
  let i = 1;
  while (i < w.length && NUMBER_WORDS.includes(w[i] ?? "")) i++;
  if (i < w.length) {
    const next = w[i] ?? "";
    const partialNumber = NUMBER_WORDS.some((word) => word.startsWith(next) && word !== next);
    if (partialNumber && i === w.length - 1 && !spaced && !hyphen) return true;
  }
  if (i === w.length) return true;
  const unit = w[i] ?? "";
  if (unit !== "pound" && unit !== "pounds" && !("pounds".startsWith(unit))) return false;
  if (unit !== "pound" && unit !== "pounds") return i === w.length - 1 && !spaced && !hyphen;
  if (unit === "pound") return i === w.length - 1 && !spaced;
  i++;
  if (hyphen && i === w.length) return true;
  if (i === w.length) return true;
  const mid = w[i] ?? "";
  const midPartial = mid !== "a" && mid !== "per" && ("a".startsWith(mid) || "per".startsWith(mid));
  if (mid !== "a" && mid !== "per" && !midPartial) return false;
  if (midPartial) return i === w.length - 1 && !spaced;
  if (i === w.length - 1) return true;
  i++;
  if (i === w.length) return true;
  if (i !== w.length - 1) return false;
  const month = w[i] ?? "";
  if (month === "month") return false;
  return "month".startsWith(month) && !spaced;
}

/** Spelled-out prices stay together until "pounds" arrives, or the next word shows it is not a price. */
function wordPriceHold(held: string): number | null {
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
      const at = tail[1].indexOf(words[w] ?? "", from);
      from = at + (words[w]?.length ?? 0);
    }
    const at = tail[1].indexOf(words[i] ?? "", from);
    return tail.index + at;
  }
  return null;
}

/** "99/mo" is not finished: it may still grow into "99/month". */
function slashHold(held: string): number | null {
  const match = held.match(/(?:^|[^\d])(\d[\d,]*\s*\/\s*(?:m(?:o(?:n(?:t(?:h)?)?)?)?)?)$/i);
  if (!match || match.index == null || match[1] == null) return null;
  if (/\/\s*month$/i.test(match[1])) return null;
  return match.index + (match[0].length - match[1].length);
}

function currencyIncomplete(tail: string): boolean {
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

function currencyHold(held: string): number | null {
  const match = held.match(/(?:£|\$|€|\bgbp\s?)\d[\d,]*(?:\.\d*)?[^£$€]*$/i) ?? held.match(/(?:£|\$|€|\bgbp\s*)$/i);
  if (!match || match.index == null) return null;
  return currencyIncomplete(held.slice(match.index)) ? match.index : null;
}

/** "149 quid", "149 pounds" and "99 per month" stay together across a chunk boundary. */
function plainPriceHold(held: string): number | null {
  const match = held.match(
    /(?:^|\D)(\d[\d,]*(?:\.\d*)?(?:[ \t]*\/[ \t]*[A-Za-z]*|[ \t]+[A-Za-z]+(?:[ \t]+[A-Za-z]+){0,2})?[ \t]*)$/,
  );
  if (!match || match.index == null || !match[1]) return null;
  if (!plainIncomplete(match[1])) return null;
  return match.index + (match[0].length - match[1].length);
}

function plainIncomplete(frag: string): boolean {
  const trimmed = frag.replace(/[ \t]+$/, "");
  const trailing = trimmed.length !== frag.length;
  if (/^\d[\d,]*(?:\.\d*)?$/.test(trimmed)) return true;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]*\/[ \t]*$/.test(frag)) return true;
  if (/\/[ \t]*month$/i.test(trimmed)) return false;
  if (/\/[ \t]*m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(trimmed)) return true;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+quid$/i.test(trimmed)) return false;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+pounds$/i.test(trimmed)) return trailing;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+pound$/i.test(trimmed)) return !trailing;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+(?:a|per)$/i.test(trimmed)) return true;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+(?:a|per)[ \t]+month$/i.test(trimmed)) return false;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+(?:a|per)[ \t]+m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(trimmed)) return !/month$/i.test(trimmed);
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+pounds[ \t]+(?:a|per)$/i.test(trimmed)) return true;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+pounds[ \t]+(?:a|per)[ \t]+month$/i.test(trimmed)) return false;
  if (/^\d[\d,]*(?:\.\d*)?[ \t]+pounds[ \t]+(?:a|per)[ \t]+m(?:o(?:n(?:t(?:h)?)?)?)?$/i.test(trimmed)) return !/month$/i.test(trimmed);
  const one = trimmed.match(/^\d[\d,]*(?:\.\d*)?[ \t]+([A-Za-z]+)$/i);
  if (one && !trailing) {
    const word = one[1].toLowerCase();
    return ["quid", "pounds", "per"].some((unit) => unit.startsWith(word) && unit !== word);
  }
  return false;
}

function priceHold(held: string): number | null {
  let best: number | null = null;
  for (const at of [wordPriceHold(held), slashHold(held), currencyHold(held), plainPriceHold(held)]) {
    if (at != null && (best == null || at < best)) best = at;
  }
  return best;
}

/** A finished banned word stays buffered for one more character, so "open ai-free" is not cut in half. */
function completeTermHold(held: string): number | null {
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
    "ai chatbots",
  ];
  let best: number | null = null;
  for (const term of terms) {
    if (!lower.endsWith(term)) continue;
    const at = lower.length - term.length;
    if (!boundaryBefore(lower, at)) continue;
    if (best == null || at < best) best = at;
  }
  return best;
}

function scrubReply(text: string, allowed: readonly string[], standIn: string, links?: PathLinks): string {
  return scrubBanned(scrubAddressApology(scrubPaths(scrubDashes(scrubPrices(text, allowed, standIn)), links)));
}

/** Holds back a trailing fragment that might still be a price, a dash range, or a path. */
export function createPriceStream(allowed: readonly string[], standIn: string, links?: PathLinks) {
  let held = "";
  const push = (chunk: string) => {
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

export function isValidContact(value: string): boolean {
  const text = value.trim();
  if (text.length < 6 || text.length > 120) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true;
  const digits = text.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 && /^[+\d][\d\s()-]+$/.test(text);
}

export function cleanLine(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
