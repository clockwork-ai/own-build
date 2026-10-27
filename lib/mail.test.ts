import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer as createTlsServer } from "node:tls";
import { test } from "node:test";
import {
  SmtpReader,
  buildLeadEmail,
  emailLead,
  leadEmailSource,
  readSmtpSettings,
  sendSmtpMail,
  submitSmtp,
  summariseTranscript,
  type LeadEmail,
  type SmtpSettings,
} from "./mail.ts";

const lead = {
  name: "Ada\u2013Test",
  business: "Test Roofing",
  contact: "ada@example.com",
  need: "TEST lead. A website\u2014and reviews.",
  page: "/services.html",
  source: "chat-tool" as const,
};

test("the email names the lead and keeps dashes out of the copy", () => {
  const mail = buildLeadEmail(
    "callum@getclockworkai.com",
    "callum@getclockworkai.com",
    lead,
    "Visitor: 3\u20135 calls\nAssistant: The missed-call calculator can help.",
  );
  assert.equal(mail.subject, "New chat lead: Ada, Test");
  assert.match(mail.text, /Name: Ada, Test/);
  assert.match(mail.text, /Business: Test Roofing/);
  assert.match(mail.text, /Contact: ada@example.com/);
  assert.match(mail.text, /What they need: TEST lead. A website, and reviews./);
  assert.match(mail.text, /Page: \/services.html/);
  assert.match(mail.text, /How it arrived: Chat/);
  assert.match(mail.text, /Visitor: 3 to 5 calls\nAssistant: The missed-call calculator can help./);
  assert.equal(mail.replyTo, "ada@example.com");
  assert.doesNotMatch(`${mail.subject}\n${mail.text}`, /[\u2013\u2014]/);
});

test("a phone contact does not become a reply address", () => {
  const mail = buildLeadEmail("callum@getclockworkai.com", "callum@getclockworkai.com", {
    ...lead,
    name: "Sam",
    contact: "07460 038202",
    need: "A roofing site",
    source: "chat-form",
  }, "No transcript was included.");
  assert.equal(mail.replyTo, undefined);
  assert.match(mail.text, /How it arrived: Details form/);
  assert.match(mail.text, /Contact: 07460 038202/);
});

test("the transcript summary keeps the latest turns only", () => {
  const turns = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `turn ${index}`,
  }));
  const summary = summariseTranscript(turns);
  assert.equal(summary.includes("turn 0"), false);
  assert.equal(summary.includes("turn 1"), false);
  assert.match(summary, /Visitor: turn 8/);
  assert.match(summary, /Assistant: turn 9/);
  assert.equal(summariseTranscript([]), "No transcript was included.");
  assert.equal(summariseTranscript("nope"), "No transcript was included.");
});

test("SMTP settings come from the mailbox and the app password", () => {
  assert.equal(readSmtpSettings({}), null);
  assert.equal(readSmtpSettings({ LEAD_SMTP_USER: "not-an-email", LEAD_SMTP_PASSWORD: "abcdefghijklmnop" }), null);
  const settings = readSmtpSettings({
    LEAD_SMTP_USER: " callum@getclockworkai.com ",
    LEAD_SMTP_PASSWORD: "abcd efgh ijkl mnop",
  });
  assert.deepEqual(settings, {
    host: "smtp.gmail.com",
    port: 465,
    user: "callum@getclockworkai.com",
    pass: "abcdefghijklmnop",
  });
});

test("a missing password does not throw and does not send", async () => {
  let called = false;
  const sent = await emailLead("callum@getclockworkai.com", lead, "Visitor: hello", {
    settings: null,
    send: async () => {
      called = true;
    },
  });
  assert.equal(sent, false);
  assert.equal(called, false);
});

test("a failed send leaves the lead path intact", async () => {
  const settings: SmtpSettings = {
    host: "smtp.gmail.com",
    port: 465,
    user: "callum@getclockworkai.com",
    pass: "secret-pass",
  };
  const sent = await emailLead("callum@getclockworkai.com", lead, "Visitor: hello", {
    settings,
    send: async () => {
      throw new Error("smtp 535 secret-pass");
    },
  });
  assert.equal(sent, false);
});

test("the SMTP conversation authenticates and sends the subject", async () => {
  const settings: SmtpSettings = {
    host: "smtp.gmail.com",
    port: 465,
    user: "callum@getclockworkai.com",
    pass: "app-password",
  };
  const mail: LeadEmail = buildLeadEmail(settings.user, settings.user, { ...lead, name: "Ada Test" }, "Visitor: hello");
  const commands: string[] = [];
  const replies = [220, 250, 235, 250, 250, 354, 250];
  await submitSmtp(
    async () => ({ code: replies.shift() ?? 0, text: "" }),
    (command) => commands.push(command),
    settings,
    mail,
  );
  assert.equal(commands[0], "EHLO clockworkai.app");
  assert.match(commands[1], /^AUTH PLAIN /);
  assert.equal(
    Buffer.from(commands[1].slice("AUTH PLAIN ".length), "base64").toString("utf8"),
    "\0callum@getclockworkai.com\0app-password",
  );
  assert.equal(commands[2], "MAIL FROM:<callum@getclockworkai.com>");
  assert.equal(commands[3], "RCPT TO:<callum@getclockworkai.com>");
  assert.equal(commands[4], "DATA");
  assert.match(commands[5], /Subject: New chat lead: Ada Test/);
  assert.match(commands[5], /What they need: TEST lead. A website, and reviews./);
  assert.doesNotMatch(commands[5], /[\u2013\u2014]/);
  assert.match(commands[5], /\r\n\.$/);
  assert.equal(commands[6], "QUIT");
});

test("the reader accepts a greeting split across chunks", async () => {
  const socket = new EventEmitter();
  const reader = new SmtpReader(socket);
  const pending = reader.reply();
  socket.emit("data", Buffer.from("220 smtp.gmail.com"));
  socket.emit("data", Buffer.from(" ESMTP\r\n250-SIZE 100\r\n"));
  const first = await pending;
  assert.equal(first.code, 220);
  const second = reader.reply();
  socket.emit("data", Buffer.from("250 AUTH PLAIN\r\n"));
  assert.equal((await second).code, 250);
});

test("a local SMTP server receives the lead email", async () => {
  const dir = mkdtempSync(join(tmpdir(), "cw-smtp-"));
  const key = join(dir, "key.pem");
  const cert = join(dir, "cert.pem");
  const made = spawnSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-keyout", key, "-out", cert,
    "-days", "1", "-nodes", "-subj", "/CN=localhost",
  ]);
  assert.equal(made.status, 0);
  const received: string[] = [];
  const server = createTlsServer({ key: readFileSync(key), cert: readFileSync(cert) }, (socket) => {
    socket.write("220 localhost ESMTP\r\n");
    let buffer = "";
    let dataMode = false;
    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (!dataMode) {
        const lines = buffer.split("\r\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("EHLO")) socket.write("250 AUTH PLAIN\r\n");
          else if (line.startsWith("AUTH")) socket.write("235 ok\r\n");
          else if (line.startsWith("MAIL FROM") || line.startsWith("RCPT TO")) socket.write("250 ok\r\n");
          else if (line === "DATA") {
            dataMode = true;
            socket.write("354 go\r\n");
          } else if (line === "QUIT") socket.write("221 bye\r\n");
        }
        return;
      }
      received.push(buffer);
      if (buffer.endsWith("\r\n.\r\n")) {
        dataMode = false;
        buffer = "";
        socket.write("250 queued\r\n");
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no port");
  const mail = buildLeadEmail("callum@getclockworkai.com", "callum@getclockworkai.com", {
    ...lead,
    name: "Preview Test",
    need: "TEST lead from the local SMTP check",
  }, "Visitor: hello");
  try {
    await sendSmtpMail(
      { host: "127.0.0.1", port: address.port, user: "callum@getclockworkai.com", pass: "app-password" },
      mail,
      { rejectUnauthorized: false },
    );
  } finally {
    server.close();
  }
  const body = received.join("");
  assert.match(body, /Subject: New chat lead: Preview Test/);
  assert.match(body, /TEST lead from the local SMTP check/);
  assert.match(body, /Visitor: hello/);
});

test("dot stuffing protects a transcript line", () => {
  const source = leadEmailSource({
    from: "callum@getclockworkai.com",
    to: "callum@getclockworkai.com",
    subject: "New chat lead: Ada",
    text: "Recent messages:\n.hidden",
  });
  assert.match(source, /\r\n\.\.hidden\r\n/);
});
