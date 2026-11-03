// Vercel Routing Middleware. Runs before the filesystem, so it can serve the
// Tarnhale demo on tarnhale.clockworkai.app even where the main site has a file
// at the same path (/, /about, 404s). Every other host passes straight through.
import { TARNHALE_FILES } from "./lib/tarnhale-files.js";

export const TARNHALE_HOST = "tarnhale.clockworkai.app";
const BASE = "/demos/tarnhale";
// Preview deployments only: ?tarnhale=1 sets this cookie so the preview URL
// behaves like the subdomain (?tarnhale=0 clears it). Ignored in production.
const PREVIEW_COOKIE = "th_preview_host";

export const config = { matcher: "/((?!_vercel/).*)" };

// Decide what a path on the Tarnhale host should serve.
// Returns { pass } | { redirect } | { rewrite } | { notFound }.
export function resolveTarnhale(pathname) {
  if (pathname === BASE || pathname.startsWith(BASE + "/")) return { pass: true };
  let p;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    return { notFound: true };
  }
  p = p.replace(/^\/+/, "");
  if (p.includes("..")) return { notFound: true };

  // Mirror cleanUrls: /about.html and /about/ go to /about.
  const clean = p.replace(/\/+$/, "").replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
  if (clean !== p) return { redirect: "/" + clean };

  if (p === "") return { rewrite: BASE };
  if (p === "404") return { notFound: true };
  if (TARNHALE_FILES.has(p + ".html")) return { rewrite: `${BASE}/${p}` };
  if (TARNHALE_FILES.has(p)) return { rewrite: `${BASE}/${p}` };
  return { notFound: true };
}

function isTarnhaleRequest(request, url) {
  const host = (request.headers.get("host") || url.host).split(":")[0].toLowerCase();
  if (host === TARNHALE_HOST) return true;
  if (process.env.VERCEL_ENV !== "preview") return false;
  return /(?:^|;\s*)th_preview_host=1(?:;|$)/.test(request.headers.get("cookie") || "");
}

const rewriteTo = (url) => new Response(null, { headers: { "x-middleware-rewrite": url.toString() } });

export default async function middleware(request) {
  const url = new URL(request.url);

  if (process.env.VERCEL_ENV === "preview" && url.searchParams.has("tarnhale")) {
    const on = url.searchParams.get("tarnhale") === "1";
    url.searchParams.delete("tarnhale");
    return new Response(null, {
      status: 307,
      headers: {
        location: url.pathname + url.search,
        "set-cookie": `${PREVIEW_COOKIE}=${on ? "1" : ""}; Path=/; Max-Age=${on ? 86400 : 0}; Secure; SameSite=Lax`,
        "cache-control": "no-store",
      },
    });
  }

  if (!isTarnhaleRequest(request, url)) return; // main site: untouched

  const r = resolveTarnhale(url.pathname);
  if (r.pass) return;
  if (r.redirect) return Response.redirect(new URL(r.redirect + url.search, url), 308);
  if (r.rewrite) return rewriteTo(new URL(r.rewrite + url.search, url));

  // Branded Tarnhale 404 with a real 404 status. Falls back to a plain rewrite
  // (status 200) if the fetch fails for any reason.
  const notFound = new URL(BASE + "/404", url);
  try {
    const headers = {};
    for (const h of ["cookie", "authorization", "x-vercel-protection-bypass"]) {
      const v = request.headers.get(h);
      if (v) headers[h] = v;
    }
    const res = await fetch(notFound, { headers });
    if (res.ok) {
      return new Response(request.method === "HEAD" ? null : res.body, {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate",
          "x-robots-tag": "noindex",
        },
      });
    }
  } catch {}
  return rewriteTo(notFound);
}
