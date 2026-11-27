import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { business } from "./business.ts";
import * as cfg from "../scripts/home-config.mjs";
import { checkTarget, renderHome } from "../scripts/home-build.mjs";

/**
 * Assembles the HTML the build publishes. Pages are copied as they stand,
 * and the homepage is rendered the same way the build writes it. Fails if
 * a removed contact string is still in a page or in the chat knowledge.
 * The pieces are joined here
 * so this file does not contain them, and the existing repo-wide scan
 * does not trip on it.
 */
const channel = ["what", "sapp"].join("");
const shortLink = ["wa", "me"].join(".");
const oldDigits = "0735" + "9";

const root = path.resolve(import.meta.dirname, "..");
const skip = new Set(["api", "lib", "server", "scripts", "node_modules", "public"]);

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === root && skip.has(entry.name)) continue;
      out.push(...htmlFiles(full));
    } else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function pageHtml(file: string): string {
  const rel = path.relative(root, file);
  if (rel === "index.html") {
    const headline = cfg.HEADLINES[cfg.HEADLINE as keyof typeof cfg.HEADLINES] ?? cfg.HEADLINES.A;
    return renderHome(fs.readFileSync(file, "utf8"), {
      daleOn: cfg.DALE_ON,
      headline,
      check: checkTarget(),
      which: cfg.DALE_ON ? { rating: "5.0", count: "142" } : null,
      town: cfg.DALE_JOB_TOWN,
    });
  }
  return fs.readFileSync(file, "utf8");
}

function hitsIn(rel: string, html: string): string[] {
  const hits: string[] = [];
  html.split("\n").forEach((line, index) => {
    const folded = line.toLowerCase();
    if (folded.includes(channel) || folded.includes(shortLink) || line.includes(oldDigits)) {
      hits.push(`${rel}:${index + 1}`);
    }
  });
  return hits;
}

test("built pages do not contain the removed contact strings", () => {
  const hits = htmlFiles(root).flatMap((file) => hitsIn(path.relative(root, file), pageHtml(file)));
  const built = path.join(root, "public");
  if (fs.existsSync(built)) {
    hits.push(...htmlFiles(built).flatMap((file) => hitsIn(path.relative(root, file), fs.readFileSync(file, "utf8"))));
  }
  for (const rel of ["lib/business.ts", "api/chat.js"]) {
    hits.push(...hitsIn(rel, fs.readFileSync(path.join(root, rel), "utf8")));
  }
  assert.deepEqual(hits, []);
});

const contactRule = "Evenings are fine. The person on the call is Callum";
const howCost = "Photos and questions hard to find, jobs priced late";
const servicesList = "Photos and postcodes land in one list per customer, not lost in forty chats.";

test("the contact rule and the one list lines are pinned, and forty chats is off how it works and roofers", () => {
  assert.ok(business.knowledge.includes(contactRule));
  const pages = new Map(htmlFiles(root).map((file) => [path.relative(root, file), pageHtml(file)]));
  const how = pages.get("how-it-works.html") ?? "";
  const roofers = pages.get("roofers.html") ?? "";
  const services = pages.get("services.html") ?? "";
  assert.ok(how.includes(howCost));
  assert.ok(services.includes(servicesList));
  assert.equal(how.includes("forty chats"), false);
  assert.equal(roofers.includes("forty chats"), false);
});
