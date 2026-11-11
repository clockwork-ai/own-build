import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { business } from "./business.ts";
import { saveLead, validateLead } from "./leads.ts";
import type { LeadInput } from "./leads.ts";

const sources = ["chat-tool", "chat-form"] as const;

const base = {
  name: "Sam Lee",
  business: "Plumber",
  contact: "sam@example.com",
  need: "Boiler service next week",
};

for (const source of sources) {
  describe(`validateLead (${source})`, () => {
    test("accepts a valid lead with an email contact", () => {
      const result = validateLead(base, source, "/pricing");
      assert.deepEqual(result, {
        ok: true,
        lead: { ...base, page: "/pricing", source },
      });
    });

    test("accepts UK phone numbers with and without a plus prefix", () => {
      for (const contact of ["07700 900123", "+44 7700 900123", "0770090012"]) {
        const result = validateLead({ ...base, contact }, source);
        assert.equal(result.ok, true, contact);
        if (result.ok) assert.equal(result.lead.contact, contact);
      }
    });

    test("page comes from knownPage and the input page is ignored", () => {
      const withKnown = validateLead({ ...base, page: "/evil" }, source, "/contact");
      assert.equal(withKnown.ok && withKnown.lead.page, "/contact");
      const withoutKnown = validateLead({ ...base, page: "/evil" }, source);
      assert.equal(withoutKnown.ok, true);
      if (withoutKnown.ok) assert.equal(withoutKnown.lead.page, undefined);
    });

    test("cleans whitespace and control characters", () => {
      const result = validateLead(
        { ...base, name: "  Sam \n Lee\u0007 ", need: "Tap\tleaks   badly\u0000" },
        source,
      );
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.lead.name, "Sam Lee");
      assert.equal(result.lead.need, "Tap leaks badly");
    });

    test("a control character inside a word becomes a space", () => {
      const result = validateLead({ ...base, name: "Sam\u0007Lee" }, source);
      assert.equal(result.ok && result.lead.name, "Sam Lee");
    });

    test("rejects bad names", () => {
      for (const name of [undefined, "", "S", "  S  ", " \n\u0007 "]) {
        assert.deepEqual(validateLead({ ...base, name }, source), { ok: false, error: "I need a name." });
      }
    });

    test("rejects bad business", () => {
      for (const value of [undefined, "", "P", "   "]) {
        assert.deepEqual(validateLead({ ...base, business: value }, source), {
          ok: false,
          error: "I need the business or trade.",
        });
      }
    });

    test("rejects bad contacts", () => {
      for (const contact of [undefined, "", "12345", "077009001", "abcdefghijkl", "not-an-email", "sam@example", "07700 abc 900123", "+1234567890123456"]) {
        const result = validateLead({ ...base, contact }, source);
        assert.deepEqual(result, { ok: false, error: "I need a phone number or email." }, String(contact));
      }
    });

    test("rejects bad need", () => {
      for (const need of [undefined, "", "x", "  x  "]) {
        assert.deepEqual(validateLead({ ...base, need }, source), {
          ok: false,
          error: "I need a short note on what they want.",
        });
      }
    });

    test("treats non-string fields as empty", () => {
      const bad: unknown[] = [42, null, {}, ["Sam Lee"], true];
      for (const value of bad) {
        assert.deepEqual(validateLead({ ...base, name: value }, source), { ok: false, error: "I need a name." });
        assert.deepEqual(validateLead({ ...base, business: value }, source), {
          ok: false,
          error: "I need the business or trade.",
        });
        assert.deepEqual(validateLead({ ...base, contact: value }, source), {
          ok: false,
          error: "I need a phone number or email.",
        });
        assert.deepEqual(validateLead({ ...base, need: value }, source), {
          ok: false,
          error: "I need a short note on what they want.",
        });
      }
    });

    test("reports the first failing field when several are bad", () => {
      assert.deepEqual(validateLead({}, source), { ok: false, error: "I need a name." });
    });

    test("name boundaries: 2 and 80 characters are accepted", () => {
      for (const length of [2, 80]) {
        const name = "a".repeat(length);
        const result = validateLead({ ...base, name }, source);
        assert.equal(result.ok && result.lead.name, name);
      }
    });

    test("over-long fields are truncated, not rejected", () => {
      const result = validateLead(
        {
          ...base,
          name: "n".repeat(200),
          business: "b".repeat(200),
          need: "w".repeat(1000),
        },
        source,
      );
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.lead.name, "n".repeat(80));
      assert.equal(result.lead.business, "b".repeat(80));
      assert.equal(result.lead.need, "w".repeat(400));
    });

    test("an email contact longer than 120 characters is cut and then rejected", () => {
      const contact = `${"a".repeat(130)}@example.com`;
      assert.deepEqual(validateLead({ ...base, contact }, source), {
        ok: false,
        error: "I need a phone number or email.",
      });
    });
  });
}

describe("saveLead without storage", () => {
  test("returns storage-not-configured and never calls fetch", async () => {
    const savedToken = process.env.BLOB_READ_WRITE_TOKEN;
    const savedStore = process.env.BLOB_STORE_ID;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;
    const fetchMock = mock.method(globalThis, "fetch", () => {
      throw new Error("fetch must not be called");
    });
    const errorMock = mock.method(console, "error", () => {});
    try {
      const lead: LeadInput = { ...base, page: "/contact", source: "chat-form" };
      const result = await saveLead(business, lead);
      assert.deepEqual(result, { ok: false, error: "storage-not-configured" });
      assert.equal(fetchMock.mock.callCount(), 0);
      assert.equal(errorMock.mock.callCount(), 1);
      assert.equal(errorMock.mock.calls[0].arguments[0], "lead storage: Blob is not connected");
    } finally {
      errorMock.mock.restore();
      fetchMock.mock.restore();
      if (savedToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = savedToken;
      if (savedStore === undefined) delete process.env.BLOB_STORE_ID;
      else process.env.BLOB_STORE_ID = savedStore;
    }
  });
});
