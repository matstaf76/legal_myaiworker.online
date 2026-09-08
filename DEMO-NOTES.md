# Combined Legal AI + Fake Law Firm — second iteration

## Experience
The original Legal.MyAIworker sales site is at the top. Fake Law Firm follows below it in the same document, with a clear transition. The top hero provides a shortcut into the demo, and the fictional firm provides a path back to Legal AI pricing. No other site's navigation was modified.

The original sales sections, video, pricing checkout, calculators, and footer links are retained. The blocking introduction overlay was removed so visitors can browse. One Riley interface serves both parts. Sales and demo CSS are scoped to their respective wrappers so their visual styles do not interfere.

The fictional firm now has a dark green/ivory/lime identity, an abstract document motif, human-language practice choices, four distinct practice stories, generated fictional attorney portraits, an in-page Riley view, scroll-aware navigation, and a progress indicator.

## Riley
Existing Vapi key and assistant ID are retained. No external assistant configuration was edited.

RILEY-PROMPT-UPDATE.md now provides the corrected two-role system prompt and first message: fictional receptionist and Legal AI sales guide. It replaces the earlier demo-only prompt, which was inconsistent with the agreed plan.

The same panel moves between floating and in-page presentation. It is not copied or reinitialized. Minimizing preserves the call and transcript; End call stops it. A LIVE indicator remains visible while a minimized voice session is active. New calls and reloads do not promise persistent provider memory.

During a live call, only a predefined section label is sent as background context, with triggerResponseEnabled set to false. Form and calculator values are not sent. Scrolling does not request a spoken response or switch the agent's role automatically.
Provider reference: https://docs.vapi.ai/assistants/background-messages

Typed messages still require an active voice call, matching the existing integration. An unsent draft is retained when the visitor attempts to send before connecting.

## Demo form and disclosure
The demo form has no named fields, endpoint, fetch, analytics, or storage writes. Submission is canceled locally, sample text entries are cleared, and a native modal disclosure opens. It cannot book appointments. Its submit control remains disabled if JavaScript does not run. A dialog form method provides an additional no-network fallback.

Live Riley audio/messages and section context are processed externally. The no-transmission statement applies to the local demo form. No confidentiality or provider-retention guarantee is made.

## Files
- index.html: combined scrolling document.
- css/combined.css: minimal shared page behavior.
- css/legal-sales-scoped.css: scoped copy of the original sales styles; original style.css and pricing.css are preserved.
- css/fake-law.css: scoped demo design and responsive Riley presentation.
- js/fake-law.js: navigation, progress, local form, panel placement, and section tracking.
- js/riley-bot.js: preserved Vapi transport with persistent controls and background section signaling.
- images/robert-fake.png, images/meredith-not-real.png, images/daniel-fake.png: generated fictional portraits.
- ARTWORK-PROMPTS.md: exact generation prompts.
- RILEY-PROMPT-UPDATE.md: manual external configuration text.

## Verification
Passed browser checks at widths 320, 375, 390, 620, 768, 850, 1024, 1440, and 1920 CSS pixels:
- Sales site appears first; single Riley interface; no duplicate IDs.
- Original implementation checkout remains present.
- Both existing calculators update.
- Anchor destinations and mobile menu work.
- Form opens disclosure, clears samples, restores keyboard focus, and makes no network requests.
- Form values are never included in Riley messages.
- One simulated voice client persists through scrolling, minimizing, reopening, and in-page placement.
- Section context is sent without requesting a response.
- Explicit ending stops the call.
- Minimized chat controls are excluded from keyboard navigation.
- Reduced-motion settings and short-screen control access work.
- No page-script errors.

Desktop, demo, portrait, and mobile screenshots were visually reviewed. Tests mock Vapi and block external font/video loading; they do not prove live audio connectivity or external persona behavior. This is WCAG 2.2 AA-oriented implementation, not accessibility certification.

## Scope and handoff
Only this directory was edited, except for the user-approved image tool output folder. No Git commands, repository operations, external assistant edits, or publishing were performed.

Original index and Riley script are in work/original-before-fake-law-firm. Additional pre-correction copies and browser test artifacts are under work. Do not upload work during manual publication.

The older README describes the original sales site; this document describes the combined iteration.
Before publication, manually paste Riley's revised prompt and first message, then test the real microphone service and the two roles. The one-time implementation price is $3,500.

## Requested refinements
The sales header/footer now use Legal.MyAIworker.online. A large top-of-page Talk to an agent button starts the existing Riley voice session on click. The plan calculator uses an explicit AI-enabled user count and computes $1,250 + $357 for each additional user; call volume affects only the workload estimate. Consultation actions now read Schedule a legal consultation, with explicit no-consultation/no-booking demo disclosures. The manual prompt text was updated to match; external settings were not changed.

## Calculator simplification
Removed the entire Legal Plan & Workload Calculator section, including its missed-call opportunity estimate and supporting inline script. Only the time-recovery calculator remains. Navigation now says Calculator. The pricing offer itself is unchanged.
