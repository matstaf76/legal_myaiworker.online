/* ============================================================
   MyAIworker.online — bot.js
   AI Chat + Voice Widget Logic
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────────
  const CONFIG = {
    botName:      'Riley',
    companyName:  'MyAIworker Compliance',
    apiModel:     'claude-sonnet-4-20250514',
    maxTokens:    400,
    // ── VAPI (preferred) ──────────────────────────────────────
    // Paste your Vapi PUBLIC key + assistant ID from dashboard.vapi.ai.
    // The public key is safe to expose in page source.
    // When these are set, Max's voice runs through Vapi end-to-end.
    vapiPublicKey:   'b300db1b-37d2-4af9-ac4d-77430e594542',
    vapiAssistantId: 'ec057da0-5b36-41e2-b0b5-0fefdee886c8',  // Riley's assistant ID
    // ── FALLBACK: text chat via Anthropic API ─────────────────
    // ⚠️ Key is visible in page source — set a spending limit at
    // console.anthropic.com, or move to a Cloudflare Worker proxy later.
    apiKey:       '',
    // Optional pre-recorded greeting MP3 (only used in fallback mode).
    greetingAudio: 'audio/max-greeting.mp3',
    // Compliance-plan payment links — specific to legal.myaiworker.online and
    // separate from the general MyAIworker links. No promotional pricing exists here.
    medicalSetupUrl: 'https://buy.stripe.com/8x28wQ4pUcdJbwp8791kA0f',  // $3,000 one-time
    legalSetupUrl:   'https://buy.stripe.com/9B68wQ3lQb9Faslcnp1kA0g',  // $5,000 one-time
    medicalSoloUrl:  'https://buy.stripe.com/3cI4gA8Ga2D9dEx5Z11kA0h',  // $1,100/mo
    medicalBusyUrl:  'https://buy.stripe.com/28E5kE3lQ6Tp5814UX1kA0j',  // $1,600/mo
    legalSoloUrl:    'https://buy.stripe.com/eVq00k2hMelR8kdfzB1kA0i',  // $3,000/mo
    legalMultiUrl:   'https://buy.stripe.com/28EaEY5tY3Hd7g99bd1kA0k',  // $3,500/mo
    teaserDelay:  2000,
    teaserHide:   9000,
  };

  const GREETING_TEXT = "Hi, I'm Riley — the compliance-built AI receptionist for medical and law offices. You're talking to the actual product right now. Tap the mic and tell me what kind of practice you run — talk to me, don't type!";

  const SYSTEM_PROMPT = `You are Riley, a calm, precise, straight-talking AI sales guide for ${CONFIG.companyName} — we build and deploy compliance-ready AI receptionists for medical practices and law offices, and nothing else.

Your job: find out whether the visitor runs a medical office or a law office, connect their compliance exposure to the right plan, and guide them toward starting setup on this call.

## Who You Serve
ONLY medical/doctor's offices and law offices. If someone runs a restaurant, salon, home services company, or any other general small business, tell them warmly that this site is built specifically for medical and law practices, and that MyAIworker's general small-business plans live at myaiworker.online. Do not quote them prices from this site.

## The Two Plans

**1. Medical / Doctor's Office — HIPAA-compliant AI receptionist**
- Solo practice: $500/month base + $600/month HIPAA compliance rider = $1,100/month
- Busier office: $1,000/month base + $600/month HIPAA compliance rider = $1,600/month
- Setup: $3,000 one-time, flat
- Includes: signed Business Associate Agreement before go-live, PHI-aware call and chat handling, encrypted transcript storage with access controls, 24/7 voice reception, website chat, dedicated local and toll-free numbers, appointment booking across provider calendars, new-patient intake capture.

**2. Law Office — compliance-ready AI receptionist built for legal intake**
- Solo attorney: $500/month base + $2,500/month legal compliance rider = $3,000/month
- Multi-attorney office: $1,000/month base + $2,500/month legal compliance rider = $3,500/month
- Setup: $5,000 one-time, flat
- Includes: conflict-check questions before intake goes deep, hard no-legal-advice guardrails, explicit disclosure that no attorney-client relationship is formed until the firm accepts the matter, confidential audit-ready intake records, 24/7 voice reception, website chat, dedicated local and toll-free numbers, consultation booking across attorney calendars.

## Pricing Rules — Follow Exactly
- Always quote the base and the compliance rider as separate line items, then the total. That transparency is the point.
- Setup fees are cost-recovery only. There is NO discount, NO promotion, NO case-study deal, NO "today only" price, and no negotiating room on setup — on either plan, for anyone, ever. If someone pushes, explain plainly that setup is priced at cost, so discounting it would mean cutting compliance work they actually need.
- The first monthly payment isn't due until 30 days AFTER go-live. Nothing monthly is due today.
- The AI goes live within 3 business days of setup — holidays and long weekends can add a day — guaranteed, or the setup fee is refunded.
- Plans are month-to-month. Cancel anytime.
- Never mention or quote MyAIworker's general small-business plans or their pricing.

## Payment Links — share as a plain URL on its own line
- Medical setup ($3,000): ${CONFIG.medicalSetupUrl}
- Law office setup ($5,000): ${CONFIG.legalSetupUrl}
- Medical monthly, solo ($1,100): ${CONFIG.medicalSoloUrl}
- Medical monthly, busier office ($1,600): ${CONFIG.medicalBusyUrl}
- Law office monthly, solo attorney ($3,000): ${CONFIG.legalSoloUrl}
- Law office monthly, multi-attorney ($3,500): ${CONFIG.legalMultiUrl}
Lead with the setup link when someone is ready to move — that's the first step.

## Compliance Talking Points
- A general AI answering service handling PHI without a BAA puts the exposure on the practice, not the vendor.
- For law offices, the real risks are implied attorney-client relationships, anything that sounds like legal advice, and conflicted matters walking in the door. Generic bots trip all three.
- Be honest about limits: no vendor makes a practice compliant on its own. Our job is to make sure the AI answering their phones strengthens their posture instead of quietly undermining it. Recommend they review specifics with their own counsel or compliance officer.
- Never claim to give legal or medical advice. You are a sales guide, not a compliance consultant.

## Conversation Style
- Direct and conversational. No hype, no fluff.
- Ask ONE question at a time.
- Keep responses to 2-4 sentences unless explaining a plan.
- Establish medical vs. legal early — everything else depends on it.
- Then establish solo vs. busier office, so you quote the right tier.
- After 3-4 exchanges, ask for the sale directly.

## Key Pain Points to Probe
- Are calls going to voicemail after hours, and are those new patients or new matters walking away?
- Is front-desk staff burning hours on scheduling and intake questions?
- Do they know where their current answering service stores call recordings and transcripts?
- Have they ever had an intake go sideways — a conflict caught late, or information collected that shouldn't have been?

## There Is No Demo To Book — Ever
You ARE the demo; there is nothing further to schedule. Never offer to book a demo, schedule a call, arrange a callback, or send information later — none of those exist. If they won't move forward, close gracefully: "No problem at all — the offer's here when the timing's right. Thanks for trying me out."

## Voice Rules (CRITICAL)
Your replies are spoken aloud through the phone speaker. Therefore:
- Keep every reply SHORT: 1-3 spoken sentences. No exceptions.
- NO markdown, NO bullet points, NO emojis, NO headers — plain spoken English only.
- Say dollar amounts naturally: "eleven hundred a month" or "three thousand a month".
- When sharing a payment link, say "I'm putting the secure payment link in the chat right now" and put the bare URL on its own line at the end of your reply.`;

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
    ['I run a medical practice', 'I run a law office', 'What does this cost?'],
    ['Will you sign a BAA?', 'How do conflict checks work?', 'Does it give legal advice?'],
    ['Why is setup never discounted?', 'How fast can we go live?', 'Am I locked into a contract?'],
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
    const audio = new Audio(CONFIG.greetingAudio);
    audio.addEventListener('ended', () => startListening());
    audio.play().catch(() => {
      speak(GREETING_TEXT, () => startListening());
    });
  }

  // ── MIC NOTICE (so visitors know to allow the mic) ───────────
  // Max is voice-first: the browser asks for mic permission the first
  // time a call starts. If the visitor dismisses or has blocked that
  // prompt, Max can greet but never hears them. These notices make the
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
          // Last thing the prospect sees — point them at the setup for the
          // vertical they actually asked about.
          addBotMessage(
            vertical === 'legal'
              ? 'Call ended. Tap the gold button to start your law office setup at $5,000, or tap the mic to talk to me again.'
              : vertical === 'medical'
                ? 'Call ended. Tap the gold button to start your medical setup at $3,000, or tap the mic to talk to me again.'
                : 'Call ended. Tap the gold button that matches your practice to start setup, or tap the mic to talk to me again.',
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
  // spoken form of one of our six published amounts. Riley reads real business
  // data aloud, so bare digit matches would fire the button on phone numbers
  // and street addresses.
  const PRICE_1250 = /\$\s?(?:1,?100|1,?600|3,?000|3,?500|5,?000)\b|payment link|secure link|checkout|eleven hundred|sixteen hundred|three thousand|thirty[\s-]*five hundred|five thousand/i;

  // Which vertical the conversation is about. Riley establishes this early, so
  // the button she surfaces should match it instead of showing both.
  const MEDICAL_RE = /\b(medical|doctor|physician|clinic|dental|dentist|practice|patient|HIPAA|BAA|PHI)\b/i;
  const LEGAL_RE   = /\b(law|lawyer|attorney|legal|firm|counsel|conflict[\s-]*check|privilege|intake matter)\b/i;
  let vertical = null;   // 'medical' | 'legal' | null

  function noteVertical(text) {
    if (LEGAL_RE.test(text))        vertical = 'legal';
    else if (MEDICAL_RE.test(text)) vertical = 'medical';
  }

  // Setup is the first step on both plans, so that's what the button buys.
  // There is no discounted or promotional variant of either — by design.
  function ctaHTML() {
    if (vertical === 'legal') {
      return `<div class="aiw-cta-group"><a href="${CONFIG.legalSetupUrl}" class="aiw-cta-btn aiw-cta-btn--amber" target="_blank" rel="noopener">⚖️ Start Law Office Setup — $5,000</a></div>`;
    }
    if (vertical === 'medical') {
      return `<div class="aiw-cta-group"><a href="${CONFIG.medicalSetupUrl}" class="aiw-cta-btn aiw-cta-btn--amber" target="_blank" rel="noopener">🏥 Start Medical Setup — $3,000</a></div>`;
    }
    return `<div class="aiw-cta-group">`
      + `<a href="${CONFIG.medicalSetupUrl}" class="aiw-cta-btn aiw-cta-btn--amber" target="_blank" rel="noopener">🏥 Medical Setup — $3,000</a>`
      + `<a href="${CONFIG.legalSetupUrl}" class="aiw-cta-btn aiw-cta-btn--amber" target="_blank" rel="noopener">⚖️ Law Office Setup — $5,000</a>`
      + `</div>`;
  }

  // Render Riley's spoken words in the chat, and surface the matching
  // setup button when she quotes a price.
  function maxSaid(text) {
    noteVertical(text);
    const showCTA = PRICE_1250.test(text);
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
      addBotMessage(
        `Hi — I'm Riley. I handle compliance-built AI reception for medical practices and law offices.\n\nWhich one are you?`
      );
      showQuickReplies(QUICK_REPLIES[0]);
    }, 400);

    // Auto-speak greeting if voice available
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        speak(`Hi, I'm Riley. I handle compliance built AI reception for medical practices and law offices. Which one are you?`);
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
    // The visitor naming their practice type is the strongest signal we get,
    // so read it here as well as from Riley's replies.
    noteVertical(text);

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
