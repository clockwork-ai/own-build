import { isStepCount, streamText, tool } from "ai";
import { z } from "zod";
import { business } from "../lib/business.ts";
import {
  clientKey,
  createPriceStream,
  knownPage,
  normaliseMessages,
  sameOrigin,
  takeRateLimit,
} from "../lib/guard.ts";
import { saveLead, validateLead } from "../lib/leads.ts";
import { buildInstructions, publicWidget } from "../lib/prompt.ts";

export const maxDuration = 30;

const leadSchema = z.object({
  name: z.string().describe("The visitor's name"),
  business: z.string().describe("Their business or trade"),
  contact: z.string().describe("A phone number or email address they gave"),
  need: z.string().describe("What they want help with, in their words"),
});

function json(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", ...extra },
  });
}

function limited(retryAfter: number): Response {
  return json(
    { error: "You've sent quite a few messages. Give it a minute, or book the free audit." },
    429,
    { "retry-after": String(retryAfter) },
  );
}

export function GET(): Response {
  return Response.json(publicWidget(business), {
    headers: { "cache-control": "public, max-age=300" },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) {
    return json({ error: "Open the chat on the site and try again." }, 403);
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 24_000) {
    return json({ error: "That message is a bit long. Try a shorter question." }, 413);
  }

  const limit = takeRateLimit(
    clientKey(request),
    Date.now(),
    business.limits.windowMs,
    business.limits.maxRequests,
  );
  if (!limit.ok) return limited(limit.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "I couldn't read that. Try again." }, 400);
  }
  if (!body || typeof body !== "object") {
    return json({ error: "I couldn't read that. Try again." }, 400);
  }

  const page = knownPage((body as { page?: unknown }).page, business.pages);
  const leadBody = (body as { lead?: unknown }).lead;
  if (leadBody && typeof leadBody === "object") {
    const parsed = validateLead(leadBody, "chat-form", page);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const saved = await saveLead(business, parsed.lead);
    if (!saved.ok) {
      return json(
        {
          error: "I couldn't save that just now. Book the free audit, or WhatsApp Callum, and he'll take it from there.",
        },
        503,
      );
    }
    return json({
      ok: true,
      notified: saved.notified,
      message: `${parsed.lead.name}, that's with Callum. He'll use it to reply. The free audit is linked below if you want the 30-minute call as well.`,
    });
  }

  const messages = normaliseMessages((body as { messages?: unknown }).messages, business.limits);
  if (!messages.ok) return json({ error: messages.error }, messages.status);

  const model = process.env.AI_GATEWAY_MODEL || business.model;
  let savedLead = false;
  const result = streamText({
    model,
    instructions: buildInstructions(business, page),
    messages: messages.messages,
    maxOutputTokens: 280,
    temperature: 0.2,
    reasoning: "none",
    stopWhen: isStepCount(4),
    tools: {
      saveLead: tool({
        description:
          "Save a lead for Callum once the visitor has given their name, business or trade, phone or email, and what they need. Call this before confirming.",
        inputSchema: leadSchema,
        execute: async (input) => {
          const parsed = validateLead(input, "chat-tool", page);
          if (!parsed.ok) return { ok: false, error: parsed.error };
          const saved = await saveLead(business, parsed.lead);
          savedLead = saved.ok;
          if (!saved.ok) {
            return {
              ok: false,
              error: "The details could not be stored. Ask them to book the free audit or use WhatsApp.",
            };
          }
          return {
            ok: true,
            notified: saved.notified,
            note: "Stored for Callum. Do not say it was emailed. Offer the free audit.",
          };
        },
      }),
    },
    onError({ error }) {
      console.error("chat model error", error instanceof Error ? error.name : "error");
    },
  });

  const guard = createPriceStream(business.allowedPrices, business.priceStandIn);
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wrote = false;
      try {
        for await (const delta of result.textStream) {
          const next = guard.push(delta);
          if (!next) continue;
          wrote = true;
          controller.enqueue(encoder.encode(next));
        }
        const tail = guard.flush();
        if (tail) {
          wrote = true;
          controller.enqueue(encoder.encode(tail));
        }
        if (!wrote) {
          const fallback = savedLead
            ? "Thanks. That's with Callum. The free audit is linked below if you'd like the 30-minute call as well."
            : "Sorry, I missed that. Ask me about the free audit, or book a call with Callum.";
          controller.enqueue(encoder.encode(fallback));
        }
      } catch (error) {
        console.error("chat stream error", error instanceof Error ? error.name : "error");
        if (!wrote) {
          controller.enqueue(
            encoder.encode(
              "Sorry, I can't answer just now. Book the free audit, or ring Callum on 07985 379605.",
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
