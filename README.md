# Clockwork AI

The website for Clockwork AI. Callum Broadfoot builds websites, then AI systems, for tradespeople. Roofers in Greater Manchester, Stockport, Bolton, Cheshire and the North West come first.

## Chat assistant

A floating chat bubble on every page. The script and stylesheet load after the page is idle, so they stay off the first load. The assistant answers from the site only. The system prompt stays on the server.

Ask it about the services, the six-part trades system, the free Business Bottleneck Audit, how it works, missed calls, or who Callum is. It will not quote a price for Foundation, Growth or Autopilot. When someone wants to go ahead, it asks for their name, business or trade, phone or email, and what they need.

After a scroll or a short wait, a small question appears above the bubble, once per browser session. The wording and the quick replies are in `lib/business.ts`. The calculator itself is the section on `missed-calls.html`. It stays in the browser. The chat names it in words, and the widget adds a button. That button can pre-fill missed calls with `?calls=`.

The assistant never writes a web address or a page path. If a reply still contains one, the server turns it into words before it is shown. The widget then puts a button under the message, such as Free audit, Book a call, Missed-call calculator or WhatsApp. On a phone, the panel follows the visible viewport, so the close button and the input stay on screen when the keyboard is open.

## Reuse it on a client site

Copy these files into the other site:

- `lib/business.ts`: edit this, and only this, for the new business
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

Each saved lead is also emailed to callum@getclockworkai.com when Gmail SMTP is configured. The message subject is "New chat lead: <name>". The body has the name, business, contact, what they need, the page, and a short transcript. The lead is stored first. If the email fails, or the password is missing, the chat still confirms the save and the JSON stays in the Blob store.

Set these on `own-build` for Production, Preview, and Development, then redeploy:

- `LEAD_SMTP_USER`: the Google Workspace mailbox that sends, `callum@getclockworkai.com`
- `LEAD_SMTP_PASSWORD`: a Google app password for that mailbox (16 letters; spaces are ignored)

The server connects to smtp.gmail.com on port 465. Create the app password in the Google account after 2-Step Verification is on. If the Workspace admin has turned app passwords off, an admin has to allow them first. Do not commit the password.

`LEAD_NOTIFY_URL` is still optional. If it is an `https` URL, the same lead is POSTed there as well. ImprovMX only forwards mail that people send to clockworkai.app. It cannot send this notification.

## What is already in place

- Private Blob store `clockwork-leads`, with `BLOB_READ_WRITE_TOKEN` on the project
- AI Gateway through the Vercel AI SDK, using OIDC on Vercel (`VERCEL_OIDC_TOKEN` is provided by the platform)
- Rate limit per IP, a cap on message length, and a cap on how long a conversation can run
- A server-side check that removes prices which are not in `allowedPrices`

If a preview reply says the assistant can't answer, the usual cause is AI Gateway access: the team needs the gateway enabled, and a payment method if it asks for verification or credits. No key belongs in the repo.
