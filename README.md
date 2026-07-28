# legal.myaiworker.online

Compliance-focused sister site to [myaiworker.online](https://myaiworker.online), serving
**medical offices and law offices only**.

## Scope

This site offers exactly two plans and nothing else. It must never display, link to, or
reference MyAIworker's general small-business tiers.

| Plan | Base | Compliance rider | Monthly total | Setup |
|---|---|---|---|---|
| Medical — solo practice | $500 | $600 HIPAA | **$1,100** | $3,000 |
| Medical — busier office | $1,000 | $600 HIPAA | **$1,600** | $3,000 |
| Law office — solo attorney | $500 | $2,500 legal | **$3,000** | $5,000 |
| Law office — multi-attorney | $1,000 | $2,500 legal | **$3,500** | $5,000 |

Pricing is displayed **itemized** (base and rider shown separately) by design.

**Setup fees are cost-recovery only and are never discounted.** No promotional pricing,
no "% off", no case-study deal. This is a hard rule — do not add one.

## Voice / chat agent

The embedded agent is **Riley** (Vapi assistant `ec057da0-5b36-41e2-b0b5-0fefdee886c8`),
tuned for medical and legal compliance sales. Max belongs to the main site and is not
used here. Callers who reach Max on myaiworker.online and identify as a medical or law
office are handed off to Riley via Vapi's native handoff tool.

## Stripe

Payment links are specific to this site and independent of the main site's links.
They live in `js/bot.js` (`CONFIG`) and in the pricing section of `index.html`.

## Deployment

GitHub Pages from `main`, custom domain `legal.myaiworker.online` (see `CNAME`).
Static site — no build step.
