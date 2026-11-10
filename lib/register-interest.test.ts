import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { business } from "./business.ts";
import { knownPage } from "./guard.ts";
import { validateRegisterInterest } from "./leads.ts";
import { buildLeadEmail } from "./mail.ts";

const good = {
  name: "Sam",
  trade: "Plumber",
  area: "Stockport",
  mobile: "07700 900123",
  email: "",
  website: "no",
  evenings: ["quotes", "paperwork"],
  notes: "",
};

test("register interest becomes a normal lead with source register-interest", () => {
  const result = validateRegisterInterest(good, "/register-interest");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.lead.source, "register-interest");
  assert.equal(result.lead.name, "Sam");
  assert.equal(result.lead.business, "Plumber");
  assert.equal(result.lead.page, "/register-interest");
  assert.match(result.lead.need, /Clockwork Flow early access/);
  assert.match(result.lead.need, /Works in Stockport/);
  assert.match(result.lead.need, /Has a website: No/);
  assert.match(result.lead.need, /quotes, paperwork/);
  assert.ok(result.lead.need.length <= 400);
  assert.match(result.lead.summary ?? "", /Area: Stockport/);
});

test("register interest needs every required answer", () => {
  const cases: [Record<string, unknown>, RegExp][] = [
    [{ ...good, name: "" }, /first name/],
    [{ ...good, trade: "" }, /trade/],
    [{ ...good, area: "" }, /town or area/],
    [{ ...good, mobile: "nope" }, /mobile number or an email/],
    [{ ...good, mobile: "", email: "not-an-email" }, /mobile number or an email/],
    [{ ...good, website: "maybe" }, /website/],
    [{ ...good, evenings: [] }, /quotes, chasing or paperwork/],
    [{ ...good, evenings: ["golf"] }, /quotes, chasing or paperwork/],
  ];
  for (const [input, error] of cases) {
    const result = validateRegisterInterest(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, error);
  }
});

test("mobile or email: either works, and both are kept", () => {
  const byEmail = validateRegisterInterest({ ...good, mobile: "", email: "sam@example.com" });
  assert.equal(byEmail.ok, true);
  if (byEmail.ok) assert.equal(byEmail.lead.contact, "sam@example.com");
  const both = validateRegisterInterest({ ...good, email: "sam@example.com" });
  assert.equal(both.ok, true);
  if (!both.ok) return;
  assert.equal(both.lead.contact, "07700 900123");
  assert.match(both.lead.need, /Email: sam@example\.com/);
  assert.match(both.lead.summary ?? "", /Email as well: sam@example\.com/);
});

test("long notes stay inside the 400 character need limit", () => {
  const result = validateRegisterInterest({ ...good, area: "x".repeat(200), notes: "y".repeat(500), evenings: ["quotes", "chasing", "paperwork"] });
  assert.equal(result.ok, true);
  if (result.ok) assert.ok(result.lead.need.length <= 400);
});

test("the notice email says it is a Clockwork Flow register interest, with the answers", () => {
  const result = validateRegisterInterest(good, "/register-interest");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const mail = buildLeadEmail("to@example.com", "from@example.com", result.lead, result.lead.summary ?? "");
  assert.equal(mail.subject, "New Clockwork Flow register interest: Sam");
  assert.match(mail.text, /Trade: Plumber/);
  assert.match(mail.text, /Register interest page \(Clockwork Flow early access\)/);
  assert.match(mail.text, /Their answers:\nRegister interest answers \(Clockwork Flow\):\nArea: Stockport/);
  assert.doesNotMatch(mail.text, /[–—]/);
});

test("chat leads keep their old email wording", () => {
  const mail = buildLeadEmail("to@example.com", "from@example.com", {
    name: "Jo", business: "Roofer", contact: "jo@example.com", need: "A website", source: "chat-form",
  }, "No transcript was included.");
  assert.equal(mail.subject, "New chat lead: Jo");
  assert.match(mail.text, /What they need: A website/);
  assert.match(mail.text, /How it arrived: Details form/);
});

test("the page is known to the lead route, the sitemap and the menu", () => {
  assert.equal(knownPage("/register-interest", business.pages), "/register-interest");
  assert.match(readFileSync("sitemap.xml", "utf8"), /<loc>https:\/\/clockworkai\.app\/register-interest<\/loc>/);
  assert.match(readFileSync("pages.js", "utf8"), /\['\/register-interest', 'Register interest'/);
});

test("the demo link is not in the public page, only sent back after a save", () => {
  const html = readFileSync("register-interest.html", "utf8");
  assert.doesNotMatch(html, /jobflow/i);
  assert.doesNotMatch(html, /[–—]/);
  assert.doesNotMatch(html, /wa\.me/);
  const server = readFileSync("server/chat.ts", "utf8");
  assert.match(server, /REGISTER_INTEREST_DEMO = "https:\/\/clockwork-ai-jobflow\.vercel\.app"/);
});
