# Clockwork AI

The website for Clockwork AI. Callum Broadfoot builds websites, then AI systems, for tradespeople. Roofers in Greater Manchester, Stockport, Bolton, Cheshire and the North West come first.

## Chat assistant

A floating chat bubble on every page. The script and stylesheet load after the page is idle, so they stay off the first load. The assistant answers from the site only. The system prompt stays on the server.

Ask it about the services, the six-part trades system, the free Business Bottleneck Audit, how it works, or who Callum is. It will not quote a price for Foundation, Growth or Autopilot. When someone wants to go ahead, it asks for their name, business or trade, phone or email, and what they need.

## Reuse it on a client site

Copy these files into the other site:

- `lib/business.ts` — edit this, and only this, for the new business
- `lib/prompt.ts`, `lib/guard.ts`, `lib/leads.ts`
- `server/chat.ts`
- `chat/widget.js`, `chat/widget.css`
- `scripts/build.mjs`
- the short loader at the bottom of each HTML page
- `package.json` dependencies (`ai`, `zod`, `@vercel/blob`, and `esbuild` for the build) and `vercel.json`

The build bundles `server/chat.ts` into `api/chat.js` and copies the site into `public/`. `lib/` is not part of that copy, so the system prompt is not a public file. `api/chat.js` is committed as well: Vercel checks that the function file exists before the build runs. The build rewrites it from `server/chat.ts` on each deploy.

In `lib/business.ts`, change the name, voice, rules, knowledge, links, widget wording, and `allowedPrices`. Put a price in `allowedPrices` only when that exact string is published on the client site. Anything else is removed from the reply before it is shown.

Connect the site to Vercel. The chat calls the AI Gateway with the deployment's OIDC token, so you do not paste a model API key. Set `AI_GATEWAY_MODEL` only if you want a different model than the one in `lib/business.ts`. The current model is `openai/gpt-4.1-mini`: tool use, low latency, and a low token price. It does not write its reasoning into the reply.

For leads, create a private Blob store in the client project (London is `lhr1` for a UK firm) and connect it so `BLOB_READ_WRITE_TOKEN` is set. Leads are JSON files under `leads/`.

## Where leads go

There is no contact form on this site, and the audit self-check never leaves the browser. Bookings are made in the visitor's browser with Cal.com. That path cannot be called from the server.

Chat leads are stored as private JSON in the Vercel Blob store `clockwork-leads` (London, `lhr1`), connected to the `own-build` project for production, preview and development. Open the store in the Vercel dashboard under Storage. The files are not public.

An email is not sent. ImprovMX only forwards mail that people send to clockworkai.app. It cannot send a notification from the chat. To get an email or a Slack message, set `LEAD_NOTIFY_URL` on `own-build` to an `https` webhook that delivers to callum@clockworkai.app, then redeploy. The chat already POSTs the lead there when that variable is present. Until then, the dashboard store is the inbox.

## What is already in place

- Private Blob store `clockwork-leads`, with `BLOB_READ_WRITE_TOKEN` on the project
- AI Gateway through the Vercel AI SDK, using OIDC on Vercel (`VERCEL_OIDC_TOKEN` is provided by the platform)
- Rate limit per IP, a cap on message length, and a cap on how long a conversation can run
- A server-side check that removes prices which are not in `allowedPrices`

If a preview reply says the assistant can't answer, the usual cause is AI Gateway access: the team needs the gateway enabled, and a payment method if it asks for verification or credits. No key belongs in the repo.
