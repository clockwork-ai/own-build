import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import { business } from "./business.ts";
import { saveLead, validateLead } from "./leads.ts";
import type { LeadInput, SaveLeadDeps } from "./leads.ts";

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

describe("saveLead with injected deps", () => {
  const hookEnv = business.lead.webhookEnv;
  const lead: LeadInput = { ...base, page: "/contact", source: "chat-form" };

  async function withEnv(
    hook: string | undefined,
    run: () => Promise<void>,
  ): Promise<void> {
    const savedToken = process.env.BLOB_READ_WRITE_TOKEN;
    const savedStore = process.env.BLOB_STORE_ID;
    const savedHook = process.env[hookEnv];
    process.env.BLOB_READ_WRITE_TOKEN = "test-token-not-real";
    delete process.env.BLOB_STORE_ID;
    if (hook === undefined) delete process.env[hookEnv];
    else process.env[hookEnv] = hook;
    const infoMock = mock.method(console, "info", () => {});
    const errorMock = mock.method(console, "error", () => {});
    try {
      await run();
    } finally {
      errorMock.mock.restore();
      infoMock.mock.restore();
      if (savedToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
      else process.env.BLOB_READ_WRITE_TOKEN = savedToken;
      if (savedStore === undefined) delete process.env.BLOB_STORE_ID;
      else process.env.BLOB_STORE_ID = savedStore;
      if (savedHook === undefined) delete process.env[hookEnv];
      else process.env[hookEnv] = savedHook;
    }
  }

  const fakePut = (impl: () => Promise<unknown> = async () => ({})) =>
    mock.fn(impl) as unknown as SaveLeadDeps["put"];
  const fakeEmail = (value: boolean) =>
    mock.fn(async (..._args: unknown[]) => value) as unknown as SaveLeadDeps["email"];
  const fakeFetch = (status: number) =>
    mock.fn(async (..._args: unknown[]) => new Response(null, { status })) as unknown as SaveLeadDeps["fetch"];
  const calls = (fn: unknown) => (fn as ReturnType<typeof mock.fn>).mock;

  test("put throws: storage-failed and no notifications", async () => {
    await withEnv(undefined, async () => {
      const put = fakePut(async () => {
        throw new Error("blob down");
      });
      const email = fakeEmail(true);
      const fetchFake = fakeFetch(200);
      const result = await saveLead(business, lead, { put, email, fetch: fetchFake });
      assert.deepEqual(result, { ok: false, error: "storage-failed" });
      assert.equal(calls(email).callCount(), 0);
      assert.equal(calls(fetchFake).callCount(), 0);
    });
  });

  test("stored then email notifies, webhook unset", async () => {
    await withEnv(undefined, async () => {
      const put = fakePut();
      const email = fakeEmail(true);
      const fetchFake = fakeFetch(200);
      const result = await saveLead(business, lead, { put, email, fetch: fetchFake });
      assert.deepEqual(result, { ok: true, notified: true });
      assert.equal(calls(email).callCount(), 1);
      assert.deepEqual(calls(email).calls[0].arguments, [
        business.lead.notifyEmail,
        lead,
        "No transcript was included.",
      ]);
      assert.equal(calls(fetchFake).callCount(), 0);
    });
  });

  test("email uses the lead summary when there is one", async () => {
    await withEnv(undefined, async () => {
      const withSummary: LeadInput = { ...lead, summary: "Asked about a boiler service." };
      const email = fakeEmail(true);
      await saveLead(business, withSummary, { put: fakePut(), email, fetch: fakeFetch(200) });
      assert.equal(calls(email).calls[0].arguments[2], "Asked about a boiler service.");
    });
  });

  test("stored, webhook only", async () => {
    await withEnv("https://hooks.example.com/lead", async () => {
      const put = fakePut();
      const email = fakeEmail(false);
      const fetchFake = fakeFetch(200);
      const result = await saveLead(business, lead, { put, email, fetch: fetchFake });
      assert.deepEqual(result, { ok: true, notified: true });
      assert.equal(calls(fetchFake).callCount(), 1);
      const [target, init] = calls(fetchFake).calls[0].arguments as [URL, RequestInit];
      assert.equal(String(target), "https://hooks.example.com/lead");
      assert.equal(init.method, "POST");
      const body = JSON.parse(String(init.body));
      assert.equal(body.name, lead.name);
      assert.equal(body.source, lead.source);
    });
  });

  test("both notifications fail but the lead is still stored", async () => {
    await withEnv("https://hooks.example.com/lead", async () => {
      const put = fakePut();
      const email = fakeEmail(false);
      const fetchFake = fakeFetch(500);
      const result = await saveLead(business, lead, { put, email, fetch: fetchFake });
      assert.deepEqual(result, { ok: true, notified: false });
      assert.equal(calls(put).callCount(), 1);
      assert.equal(calls(fetchFake).callCount(), 1);
    });
  });

  test("stored record path, contents and options", async () => {
    // Pin the clock so the day in the path can't change between the two saves.
    mock.timers.enable({ apis: ["Date"], now: Date.parse("2026-11-11T12:00:00.000Z") });
    try {
      await withEnv(undefined, async () => {
        const put = fakePut();
        const deps = { put, email: fakeEmail(false), fetch: fakeFetch(200) };
        await saveLead(business, lead, deps);
        await saveLead(business, lead, deps);
        assert.equal(calls(put).callCount(), 2);
        const [path, body, options] = calls(put).calls[0].arguments as [string, string, unknown];
        const prefix = business.lead.storagePrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assert.match(path, new RegExp(`^${prefix}/2026-11-11/[0-9a-f]{16}\\.json$`));
        assert.equal(calls(put).calls[1].arguments[0], path);
        const record = JSON.parse(body);
        assert.deepEqual(
          { ...record, savedAt: undefined },
          {
            ...lead,
            summary: "No transcript was included.",
            notifyName: business.lead.notifyName,
            savedAt: undefined,
          },
        );
        assert.equal(record.savedAt, "2026-11-11T12:00:00.000Z");
        assert.deepEqual(options, {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        });
      });
    } finally {
      mock.timers.reset();
    }
  });
});
