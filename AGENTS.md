# Clockwork AI

Rules for editing clockworkai.app. The repo is clockwork-ai/own-build, and on main it is static HTML. Claude Code reads this file as `CLAUDE.md`. Cursor reads the same text as `AGENTS.md`. Keep the two files identical.

## Workflow

Always start from the latest `main` on GitHub (clockwork-ai/own-build). Work on a branch, open a pull request, and check the Vercel preview (team clockwork-ai1). Never push to main. Never merge without Callum's approval. Never edit an old local copy or upload files directly.

## Writing

Plain British English, in the first person, the way the site already speaks. No em dashes and no en dashes anywhere. Titles use a pipe. Ranges use "to" (write "3 to 5", not a dash). No AI buzzwords: unlock, seamless, elevate, game-changer. Do not invent testimonials, client results, stats or guarantees. If a number is already on the site with a source, keep the source, and do not present it as a client's result.

## Pricing

The Foundation, Growth and Autopilot tier prices are not approved. Never publish them. The tiers show "priced on your call".

On the site, Foundation is the website, the 24/7 AI Chatbot and the Review Accelerator. Growth adds the AI Voice Employee and Database Reactivation. Autopilot adds the Referral Flywheel, the Lifetime Value System, and a monthly review call. Say that, and "priced on your call". Do not add a figure.

## Brand

Keep the colours, fonts and the six part names the same on the homepage (`index.html`), `services.html` and `roofers.html`. The live tokens are in `index.html` and `pages.css`. If you change a colour or a font, change it in both.

- Canvas `#0E0F12`, surface `#17191D`, ink `#E8EED6`, soft ink `#A7AC9C`
- Accent `#CBB892`, accent ink `#0E0F12`, primary button hover `#D8C7A3`
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

Pull request #2 (branch `cursor/chat-assistant-7a23`) adds a chat assistant. It is not on main yet. Once it is merged, its wording, rules, knowledge and allowed prices live in `lib/business.ts`. That is the only file to edit per site. Leads go to the private Vercel Blob store `clockwork-leads`.

## Analytics

Vercel Web Analytics is on. Every page loads `/_vercel/insights/script.js`. Leave it on.
