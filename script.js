/* =============================================================
   SERPENT INK — Main Script
   Preloader · Nav · Hamburger · Scroll reveal · Counters · Form · FAQ · Sticky bar
   ============================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNav();
  initHamburger();
  initScrollReveal();
  initCounters();
  initFAQ();
  initForm();
  initStickyBar();
});

/* ──────────────────────────────────────────
   PRELOADER
────────────────────────────────────────── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const hide = () => {
    preloader.classList.add('hidden');
    document.body.classList.remove('preloading');
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 900);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 900));
  }
}

/* ──────────────────────────────────────────
   NAV SCROLL BEHAVIOUR
────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ──────────────────────────────────────────
   HAMBURGER MENU
────────────────────────────────────────── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  const open = () => {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? close() : open();
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', close));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') && !hamburger.contains(e.target) && !navLinks.contains(e.target)) close();
  });
}

/* ──────────────────────────────────────────
   SCROLL REVEAL (Intersection Observer)
────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   ANIMATED COUNTERS
────────────────────────────────────────── */
function initCounters() {
  const stats = document.querySelectorAll('.stat[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el      = entry.target;
        const number  = el.querySelector('.stat-number');
        const target  = parseInt(el.dataset.count, 10);
        const suffix  = el.dataset.suffix || '';
        const dur     = 1600;
        const step    = 16;
        const steps   = dur / step;
        let   current = 0;

        const tick = () => {
          current = Math.min(current + target / steps, target);
          number.textContent = Math.floor(current) + suffix;
          if (current < target) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}

/* ──────────────────────────────────────────
   FAQ ACCORDION
────────────────────────────────────────── */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        if (other === item) return;
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) {
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.opacity   = '0';
          setTimeout(() => { otherAnswer.hidden = true; }, 300);
        }
      });

      // Toggle this item
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        answer.style.opacity   = '0';
        setTimeout(() => { answer.hidden = true; }, 300);
      } else {
        answer.hidden = false;
        // Force reflow
        answer.getBoundingClientRect();
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity   = '1';
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Init closed state
    answer.style.maxHeight  = '0';
    answer.style.opacity    = '0';
    answer.style.overflow   = 'hidden';
    answer.style.transition = 'max-height .35s cubic-bezier(.25,.46,.45,.94), opacity .3s ease';
    answer.hidden = true;
  });
}

/* ──────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────── */
function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn      = form.querySelector('button[type="submit"]');
    const nameEl   = form.querySelector('#fname');
    const emailEl  = form.querySelector('#femail');
    const orig     = btn.textContent;
    const hasName  = nameEl.value.trim();
    const hasEmail = emailEl.value.trim();

    clearError(nameEl);
    clearError(emailEl);

    let hasError = false;
    if (!hasName)  { showError(nameEl,  'Proszę podać imię i nazwisko.');  hasError = true; }
    if (!hasEmail) { showError(emailEl, 'Proszę podać adres email.'); hasError = true; }

    if (hasError) {
      shakeBtn(btn);
      return;
    }

    btn.textContent = 'Wysyłanie…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Zapytanie wysłane ✓';
      btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
      }, 4000);
    }, 900);
  });
}

function showError(input, message) {
  input.style.borderColor = '#ef4444';
  input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.20)';
  const msg = document.createElement('span');
  msg.className = 'field-error';
  msg.setAttribute('role', 'alert');
  msg.textContent = message;
  msg.style.cssText = 'display:block;font-size:.75rem;color:#ef4444;margin-top:4px;';
  input.parentNode.appendChild(msg);

  input.addEventListener('input', () => clearError(input), { once: true });
}

function clearError(input) {
  input.style.borderColor = '';
  input.style.boxShadow   = '';
  const msg = input.parentNode.querySelector('.field-error');
  if (msg) msg.remove();
}

function shakeBtn(btn) {
  btn.style.animation = 'shake .45s ease';
  btn.addEventListener('animationend', () => { btn.style.animation = ''; }, { once: true });
}

/* ──────────────────────────────────────────
   STICKY BAR
────────────────────────────────────────── */
function initStickyBar() {
  const bar   = document.getElementById('stickyBar');
  const close = document.getElementById('stickyClose');
  if (!bar || !close) return;

  const KEY = 'kontaktio_sticky_closed';
  try { if (localStorage.getItem(KEY) === '1') return; } catch {}

  let shown = false;

  const update = () => {
    const should = window.scrollY > 900;
    if (should !== shown) {
      shown = should;
      bar.classList.toggle('on', should);
      bar.setAttribute('aria-hidden', String(!should));
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  close.addEventListener('click', () => {
    bar.classList.remove('on');
    bar.setAttribute('aria-hidden', 'true');
    try { localStorage.setItem(KEY, '1'); } catch {}
    window.removeEventListener('scroll', update);
  });
}
