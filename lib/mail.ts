import { connect as connectTls, type TLSSocket } from "node:tls";
import { scrubDashes } from "./guard.ts";

/** Fields the notification email is allowed to include. */
export type LeadNotice = {
  name: string;
  business: string;
  contact: string;
  need: string;
  page?: string;
  source: string;
};

export type SmtpSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
};

export type LeadEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;

/** Recent chat turns, clipped. Used as the transcript summary in the email. */
export function summariseTranscript(input: unknown): string {
  if (!Array.isArray(input)) return "No transcript was included.";
  const lines: string[] = [];
  for (const item of input.slice(-8)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const text = content.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 280);
    if (!text) continue;
    lines.push(`${role === "user" ? "Visitor" : "Assistant"}: ${text}`);
  }
  if (!lines.length) return "No transcript was included.";
  return lines.join("\n");
}

export function readSmtpSettings(env: NodeJS.ProcessEnv = process.env): SmtpSettings | null {
  const user = env.LEAD_SMTP_USER?.trim() ?? "";
  const pass = env.LEAD_SMTP_PASSWORD?.replace(/\s+/g, "") ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user) || pass.length < 8) return null;
  return { host: SMTP_HOST, port: SMTP_PORT, user, pass };
}

function oneLine(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function plainBlock(value: string, max: number): string {
  return value.replace(/[\u0000-\u0009\u000b-\u001f]+/g, " ").trim().slice(0, max);
}

function encodeSubject(subject: string): string {
  const clean = oneLine(subject, 180);
  if (/^[\x20-\x7e]*$/.test(clean)) return clean;
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function replyAddress(contact: string): string | undefined {
  const clean = oneLine(contact, 120);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : undefined;
}

export function buildLeadEmail(to: string, from: string, lead: LeadNotice, summary: string): LeadEmail {
  const name = oneLine(lead.name, 80) || "Unknown";
  const business = oneLine(lead.business, 80) || "Not given";
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
      `Business: ${business}`,
      `Contact: ${contact}`,
      `What they need: ${need}`,
      `Page: ${page}`,
      `How it arrived: ${arrived}`,
      "",
      "Recent messages:",
      recent,
    ].join("\n"),
  );
  return {
    from: oneLine(from, 120),
    to: oneLine(to, 120),
    subject,
    text,
    replyTo: replyAddress(contact),
  };
}

export function leadEmailSource(mail: LeadEmail): string {
  const headers = [
    `From: Clockwork chat <${mail.from}>`,
    `To: ${mail.to}`,
    `Subject: ${encodeSubject(mail.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
  ];
  if (mail.replyTo) headers.push(`Reply-To: ${mail.replyTo}`);
  const body = mail.text
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\r\n")
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
  return `${headers.join("\r\n")}\r\n\r\n${body}\r\n`;
}

type Reply = { code: number; text: string };

export class SmtpReader {
  private buffer = "";
  private waiters: Array<(line: string) => void> = [];

  constructor(socket: { on(event: "data", listener: (chunk: Buffer) => void): void }) {
    socket.on("data", (chunk) => {
      this.buffer += chunk.toString("utf8");
      this.drain();
    });
  }

  private drain(): void {
    while (this.waiters.length) {
      const nl = this.buffer.indexOf("\n");
      if (nl < 0) return;
      const line = this.buffer.slice(0, nl).replace(/\r$/, "");
      this.buffer = this.buffer.slice(nl + 1);
      this.waiters.shift()?.(line);
    }
  }

  private line(): Promise<string> {
    const nl = this.buffer.indexOf("\n");
    if (nl >= 0) {
      const line = this.buffer.slice(0, nl).replace(/\r$/, "");
      this.buffer = this.buffer.slice(nl + 1);
      return Promise.resolve(line);
    }
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  async reply(): Promise<Reply> {
    const lines: string[] = [];
    for (;;) {
      const line = await this.line();
      lines.push(line);
      if (/^\d{3} /.test(line) || (lines.length === 1 && /^\d{3}$/.test(line))) {
        return { code: Number(line.slice(0, 3)), text: lines.join("\n") };
      }
      if (!/^\d{3}-/.test(line)) {
        return { code: Number(line.slice(0, 3)) || 0, text: lines.join("\n") };
      }
    }
  }
}

async function expectCode(reply: Reply, code: number): Promise<void> {
  if (reply.code !== code) throw new Error(`smtp ${reply.code}`);
}

/** Speaks one message to an already connected SMTP server. */
export async function submitSmtp(
  reply: () => Promise<Reply>,
  write: (command: string) => void,
  settings: SmtpSettings,
  mail: LeadEmail,
): Promise<void> {
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

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("smtp-timeout")), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function sendSmtpMail(
  settings: SmtpSettings,
  mail: LeadEmail,
  tlsOptions: { rejectUnauthorized?: boolean } = {},
): Promise<void> {
  const socket: TLSSocket = connectTls({
    host: settings.host,
    port: settings.port,
    servername: /[a-z]/i.test(settings.host) ? settings.host : undefined,
    timeout: 8000,
    rejectUnauthorized: tlsOptions.rejectUnauthorized !== false,
  });
  const reader = new SmtpReader(socket);
  const write = (command: string) => {
    socket.write(`${command}\r\n`);
  };
  try {
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        socket.once("secureConnect", () => resolve());
        socket.once("error", reject);
      }),
      8000,
    );
    await withTimeout(submitSmtp(() => reader.reply(), write, settings, mail), 8000);
  } finally {
    socket.end();
    socket.destroy();
  }
}

export async function emailLead(
  to: string,
  lead: LeadNotice,
  summary: string,
  deps: {
    settings?: SmtpSettings | null;
    send?: (settings: SmtpSettings, mail: LeadEmail) => Promise<void>;
  } = {},
): Promise<boolean> {
  const settings = deps.settings === undefined ? readSmtpSettings() : deps.settings;
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
