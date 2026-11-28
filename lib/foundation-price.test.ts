// Pins the Foundation price line Callum approved on 27 Nov 2026, and keeps the chat from quoting it.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { business } from "./business.ts";

const line = "Foundation is £99 a month, with a 12-month minimum, £1,188 in total. No VAT added. Growth and Autopilot are priced on your call. The price you pay is the one in your written agreement.";

function read(name: string): string {
  return readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
}

test("the approved Foundation line is on the terms page, both services price lines, and the homepage FAQ", () => {
  const terms = read("terms.html");
  const services = read("services.html");
  const home = read("index.html");
  assert.equal(terms.split(line).length - 1, 1);
  assert.equal(services.split(line).length - 1, 4);
  assert.equal(home.split(line).length - 1, 2);
  assert.match(terms, /put in writing before I start\. Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\./);
  assert.doesNotMatch(terms, /These website terms don't publish a price/);
  assert.match(services, /<p>Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\. Built for trades first/);
  assert.match(services, /<summary>What does it cost\?<\/summary><p>Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\. The first conversation is free\.<\/p>/);
  assert.match(home, /<summary>What does it cost\?<\/summary><p>Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\. You know the full cost before anything starts\.<\/p>/);
  assert.doesNotMatch(services, /No prices here|I don't publish plan prices here|Fixed setup plus a simple monthly plan, priced on your call/);
  assert.doesNotMatch(home, /priced on your free call/);
  const foundationCard = services.slice(services.indexOf(">Foundation<"), services.indexOf(">Growth<"));
  assert.doesNotMatch(foundationCard, /Prices on your free call/);
  assert.match(services.slice(services.indexOf(">Growth<"), services.indexOf(">Autopilot<")), /Prices on your free call/);
  assert.match(services.slice(services.indexOf(">Autopilot<")), /Prices on your free call/);
  assert.match(home, /<h3>Pick a plan<\/h3><p>Foundation is £99 a month, with a 12-month minimum, £1,188 in total\. No VAT added\. Growth and Autopilot are priced on your call\. The price you pay is the one in your written agreement\. No surprises after\.<\/p>/);
  for (const page of ["roofers.html", "plumbers.html", "electricians.html", "landscapers.html"]) {
    const html = read(page);
    assert.equal(html.split(line).length - 1, 2, page);
    assert.doesNotMatch(html, /Fixed setup plus a simple monthly plan, priced on your call|No prices on this page|Prices on your free call/);
  }
  for (const page of ["book.html", "about.html", "clockwork-check.html", "made-to-measure.html", "missed-calls.html"]) {
    assert.ok(read(page).includes(line), page);
  }
  assert.match(read("missed-calls.html"), /Growth and Autopilot\. Prices on your free call/);
});

test("the chat still cannot quote the Foundation price", () => {
  assert.deepEqual(business.allowedPrices, []);
  const source = read("lib/business.ts");
  assert.match(source, /allowedPrices: \[\],/);
  assert.match(source, /Never quote a price/);
});
