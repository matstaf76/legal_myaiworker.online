/* ============================================================
   Fake Law Firm — Riley voice integration
   Riley AI Chat + Vapi Voice Widget
   ============================================================ */

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  const CONFIG = {
    botName: 'Riley',
    companyName: 'Fake Law Firm',

    // Vapi public keys are designed for browser use.
    vapiPublicKey: '19fae66b-8dd9-463f-8bab-b887a929da78',
    vapiAssistantId: '99f20fd1-f643-4612-b50e-89b2ed33b409',

    teaserHide: 9000,
  };

  // External prompt: manual update in RILEY-PROMPT-UPDATE.md.

  // ── STATE ───────────────────────────────────────────────────
  let isOpen = false;
  let vapi = null;
  let vapiActive = false;
  let vapiLoading = false;
  let vapiModulePromise = null;
  let callAttempt = 0;
  let sectionContext = 'Legal AI / Introduction';
  let sentContext = '';
  let voiceFailureReported = false;

  const $ = (id) => document.getElementById(id);

  // ── INITIALIZATION ──────────────────────────────────────────
  function init() {
    bindEvents();
    injectMicStyles();
    // Existing sales microphone guidance is provided by its own CTA.
    scheduleTeaserHide();
    setVoiceUI(false);

    const setup = $('aiw-setup');
    const chat = $('aiw-chat');

    if (setup) setup.style.display = 'none';
    if (chat) chat.style.display = 'flex';

    // Load the external SDK only after an explicit voice request.
  }

  function vapiConfigured() {
    return Boolean(CONFIG.vapiPublicKey && CONFIG.vapiAssistantId);
  }

  // ── VAPI SDK ────────────────────────────────────────────────
  function loadVapiModule() {
    if (!vapiModulePromise) {
      vapiModulePromise = import(
        'https://cdn.jsdelivr.net/npm/@vapi-ai/web@2.6.1/+esm'
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

    const attempt = ++callAttempt;
    voiceFailureReported = false;
    vapiLoading = true;
    openWindow();
    showMicBanner();
    setVoiceUI(true, 'Connecting to Riley…');

    try {
      const client = await createVapiClient();
      if (attempt !== callAttempt) return;

      /*
       * Vapi owns the microphone request.
       * Do not open and close a separate microphone stream here.
       */
      await client.start(CONFIG.vapiAssistantId);
    } catch (error) {
      if (attempt === callAttempt) handleVapiStartFailure(error);
    }
  }

  function stopVapiCall() {
    callAttempt += 1;
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
    if (!vapiLoading && !vapiActive) { vapi.stop(); return; }
    vapiActive = true;
    vapiLoading = false;
    voiceFailureReported = false;
    setVoiceUI(true, 'Voice session active');
    sentContext = '';
    sendSectionContext();
  }

  function handleVapiCallEnd() {
    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);

    addBotMessage('Call ended. Your transcript stays here while you browse. Start a new call whenever you like.');
  }

  function handleVapiError(error) {
    reportVoiceFailure('Riley Vapi error', error);
  }

  function handleVapiStartFailure(error) {
    reportVoiceFailure('Riley Vapi start failed', error);
  }

  function reportVoiceFailure(logLabel, error) {
    const detail = describeVapiError(error);

    console.error(logLabel + ': ' + detail, error);

    vapiActive = false;
    vapiLoading = false;
    setVoiceUI(false);

    if (voiceFailureReported) return;
    voiceFailureReported = true;

    const embeddedApp = webviewName();
    if (embeddedApp) {
      showOpenInBrowserNotice(embeddedApp);
      return;
    }

    if (/notallowed|permission|denied|microphone|audio capture/i.test(detail)) {
      addBotMessage(
        '⚠️ Microphone access was not granted. Allow microphone access in your browser site settings, then select Start voice call to try again.'
      );
      return;
    }

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

    if (!vapiActive) {
      addBotMessage('Start a voice call first to send typed messages. Your draft is still here.');
      return;
    }
    input.value = '';
    input.style.height = 'auto';
    sendText(text);
  }

  function sendText(text) {
    if (!text) return;

    if (!vapiActive || !vapi) {
      addBotMessage(
        'Select Start voice call to start talking with Riley.'
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

  function rileySaid(text) {
    addBotMessageHTML(formatText(text));
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

    $('aiw-minimize').addEventListener('click', toggleWindow);
    $('aiw-end-call').addEventListener('click', stopVapiCall);
    document.querySelector('.voice-dismiss').addEventListener('click', stopVapiCall);
    $('aiw-window').addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); toggleWindow(); }
    });
    window.addEventListener('pagehide', stopVapiCall);

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

  }

  // ── WIDGET WINDOW ───────────────────────────────────────────
  function toggleWindow() {
    if (window.aiwFloatPanel) window.aiwFloatPanel();
    isOpen = !isOpen;

    const win = $('aiw-window');
    const fab = $('aiw-fab');
    const teaser = $('aiw-teaser');

    if (win) {
      win.classList.toggle('open', isOpen);
      win.inert = !isOpen;
    }

    if (fab) {
      fab.classList.toggle('open', isOpen);
      fab.setAttribute('aria-expanded', String(isOpen));
      fab.setAttribute('aria-label', isOpen ? 'Minimize Riley' : ((vapiActive || vapiLoading) ? 'Open Riley — voice session active' : 'Open Riley'));
    }

    if (teaser && isOpen) {
      teaser.classList.add('hidden');
    }

    // Minimize without stopping the voice client or discarding messages.
    if (isOpen) $('aiw-minimize').focus();
    else if (fab) fab.focus();
  }

  function openWindow() {
    if (!isOpen) toggleWindow();
  }

  window.aiwToggle = toggleWindow;
  window.aiwOpen = function () {
    if (window.aiwFloatPanel) window.aiwFloatPanel();
    openWindow();
  };

  function sendSectionContext() {
    if (!vapiActive || !vapi || sentContext === sectionContext) return;
    try {
      vapi.send({ type: 'add-message', triggerResponseEnabled: false, message: {
        role: 'system',
        content: 'Website viewing context: ' + sectionContext + '. Context only; do not interrupt or change roles merely because the visitor scrolls. Respond to their intent. No form content is available.'
      } });
      sentContext = sectionContext;
    } catch (error) { console.warn('Riley section context could not be sent.', error); }
  }
  window.aiwSetContext = function (context) {
    const allowed = Array.from(document.querySelectorAll('[data-riley-context]'), element => element.dataset.rileyContext);
    if (!allowed.includes(context)) return;
    sectionContext = context;
    sendSectionContext();
  };

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
      voiceButton.textContent = live ? 'End voice call' : 'Start voice call';
    }

    if (input) {
      input.placeholder = live
        ? label || '🎙️ Live — just talk'
        : 'Type during a live call';
    }
    const status = document.querySelector('.aiw-status');
    if (status) status.textContent = live ? (label || 'Voice session active') : 'AI assistant · Ready to connect';
    const end = $('aiw-end-call');
    if (end) end.disabled = !live;
    const fab = $('aiw-fab');
    if (fab) {
      fab.dataset.live = String(Boolean(live));
      fab.title = live ? 'Voice session active — open Riley to end the call' : 'Open Riley';
      if (!isOpen) fab.setAttribute('aria-label', live ? 'Open Riley — voice session active' : 'Open Riley');
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
