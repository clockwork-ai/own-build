// Writes the homepage switches into public/index.html at build time:
//   {{HERO_H1}}            the live headline
//   {{CHECK_HREF}}         the Website Check target, {{CHECK_TARGET}} its target/rel attributes
//   <!-- dale:on --> ... <!-- /dale:on -->    kept only when DALE_ON
//   <!-- dale:off --> ... <!-- /dale:off -->  kept only when DALE_ON is false
//   {{DP_RATING}} {{DP_COUNT}}   Dale's live Which? figures; the block marked <!-- which --> ... <!-- /which -->
//                                is dropped if they can't be read
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cfg from "./home-config.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function checkTarget(c = cfg) {
  const t = c.CHECK_TARGETS[c.CHECK_MODE] ?? c.CHECK_TARGETS.call;
  return { href: t.href, attrs: t.newTab ? ' target="_blank" rel="noopener"' : "" };
}

/** "5.0 from 143 reviews" as shown on Dale's live homepage, or null. */
export function parseWhich(html) {
  const m = String(html).match(/\b([0-5]\.\d) from (\d{1,5}) reviews\b/);
  return m ? { rating: m[1], count: m[2] } : null;
}

export async function fetchWhich(url = cfg.DALE_LIVE_URL, fetchFn = fetch) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetchFn(url, { signal: ctrl.signal, headers: { "User-Agent": "clockworkai.app build" } });
    clearTimeout(t);
    return res.ok ? parseWhich(await res.text()) : null;
  } catch {
    return null;
  }
}

const block = (html, name, keep) =>
  html.replace(new RegExp(`<!-- ${name} -->([\\s\\S]*?)<!-- /${name} -->`, "g"), (_, inner) => (keep ? inner : ""));

export function renderHome(html, { daleOn, headline, check, which, town }) {
  let out = block(html, "dale:on", daleOn);
  out = block(out, "dale:off", !daleOn);
  out = block(out, "which", !!which);
  out = block(out, "town", !!town);
  return out
    .replaceAll("{{HERO_H1}}", esc(headline))
    .replaceAll("{{CHECK_HREF}}", esc(check.href))
    .replaceAll("{{CHECK_TARGET}}", check.attrs)
    .replaceAll("{{DP_RATING}}", esc(which?.rating ?? ""))
    .replaceAll("{{DP_COUNT}}", esc(which?.count ?? ""))
    .replaceAll("{{DP_TOWN}}", esc(town ?? ""));
}

export async function buildHome(publicDir, c = cfg) {
  const file = path.join(publicDir, "index.html");
  const which = c.DALE_ON ? await fetchWhich(c.DALE_LIVE_URL) : null;
  const html = renderHome(await readFile(file, "utf8"), {
    daleOn: c.DALE_ON, headline: c.HEADLINES[c.HEADLINE] ?? c.HEADLINES.A, check: checkTarget(c), which, town: c.DALE_JOB_TOWN,
  });
  await writeFile(file, html);
  const daleDir = path.join(publicDir, "assets", "dale");
  await rm(daleDir, { recursive: true, force: true });
  if (c.DALE_ON) {
    await mkdir(daleDir, { recursive: true });
    for (const [name, url] of Object.entries(c.DALE_ASSETS)) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Dale asset ${name} could not be fetched (${res.status})`);
      await writeFile(path.join(daleDir, name), Buffer.from(await res.arrayBuffer()));
    }
  }
  console.log(`home: headline ${c.HEADLINE}, check ${c.CHECK_MODE}, dale ${c.DALE_ON ? "on" : "off"}${c.DALE_ON ? `, which ${which ? `${which.rating} from ${which.count}` : "not read, left off"}` : ""}`);
}
