import assert from "node:assert/strict";
import { test } from "node:test";
import { business } from "./business.ts";
import { buildInstructions, publicWidget } from "./prompt.ts";

test("the model is not handed a web address or a page path", () => {
  const text = buildInstructions(business, "/services.html");
  assert.equal(text.includes(".html"), false);
  assert.equal(text.includes("https://"), false);
  assert.equal(text.includes("http://"), false);
  assert.equal(text.includes("cal.com"), false);
  assert.equal(text.includes("wa.me"), false);
  assert.match(text, /the services page/);
  assert.match(text, /Never write a URL/);
  assert.match(text, /with 4 a day filled in/);
  assert.match(text, /07460 038202/);
  assert.match(text, /content day/);
  assert.match(text, /12th monthly payment/);
  assert.doesNotMatch(text, /8-Week/);
  assert.doesNotMatch(text, /[\u2013\u2014]/);
});

test("the public widget config still has the button destinations", () => {
  const widget = publicWidget(business);
  assert.equal(widget.auditHref, "/clockwork-check");
  assert.equal(widget.suggestions.length, 3);
  assert.equal("rules" in widget, false);
  assert.equal("knowledge" in widget, false);
});
