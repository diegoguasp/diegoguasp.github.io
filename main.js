/* ─────────────────────────────────────────
   Diego Guasp — main.js
   ───────────────────────────────────────── */

// ─── Language Toggle ───
const LANG_KEY = 'dg_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'es';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);

  // Update all translatable elements
  document.querySelectorAll('[data-es][data-en]').forEach(el => {
    const text = lang === 'en' ? el.dataset.en : el.dataset.es;
    // Elements with innerHTML (those containing <br> or <em>)
    if (text && (text.includes('<br>') || text.includes('<em>'))) {
      el.innerHTML = text;
    } else if (text) {
      el.textContent = text;
    }
  });

  // Update html lang attribute
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';

  // Update toggle active state on both toggles
  document.querySelectorAll('.lang-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // Track in GA4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'language_switch', { event_label: lang });
  }
}

// Attach click to both toggles (desktop + mobile)
document.querySelectorAll('.lang-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    applyLang(currentLang === 'es' ? 'en' : 'es');
  });
});

// Init on load
applyLang(currentLang);

// ─── Navbar scroll ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── Hamburger menu ───
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.getElementById('main-navigation');
const overlay   = document.getElementById('navOverlay');

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  overlay.classList.remove('open');
}
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  overlay.classList.toggle('open', isOpen);
});
overlay.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// ─── Track touch feedback (mobile) ───
document.querySelectorAll('.track').forEach(track => {
  track.addEventListener('touchstart', () => track.classList.add('touched'), { passive: true });
  track.addEventListener('touchend', () => setTimeout(() => track.classList.remove('touched'), 400));
});

// ─── Scroll reveal ───
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── Calendly modal ───
const modal          = document.getElementById('calendlyModal');
const calendlyIframe = document.getElementById('calendlyIframe');
const CALENDLY_URL   = 'https://calendly.com/diegoguasp/asesoria-legal?embed_domain=diegoguasp.github.io&embed_type=Inline';

function openCalendlyModal() {
  calendlyIframe.src = '';
  requestAnimationFrame(() => { calendlyIframe.src = CALENDLY_URL; });
  modal.style.display = 'flex';
}
function closeCalendlyModal() {
  modal.style.display = 'none';
  calendlyIframe.src = '';
}

document.getElementById('openCalendly').addEventListener('click', openCalendlyModal);
document.getElementById('closeCalendly').addEventListener('click', closeCalendlyModal);
modal.addEventListener('click', e => { if (e.target === modal) closeCalendlyModal(); });

// Auto-close on booking completion
window.addEventListener('message', e => {
  if (e.data?.event === 'calendly.event_scheduled') setTimeout(closeCalendlyModal, 2500);
});

// ─── GA4 Event Tracking ───
function trackClick(eventName, label) {
  if (typeof gtag !== 'undefined') gtag('event', eventName, { event_label: label });
}

document.querySelectorAll('[href="#agenda-col"], #openCalendly').forEach(el => {
  el.addEventListener('click', () => trackClick('click_agendar', el.id || el.textContent.trim()));
});
document.querySelectorAll('.platform-btn').forEach(el => {
  el.addEventListener('click', () => trackClick('click_plataforma', el.textContent.trim()));
});
document.querySelectorAll('a[href*="imdb.com"]').forEach(el => {
  el.addEventListener('click', () => trackClick('click_imdb', 'IMDb'));
});
document.querySelectorAll('a[href*="bandcamp.com"]').forEach(el => {
  el.addEventListener('click', () => trackClick('click_bandcamp', el.textContent.trim()));
});
document.querySelectorAll('.track-link').forEach(el => {
  el.addEventListener('click', () => {
    const title = el.closest('.track')?.querySelector('.track-title')?.textContent || 'unknown';
    trackClick('click_track', title);
  });
});

/* ─── LIBRERÍA — descomentar cuando esté lista ───
function handleLead() {
  const name = document.getElementById('leadName').value.trim();
  const email = document.getElementById('leadEmail').value.trim();
  if (!name || !email) { alert('Por favor ingresa tu nombre y correo.'); return; }
  const btn = document.querySelector('.lead-submit');
  btn.textContent = '¡Listo! Revisa tu correo →';
  btn.style.background = '#3a7a3a';
  btn.disabled = true;
  document.getElementById('leadName').value = '';
  document.getElementById('leadEmail').value = '';
  document.getElementById('leadRole').value = '';
}
*/
