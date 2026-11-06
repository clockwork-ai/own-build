import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore plain JS module
import middleware, { resolveDemo, resolveTarnhale } from "../middleware.js";
// @ts-ignore plain JS module
import { DEMO_SITES } from "./demo-sites.js";
// @ts-ignore plain JS module
import { demoSites } from "../scripts/demo-sites.mjs";

type Site = { name: string; host: string; files: string[] };

test("demo sites manifest matches demos/*/site.json", async () => {
  assert.deepEqual(DEMO_SITES, await demoSites());
});

test("every demo host is a unique clockworkai.app subdomain, never tarnhale or the main site", () => {
  const hosts = (DEMO_SITES as Site[]).map((s) => s.host);
  assert.equal(new Set(hosts).size, hosts.length);
  for (const h of hosts) {
    assert.match(h, /^[a-z0-9-]+\.clockworkai\.app$/);
    assert.notEqual(h, "tarnhale.clockworkai.app");
  }
});

for (const site of DEMO_SITES as Site[]) {
  const base = `/demos/${site.name}`;
  test(`${site.name}: paths resolve like Tarnhale's`, () => {
    assert.ok(site.files.includes("index.html") && site.files.includes("404.html"), "needs index.html and 404.html");
    assert.deepEqual(resolveDemo(site.name, "/"), { rewrite: base });
    const page = site.files.find((f) => f.endsWith(".html") && f !== "index.html" && f !== "404.html")!;
    const clean = page.replace(/\.html$/, "");
    assert.deepEqual(resolveDemo(site.name, "/" + clean), { rewrite: `${base}/${clean}` });
    assert.deepEqual(resolveDemo(site.name, "/" + page), { redirect: "/" + clean });
    const asset = site.files.find((f) => !f.endsWith(".html"))!;
    assert.deepEqual(resolveDemo(site.name, "/" + asset), { rewrite: `${base}/${asset}` });
    assert.deepEqual(resolveDemo(site.name, "/404"), { notFound: true });
    assert.deepEqual(resolveDemo(site.name, "/how-it-works"), { notFound: true });
    assert.deepEqual(resolveDemo(site.name, "/api/chat"), { notFound: true });
    assert.deepEqual(resolveDemo(site.name, "/img/../../vercel.json"), { notFound: true });
    assert.deepEqual(resolveDemo(site.name, `${base}/index.html`), { pass: true });
  });

  test(`${site.name}: its host rewrites into its own folder only`, async () => {
    const res = await middleware(new Request(`https://${site.host}/`, { headers: { host: site.host } }));
    assert.equal(res.headers.get("x-middleware-rewrite"), `https://${site.host}${base}`);
  });
}

test("main host and Tarnhale are unchanged", async () => {
  for (const p of ["/", "/about", "/nope"]) {
    const res = await middleware(new Request("https://clockworkai.app" + p, { headers: { host: "clockworkai.app" } }));
    assert.equal(res, undefined, p);
  }
  assert.deepEqual(resolveTarnhale("/"), { rewrite: "/demos/tarnhale" });
  const res = await middleware(new Request("https://tarnhale.clockworkai.app/about", { headers: { host: "tarnhale.clockworkai.app" } }));
  assert.equal(res.headers.get("x-middleware-rewrite"), "https://tarnhale.clockworkai.app/demos/tarnhale/about");
});

test("an unknown demo name resolves to not found", () => {
  assert.deepEqual(resolveDemo("no-such-demo", "/"), { notFound: true });
});
