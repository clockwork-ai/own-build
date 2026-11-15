<!-- Clockwork pull request. Fill every section. Delete nothing. Previews stay open until Callum says merge. -->

## What changed

One or two plain sentences. What a visitor will notice, and what they will not.

## Why

The brief or decision this comes from (link the Drive brief, DONE file or DECISIONS line).

## Preview link

- Vercel preview: <!-- https://own-build-...-clockwork-ai1.vercel.app -->
- If the preview is behind Vercel login and Callum needs to open it on his phone, add a shareable link made from the deployment's Share menu here: <!-- never commit a _vercel_share token anywhere else -->
- Demo subdomain simulated with `?demo=<name>` if this touches a demo.

## Screenshots

Desktop (1440 wide) and mobile (390 wide) of every page this PR touches. Before and after where the change is visible.

| Page | Desktop | Mobile |
|---|---|---|
|  |  |  |

## Checks

Paste the real output, not a tick.

- [ ] `npm test` passed (count: )
- [ ] `npm run typecheck` passed
- [ ] `npm run build` passed
- [ ] `npm run check:client-safe` clean
- [ ] No em dashes, no new prices (only the approved Foundation figures), "no VAT added" wording kept, no "AI" or "live chat" in client copy, no phone number change, no secrets
- [ ] Preview opened and walked on a phone

## Rollback deploy id

The current production deployment id before this merges (Deployments, Environment = Production, top row): <!-- own-build-xxxxxxxxx -->

## Needs Callum: yes / no

If yes, list each decision in one line.

## What could break

One to three lines on the riskiest part and how to spot it.
