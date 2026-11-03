#!/usr/bin/env node
// Client-safe check: blocks the house-rule slips before anything reaches a client.
//
//   node check-client-safe.mjs file1.html file2.md ...      check whole files
//   node check-client-safe.mjs --diff origin/main            check only lines added since that base (in a git repo)
//   --profile clockwork|coaching|lyme|all                   which business rules to add (default clockwork)
//
// Exits 1 if anything is found. To allow one line on purpose, put "client-safe: ignore" on it.
// The same file lives in _Hub/tools (Drive) and in own-build/scripts (GitHub check). Keep them identical.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const RULES = {
  all: [
    { id: "em-dash", re: /—/, msg: "Em dash. Use a comma, full stop or brackets." },
    { id: "secret", re: /(sk-[A-Za-z0-9_-]{12,}|(?:KIE|OPENAI|ANTHROPIC|RESEND|VERCEL|GITHUB)_[A-Z_]*\s*[:=]\s*\S+|Bearer\s+[A-Za-z0-9._-]{12,}|gh[pousr]_[A-Za-z0-9]{20,})/, msg: "Looks like a key or token." },
    { id: "internal", re: /^#{1,4}\s*Internal\b|client_safe:\s*no/i, msg: "Internal hub content in client-facing output." },
  ],
  clockwork: [
    { id: "pound", re: /£/, msg: "£ in client-facing content." },
    { id: "ai-tool", re: /\b(ChatGPT|OpenAI|GPT-?\d\w*|Claude|Anthropic|Gemini|Grok|Midjourney|DALL-?E|Copilot|Perplexity|kie\.ai|Stable Diffusion|LLMs?)\b/, msg: "AI or tool name." },
    { id: "ai-word", re: /(?<!Clockwork\s)(?<![\w-])AI(?![\w-])|artificial intelligence/, msg: "\"AI\" outside the brand name Clockwork AI." },
    { id: "live-chat", re: /live[\s-]?chat/i, msg: "Never say \"live chat\"." },
    { id: "pca-member", re: /\bPCA[\s-]*(member|registered|approved|accredited|certified)|member of the (PCA|Property Care Association)/i, msg: "Implies PCA membership. Say \"written to PCA standards\"." },
    { id: "rentokil", re: /Rentokil/i, msg: "Don't mention Rentokil." },
  ],
  coaching: [
    { id: "j3u", re: /J3U/i, msg: "Never name J3U." },
    { id: "diagnosed", re: /\bdiagnos(ed|e|is|ing)\b/i, msg: "Never say \"diagnosed\"." },
    { id: "ped", re: /\b(steroids?|PEDs?|SARMs?|dosing|dosage|cycle support)\b/i, msg: "No PED or dosing talk." },
    { id: "in-person", re: /\bin[\s-]person\b/i, msg: "No in-person offers." },
  ],
  lyme: [
    { id: "gas", re: /\b(gas|gas safe|f-?gas|boilers?|MCS)\b/i, msg: "No gas, boiler, Gas Safe, F-gas or MCS claims." },
    { id: "claims", re: /\b(grants?|accredited|accreditation|certified|insured)\b/i, msg: "No grants, accredited, certified or insured claims." },
  ],
};

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const base = opt("--diff", null);
const profile = opt("--profile", "clockwork");
const rules = [...RULES.all, ...(profile === "all" ? [...RULES.clockwork, ...RULES.coaching, ...RULES.lyme] : RULES[profile] || [])];

// Which repo files count as client-facing in --diff mode
// lib/ holds code that writes text visitors see (business.ts, the chat prompt), so its quoted strings are checked too
const LIB_CODE = (f) => /^lib\/[^/]+\.(ts|js|mjs)$/i.test(f) && !/\.test\.(ts|js|mjs)$/i.test(f);
const CLIENT_FACING = (f) => LIB_CODE(f) || (
  !/(^|\/)(node_modules|lib|api|server|scripts|tests?|\.github)\//.test(f) &&
  !/(^|\/)(README|CLAUDE|CHANGELOG|LICENSE)[^/]*$/i.test(f) &&
  (/\.(html?|md|txt)$/i.test(f) || (/^(demos|p)\//.test(f) && /\.(js|mjs|json|css|svg)$/i.test(f))));

// Gather [file, lineNo, text]
const lines = [];
if (base) {
  const diff = execFileSync("git", ["diff", "-U0", "--no-color", "--no-ext-diff", `${base}...HEAD`], { encoding: "utf8", maxBuffer: 64 << 20 });
  let file = null, n = 0;
  for (const l of diff.split("\n")) {
    if (l.startsWith("+++ ")) { file = l.slice(4).replace(/^b\//, ""); if (file === "/dev/null") file = null; continue; }
    const h = l.match(/^@@ -\S+ \+(\d+)/); if (h) { n = +h[1]; continue; }
    if (!file || !CLIENT_FACING(file)) continue;
    if (l.startsWith("+")) { lines.push([file, n, l.slice(1)]); n++; }
    else if (!l.startsWith("-") && !l.startsWith("\\")) n++;
  }
} else {
  for (const f of args) {
    let text; try { text = fs.readFileSync(f, "utf8"); } catch { console.error(`can't read ${f}`); process.exitCode = 2; continue; }
    text.split("\n").forEach((t, i) => lines.push([f, i + 1, t]));
  }
}

// Strip URLs, image/file names and HTML attributes that aren't visible text, so links and class names don't trip the rules
const visible = (t) => t.replace(/\b(?:src|href|class|id|for|name|data-[\w-]+)=("[^"]*"|'[^']*')/g, " ").replace(/https?:\/\/[^\s"'<>)]+/g, " ");

// Code comments in .js/.css aren't seen by anyone, so they're skipped
// In lib code, only the words inside quoted strings count (not code, comments or regex patterns)
const REGEXY = /\\[sdwbS]|\(\?[:=!<]|\[\^|\$\{|^\^/;
function libStrings(t) {
  const out = []; const line = t.replace(/(^|[^:"'`\\])\/\/.*$/, "$1");
  if (/^\s*(\*|\/\*)/.test(line)) return "";
  for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)) { const v = m[2]; if (/[A-Za-z]{2,}\s+\S/.test(v) && !REGEXY.test(v)) out.push(v); }
  return out.join("  ");
}
const uncomment = (file, t) => (/\.(js|mjs|css)$/i.test(file) ? t.replace(/\/\*.*?\*\//g, " ").replace(/^\s*(\/\/|\*|\/\*).*$/, "") : t);
// A client's demo app shows that client's own prices, so £ is allowed under demos/ (rule is for Clockwork's own content)
const skip = (file, rule) => rule === "pound" && /(^|\/)demos\//.test(file);

const hits = [];
for (const [file, line, raw] of lines) {
  if (/client-safe:\s*ignore/i.test(raw)) continue;
  const t = visible(LIB_CODE(file) ? libStrings(raw) : uncomment(file, raw));
  for (const r of rules) { if (skip(file, r.id)) continue; const m = t.match(r.re); if (m) hits.push({ file, line, rule: r.id, msg: r.msg, found: m[0], text: raw.trim().slice(0, 140) }); }
}

const gh = !!process.env.GITHUB_ACTIONS;
for (const h of hits) {
  if (gh) console.log(`::error file=${h.file},line=${h.line},title=Client-safe: ${h.rule}::${h.msg} Found "${h.found}".`);
  else console.log(`${h.file}:${h.line}  [${h.rule}] ${h.msg}  -> "${h.found}"  | ${h.text}`);
}
const scope = base ? `lines added since ${base}` : `${args.length} file(s)`;
console.log(hits.length ? `\nClient-safe check: ${hits.length} problem(s) in ${scope} (profile ${profile}).` : `Client-safe check: clean (${scope}, profile ${profile}).`);
if (hits.length) process.exitCode = 1;
