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

test("the chat knowledge says the first three clients get 30% off with 2 spaces left", () => {
  const text = buildInstructions(business, "/services");
  assert.match(text, /The first three clients get 30% off, 2 spaces left/);
  assert.match(text, /there are 2 spaces left/);
  assert.doesNotMatch(text, /first five/);
  assert.doesNotMatch(text, /five clients/);
  assert.doesNotMatch(text, /5 clients/);
  assert.doesNotMatch(text, /how many of the five/);
});

test("the public widget config still has the button destinations", () => {
  const widget = publicWidget(business);
  assert.equal(widget.auditHref, "/clockwork-check");
  assert.equal(widget.suggestions.length, 3);
  assert.equal("rules" in widget, false);
  assert.equal("knowledge" in widget, false);
});
