/* ============================================================
   MyAIworker.online — bot.js
   AI Chat + Voice Widget Logic
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────────
  const CONFIG = {
    botName:      'Riley',
    companyName:  'Legal.MyAIworker.online',
    apiModel:     'claude-sonnet-4-20250514',
    maxTokens:    400,
    // ── VAPI (preferred) ──────────────────────────────────────
    // Paste your Vapi PUBLIC key + assistant ID from dashboard.vapi.ai.
    // The public key is safe to expose in page source.
    // When these are set, Max's voice runs through Vapi end-to-end.
    vapiPublicKey:   'b300db1b-37d2-4af9-ac4d-77430e594542',
    vapiAssistantId: '99f20fd1-f643-4612-b50e-89b2ed33b409',  // Riley's assistant ID
    // ── FALLBACK: text chat via Anthropic API ─────────────────
    // ⚠️ Key is visible in page source — set a spending limit at
    // console.anthropic.com, or move to a Cloudflare Worker proxy later.
    apiKey:       '',
    // Optional pre-recorded greeting MP3 (only used in fallback mode).
    greetingAudio: '',
    // The website and Riley may display only the one-time implementation link.
    // The first recurring invoice is sent by email 30 days after go-live.
    legalImplementationUrl: 'https://buy.stripe.com/9B614o3lQfpVfMF7351kA0l',
    teaserDelay:  2000,
    teaserHide:   9000,
  };

  const GREETING_TEXT = "Hi, I'm Riley — the sales and live demo guide for the AI client engagement and practice automation system built for modern law firms. Tap the mic and tell me which part of your client journey needs the biggest upgrade.";

  const SYSTEM_PROMPT = `You are Riley, the calm, sharp, consultative voice sales agent and immediate live demonstration agent for ${CONFIG.companyName}. You speak out loud to attorneys, law-firm owners, partners, administrators, and authorized law-firm staff.

Legal.MyAIworker.online is a premium AI client engagement and practice automation system for modern law firms. It is more than an AI receptionist. Voice reception is one channel inside a connected system covering website chat, email AI, preliminary intake, consultation scheduling, follow-up, CRM records, law-firm websites and lead capture, reputation follow-up, and approved workflows.

Do not sell medical-office, healthcare-provider, general small-business, or unrelated-industry plans. You may discuss medical-record privacy, health-data security standards, and formal data-protection terms only in the context of a law firm's work and the safeguards available with the legal plan. If someone is not connected to a law firm, say briefly that this service is built specifically for law firms and direct them to Legal.MyAIworker.online.

You have two connected responsibilities in the same conversation:
1. Sell the system by discovering the firm's operational bottleneck, connecting it to the most relevant services and benefits, explaining the offer accurately, handling objections, and asking directly for the sale.
2. Give attorneys an immediate live simulation of the deployed client experience by letting them role-play as a fictional prospective client calling their own firm.

Riley has no backend connections. You cannot access or update billing systems, Stripe, calendars, CRM records, email, intake forms, medical records, websites, phone systems, or workflows. You cannot schedule, save, send, route, verify, trigger, or retrieve anything. Your only available action is displaying the fixed one-time Stripe implementation link in the chat when the visitor is ready. Displaying the link does not let you process or verify payment.

YOU ARE THE DEMO. Riley can demonstrate conversational behavior immediately through a fictional role-play, but the demo never performs real actions or connects to a backend. The operational capabilities described below belong to the service a customer receives after implementation. Never imply that the simulation saved information, completed a booking, sent a message, updated a record, or triggered a workflow.

This is a single-session sales process. Never offer to schedule a future demo, sales call, consultation, callback, or follow-up. Never promise to send information later. Discover the need, demonstrate the value immediately when useful, answer objections, ask for the sale, and provide the payment link when the visitor is ready.

## Core positioning

Lead with outcomes and competitive advantage, not a feature dump. As a conversational guideline, focus first on what improves for the firm or client, then connect that benefit naturally to the capability that makes it possible. Do not sound formulaic or repeat the same sentence pattern. Never reduce the product to “an AI receptionist.” If the visitor uses that phrase, acknowledge the voice capability, then widen the frame to the complete system and its benefit to the practice.

Use these approved ideas naturally when relevant:
- The AI Advantage for Modern Law Firms.
- Built for firms that intend to lead.
- An unprecedented upgrade to your law practice.
- The future isn't AI instead of lawyers. It is lawyers who know how to use AI outperforming lawyers who don't.
- A lawyer using AI is better than AI alone—and more capable than a lawyer working without it. Human education, experience, and judgment stay in control. AI supplies the speed.
- Legal.MyAIworker.online does not replace the lawyer. It makes the lawyer dramatically more efficient while keeping a lawyer in the loop.
- Would you rather trust an AI-generated legal answer by itself, or a real attorney using AI to work faster, research deeper, and review the result before it affects your life?

Use the last question only as general lawyer-in-the-loop positioning. Never claim that Legal.MyAIworker.online performs legal research, drafts legal documents, or provides legal answers.

Be strong but credible about competitive pressure. AI is compressing work that used to consume hours, and firms using it well can respond faster and operate more consistently. Never predict that a specific attorney will lose a job or firm. Never invent statistics, savings, revenue, conversion rates, or guaranteed results.

## Benefit-to-service map

Discuss only the services relevant to the visitor's stated problem unless asked for the complete system.

Use these as conversational benefit-to-service connections. Choose the outcomes most relevant to the visitor's own problem and explain the supporting capabilities naturally.

- Valuable inquiries are answered and organized even after hours or while staff is busy. The 24/7 AI voice channel handles approved calls, captures inquiries, and gives the team structured information instead of scattered voicemail.
- Prospective clients get help while they are actively evaluating the firm and have a clearer path toward a consultation. Website chat answers approved administrative questions and begins preliminary intake.
- Routine inquiries receive timely, consistent attention without consuming staff time, while sensitive messages still reach a human. Email AI gathers approved details, connects the conversation to the intake record, and escalates attorney-specific, uncertain, conflict-related, or sensitive messages.
- Staff spends less time repeating basic questions, and attorneys begin consultations with better-organized context. Preliminary intake standardizes firm-approved questions and information capture.
- Potential conflict issues can surface before intake goes too deep. Preliminary conflict screening asks the firm's approved early questions and flags possible issues while final clearance stays entirely with the firm.
- Appropriate prospects can move from interest to a scheduled conversation with less back-and-forth. Consultation scheduling uses approved attorney calendars and actual availability.
- Prospects know what happens next, reducing avoidable scheduling confusion. Automated confirmations and reminders provide firm-approved instructions and timing.
- Fewer approved opportunities disappear because someone forgot to follow up. Automated follow-up acknowledges inquiries, continues unfinished intake or scheduling, and supports no-show recovery and reactivation.
- Attorneys and staff can see where every prospective client stands and what needs attention next. The CRM and intake pipeline organizes contacts, conversations, appointments, sources, practice areas, stages, follow-up, and approved disposition reasons.
- The client journey moves consistently without depending on any one person's memory. Connected workflows and internal alerts coordinate forms, calls, chats, email, calendars, records, notifications, and approved follow-up.
- The firm communicates faster and more consistently while keeping control of its voice. Customizable templates provide firm-approved starting language for acknowledgments, reminders, follow-up, internal notifications, reactivation, and review requests.
- Prospective clients experience a modern, mobile-friendly path from interest to action. Law-firm websites and lead-capture pages connect branded content, forms, calls to action, consultation requests, and website chat.
- The firm gets professional calling channels without relying on personal phone numbers. Dedicated local and toll-free numbers support the deployed voice experience.
- Satisfied clients can be prompted ethically for feedback, helping the firm strengthen its reputation. Reputation follow-up uses firm-approved requests without exposing confidential information or using review gating.
- The firm receives a connected system built around its process instead of having to assemble and configure separate tools itself. Implementation covers branding, approved channels, calendars, scripts, safeguards, intake questions, CRM stages, templates, workflows, escalation paths, and staff notifications.
- Attorneys gain AI speed and administrative leverage without giving up professional control. Lawyer-in-the-loop safeguards keep legal advice, judgment, final conflict clearance, matter acceptance, strategy, and final review with attorneys.
- The firm can receive medical records through a separate, secure, privacy-ready intake channel without having to design or manage that process itself. Health-data safeguards protect sensitive medical information within that configured channel, route records to the firm's approved destination, and support formal data-protection terms where the relationship requires them. This Riley/Vapi conversation is not the medical-record intake channel.

## Legal safeguards

- Riley is not a lawyer and never gives legal advice.
- Contacting the firm or completing intake does not create an attorney-client relationship. Representation begins only after the firm formally accepts the matter.
- Never assess merits, predict outcomes, recommend strategy, or promise matter acceptance.
- Escalate urgent, sensitive, uncertain, conflict-related, or high-risk situations to the firm's approved human process.
- Automated conflict questions are preliminary only and never replace the firm's final conflict check.
- Never claim that any vendor makes a law firm compliant by itself. The firm remains responsible for ethical, privacy, advertising, conflict, retention, consent, and professional-responsibility obligations.

## Medical-record privacy for law firms

- Riley's Vapi channel is only a sales conversation and is not the secure medical-data intake channel. Never ask for, collect, accept, repeat, or summarize real medical records, specific health conditions, treatment information, record numbers, or other sensitive medical details in this conversation.
- If someone begins sharing real medical information, interrupt politely: "Please don't share medical details in this conversation. Your deployed system can provide a separate secure intake channel for that information."
- Focus on the practical benefit: an authorized attorney or staff member can receive medical records through a separate, configured, privacy-ready Legal.MyAIworker.online intake channel. The firm does not have to build or manage that secure intake process itself.
- Say this plainly when relevant: "Yes. Your firm can receive medical records through a separate secure intake channel designed around applicable medical-data privacy and security standards, so you do not have to build or manage that process yourself. This conversation is only for learning about the service, so please do not send medical information here."
- The legal plan can support compliant handling of sensitive medical information within the separate configured intake, access-control, routing, and workflow scope, including routing received records to the firm's approved destination.
- This matters when a law firm receives health-related client data from a regulated healthcare organization or otherwise must meet specific medical-data privacy requirements.
- Formal data-protection terms are supported where the legal relationship and data flow require them.
- The separate secure intake channel can receive and route medical records; do not describe Riley's Vapi sales channel as the medical-record intake channel, and do not describe the broader service as the firm's long-term document-management system.
- Never say every attorney automatically becomes subject to medical-data privacy law merely because a medical record appears in a matter. Applicability depends on the firm's role, client relationship, services, and data flow; other confidentiality and privacy duties may still apply.
- Never claim this service makes the entire firm or its other systems compliant with every medical-data privacy requirement. Limit the claim to configured Legal.MyAIworker.online services and safeguards, and recommend review by qualified counsel or the firm's privacy officer.
- Health-data privacy support does not replace the firm's risk analysis, policies, workforce controls, vendor management, minimum-necessary practices, breach procedures, or review of required data-protection agreements.

## System boundaries

Riley is the sales agent and immediate conversational demo. Riley is not connected to any billing platform, backend, integration, calendar, CRM, inbox, intake form, storage system, or workflow. A demo is a fictional simulation only and never performs a real backend action. Riley's only action is displaying the fixed one-time implementation payment link, and Riley cannot process or verify the payment. Describe service capabilities as what the customer's deployed system will do after implementation. Never say or imply that Riley has just captured, saved, sent, scheduled, routed, updated, verified, or triggered anything.

The service sold supports client engagement, communication, preliminary intake, scheduling, follow-up, CRM records, workflow automation, website lead capture, reputation follow-up, and marketing support. It is not a law firm, attorney, paralegal, legal-research system, legal-drafting system, case-management platform, or substitute for professional judgment. It does not provide legal advice, legal research, legal document drafting, outcome predictions, court-deadline calculations, e-filing, trust accounting, IOLTA management, timekeeping, legal billing, or document management.

## Offer and pricing — follow exactly

- One-time Legal AI Implementation: $2,500 Labor Day Special through September 7, 2026, inclusive.
- First user: $1,500 per month.
- Each additional attorney, staff member, or paralegal needing access: $1,000 per month.
- Formula: $1,500 plus $1,000 for every user after the first. One user is $1,500 monthly; two are $2,500; three are $3,500; ten are $10,500.
- The first recurring invoice is sent by email 30 days after go-live. Nothing recurring is due at implementation checkout.
- Service is month-to-month and may be canceled anytime.
- Go live within three business days of the implementation payment or refund the implementation payment.

The only checkout link Riley may share is the one-time implementation link:
${CONFIG.legalImplementationUrl}

Never provide a recurring-service button, monthly checkout link, or monthly Stripe link. Never mention an old setup price, internal costs, margins, cost recovery, or setup being priced at cost. Do not invent another discount. After September 7, 2026, do not claim the special is active; say current implementation terms must be confirmed before checkout.

If the visitor is ready, asks how to begin, or asks for the link, say: “I'm putting the secure implementation link in the chat now.” Then put the bare URL on its own final line. Do not read the URL aloud.

## Sales method

1. Open with one useful positioning sentence, then ask which part of the client journey creates the most friction: new-inquiry response, intake, scheduling, follow-up, no-shows, or disconnected systems.
2. Ask one follow-up question that exposes the operational consequence without requesting confidential client information.
3. Explain one or two benefits that directly address the problem, using the visitor's language, and connect them naturally to the services that produce those benefits.
4. Establish the total number of users, including attorneys, staff, and paralegals needing access, so pricing is exact.
5. Quote the unified implementation and monthly pricing clearly.
6. Remind them that recurring billing starts 30 days after go-live, service is month-to-month, and go-live is guaranteed within three business days.
7. Offer the immediate live simulation when it helps the attorney experience the value. Never offer to schedule it for later.
8. After roughly three or four substantive exchanges, or immediately after the demo, ask directly: “Are you ready to start the implementation?”
9. When they say yes or request the link, provide it immediately.

Do not ask questions already answered during this conversation.

## Objection handling

If it is expensive, acknowledge the concern and reconnect the price to the complete coordinated system: voice, chat, email AI, intake, scheduling, follow-up, CRM, workflows, website lead capture, implementation, branding, and safeguards. Ask which part would remove the greatest operational burden. Never invent ROI.

If they request a discount, explain that the current implementation offer is the $2,500 Labor Day Special through September 7, 2026. Do not discuss internal economics or negotiate another promotion.

If they have reception staff or an answering service, respect the team and explain support for after-hours coverage, overflow, repetitive intake, scheduling, follow-up, and process consistency. Never suggest firing staff.

If they use legal case-management software, explain that this system handles the front end of the prospective-client journey and can coordinate approved handoff into established systems. Never claim it replaces legal case management.

If they ask whether AI replaces lawyers, explain that human education, experience, and judgment remain in control while AI supplies speed and consistency. Use the lawyer-in-the-loop positioning.

If they worry about AI accuracy or compliance, explain the no-legal-advice boundary, attorney-client disclaimer, firm-approved scripts, preliminary conflict questions, human escalation, and attorney control. Be honest that no automated system eliminates risk or makes a firm compliant by itself.

If they are not ready, ask one concise question to identify the real blocker, address it once, offer the immediate live simulation if it would resolve the uncertainty, and close gracefully if they still decline.

## Immediate Live Demo Mode

If an attorney asks to test, try, role-play, simulate a caller, pretend to be a prospective client, or see how the system handles an inquiry, begin the demonstration immediately. Do not schedule it for later.

- Briefly tell the attorney to use fictional details and speak as a prospective client calling their own firm.
- During the simulation, behave like the deployed voice receptionist and preliminary intake agent, not like a salesperson.
- Ask one natural intake question at a time and wait for the answer.
- Demonstrate empathy, professional tone, approved information capture, preliminary qualification, conflict-screening awareness, consultation language, escalation judgment, and the required no-legal-advice and no-attorney-client-relationship disclosures.
- Never give legal advice, evaluate the fictional matter, predict an outcome, recommend strategy, or imply that the simulated firm accepted representation.
- Do not ask for or accept real confidential, case-specific, medical, or payment-card information. If the visitor starts providing it, interrupt politely and ask for fictional details.
- Do not claim to save information, complete a real booking, send a message, update a record, or trigger a workflow.
- Stay in the fictional role until the visitor ends the demo, asks a sales question, or clearly steps out of character.

When the demo ends, step out of character briefly, connect one or two benefits they experienced to the firm's stated problem, answer any immediate objection, and ask whether they are ready to start implementation. Do not offer another person, meeting, appointment, callback, or later follow-up.

If someone asks Riley to perform a real action, explain briefly: “This is a live simulation of the client experience. I don't connect to your systems or perform real actions here, but your deployed Legal.MyAIworker.online system will be configured to handle that workflow.” Then return naturally to the sale.

## Voice rules — critical

- Keep every reply to one to three short spoken sentences.
- Ask one question at a time.
- Use plain spoken English. No markdown, bullets, headers, emojis, tables, or long lists in replies.
- Sound calm, confident, precise, and consultative—not frantic, gimmicky, submissive, or cartoonishly aggressive.
- Do not start every reply with filler such as “Absolutely” or “Great question.”
- Do not repeat the visitor's entire statement.
- Say prices naturally: “twenty-five hundred for implementation,” “fifteen hundred a month for the first user,” and “one thousand a month for each additional user.”
- Do not read URLs aloud.
- During a demo, ask one realistic intake question at a time and wait for the fictional caller's answer.

First response: “Hi, I'm Riley, the sales and live demo guide for the AI client engagement and practice automation system built for modern law firms. Which part of your client journey needs the biggest upgrade right now: intake, scheduling, follow-up, or responding to new inquiries?”`;

  // ── STATE ───────────────────────────────────────────────────
  let apiKey      = '';
  let messages    = [];
  let isOpen      = false;
  let isTyping    = false;
  let recognition = null;
  let isListening = false;
  let voiceMode   = false;   // true = auto-reopen the mic after Max speaks
  let qrSet       = 0;

  const QUICK_REPLIES = [
    ['What does the full system include?', 'What does this cost?', 'Can I try a live intake demo?'],
    ['How does email AI help?', 'How do conflict screens work?', 'Can it book consultations?'],
    ['How does follow-up work?', 'What does the CRM track?', 'How fast can we go live?'],
  ];

  // ── DOM REFS ─────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  // ── INIT ─────────────────────────────────────────────────────
  function vapiConfigured() {
    return !!(CONFIG.vapiPublicKey && CONFIG.vapiAssistantId);
  }

  function init() {
    bindEvents();
    scheduleTeaserHide();
    injectMicStyles();
    injectMicNotice();

    if (CONFIG.apiKey && CONFIG.apiKey.indexOf('sk-ant') === 0) {
      apiKey = CONFIG.apiKey;
    }

    if (vapiConfigured()) {
      // Warm the voice SDK while the visitor reads the intro overlay,
      // so the first tap connects instead of downloading.
      setTimeout(() => { loadVapiMod().catch(() => {}); }, 300);
    }

    if (vapiConfigured() || apiKey) {
      // Production mode: no setup screen, voice-first flyer experience.
      const setup = $('aiw-setup');
      const chat  = $('aiw-chat');
      if (setup) setup.style.display = 'none';
      if (chat)  chat.style.display = 'flex';
      showIntroOverlay();
    }
    // Nothing configured: legacy behavior — visitor enters their own key.
  }

  // ── INTRO OVERLAY (the flyer experience) ─────────────────────
  // Phones block audio until the first touch, so this full-screen
  // overlay turns that mandatory first tap into the start of the demo.
  function showIntroOverlay() {
    const ov = document.createElement('div');
    ov.id = 'aiw-intro';
    ov.innerHTML = `
      <div class="aiw-intro-inner">
        <div class="aiw-intro-orb" aria-hidden="true">🎙️</div>
        <div class="aiw-intro-title">Meet Riley</div>
        <div class="aiw-intro-sub">Riley talks back <strong>out loud</strong>. Tap anywhere to start — then tap <strong>“Allow”</strong> when your browser asks to use your <strong>microphone</strong> 🎙️ so Riley can hear you.</div>
      </div>`;
    ov.addEventListener('click', startFlyerExperience, { once: true });
    ov.addEventListener('touchend', startFlyerExperience, { once: true });
    document.body.appendChild(ov);
  }

  let flyerStarted = false;
  function startFlyerExperience(e) {
    if (flyerStarted) return;        // touchend + click can both fire — run once
    flyerStarted = true;
    if (e) e.preventDefault();

    const ov = $('aiw-intro');
    if (ov) {
      ov.classList.add('aiw-intro-out');
      setTimeout(() => ov.remove(), 450);
    }

    openWindow();

    if (vapiConfigured()) {
      // Vapi mode: the assistant's firstMessage is the greeting.
      startVapiCall();
      return;
    }

    // Fallback mode: browser TTS + speech recognition.
    voiceMode = true;
    addBotMessage(GREETING_TEXT);
    if (CONFIG.greetingAudio) {
      const audio = new Audio(CONFIG.greetingAudio);
      audio.addEventListener('ended', () => startListening());
      audio.play().catch(() => speak(GREETING_TEXT, () => startListening()));
    } else {
      speak(GREETING_TEXT, () => startListening());
    }
  }

  // ── MIC NOTICE (so visitors know to allow the mic) ───────────
  // Riley is voice-first: the browser asks for mic permission the first
  // time a call starts. If the visitor dismisses or has blocked that
  // prompt, Riley can greet but never hears them. These notices make the
  // one required action — "Allow the microphone" — impossible to miss.
  function injectMicStyles() {
    if (document.getElementById('aiw-mic-style')) return;
    const css = `
      .aiw-mic-notice{display:flex;align-items:flex-start;gap:.55rem;margin-top:1.1rem;
        padding:.7rem .95rem;border:1px solid rgba(140,242,90,.38);
        background:rgba(140,242,90,.08);border-radius:11px;color:#d7eccb;
        font-size:.85rem;line-height:1.4;max-width:540px}
      .aiw-mic-notice strong{color:#a9f582}
      .aiw-mic-notice .aiw-mic-ico{font-size:1.05rem;line-height:1.3;flex:0 0 auto}
      .aiw-mic-banner{margin:0 0 .8rem;padding:.7rem .85rem;
        border:1px solid rgba(140,242,90,.42);background:rgba(140,242,90,.1);
        border-radius:11px;color:#e2f5d7;font-size:.85rem;line-height:1.45}
      .aiw-mic-banner strong{color:#bdf79c}
      .aiw-mic-banner .aiw-mic-sub{display:block;margin-top:.4rem;
        color:#a6c79a;font-size:.78rem}
      .aiw-browser-warn{margin:0 0 .8rem;padding:.8rem .95rem;
        border:1px solid rgba(255,176,60,.5);background:rgba(255,176,60,.11);
        border-radius:11px;color:#f6e6cd;font-size:.87rem;line-height:1.5}
      .aiw-browser-warn strong{color:#ffc978}
      .aiw-browser-warn .aiw-warn-steps{display:block;margin-top:.45rem;
        color:#dcc6a3;font-size:.79rem}
      .aiw-copy-link{margin-top:.6rem;display:inline-block;padding:.42rem .8rem;
        border:1px solid rgba(255,176,60,.6);background:rgba(255,176,60,.16);
        color:#ffd79a;border-radius:8px;font-size:.8rem;cursor:pointer}`;
    const el = document.createElement('style');
    el.id = 'aiw-mic-style';
    el.textContent = css;
    document.head.appendChild(el);
  }

  // Slim banner on the page itself, right under the hero "talk to Riley" prompt.
  function injectMicNotice() {
    if (document.getElementById('aiw-mic-notice')) return;
    const anchor = document.querySelector('.hero-voice-prompt');
    if (!anchor) return;
    const bar = document.createElement('div');
    bar.id = 'aiw-mic-notice';
    bar.className = 'aiw-mic-notice';
    bar.innerHTML =
      '<span class="aiw-mic-ico" aria-hidden="true">🎙️</span>' +
      '<span>Riley talks back by <strong>voice</strong>. When you start a chat, your browser ' +
      'will ask for your microphone — tap <strong>Allow</strong>, then just talk to him.</span>';
    anchor.insertAdjacentElement('afterend', bar);
  }

  // In-chat banner shown the moment a call starts, with a "blocked it?" recovery tip.
  function showMicBanner() {
    const msgs = $('aiw-messages');
    if (!msgs || document.getElementById('aiw-mic-banner')) return;
    const div = document.createElement('div');
    div.id = 'aiw-mic-banner';
    div.className = 'aiw-mic-banner';
    div.innerHTML =
      '🎙️ <strong>Allow microphone access</strong> when your browser asks — then just talk to Riley.' +
      '<span class="aiw-mic-sub">Already blocked it? Click the 🔒 lock icon in the address bar → ' +
      'set <strong>Microphone</strong> to <strong>Allow</strong> → reload the page.</span>';
    msgs.appendChild(div);
    scrollMessages();
  }

  // ── IN-APP BROWSER GUARD ─────────────────────────────────────
  // Flyer QR codes get scanned from inside Instagram, Facebook, TikTok and
  // similar in-app browsers, and most of those webviews block or silently
  // fail getUserMedia. Max is the demo, so a dead mic on first contact loses
  // the sale outright. Detect it up front and route them to a real browser
  // instead of letting vapi.start() fail with a generic "hiccup" message.
  const WEBVIEWS = [
    [/Instagram/i,                      'Instagram'],
    [/FBAN|FBAV|FB_IAB|FBIOS/i,         'Facebook'],
    [/Messenger/i,                      'Messenger'],
    [/TikTok|BytedanceWebview|musical_ly/i, 'TikTok'],
    [/Snapchat/i,                       'Snapchat'],
    [/LinkedInApp/i,                    'LinkedIn'],
    [/Pinterest/i,                      'Pinterest'],
    [/WhatsApp/i,                       'WhatsApp'],
    [/Twitter/i,                        'X'],
    [/\bLine\//i,                       'LINE'],
  ];

  // Name of the host app, used only to WORD the advice — never to block.
  function webviewName() {
    const ua = navigator.userAgent || '';
    for (const [re, name] of WEBVIEWS) {
      if (re.test(ua)) return name;
    }
    if (/Android.*;\s*wv\)/i.test(ua)) return 'this app';
    return null;
  }

  // Returns null when voice should work, else a short reason string.
  //
  // We PROBE for the microphone instead of trusting the user agent. In-app
  // browsers differ by app version and platform and plenty of them do work —
  // blocking a visitor whose mic was fine is a worse failure than the one
  // we're fixing. A UA match alone never stops a call.
  async function micCheck() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return webviewName() || 'this browser';
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());  // Vapi opens its own stream
      return null;
    } catch (err) {
      // The visitor simply declined the prompt — that's recoverable, and the
      // existing mic banner already explains how to undo it. Carry on exactly
      // as before rather than sending them away.
      if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) return null;
      // NotFoundError / NotReadableError / AbortError in a webview means the
      // environment genuinely can't hand us audio.
      return webviewName() || 'this browser';
    }
  }

  function showOpenInBrowserNotice(appName) {
    injectMicStyles();
    openWindow();
    const msgs = $('aiw-messages');
    if (!msgs || document.getElementById('aiw-browser-warn')) return;

    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');
    const steps = isIOS
      ? 'Tap the <strong>•••</strong> (or share) button at the corner of this screen, then choose <strong>Open in Safari</strong>.'
      : 'Tap the <strong>⋮</strong> menu at the corner of this screen, then choose <strong>Open in browser</strong> (Chrome).';

    const div = document.createElement('div');
    div.id = 'aiw-browser-warn';
    div.className = 'aiw-browser-warn';
    div.innerHTML =
      '⚠️ <strong>' + escapeHTML(appName) + '’s built-in browser blocks the microphone</strong>, ' +
      'so I can’t hear you in here. Open this page in your real browser and I’ll talk you through everything.' +
      '<span class="aiw-warn-steps">' + steps + '</span>' +
      '<span class="aiw-copy-link" id="aiw-copy-link" role="button" tabindex="0">📋 Copy the link instead</span>';
    msgs.appendChild(div);

    const copy = $('aiw-copy-link');
    if (copy) {
      copy.addEventListener('click', () => {
        const url = window.location.href;
        const done = () => { copy.textContent = '✅ Link copied — paste it in Safari or Chrome'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(() => { copy.textContent = url; });
        } else {
          copy.textContent = url;
        }
      });
    }
    scrollMessages();
  }

  // ── VAPI VOICE (preferred engine) ────────────────────────────
  let vapi = null;
  let vapiActive = false;
  let vapiLoading = false;
  let vapiModPromise = null;

  // Kick off the SDK download once; safe to call repeatedly.
  function loadVapiMod() {
    if (!vapiModPromise) {
      vapiModPromise = import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.5.2/+esm')
        .catch((err) => { vapiModPromise = null; throw err; });
    }
    return vapiModPromise;
  }

  async function startVapiCall() {
    if (vapiActive || vapiLoading) return;

    vapiLoading = true;
    setVoiceUI(true, 'Connecting to Riley…');

    // Only bail if the mic genuinely can't be opened here (see micCheck).
    const blocker = await micCheck();
    if (blocker) {
      vapiLoading = false;
      setVoiceUI(false);
      showOpenInBrowserNotice(blocker);
      return;
    }

    showMicBanner();

    try {
      if (!vapi) {
        // Version pinned + interop-safe unwrap: jsDelivr's +esm build wraps the
        // class in a nested default ({ default: { default: VapiClass } }), so
        // `new mod.default()` throws "not a constructor" and the call dies
        // before the mic is ever requested.
        const mod = await loadVapiMod();
        const Vapi = (mod.default && mod.default.default) ? mod.default.default : mod.default;
        vapi = new Vapi(CONFIG.vapiPublicKey);

        vapi.on('call-start', () => {
          vapiActive = true;
          vapiLoading = false;
          setVoiceUI(true, '🎙️ Live — just talk');
        });

        vapi.on('call-end', () => {
          vapiActive = false;
          vapiLoading = false;
          setVoiceUI(false);
          addBotMessage(
            'Call ended. Tap the gold button to claim the $2,500 Legal AI Implementation special, or tap the mic to talk to me again.',
            true
          );
        });

        vapi.on('message', (m) => {
          if (m.type === 'transcript' && m.transcriptType === 'final') {
            if (m.role === 'user') addUserMessage(m.transcript);
            else maxSaid(m.transcript);
          }
        });

        vapi.on('error', () => {
          vapiActive = false;
          vapiLoading = false;
          setVoiceUI(false);
          addBotMessage('⚠️ Voice connection hiccup. Tap the mic to reconnect, or type below.');
        });
      }

      await vapi.start(CONFIG.vapiAssistantId);
    } catch (err) {
      vapiActive = false;
      vapiLoading = false;
      setVoiceUI(false);
      addBotMessage('⚠️ Couldn\'t start the voice call. Tap the mic to retry, or type below.');
    }
  }

  function stopVapiCall() {
    if (vapi && (vapiActive || vapiLoading)) vapi.stop();
    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);
  }

  // ── PRICE / CLOSE DETECTION ──────────────────────────────────
  // Only treat a number as a price when it carries a $ sign or matches the
  // spoken form of one of our published amounts. Riley reads real business
  // data aloud, so bare digit matches would fire the button on phone numbers
  // and street addresses.
  const PRICE_OR_CLOSE = /\$\s?(?:1,?000|1,?500|2,?500|3,?500|10,?500)\b|payment link|implementation link|secure link|checkout|one thousand|fifteen hundred|twenty[\s-]*five hundred|thirty[\s-]*five hundred|ten thousand five hundred/i;

  // The website collects only the one-time implementation payment.
  function ctaHTML() {
    return `<div class="aiw-cta-group"><a href="${CONFIG.legalImplementationUrl}" class="aiw-cta-btn aiw-cta-btn--amber" target="_blank" rel="noopener">⚖️ Claim the Labor Day Special — $2,500</a></div>`;
  }

  // Render Riley's spoken words and surface only the implementation checkout.
  function maxSaid(text) {
    const showCTA = PRICE_OR_CLOSE.test(text);
    addBotMessageHTML(formatText(text) + (showCTA ? ctaHTML() : ''));
  }

  function setVoiceUI(live, label) {
    const btn = $('aiw-voice-btn');
    if (btn) btn.classList.toggle('listening', !!live);
    const input = $('aiw-input');
    if (input) input.placeholder = live ? (label || '🎙️ Live — just talk') : 'Type or speak...';
  }

  function bindEvents() {
    const fab    = $('aiw-fab');
    const teaser = $('aiw-teaser');
    const send   = $('aiw-send');
    const input  = $('aiw-input');
    const voice  = $('aiw-voice-btn');

    if (fab)    fab.addEventListener('click', toggleWindow);
    if (teaser) teaser.addEventListener('click', toggleWindow);
    if (send)   send.addEventListener('click', sendMessage);
    if (voice)  voice.addEventListener('click', toggleVoice);

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      input.addEventListener('input', () => autoResize(input));
    }
  }

  // ── WINDOW TOGGLE ────────────────────────────────────────────
  function toggleWindow() {
    isOpen = !isOpen;
    const win = $('aiw-window');
    const fab = $('aiw-fab');
    const tsr = $('aiw-teaser');

    if (win) win.classList.toggle('open', isOpen);
    if (fab) fab.classList.toggle('open', isOpen);
    if (tsr && isOpen) tsr.classList.add('hidden');

    if (isOpen && !apiKey) {
      // Show setup screen — key already visible
    }
  }

  function openWindow() {
    if (!isOpen) toggleWindow();
  }

  // ── TEASER / AUTO-OPEN ───────────────────────────────────────
  function scheduleTeaserHide() {
    setTimeout(() => {
      const tsr = $('aiw-teaser');
      if (tsr && !isOpen) {
        tsr.style.transition = 'opacity 0.5s';
        tsr.style.opacity = '0';
        setTimeout(() => tsr.classList.add('hidden'), 500);
      }
    }, CONFIG.teaserHide);
  }

  // ── API KEY SETUP ─────────────────────────────────────────────
  window.aiwStartBot = function () {
    const keyInput = $('aiw-api-key');
    if (!keyInput) return;
    const key = keyInput.value.trim();

    if (!key.startsWith('sk-ant')) {
      keyInput.style.borderColor = 'var(--clr-danger)';
      return;
    }

    apiKey = key;
    const setup = $('aiw-setup');
    const chat  = $('aiw-chat');

    if (setup) setup.style.display = 'none';
    if (chat)  { chat.style.display = 'flex'; }

    // Auto-greet
    setTimeout(() => {
      addBotMessage(`Hi — I'm Riley. I provide AI client engagement and practice automation for modern law firms. Which part of your client journey needs the biggest upgrade?`);
      showQuickReplies(QUICK_REPLIES[0]);
    }, 400);

    // Auto-speak greeting if voice available
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        speak(`Hi, I'm Riley. I provide AI client engagement and practice automation for modern law firms. Which part of your client journey needs the biggest upgrade?`);
      }, 800);
    }
  };

  // ── SEND MESSAGE ─────────────────────────────────────────────
  function sendMessage() {
    const input = $('aiw-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    clearQuickReplies();
    sendText(text);
  }

  async function sendText(text) {
    // During a live Vapi call, typed messages go into the call.
    if (vapiActive && vapi) {
      addUserMessage(text);
      try {
        vapi.send({ type: 'add-message', message: { role: 'user', content: text } });
      } catch (err) { /* non-fatal */ }
      return;
    }

    if (!apiKey) {
      if (vapiConfigured()) { startVapiCall(); return; }
      openWindow();
      return;
    }

    addUserMessage(text);
    messages.push({ role: 'user', content: text });

    showTyping();
    isTyping = true;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'x-api-key':     apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      CONFIG.apiModel,
          max_tokens: CONFIG.maxTokens,
          system:     SYSTEM_PROMPT,
          messages:   messages,
        }),
      });

      const data = await res.json();
      hideTyping();
      isTyping = false;

      if (data.error) {
        addBotMessage('⚠️ ' + data.error.message);
        return;
      }

      const reply = data.content[0].text;
      messages.push({ role: 'assistant', content: reply });

      const showCTA = messages.length >= 6 ||
        /price|cost|buy|ready|sign up|start|demo|trial|interested/i.test(text);

      addBotMessage(reply, showCTA);

      // Speak the reply; in voice mode, reopen the mic when done speaking
      // so the conversation flows hands-free.
      speak(reply, () => {
        if (voiceMode && isOpen && !isTyping) startListening();
      });

      qrSet = (qrSet + 1) % QUICK_REPLIES.length;
      setTimeout(() => showQuickReplies(QUICK_REPLIES[qrSet]), 700);

    } catch (err) {
      hideTyping();
      isTyping = false;
      addBotMessage('⚠️ Connection issue. Check your API key or network and try again.');
    }
  }

  // ── MESSAGE RENDERING ─────────────────────────────────────────
  function addBotMessage(text, withCTA = false) {
    const msgs = $('aiw-messages');
    if (!msgs) return;

    const div = document.createElement('div');
    div.className = 'aiw-msg bot';

    const formatted = formatText(text);

    const cta = withCTA ? ctaHTML() : '';

    div.innerHTML = `
      <div class="aiw-mini-avatar">⚖</div>
      <div class="aiw-bubble">${formatted}${cta}</div>`;

    msgs.appendChild(div);
    scrollMessages();
  }

  // Bot bubble from pre-built HTML (used for Vapi transcripts + CTAs).
  function addBotMessageHTML(html) {
    const msgs = $('aiw-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'aiw-msg bot';
    div.innerHTML = `
      <div class="aiw-mini-avatar">⚖</div>
      <div class="aiw-bubble">${html}</div>`;
    msgs.appendChild(div);
    scrollMessages();
  }

  function addUserMessage(text) {
    const msgs = $('aiw-messages');
    if (!msgs) return;

    const div = document.createElement('div');
    div.className = 'aiw-msg user';
    div.innerHTML = `<div class="aiw-bubble">${escapeHTML(text)}</div>`;
    msgs.appendChild(div);
    scrollMessages();
  }

  function showTyping() {
    const msgs = $('aiw-messages');
    if (!msgs) return;

    const div = document.createElement('div');
    div.id = 'aiw-typing';
    div.className = 'aiw-msg bot';
    div.innerHTML = `
      <div class="aiw-mini-avatar">⚖</div>
      <div class="aiw-bubble">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
    msgs.appendChild(div);
    scrollMessages();
  }

  function hideTyping() {
    const el = $('aiw-typing');
    if (el) el.remove();
  }

  function scrollMessages() {
    const msgs = $('aiw-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  // ── QUICK REPLIES ─────────────────────────────────────────────
  function showQuickReplies(replies) {
    const container = $('aiw-quick-replies');
    if (!container) return;
    container.innerHTML = '';

    replies.forEach((r) => {
      const btn = document.createElement('button');
      btn.className = 'aiw-qr';
      btn.textContent = r;
      btn.addEventListener('click', () => {
        clearQuickReplies();
        sendText(r);
      });
      container.appendChild(btn);
    });
  }

  function clearQuickReplies() {
    const container = $('aiw-quick-replies');
    if (container) container.innerHTML = '';
  }

  // ── VOICE INPUT ───────────────────────────────────────────────
  function toggleVoice() {
    if (vapiConfigured()) {
      // Vapi mode: mic button starts/ends the live call.
      if (vapiActive || vapiLoading) stopVapiCall();
      else startVapiCall();
      return;
    }

    if (isListening) {
      voiceMode = false;            // user manually stopped — break the loop
      if (recognition) recognition.stop();
      return;
    }
    voiceMode = true;               // user opted into voice — keep the loop going
    startListening();
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addBotMessage('Voice input isn\'t supported in this browser — type your question instead!');
      voiceMode = false;
      return;
    }

    if (isListening) return;

    const btn = $('aiw-voice-btn');

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      if (btn) btn.classList.add('listening');
      const overlay = $('aiw-voice-overlay');
      if (overlay) overlay.classList.add('active');
      const input = $('aiw-input');
      if (input) input.placeholder = '🎙️ Listening...';
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const input = $('aiw-input');
      if (input) input.value = transcript;
      sendMessage();
    };

    recognition.onend = () => {
      isListening = false;
      if (btn) btn.classList.remove('listening');
      const overlay = $('aiw-voice-overlay');
      if (overlay) overlay.classList.remove('active');
      const input = $('aiw-input');
      if (input) input.placeholder = 'Type or speak...';
    };

    recognition.onerror = recognition.onend;
    recognition.start();
  }

  window.aiwDismissVoice = function () {
    voiceMode = false;
    const overlay = $('aiw-voice-overlay');
    if (overlay) overlay.classList.remove('active');
    if (recognition) recognition.stop();
  };

  // ── SPEECH SYNTHESIS ──────────────────────────────────────────
  function speak(text, onDone) {
    if (!('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }
    window.speechSynthesis.cancel();

    // Strip markdown and URLs for speech
    const clean = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/\n/g, ' ')
      .substring(0, 400);

    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate   = 1.05;
    utter.pitch  = 1.0;
    utter.volume = 0.9;

    // Pick a decent voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      /Google US English|Microsoft David|Alex|Samantha/i.test(v.name)
    );
    if (preferred) utter.voice = preferred;

    // Fire onDone exactly once — utter.onend is flaky on some phones,
    // so a duration-based fallback timer backs it up.
    let fired = false;
    const done = () => {
      if (fired) return;
      fired = true;
      if (onDone) onDone();
    };
    utter.onend = done;
    utter.onerror = done;
    const estMs = Math.min(2000 + clean.length * 65, 30000);
    setTimeout(done, estMs);

    window.speechSynthesis.speak(utter);
  }

  // ── HELPERS ───────────────────────────────────────────────────
  function formatText(text) {
    return text
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[^"=])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/\n/g,            '<br>');
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  // ── PUBLIC API ────────────────────────────────────────────────
  window.aiwSendText = sendText;
  window.aiwToggle   = toggleWindow;

  // ── START ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
