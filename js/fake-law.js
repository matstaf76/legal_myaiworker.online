(() => {
  'use strict';
  const demo = document.getElementById('fake-law-demo');
  demo.classList.add('js-ready');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll('[data-practice]').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('demo-practice').value = link.dataset.practice;
    });
  });
  document.querySelectorAll('[data-open-riley]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.rileyScenario) window.aiwSetContext('Fake Law Firm / ' + button.dataset.rileyScenario);
      window.aiwOpen();
    });
  });
  const dock = document.getElementById('riley-dock');
  const panel = document.getElementById('aiw-window');
  document.getElementById('riley-dock-open').addEventListener('click', () => {
    window.aiwOpen();
    dock.appendChild(panel);
    panel.classList.add('docked');
    document.getElementById('aiw-minimize').focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  });
  // Restore floating presentation without recreating the panel or its voice client.
  window.aiwFloatPanel = () => {
    if (!panel.classList.contains('docked')) return;
    demo.appendChild(panel);
    panel.classList.remove('docked');
  };
  const dockObserver = new IntersectionObserver(entries => {
    if (entries[0].intersectionRatio === 0 && panel.classList.contains('docked')) window.aiwFloatPanel();
  });
  dockObserver.observe(dock);

  const form = document.getElementById('demo-form');
  const dialog = document.getElementById('demo-dialog');
  form.addEventListener('submit', event => {
    event.preventDefault();
    ['demo-name', 'demo-email', 'demo-message'].forEach(id => {
      document.getElementById(id).value = '';
    });
    dialog.showModal();
  });
  document.getElementById('dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.getElementById('demo-submit').focus());
  document.getElementById('demo-submit').disabled = false;
  document.getElementById('fake-year').textContent = new Date().getFullYear();

  const sections = [...document.querySelectorAll('[data-riley-context]')];
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  let scheduled = false;
  let contextTimer;
  let pendingContext = '';
  function updateScroll() {
    scheduled = false;
    const line = Math.min(innerHeight * 0.35, 240);
    let current = sections.find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line;
    });
    if (!current) current = sections.filter(section => section.getBoundingClientRect().top <= line).at(-1) || sections[0];
    const context = current.dataset.rileyContext;
    if (context !== pendingContext) {
      pendingContext = context;
      clearTimeout(contextTimer);
      contextTimer = setTimeout(() => window.aiwSetContext(context), 300);
    }
    const activeId = current.classList.contains('practice-story') ? 'practice' : current.id;
    navLinks.forEach(link => {
      if (link.hash === '#' + activeId) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const rect = demo.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    demo.querySelector('.demo-progress span').style.width = (progress * 100) + '%';
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();
})();
