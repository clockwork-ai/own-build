// Every trade demo's scripted chat booking must agree with that demo's own sample opening hours,
// and must stay a demo: no network calls, and a confirmation that says nothing was booked or sent.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "demos");
const demos = fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, "chat.js")) && fs.existsSync(path.join(root, d, "site.json")));

type Chat = { slots: string[]; satSlots?: string[] | null };
const config = (d: string): Chat => {
  const first = fs.readFileSync(path.join(root, d, "chat.js"), "utf8").split("\n", 1)[0];
  return JSON.parse(first.replace(/^window\.DEMO_CHAT=/, "").replace(/;$/, ""));
};
// "8am" -> 8, "5.30pm" -> 17.5, "12" -> 12
const hour = (s: string) => { const m = s.match(/^(\d{1,2})(?:\.(\d{2}))?\s*(am|pm)?$/)!; let h = +m[1] + (m[2] ? +m[2] / 60 : 0); if (m[3] === "pm" && h < 12) h += 12; return h; };
const range = (s: string) => { const m = s.match(/\((\d{1,2}(?:\.\d{2})?(?:am|pm)?) to (\d{1,2}(?:\.\d{2})?(?:am|pm)?)\)/); assert.ok(m, `slot label without a time range: ${s}`); return [hour(m![1]), hour(m![2])]; };
const hoursText = (d: string) => fs.readFileSync(path.join(root, d, "index.html"), "utf8").match(/Mon to Fri [^<]*/)![0].replace(/\s+$/, "");

test("found the four trade demos", () => {
  for (const d of ["ginnel", "brookstop", "slatehollow", "lunebrook"]) assert.ok(demos.includes(d), d);
});

for (const d of demos) {
  test(`${d}: weekday slots sit inside the advertised weekday hours`, () => {
    const h = hoursText(d);
    const wk = h.match(/Mon to Fri (\S+) to (\S+?)(?:,|$)/)!;
    const [open, close] = [hour(wk[1]), hour(wk[2])];
    for (const s of config(d).slots) { const [a, b] = range(s); assert.ok(a >= open && b <= close, `${d}: "${s}" outside ${h}`); }
  });

  test(`${d}: Saturday is offered only when the demo opens on Saturday, and only within those hours`, () => {
    const h = hoursText(d);
    const sat = h.match(/Sat (\S+) to (\S+?)(?:,|$)/);
    const c = config(d);
    if (!sat) { assert.equal(c.satSlots ?? null, null, `${d}: Saturday slots offered but hours say "${h}"`); return; }
    assert.ok(c.satSlots && c.satSlots.length, `${d}: opens Saturday but satSlots is empty`);
    const [open, close] = [hour(sat[1]), hour(sat[2])];
    for (const s of c.satSlots!) { const [a, b] = range(s); assert.ok(a >= open && b <= close, `${d}: Saturday "${s}" outside ${h}`); }
  });

  test(`${d}: the chat never calls the network and always says it's a demo`, () => {
    const js = fs.readFileSync(path.join(root, d, "chat.js"), "utf8");
    assert.doesNotMatch(js, /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.share/);
    assert.match(js, /Booked in \(demo\)/);
    assert.match(js, /nothing has been booked, sent or saved/);
    assert.match(js, /g !== 0/, "Sundays must stay closed");
  });
}
