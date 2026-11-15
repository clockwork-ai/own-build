# Clockwork AI (clockwork-ai/own-build)

Rules for editing clockworkai.app. On main it is static HTML plus a small chat function, built by `scripts/build.mjs` and hosted on Vercel (team clockwork-ai1, project own-build). Claude Code reads this file as `CLAUDE.md`. Cursor reads the same text as `AGENTS.md`. Keep the two files identical.

## Standing rules

- British English, in the first person, the way the site already speaks. No em dashes and no en dashes anywhere, including code comments and commit messages. Titles use a pipe. Ranges use "to" (write "3 to 5", not a dash).
- No phone number or price changes without Callum's approval. The CTA number on the site is 07460 038202.
- Never touch Search Console verification files or tags, in this repo or any client repo.
- Customer-facing work stays in a preview or a pull request until Callum says merge. Never push to main. Never merge your own pull request. Never edit an old local copy or upload files directly.
- No keys, tokens or secrets in any file. The chat uses the deployment's own token for the AI Gateway; there is nothing to paste.
- Do not invent testimonials, client results, stats or guarantees. If a number is already on the site with a source, keep the source, and do not present it as a client's result.
- No AI buzzwords: unlock, seamless, elevate, game-changer.

## Workflow

Always start from the latest `main` on GitHub. Work on a branch, open a pull request with the template filled in, and check the Vercel preview. CI runs the unit tests, the typecheck and the client-safe check on every pull request; all three must be green before Callum looks.

## Pricing and wording

- The only prices allowed on the public site are the approved Foundation figures: £99 a month, 12-month minimum, £1,188 in total. No other figure, tier price or percentage goes on the site or in a graphic until Callum says publish. Growth and Autopilot stay "priced on your call".
- Clockwork is not VAT registered. Say "no VAT added". Never write "plus VAT" or "ex VAT" on the site.
- No "AI" talk and no "live chat" in client-facing copy. "Clockwork AI" is the brand name and is fine as a name. Jess is "the phone line" or "answers the phone", never an AI, a bot or live chat.
- `lib/business.ts` holds the chat's wording, rules, knowledge and `allowedPrices`. A price goes in `allowedPrices` only when that exact string is published on the site. Anything else is removed from the reply before it is shown.

## Brand (Dial kit)

Keep the colours, fonts and the six part names the same on the homepage (`index.html`), `services.html` and `roofers.html`. The live tokens are in `index.html` and `pages.css`. If you change a colour or a font, change it in both.

- Canvas `#0E0F12`, surface `#17191D`, ink `#E8EED6`, soft ink `#A7AC9C`
- Accent (champagne) `#CBB892`, accent ink `#0E0F12`, primary button hover `#D8C7A3`, deep gold for print `#B8893A`
- The homepage also sets graphite `#24262A` and steel `#6E7378`
- Display: Instrument Serif, then Georgia. Body: Geist, then system-ui. Mono: Geist Mono

`scrollcraft.css` still has older defaults (lime accent `#d8ff3e`, display face Instrument Sans). The pages override them. Leave those defaults unused.

The six-part trades system, in this order:

1. AI Voice Employee
2. 24/7 AI Chatbot
3. Database Reactivation
4. Review Accelerator
5. Referral Flywheel
6. Lifetime Value System

Do not rename them, renumber them, or add a seventh part.

## Story

Callum is 42, on the tools since 16, a former Gas Safe engineer who ran a trades business with vans and a team. That is true and can be used. Do not add anything beyond it.

## Review Accelerator

Every customer gets the review link. No review gating, and no incentive for a star. Do not write that only happy customers are asked.

## Chatbot

The chat assistant is live. Its wording, rules, knowledge and allowed prices live in `lib/business.ts`; that is the only file to edit per site. `server/chat.ts` is bundled into `api/chat.js` by the build and the committed copy is rewritten on each deploy. Leads go to the private Vercel Blob store `clockwork-leads`.

## Demo sites

Client demos live under `demos/<name>/` (Tarnhale, Easy Damp, Marlbrow). A `demos/<name>/site.json` with a `host` is listed in the generated `lib/demo-sites.js` (run by the build) and served on its subdomain by `middleware.js`. On a preview, `?demo=<name>` simulates the subdomain. Marlbrow has no repo of its own: it is a demo folder here. Demo prices and sample reviews are allowed inside `demos/` because they are the fictional client's own, and must be marked illustrative.

## Analytics

Vercel Web Analytics is on. Every page loads `/_vercel/insights/script.js`. Leave it on.

## How to test

    npm ci
    npm test                  # node --test lib/*.test.ts
    npm run typecheck
    npm run build             # scripts/build.mjs, writes public/
    npm run check:client-safe # em dashes, £, AI or tool names, "live chat", keys, in lines added since main

Show the output in the pull request. Check changed pages at 390 and 1440 wide and attach both screenshots.

## How to deploy

Merging to `main` on GitHub deploys production through the Vercel Git integration. Nothing else deploys production. Every pull request gets a preview at a `*-clockwork-ai1.vercel.app` address.

## How to roll back

Only Callum rolls back. Steps:

1. Find the previous production deployment id. Vercel dashboard: team clockwork-ai1, project own-build, Deployments, filter Environment = Production. The top row is live; the row below is the previous one. Its id is the `own-build-xxxxxxxxx` part of the deployment URL. From a terminal with the saved Vercel login: `npx -y vercel@latest ls own-build --environment production --scope clockwork-ai1` lists the same rows, newest first.
2. Open that previous deployment and choose "Promote to Production" (or "Instant Rollback" on the current production deployment). CLI: `npx -y vercel@latest rollback <previous deployment url> --scope clockwork-ai1`.
3. Note the deployment id you promoted in the pull request or the hub log, then fix forward on a branch.
