import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { readClockworkPhone, websiteCheckStopLine } from "./clockwork-number.ts";

/**
 * Lyme Plumbing's number must not appear on Clockwork, in any of the
 * spacings people write, and neither should a WhatsApp short link. The
 * pieces are joined here so this file does not contain the number itself.
 */
const head = "0735" + "9";
const mid = "73" + "59";
const tail = "838" + "866";
const national = head + tail;
const international = "44" + mid + tail;
const wa = ["wa", "me"].join(".");
const numberRe = new RegExp(
  `${head}[\\s().-]*${tail}|\\+?0*44[\\s().-]*${mid}[\\s().-]*${tail}`,
  "i",
);
const waRe = new RegExp(wa.replace(".", "\\."), "i");

const root = path.resolve(import.meta.dirname, "..");
const self = path.join(root, "lib", "lyme-number.test.ts");
const skipDir = new Set(["node_modules", ".git"]);
const binary = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".woff", ".woff2", ".pdf", ".mp4", ".webm", ".zip",
]);

function trackedFiles(): string[] {
  const listed = execFileSync("git", ["ls-files", "-z"], { cwd: root });
  return listed.toString("utf8").split("\0").filter(Boolean).map((rel) => path.join(root, rel));
}

function filesUnder(dir: string, skip: Set<string>): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(full, skip));
    else if (!binary.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function offending(file: string): string[] {
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  if (text.includes("\u0000")) return [];
  const found: string[] = [];
  text.split("\n").forEach((line, index) => {
    const digits = line.replace(/\D/g, "");
    if (numberRe.test(line) || digits.includes(national) || digits.includes(international) || waRe.test(line)) {
      found.push(`${path.relative(root, file)}:${index + 1}`);
    }
  });
  return found;
}

test("Lyme's number and the WhatsApp short link are absent from tracked files", () => {
  const hits = trackedFiles()
    .filter((file) => file !== self && !binary.has(path.extname(file).toLowerCase()))
    .flatMap(offending);
  assert.deepEqual(hits, []);
});

test("Lyme's number and the WhatsApp short link are absent from the built site", () => {
  const built = path.join(root, "public");
  if (!fs.existsSync(built)) return;
  const hits = filesUnder(built, skipDir).flatMap(offending);
  assert.deepEqual(hits, []);
});

test("the Website Check stop line uses 07460 038202", () => {
  const bad = `${head} ${tail}`;
  const line = websiteCheckStopLine({ CLOCKWORK_PHONE: bad });
  assert.equal(line, "Call or text 07460 038202");
  assert.equal(readClockworkPhone({ CLOCKWORK_PHONE: bad }), "07460 038202");
  assert.equal(readClockworkPhone({}), "07460 038202");
  assert.equal(numberRe.test(line), false);
  assert.equal(waRe.test(line), false);
});

test("the booking page offers a call or a text on the Clockwork number", () => {
  const html = fs.readFileSync(path.join(root, "book.html"), "utf8");
  assert.equal(/whatsapp/i.test(html), false);
  assert.match(html, /sms:\+447460038202/);
  assert.match(html, /tel:\+447460038202/);
  assert.match(html, /07460 038202/);
  assert.equal(numberRe.test(html), false);
  assert.equal(waRe.test(html), false);
});
