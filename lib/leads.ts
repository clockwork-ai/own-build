import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import type { BusinessConfig } from "./business.ts";
import { cleanLine, isValidContact } from "./guard.ts";

export type LeadInput = {
  name: string;
  business: string;
  contact: string;
  need: string;
  page?: string;
  source: "chat-tool" | "chat-form";
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

function pathname(prefix: string, lead: LeadInput): string {
  const day = new Date().toISOString().slice(0, 10);
  const hash = createHash("sha256")
    .update(`${lead.contact.toLowerCase()}\n${lead.need.toLowerCase()}`)
    .digest("hex")
    .slice(0, 16);
  return `${prefix}/${day}/${hash}.json`;
}

async function notify(config: BusinessConfig, lead: LeadInput): Promise<boolean> {
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
    const response = await fetch(target, {
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

export async function saveLead(config: BusinessConfig, lead: LeadInput): Promise<LeadResult> {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    console.error("lead storage: Blob is not connected");
    return { ok: false, error: "storage-not-configured" };
  }
  const record = {
    ...lead,
    notifyName: config.lead.notifyName,
    savedAt: new Date().toISOString(),
  };
  try {
    await put(pathname(config.lead.storagePrefix, lead), JSON.stringify(record), {
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
  const notified = await notify(config, lead);
  console.info(`lead stored source=${lead.source} notified=${notified}`);
  return { ok: true, notified };
}
