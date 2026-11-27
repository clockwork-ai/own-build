import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// The unit test job is node:test on ubuntu-latest. Chrome is not installed
// there, so this file cannot measure scrollWidth. It pins the rule that a
// headless check at 390x844 measured.
//
// Before: plumbers documentElement.scrollWidth 410, clientWidth 390.
// The Brookstop button (white-space: nowrap) was 389.6px wide and started
// 20px in, so its right edge was at 409.6. That is the 20px sideways scroll.
// After: scrollWidth 390. The same pass over the other public pages was
// already 390, including electricians, landscapers and roofers. Their
// call to action labels are shorter than the column, so the shared nowrap
// rule did not push them past the screen. The phone override still covers
// those buttons.

const css = readFileSync(new URL("../pages.css", import.meta.url), "utf8");
const read = (name: string) => readFileSync(new URL(`../${name}.html`, import.meta.url), "utf8");

const phoneStart = css.indexOf(".phero { min-height: auto");
const phoneEnd = css.indexOf("@media (max-width: 400px)");
const phone = css.slice(phoneStart, phoneEnd);

test("phone call to action labels wrap instead of widening the page", () => {
  assert.ok(phoneStart > 0 && phoneEnd > phoneStart);
  assert.match(phone, /\.cta-row \.btn \{ white-space: normal; text-align: center; max-width: 100%; \}/);
  assert.doesNotMatch(phone, /overflow-x:\s*hidden/);
  assert.match(css, /\.btn \{[^}]*white-space: nowrap/);
});

test("the plumbers label is the long one and the copy is unchanged", () => {
  const plumbers = "Open the Brookstop Plumbing & Heating site";
  const electricians = "Open the Ginnel Electrical site";
  const landscapers = "Open the Marlbrow site";
  assert.ok(read("plumbers").includes(plumbers.replace("&", "&amp;")));
  assert.ok(read("electricians").includes(electricians));
  assert.ok(read("landscapers").includes(landscapers));
  assert.ok(plumbers.length > electricians.length);
  assert.ok(electricians.length > landscapers.length);
  assert.doesNotMatch(read("roofers"), />Open the [^<]*site/);
});
