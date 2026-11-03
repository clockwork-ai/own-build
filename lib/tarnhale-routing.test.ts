import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore plain JS module
import middleware, { resolveTarnhale } from "../middleware.js";
// @ts-ignore plain JS module
import { TARNHALE_FILES } from "./tarnhale-files.js";
// @ts-ignore plain JS module
import { tarnhaleFiles } from "../scripts/tarnhale-manifest.mjs";

test("file manifest matches demos/tarnhale", async () => {
  assert.deepEqual([...TARNHALE_FILES], await tarnhaleFiles());
});

test("tarnhale paths resolve", () => {
  const cases: [string, object][] = [
    ["/", { rewrite: "/demos/tarnhale" }],
    ["/about", { rewrite: "/demos/tarnhale/about" }],
    ["/services", { rewrite: "/demos/tarnhale/services" }],
    ["/journal-barn-conversions", { rewrite: "/demos/tarnhale/journal-barn-conversions" }],
    ["/project-fell-house", { rewrite: "/demos/tarnhale/project-fell-house" }],
    ["/style.css", { rewrite: "/demos/tarnhale/style.css" }],
    ["/img/fh-hero.jpg", { rewrite: "/demos/tarnhale/img/fh-hero.jpg" }],
    ["/about.html", { redirect: "/about" }],
    ["/about/", { redirect: "/about" }],
    ["/index.html", { redirect: "/" }],
    ["/nope", { notFound: true }],
    ["/404", { notFound: true }],
    ["/how-it-works", { notFound: true }],
    ["/demos/aldwyn", { notFound: true }],
    ["/api/chat", { notFound: true }],
    ["/img/../../vercel.json", { notFound: true }],
    ["/demos/tarnhale/about", { pass: true }],
  ];
  for (const [p, want] of cases) assert.deepEqual(resolveTarnhale(p), want, p);
});

test("main host passes through untouched", async () => {
  for (const p of ["/", "/about", "/nope", "/demos/tarnhale"]) {
    const res = await middleware(new Request("https://clockworkai.app" + p, { headers: { host: "clockworkai.app" } }));
    assert.equal(res, undefined, p);
  }
});

test("tarnhale host rewrites", async () => {
  const res = await middleware(new Request("https://tarnhale.clockworkai.app/about", { headers: { host: "tarnhale.clockworkai.app" } }));
  assert.equal(res.headers.get("x-middleware-rewrite"), "https://tarnhale.clockworkai.app/demos/tarnhale/about");
});
