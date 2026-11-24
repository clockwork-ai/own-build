// Demo pages are opened at /demos/<name> with the trailing slash removed.
// vercel.json sets cleanUrls and trailingSlash false for the whole site, so a
// relative asset on that URL resolves in /demos/ and 404s. The preload scanner
// does not run scripts, so document.write alone still lets it request
// /demos/style.css. Each page therefore also has a static base element for
// that scanner. The script writes its base first, and the first base wins:
// /demos/<name>/ on that path, and / on a demo subdomain (or a preview with
// ?demo=<name>), so subdomain links stay at /about. This test fails if any
// demo page still loads an asset, font, fetch or in-site link by a relative
// URL that would break on the no-slash path.
import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const demosDir = path.join(root, "demos");

function baseScript(name: string) {
  return `<script>document.write('<base href="'+(location.pathname.indexOf('/demos/${name}')===0?'/demos/${name}/':'/')+'">')</script>`;
}

// Same choice the inline script makes. Pathname on the main site starts with
// /demos/<name>. On the subdomain, and on a preview rewrite, it does not.
export function demoBaseHref(pathname: string, name: string) {
  return pathname.indexOf(`/demos/${name}`) === 0 ? `/demos/${name}/` : "/";
}

function isPathRelative(url: string) {
  const t = url.trim();
  if (!t || t.startsWith("#") || t.startsWith("?") || t.startsWith("/")) return false;
  if (t.startsWith("data:") || t.startsWith("mailto:") || t.startsWith("tel:") || t.startsWith("javascript:")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return false;
  return true;
}

function quotedAttrs(html: string, names: string[]) {
  const out: { index: number; name: string; value: string }[] = [];
  const re = new RegExp(`\\b(${names.join("|")})\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi");
  for (const m of html.matchAll(re)) {
    out.push({ index: m.index ?? 0, name: m[1].toLowerCase(), value: m[3] ?? m[4] ?? "" });
  }
  return out;
}

function candidates(name: string, value: string) {
  if (name === "srcset" || name === "imagesrcset") {
    return value.split(",").map((part) => part.trim().split(/\s+/)[0] || "").filter(Boolean);
  }
  return [value];
}

async function walk(dir: string, rel = ""): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), r)));
    else out.push(r);
  }
  return out;
}

function localFile(demo: string, url: URL) {
  const prefix = `/demos/${demo}/`;
  assert.ok(url.pathname.startsWith(prefix), url.pathname);
  let rel = decodeURIComponent(url.pathname.slice(prefix.length));
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  if (!path.posix.extname(rel)) rel += ".html";
  return rel;
}

async function assertExists(demo: string, rel: string, from: string) {
  const file = path.join(demosDir, demo, rel);
  try {
    await access(file);
  } catch {
    assert.fail(`${from} resolves to demos/${demo}/${rel}, which is not a file`);
  }
}

const names = (await readdir(demosDir, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && !e.name.startsWith("."))
  .map((e) => e.name)
  .sort();

test("easy damp PDF book and deposit links stay on the demo, not its parent folder", async () => {
  const src = await readFile(path.join(demosDir, "easy-damp", "report.js"), "utf8");
  const built = src.match(/var base = ([^;]+);/);
  assert.ok(built, "report.js must set the PDF link base");
  assert.doesNotMatch(
    built[1],
    /pathname\.replace\(\s*\/\[\^\/\]\*\$\//,
    "that replace drops the last path segment, so the links point at /demos/",
  );
  const baseFor = (pathname: string) =>
    new Function("location", `return (${built[1]});`)({ origin: "https://clockworkai.app", pathname }) as string;
  // The live page, the slash address, and index.html. The slash and index.html
  // addresses redirect to /demos/easy-damp before this script runs. If they
  // did not, origin + pathname would still stay under the demo, not /demos/.
  for (const pathname of ["/demos/easy-damp", "/demos/easy-damp/", "/demos/easy-damp/index.html"]) {
    for (const hash of ["#book", "#deposit"]) {
      const link = new URL(baseFor(pathname) + hash);
      assert.equal(link.hash, hash);
      assert.ok(link.pathname.startsWith("/demos/easy-damp"), link.href);
      assert.notEqual(link.pathname.replace(/\/+$/, ""), "/demos");
    }
  }
  const book = new URL(baseFor("/demos/easy-damp") + "#book");
  const deposit = new URL(baseFor("/demos/easy-damp") + "#deposit");
  assert.equal(book.pathname + book.hash, "/demos/easy-damp#book");
  assert.equal(deposit.pathname + deposit.hash, "/demos/easy-damp#deposit");
});

test("site-wide trailing slash stays off", async () => {
  const cfg = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
  assert.equal(cfg.trailingSlash, false);
  assert.equal(cfg.cleanUrls, true);
});

test("demo base href: folder on /demos/<name>, site root on a subdomain path", () => {
  for (const name of names) {
    assert.equal(demoBaseHref(`/demos/${name}`, name), `/demos/${name}/`);
    assert.equal(demoBaseHref(`/demos/${name}/`, name), `/demos/${name}/`);
    assert.equal(demoBaseHref(`/demos/${name}/about`, name), `/demos/${name}/`);
    assert.equal(demoBaseHref("/", name), "/");
    assert.equal(demoBaseHref("/about", name), "/");
    const onSite = new URL("style.css", `https://clockworkai.app${demoBaseHref(`/demos/${name}`, name)}`);
    assert.equal(onSite.pathname, `/demos/${name}/style.css`);
    const onSub = new URL("about", `https://${name}.clockworkai.app${demoBaseHref("/services", name)}`);
    assert.equal(onSub.pathname, "/about");
  }
  for (const name of names) {
    for (const other of names) {
      if (other === name) continue;
      assert.ok(!other.startsWith(name), `${name} is a prefix of ${other}, so the base script would pick the wrong folder`);
    }
  }
});

for (const name of names) {
  test(`${name}: relative assets survive /demos/${name} with no trailing slash`, async () => {
    const files = await walk(path.join(demosDir, name));
    const pages = files.filter((f) => f.endsWith(".html"));
    assert.ok(pages.includes("index.html"), "needs index.html");
    const script = baseScript(name);
    const staticBase = `<base href="/demos/${name}/">`;
    const bare = `https://clockworkai.app/demos/${name}`;
    const fixedBase = `https://clockworkai.app${demoBaseHref(`/demos/${name}`, name)}`;

    for (const page of pages) {
      const html = await readFile(path.join(demosDir, name, page), "utf8");
      const at = html.indexOf(script);
      assert.notEqual(at, -1, `${page} is missing the demo base script`);
      assert.equal(html.indexOf(script, at + 1), -1, `${page} has the base script twice`);
      const atStatic = html.indexOf(staticBase);
      assert.ok(atStatic > at, `${page} needs a static base after the script so the preload scanner has a base, and the script stays first`);
      assert.equal(html.indexOf(staticBase, atStatic + staticBase.length), -1, `${page} has two static bases`);

      const attrs = quotedAttrs(html, ["href", "src", "poster", "srcset", "imagesrcset"]);
      for (const attr of attrs) {
        if (attr.index >= at && attr.index < at + script.length) continue;
        if (attr.index >= atStatic && attr.index < atStatic + staticBase.length) continue;
        for (const raw of candidates(attr.name, attr.value)) {
          if (!isPathRelative(raw)) continue;
          assert.ok(attr.index > atStatic, `${page} uses relative ${attr.name}="${raw}" before the static base`);
          const broken = new URL(raw, bare);
          const fixed = new URL(raw, fixedBase);
          assert.ok(
            !broken.pathname.startsWith(`/demos/${name}/`),
            `${page} ${raw} already resolves inside the demo without a base (${broken.pathname}), so a missing base would not be caught`,
          );
          const rel = localFile(name, fixed);
          await assertExists(name, rel, `${page} ${attr.name}="${raw}"`);
        }
      }
    }

    for (const file of files.filter((f) => f.endsWith(".js"))) {
      const text = await readFile(path.join(demosDir, name, file), "utf8");
      const refs: string[] = [];
      for (const m of text.matchAll(/(?:fetch|loadImg)\(\s*(["'])([^"']+)\1\s*\)/g)) refs.push(m[2]);
      for (const m of text.matchAll(/\bsrc\s*:\s*(["'])([^"']+)\1/g)) refs.push(m[2]);
      for (const m of text.matchAll(/fetch\(\s*(["'])([^"']+)\1\s*\+\s*[A-Za-z_$][\w$]*\s*\+\s*(["'])([^"']+)\3\s*\)/g)) {
        const before = text.slice(Math.max(0, (m.index ?? 0) - 400), m.index ?? 0);
        const maps = [...before.matchAll(/\[[^\[\]]*\]\s*\.map/g)];
        const array = maps.at(-1);
        assert.ok(array, `${file} builds a fetch URL from pieces but the weights are not in the .map before it`);
        const parts = [...array[0].matchAll(/(["'])([^"']+)\1/g)].map((p) => p[2]);
        assert.ok(parts.length > 0, `${file} fetch has no weight list`);
        for (const part of parts) refs.push(m[2] + part + m[4]);
      }
      for (const raw of refs) {
        if (!isPathRelative(raw)) continue;
        const broken = new URL(raw, bare);
        const fixed = new URL(raw, fixedBase);
        assert.ok(!broken.pathname.startsWith(`/demos/${name}/`), `${file} ${raw} would not 404 without a base`);
        const rel = localFile(name, fixed);
        await assertExists(name, rel, `${file} ${raw}`);
      }
    }

    for (const file of files.filter((f) => f.endsWith(".css"))) {
      const text = await readFile(path.join(demosDir, name, file), "utf8");
      const sheet = `https://clockworkai.app/demos/${name}/${file}`;
      for (const m of text.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]+))\s*\)/g)) {
        const raw = m[1] ?? m[2] ?? m[3] ?? "";
        if (!raw || raw.startsWith("data:") || raw.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
        if (!isPathRelative(raw)) continue;
        const resolved = new URL(raw, sheet);
        const rel = localFile(name, resolved);
        await assertExists(name, rel, `${file} url(${raw})`);
      }
    }
  });
}
