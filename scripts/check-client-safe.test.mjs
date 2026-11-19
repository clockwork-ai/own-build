// The client-safe check runs as a script, so these tests hand it a small page.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-client-safe.mjs", import.meta.url));

function check(text) {
  const dir = mkdtempSync(join(tmpdir(), "client-safe-"));
  const file = join(dir, "page.html");
  try {
    writeFileSync(file, text);
    return spawnSync(process.execPath, [script, file], { encoding: "utf8" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("plain AI passes", () => {
  const result = check([
    "<p>Jess is an AI phone line.</p>",
    "<p>She is an AI receptionist.</p>",
    "<p>A person can ring the office.</p>",
    "<p>The receptionist books the visit.</p>",
    "<p>This page is not a bot.</p>",
  ].join("\n"));
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Client-safe check: clean/);
});

test("live chat fails", () => {
  const result = check("<p>Open the live chat.</p>");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /\[live-chat\]/);
});

test("a Jess-as-a-person phrase fails", () => {
  const phrases = [
    "Jess is a real person.",
    "Meet our human receptionist.",
    "Jess is a real receptionist.",
    "Jess is not a bot.",
    "The phone line is not a bot.",
  ];
  for (const phrase of phrases) {
    const result = check(`<p>${phrase}</p>`);
    assert.equal(result.status, 1, phrase + "\n" + result.stdout);
    assert.match(result.stdout, /\[jess-person\]/, phrase);
  }
});
