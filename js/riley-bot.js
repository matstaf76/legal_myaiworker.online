/* ============================================================
   Legal.MyAIworker.online — bot.js
   Riley AI Chat + Vapi Voice Widget
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  const CONFIG = {
    botName: 'Riley',
    companyName: 'Legal.MyAIworker.online',

    // Vapi public keys are designed for browser use.
    vapiPublicKey: '19fae66b-8dd9-463f-8bab-b887a929da78',
    vapiAssistantId: '99f20fd1-f643-4612-b50e-89b2ed33b409',

    legalImplementationUrl:
      'https://buy.stripe.com/9B614o3lQfpVfMF7351kA0l',

    teaserHide: 9000,
  };

  const SYSTEM_PROMPT = `
You are Riley, the calm, precise, consultative voice sales agent and live
demonstration guide for Legal.MyAIworker.online.

You speak with attorneys, law-firm owners, partners, administrators, and
authorized law-firm staff.

Legal.MyAIworker.online is a premium AI client-engagement and practice-
automation system for modern law firms. It coordinates voice, website chat,
email AI, preliminary intake, consultation scheduling, follow-up, CRM records,
and approved workflows.

Riley is the sales agent and immediate conversational demonstration. Riley is
not a lawyer and never gives legal advice.

Riley has no live backend connections. Riley cannot access or update calendars,
CRM records, email, intake forms, medical records, billing systems, Stripe,
websites, phone systems, or workflows. A demonstration is a fictional
simulation and never performs a real business action.

The website and Riley may present only this one-time implementation checkout:

https://buy.stripe.com/9B614o3lQfpVfMF7351kA0l

Pricing:
- Legal AI implementation is $2,500 under the Labor Day Special through
  September 7, 2026.
- The first user is $1,500 per month.
- Each additional attorney, staff member, or paralegal needing access is
  $1,000 per month.
- The first recurring invoice is sent 30 days after go-live.
- Service is month-to-month and may be canceled anytime.
- Go-live is guaranteed within three business days of implementation payment,
  or the implementation payment is refunded.

Voice rules:
- Keep every response to one to three short spoken sentences.
- Ask one question at a time.
- Use plain spoken English.
- Do not use markdown, headings, tables, long lists, or emojis in spoken
  responses.
- Never read a raw URL aloud.
- When saying Legal.MyAIworker.online aloud, pronounce it naturally as
  "Legal dot My AI Worker dot online."
- Never spell the website address letter by letter.
- Say prices naturally: "twenty-five hundred for implementation,"
  "fifteen hundred a month for the first user," and
  "one thousand a month for each additional user."
- Never provide legal advice.
- Never imply that contacting a firm creates an attorney-client relationship.
- Never claim that a simulated action was saved, scheduled, sent, routed,
  verified, or completed.

When an attorney asks for a demonstration, begin a fictional role-play
immediately. Tell the attorney to use fictional details. Behave like the
deployed intake agent, ask one realistic question at a time, and retain all
legal-advice, confidentiality, conflict-screening, and attorney-client-
relationship boundaries.

Lead with outcomes rather than a feature dump. Diagnose the firm's main
operational bottleneck, explain the most relevant benefit, answer objections
briefly, and ask directly whether the visitor is ready to start implementation.

First response:
"Hi, I'm Riley, the sales and live demo guide for modern law firms. What would
make the biggest difference to your practice right now: faster responses to
new inquiries, smoother intake and scheduling, or more consistent follow-up?"
`.trim();

  // ── STATE ───────────────────────────────────────────────────
  let isOpen = false;
  let vapi = null;
  let vapiActive = false;
  let vapiLoading = false;
  let vapiModulePromise = null;
  let checkoutOffered = false;

  const $ = (id) => document.getElementById(id);

  // ── INITIALIZATION ──────────────────────────────────────────
  function init() {
    bindEvents();
    injectMicStyles();
    injectMicNotice();
    scheduleTeaserHide();

    const setup = $('aiw-setup');
    const chat = $('aiw-chat');

    if (setup) setup.style.display = 'none';
    if (chat) chat.style.display = 'flex';

    /*
     * Download the SDK while the visitor reads the page.
     * This does not start a call or consume Vapi minutes.
     */
    if (vapiConfigured()) {
      setTimeout(function () {
        loadVapiModule().catch(function (error) {
          console.error('Riley Vapi SDK preload failed:', error);
        });
      }, 300);
    }
  }

  function vapiConfigured() {
    return Boolean(CONFIG.vapiPublicKey && CONFIG.vapiAssistantId);
  }

  // ── VAPI SDK ────────────────────────────────────────────────
  function loadVapiModule() {
    if (!vapiModulePromise) {
      vapiModulePromise = import(
        'https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.5.2/+esm'
      ).catch(function (error) {
        vapiModulePromise = null;
        throw error;
      });
    }

    return vapiModulePromise;
  }

  function getVapiConstructor(module) {
    if (
      module &&
      module.default &&
      module.default.default &&
      typeof module.default.default === 'function'
    ) {
      return module.default.default;
    }

    if (module && typeof module.default === 'function') {
      return module.default;
    }

    if (typeof module === 'function') {
      return module;
    }

    return null;
  }

  function stringifyErrorDetail(value) {
    if (value === undefined || value === null || value === '') return '';

    if (typeof value === 'string') {
      return value === '[object Object]' ? '' : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    try {
      const seen = [];
      const serialized = JSON.stringify(value, function (key, current) {
        if (current instanceof Error) {
          return {
            name: current.name,
            message: current.message,
          };
        }

        if (current && typeof current === 'object') {
          if (seen.indexOf(current) !== -1) return '[Circular]';
          seen.push(current);
        }

        return current;
      });

      if (serialized && serialized !== '{}' && serialized !== '[]') {
        return serialized;
      }
    } catch (_) {
      // Fall through to a guarded string conversion.
    }

    const fallback = String(value);
    return fallback === '[object Object]' ? '' : fallback;
  }

  function describeVapiError(error) {
    if (!error) return 'Unknown Vapi error';

    const nested = error && typeof error === 'object' ? error.error : null;
    const candidates = [
      nested && nested.message,
      nested && nested.msg,
      nested && nested.code,
      nested && nested.type,
      nested && nested.statusCode,
      error.message,
      error.msg,
      error.code,
      error.type,
      error.statusCode,
      nested,
      error,
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const detail = stringifyErrorDetail(candidates[index]);
      if (detail) return detail;
    }

    return 'Unknown Vapi error';
  }

  async function createVapiClient() {
    if (vapi) return vapi;

    const module = await loadVapiModule();
    const Vapi = getVapiConstructor(module);

    if (!Vapi) {
      throw new Error('Vapi SDK constructor was not found');
    }

    vapi = new Vapi(CONFIG.vapiPublicKey);

    vapi.on('call-start', handleVapiCallStart);
    vapi.on('call-end', handleVapiCallEnd);
    vapi.on('message', handleVapiMessage);
    vapi.on('error', handleVapiError);

    return vapi;
  }

  // ── VAPI CALL LIFECYCLE ─────────────────────────────────────
  async function startVapiCall() {
    if (vapiActive || vapiLoading) return;

    if (!vapiConfigured()) {
      addBotMessage('Voice is not configured yet.');
      return;
    }

    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      showOpenInBrowserNotice(webviewName() || 'this browser');
      return;
    }

    vapiLoading = true;
    openWindow();
    showMicBanner();
    setVoiceUI(true, 'Connecting to Riley…');

    try {
      const client = await createVapiClient();

      /*
       * Vapi owns the microphone request.
       * Do not open and close a separate microphone stream here.
       */
      await client.start(CONFIG.vapiAssistantId);
    } catch (error) {
      handleVapiStartFailure(error);
    }
  }

  function stopVapiCall() {
    if (vapi && (vapiActive || vapiLoading)) {
      try {
        vapi.stop();
      } catch (error) {
        console.error('Riley Vapi stop failed:', error);
      }
    }

    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);
  }

  function handleVapiCallStart() {
    vapiActive = true;
    vapiLoading = false;
    setVoiceUI(true, '🎙️ Live — just talk');
  }

  function handleVapiCallEnd() {
    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);

    addBotMessageHTML(
      '<strong>Call ended.</strong> Tap the microphone to talk to Riley again.' +
        checkoutHTML()
    );
  }

  function handleVapiError(error) {
    const detail = describeVapiError(error);

    console.error('Riley Vapi error: ' + detail, error);

    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);

    addBotMessage(
      '⚠️ Riley could not start the voice session. Error: ' + detail
    );
  }

  function handleVapiStartFailure(error) {
    const detail = describeVapiError(error);

    console.error('Riley Vapi start failed: ' + detail, error);

    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);

    addBotMessage(
      '⚠️ Riley could not start the voice session. Error: ' + detail
    );
  }

  function handleVapiMessage(message) {
    if (!message || message.type !== 'transcript') return;
    if (message.transcriptType !== 'final') return;

    const text =
      message.transcript ||
      message.text ||
      (message.message && message.message.content) ||
      message.transcriptText;

    if (!text) return;

    const role =
      message.role ||
      (message.message && message.message.role) ||
      'assistant';

    if (role === 'user') {
      addUserMessage(text);
      return;
    }

    rileySaid(text);
  }

  // ── PUBLIC VOICE CONTROLS ───────────────────────────────────
  function toggleVoice() {
    if (vapiActive || vapiLoading) {
      stopVapiCall();
      return;
    }

    startVapiCall();
  }

  /*
   * Called by the large "Let's Talk to Riley" button.
   * One deliberate click opens the widget and starts voice.
   * Nothing starts automatically on page load.
   */
  window.aiwStartVoice = function () {
    openWindow();
    startVapiCall();
  };

  window.aiwDismissVoice = function () {
    stopVapiCall();

    const overlay = $('aiw-voice-overlay');
    if (overlay) overlay.classList.remove('active');
  };

  // ── TEXT INPUT DURING A VAPI CALL ───────────────────────────
  function sendMessage() {
    const input = $('aiw-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    sendText(text);
  }

  function sendText(text) {
    if (!text) return;

    if (!vapiActive || !vapi) {
      addBotMessage(
        'Tap the microphone to start talking with Riley.'
      );
      return;
    }

    addUserMessage(text);

    try {
      vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: text,
        },
      });
    } catch (error) {
      console.error('Riley typed-message delivery failed:', error);
      addBotMessage(
        '⚠️ That message could not be added to the voice session.'
      );
    }
  }

  window.aiwSendText = sendText;

  // ── CHECKOUT DISPLAY ────────────────────────────────────────
  const PRICE_OR_CLOSE =
    /\$\s?(?:1,?000|1,?500|2,?500|3,?500|10,?500)\b|payment link|implementation link|secure link|checkout|twenty[\s-]*five hundred|fifteen hundred|one thousand/i;

  function checkoutHTML() {
    return (
      '<div class="aiw-cta-group">' +
      '<a href="' +
      escapeAttribute(CONFIG.legalImplementationUrl) +
      '" class="aiw-cta-btn aiw-cta-btn--amber" ' +
      'target="_blank" rel="noopener">' +
      '⚖️ Claim the Labor Day Special — $2,500' +
      '</a>' +
      '</div>'
    );
  }

  function rileySaid(text) {
    const showCheckout =
      checkoutOffered || PRICE_OR_CLOSE.test(String(text));

    if (showCheckout) checkoutOffered = true;

    addBotMessageHTML(
      formatText(text) + (showCheckout ? checkoutHTML() : '')
    );
  }

  // ── WIDGET EVENTS ───────────────────────────────────────────
  function bindEvents() {
    const fab = $('aiw-fab');
    const teaser = $('aiw-teaser');
    const send = $('aiw-send');
    const input = $('aiw-input');
    const voice = $('aiw-voice-btn');

    if (fab) fab.addEventListener('click', toggleWindow);
    if (teaser) teaser.addEventListener('click', toggleWindow);
    if (send) send.addEventListener('click', sendMessage);
    if (voice) voice.addEventListener('click', toggleVoice);

    if (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      });

      input.addEventListener('input', function () {
        autoResize(input);
      });
    }

    /*
     * The hero prompt is a role="button" div.
     * Give keyboard users the same deliberate start behavior.
     */
    const heroPrompt = document.querySelector('.hero-voice-prompt');

    if (heroPrompt) {
      heroPrompt.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.aiwStartVoice();
        }
      });
    }
  }

  // ── WIDGET WINDOW ───────────────────────────────────────────
  function toggleWindow() {
    isOpen = !isOpen;

    const win = $('aiw-window');
    const fab = $('aiw-fab');
    const teaser = $('aiw-teaser');

    if (win) win.classList.toggle('open', isOpen);

    if (fab) {
      fab.classList.toggle('open', isOpen);
      fab.setAttribute('aria-expanded', String(isOpen));
    }

    if (teaser && isOpen) {
      teaser.classList.add('hidden');
    }

    if (!isOpen && (vapiActive || vapiLoading)) {
      stopVapiCall();
    }
  }

  function openWindow() {
    if (!isOpen) toggleWindow();
  }

  window.aiwToggle = toggleWindow;

  // ── VOICE UI ────────────────────────────────────────────────
  function setVoiceUI(live, label) {
    const voiceButton = $('aiw-voice-btn');
    const input = $('aiw-input');

    if (voiceButton) {
      voiceButton.classList.toggle('listening', Boolean(live));
      voiceButton.setAttribute(
        'aria-label',
        live ? 'End voice call' : 'Start voice call'
      );
      voiceButton.title = live ? 'End voice call' : 'Start voice call';
    }

    if (input) {
      input.placeholder = live
        ? label || '🎙️ Live — just talk'
        : 'Type or speak...';
    }
  }

  // ── MICROPHONE GUIDANCE ─────────────────────────────────────
  function injectMicStyles() {
    if ($('aiw-mic-style')) return;

    const style = document.createElement('style');
    style.id = 'aiw-mic-style';

    style.textContent = `
      .aiw-mic-notice {
        display: flex;
        align-items: flex-start;
        gap: .55rem;
        margin-top: 1.1rem;
        padding: .7rem .95rem;
        border: 1px solid rgba(140, 242, 90, .38);
        background: rgba(140, 242, 90, .08);
        border-radius: 11px;
        color: #d7eccb;
        font-size: .85rem;
        line-height: 1.4;
        max-width: 540px;
      }

      .aiw-mic-notice strong {
        color: #a9f582;
      }

      .aiw-mic-notice .aiw-mic-ico {
        flex: 0 0 auto;
        font-size: 1.05rem;
        line-height: 1.3;
      }

      .aiw-mic-banner {
        margin: 0 0 .8rem;
        padding: .7rem .85rem;
        border: 1px solid rgba(140, 242, 90, .42);
        background: rgba(140, 242, 90, .1);
        border-radius: 11px;
        color: #e2f5d7;
        font-size: .85rem;
        line-height: 1.45;
      }

      .aiw-mic-banner strong {
        color: #bdf79c;
      }

      .aiw-mic-banner .aiw-mic-sub {
        display: block;
        margin-top: .4rem;
        color: #a6c79a;
        font-size: .78rem;
      }

      .aiw-browser-warn {
        margin: 0 0 .8rem;
        padding: .8rem .95rem;
        border: 1px solid rgba(255, 176, 60, .5);
        background: rgba(255, 176, 60, .11);
        border-radius: 11px;
        color: #f6e6cd;
        font-size: .87rem;
        line-height: 1.5;
      }

      .aiw-browser-warn strong {
        color: #ffc978;
      }

      .aiw-browser-warn .aiw-warn-steps {
        display: block;
        margin-top: .45rem;
        color: #dcc6a3;
        font-size: .79rem;
      }

      .aiw-copy-link {
        display: inline-block;
        margin-top: .6rem;
        padding: .42rem .8rem;
        border: 1px solid rgba(255, 176, 60, .6);
        background: rgba(255, 176, 60, .16);
        color: #ffd79a;
        border-radius: 8px;
        font-size: .8rem;
        cursor: pointer;
      }
    `;

    document.head.appendChild(style);
  }

  function injectMicNotice() {
    if ($('aiw-mic-notice')) return;

    const anchor = document.querySelector('.hero-voice-prompt');
    if (!anchor) return;

    const notice = document.createElement('div');
    notice.id = 'aiw-mic-notice';
    notice.className = 'aiw-mic-notice';

    notice.innerHTML =
      '<span class="aiw-mic-ico" aria-hidden="true">🎙️</span>' +
      '<span>Press <strong>Let’s Talk to Riley</strong>, allow microphone ' +
      'access when asked, and speak normally.</span>';

    anchor.insertAdjacentElement('afterend', notice);
  }

  function showMicBanner() {
    const messages = $('aiw-messages');

    if (!messages || $('aiw-mic-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'aiw-mic-banner';
    banner.className = 'aiw-mic-banner';

    banner.innerHTML =
      '🎙️ <strong>Allow microphone access</strong> when your browser asks, ' +
      'then talk to Riley.' +
      '<span class="aiw-mic-sub">' +
      'If access was previously blocked, open the site permissions beside ' +
      'the address bar, allow the microphone, and reload the page.' +
      '</span>';

    messages.appendChild(banner);
    scrollMessages();
  }

  const WEBVIEWS = [
    [/Instagram/i, 'Instagram'],
    [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook'],
    [/Messenger/i, 'Messenger'],
    [/TikTok|BytedanceWebview|musical_ly/i, 'TikTok'],
    [/Snapchat/i, 'Snapchat'],
    [/LinkedInApp/i, 'LinkedIn'],
    [/Pinterest/i, 'Pinterest'],
    [/WhatsApp/i, 'WhatsApp'],
    [/Twitter/i, 'X'],
    [/\bLine\//i, 'LINE'],
  ];

  function webviewName() {
    const userAgent = navigator.userAgent || '';

    for (const entry of WEBVIEWS) {
      if (entry[0].test(userAgent)) return entry[1];
    }

    if (/Android.*;\s*wv\)/i.test(userAgent)) {
      return 'this app';
    }

    return null;
  }

  function showOpenInBrowserNotice(appName) {
    injectMicStyles();
    openWindow();

    const messages = $('aiw-messages');

    if (!messages || $('aiw-browser-warn')) return;

    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || '');

    const steps = isIOS
      ? 'Use the share or menu button and choose Open in Safari.'
      : 'Use the menu and choose Open in browser or Open in Chrome.';

    const warning = document.createElement('div');
    warning.id = 'aiw-browser-warn';
    warning.className = 'aiw-browser-warn';

    warning.innerHTML =
      '⚠️ <strong>' +
      escapeHTML(appName) +
      ' cannot provide microphone access.</strong>' +
      '<span class="aiw-warn-steps">' +
      steps +
      '</span>' +
      '<span class="aiw-copy-link" id="aiw-copy-link" ' +
      'role="button" tabindex="0">📋 Copy this page link</span>';

    messages.appendChild(warning);

    const copyButton = $('aiw-copy-link');

    if (copyButton) {
      const copyLink = function () {
        const url = window.location.href;

        const complete = function () {
          copyButton.textContent =
            '✅ Link copied — paste it into Safari or Chrome';
        };

        if (
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === 'function'
        ) {
          navigator.clipboard.writeText(url).then(complete).catch(function () {
            copyButton.textContent = url;
          });
        } else {
          copyButton.textContent = url;
        }
      };

      copyButton.addEventListener('click', copyLink);

      copyButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          copyLink();
        }
      });
    }

    scrollMessages();
  }

  // ── CHAT RENDERING ──────────────────────────────────────────
  function addBotMessage(text) {
    addBotMessageHTML(formatText(text));
  }

  function addBotMessageHTML(html) {
    const messages = $('aiw-messages');
    if (!messages) return;

    const message = document.createElement('div');
    message.className = 'aiw-msg bot';

    message.innerHTML =
      '<div class="aiw-mini-avatar">⚖</div>' +
      '<div class="aiw-bubble">' +
      html +
      '</div>';

    messages.appendChild(message);
    scrollMessages();
  }

  function addUserMessage(text) {
    const messages = $('aiw-messages');
    if (!messages) return;

    const message = document.createElement('div');
    message.className = 'aiw-msg user';

    message.innerHTML =
      '<div class="aiw-bubble">' +
      escapeHTML(text) +
      '</div>';

    messages.appendChild(message);
    scrollMessages();
  }

  function scrollMessages() {
    const messages = $('aiw-messages');

    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function scheduleTeaserHide() {
    setTimeout(function () {
      const teaser = $('aiw-teaser');

      if (teaser && !isOpen) {
        teaser.style.transition = 'opacity .5s';
        teaser.style.opacity = '0';

        setTimeout(function () {
          teaser.classList.add('hidden');
        }, 500);
      }
    }, CONFIG.teaserHide);
  }

  // ── FORMATTING ──────────────────────────────────────────────
  function formatText(value) {
    return escapeHTML(String(value))
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      )
      .replace(
        /(^|[^"=])(https?:\/\/[^\s<]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener">$2</a>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  function autoResize(element) {
    element.style.height = 'auto';
    element.style.height =
      Math.min(element.scrollHeight, 96) + 'px';
  }

  // ── START ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
