import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import type { BusinessConfig } from "./business.ts";
import { cleanLine, isValidContact } from "./guard.ts";
import { emailLead, summariseTranscript } from "./mail.ts";

export type LeadInput = {
  name: string;
  business: string;
  contact: string;
  need: string;
  page?: string;
  source: "chat-tool" | "chat-form" | "register-interest";
  summary?: string;
};

export type LeadResult =
  | { ok: true; notified: boolean }
  | { ok: false; error: string };

export function validateLead(
  input: {
    name?: unknown;
    business?: unknown;
    contact?: unknown;
    need?: unknown;
    page?: unknown;
  },
  source: LeadInput["source"],
  knownPage?: string,
): { ok: true; lead: LeadInput } | { ok: false; error: string } {
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
    lead: { name, business: trade, contact, need, page: knownPage, source },
  };
}

export const EVENING_JOBS = ["quotes", "chasing", "paperwork"] as const;
export type EveningJob = (typeof EVENING_JOBS)[number];

/**
 * Register interest in Clockwork Flow (the /register-interest page).
 * Checks the extra answers, then turns them into the same lead record the chat
 * form makes, so storage, the notice email and the webhook stay as they are.
 */
export function validateRegisterInterest(
  input: {
    name?: unknown;
    trade?: unknown;
    area?: unknown;
    mobile?: unknown;
    email?: unknown;
    contact?: unknown;
    website?: unknown;
    evenings?: unknown;
    notes?: unknown;
  },
  knownPage?: string,
): { ok: true; lead: LeadInput } | { ok: false; error: string } {
  // Mobile and email arrive separately (the contact check takes one or the other).
  // The first good one becomes the contact; a second good one is kept in the answers.
  const line = (v: unknown, max: number) => cleanLine(typeof v === "string" ? v : "", max);
  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const mobile = line(input.mobile, 40);
  const email = line(input.email, 120);
  const mobileOk = mobile !== "" && !isEmail(mobile) && isValidContact(mobile);
  const emailOk = email !== "" && isEmail(email) && isValidContact(email);
  const contact = mobileOk ? mobile : emailOk ? email : line(input.contact, 120);
  const alsoEmail = mobileOk && emailOk ? email : "";
  const area = cleanLine(typeof input.area === "string" ? input.area : "", 60);
  const website = input.website === "yes" ? "Yes" : input.website === "no" ? "No" : "";
  const picked = Array.isArray(input.evenings) ? input.evenings : [];
  const evenings = EVENING_JOBS.filter((job) => picked.includes(job));
  const notes = cleanLine(typeof input.notes === "string" ? input.notes : "", 140);
  if (area.length < 2) return { ok: false, error: "Add the town or area you work in." };
  if (!website) return { ok: false, error: "Say whether you have a website." };
  if (!evenings.length) return { ok: false, error: "Pick at least one of quotes, chasing or paperwork." };
  const need = [
    "Clockwork Flow early access.",
    `Works in ${area}.`,
    `Has a website: ${website}.`,
    `Evenings go on: ${evenings.join(", ")}.`,
    alsoEmail ? `Email: ${alsoEmail}.` : "",
    notes ? `Notes: ${notes}` : "",
  ].filter(Boolean).join(" ");
  const base = validateLead(
    { name: input.name, business: input.trade, contact, need },
    "register-interest",
    knownPage,
  );
  if (!base.ok) {
    const error = base.error === "I need a name." ? "Add your first name."
      : base.error === "I need the business or trade." ? "Add your trade."
      : base.error === "I need a phone number or email." ? "Add a mobile number or an email address."
      : base.error;
    return { ok: false, error };
  }
  const summary = [
    "Register interest answers (Clockwork Flow):",
    `Area: ${area}`,
    `Has a website: ${website}`,
    `Evenings go on: ${evenings.join(", ")}`,
    alsoEmail ? `Email as well: ${alsoEmail}` : "",
    `Notes: ${notes || "None"}`,
  ].filter(Boolean).join("\n");
  return { ok: true, lead: { ...base.lead, summary } };
}

function pathname(prefix: string, lead: LeadInput): string {
  const day = new Date().toISOString().slice(0, 10);
  const hash = createHash("sha256")
    .update(`${lead.contact.toLowerCase()}\n${lead.need.toLowerCase()}`)
    .digest("hex")
    .slice(0, 16);
  return `${prefix}/${day}/${hash}.json`;
}

// Optional collaborators for saveLead, so tests can pass fakes. Live callers pass nothing.
export type SaveLeadDeps = {
  put?: typeof put;
  email?: typeof emailLead;
  fetch?: typeof fetch;
};

async function notify(config: BusinessConfig, lead: LeadInput, deps: SaveLeadDeps): Promise<boolean> {
  const email = deps.email ?? emailLead;
  const emailed = await email(config.lead.notifyEmail, lead, lead.summary || "No transcript was included.");
  const hooked = await notifyWebhook(config, lead, deps.fetch ?? fetch);
  console.info(`lead notice emailed=${emailed} webhook=${hooked}`);
  return emailed || hooked;
}

async function notifyWebhook(config: BusinessConfig, lead: LeadInput, send: typeof fetch): Promise<boolean> {
  const url = process.env[config.lead.webhookEnv];
  if (!url) return false;
  let target: URL;
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
    const response = await send(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: config.lead.notifyName,
        email: config.links.email,
        ...lead,
        receivedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(4000),
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

export async function saveLead(
  config: BusinessConfig,
  lead: LeadInput,
  deps: SaveLeadDeps = {},
): Promise<LeadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    console.error("lead storage: Blob is not connected");
    return { ok: false, error: "storage-not-configured" };
  }
  const record = {
    ...lead,
    summary: lead.summary || "No transcript was included.",
    notifyName: config.lead.notifyName,
    savedAt: new Date().toISOString(),
  };
  try {
    await (deps.put ?? put)(pathname(config.lead.storagePrefix, lead), JSON.stringify(record), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    console.error("lead storage: put failed", error instanceof Error ? error.name : "error");
    return { ok: false, error: "storage-failed" };
  }
  const notified = await notify(config, lead, deps);
  console.info(`lead stored source=${lead.source} notified=${notified}`);
  return { ok: true, notified };
}
