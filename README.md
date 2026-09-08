# legal.myaiworker.online

Legal.MyAIworker.online is a premium AI client engagement and practice automation
system built specifically for modern law firms.

## Scope

This site is legal-only. It must not display or quote medical-office or general
small-business plans.

- Legal AI Implementation: **$3,500 one-time implementation fee**.
- Recurring service: **$1,250/month for the first user** plus **$357/month for
  each additional user**.
- Employee count does not automatically equal user count. Only people who need
  their own AI-enabled access or workflow count as users.
- The first recurring invoice is sent by GHL 30 days after go-live.
- Service is month-to-month.
- Go live within three business days or the implementation payment is refunded.

The website and Riley may provide only the one-time implementation checkout. Never
add a recurring-service payment button or monthly Stripe link.

## Voice / chat agent

The embedded agent is **Riley** (Vapi assistant `99f20fd1-f643-4612-b50e-89b2ed33b409`),
tuned to sell the complete legal AI client engagement and practice automation system,
not merely voice reception. Riley can explain and demonstrate voice, website chat,
email AI, preliminary intake, scheduling, follow-up, CRM records, connected workflows,
website lead capture, reputation follow-up, implementation, and legal safeguards.

The production voice prompt is maintained in Vapi. The matching local text-chat
fallback prompt lives in `js/bot.js`.

## Stripe

The one-time implementation checkout is:
https://buy.stripe.com/6oUbJ29Ke1z5fMFcnp1kA0o

It lives in `js/bot.js` (`CONFIG`) and in the pricing section of `index.html`.

## Deployment

GitHub Pages from `main`, custom domain `legal.myaiworker.online` (see `CNAME`).
Static site — no build step.
