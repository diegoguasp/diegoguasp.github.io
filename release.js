/* ─────────────────────────────────────────
   Diego Guasp — release.js
   Diálogo temporal "Próximo lanzamiento"

   CÓMO USARLO
   1. Edita SOLO el objeto RELEASE de abajo.
   2. Pon active: true cuando quieras mostrarla.
   3. Antes de la fecha → muestra cuenta regresiva + "Pre-guardar".
      Desde la fecha → cambia sola a "Escuchar ahora".
   4. Cuando el release ya haya salido, agrégalo a la
      Discografía en index.html y pon active: false.
   5. Para el siguiente release, solo cambia los datos.

   VISTA PREVIA (sin publicarla): abre el sitio con
   ?preview=release al final de la URL.
   ───────────────────────────────────────── */

const RELEASE = {
  active: false,                      // true = visible para todos

  title: 'Título del release',
  artist: '',                         // opcional, ej. 'con Nombre de la artista'
  kind: { es: 'Single', en: 'Single' },   // 'Álbum' / 'Album', 'EP', etc.

  // Fecha y hora de salida. México Central = -06:00
  date: '2027-03-05T00:00:00-06:00',

  cover: 'Imagenes/Releases/cover.jpg',   // portada cuadrada; si no existe, se muestra un bloque con el título

  blurb: {
    es: 'Descripción corta del lanzamiento. Cuenta de qué trata y por qué vale la pena escucharlo.',
    en: 'Short description of the release. Tell what it is about and why it is worth a listen.'
  },

  // Link de pre-save generado en Show.co (CD Baby) para Spotify y Apple Music
  presaveUrl: '',
  // Opcional: pre-order en Bandcamp
  preorderUrl: '',

  // Links finales de cada plataforma (se usan desde el día de salida)
  links: {
    spotify: '',
    apple: '',
    amazon: '',
    tidal: '',
    bandcamp: ''
  }
};

/* ───────── No es necesario editar de aquí hacia abajo ───────── */

(function () {
  const params   = new URLSearchParams(window.location.search);
  const preview  = params.get('preview') === 'release';
  const section  = document.getElementById('proximo-lanzamiento');
  if (!section || !(RELEASE.active || preview)) return;

  const releaseTime = new Date(RELEASE.date).getTime();
  if (Number.isNaN(releaseTime)) return;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const ICONS = {
    spotify: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#1DB954"/><path d="M17.2 10.6c-2.9-1.7-7.6-1.9-10.3-1a.7.7 0 01-.9-.5.7.7 0 01.5-.9c3-.9 8.1-.7 11.3 1.2a.7.7 0 01.2 1 .7.7 0 01-.8.2zm-.1 2.7a.6.6 0 01-.8.2c-2.4-1.5-6.1-1.9-9-1.1a.6.6 0 01-.7-.4.6.6 0 01.4-.7c3.3-.9 7.3-.5 10 1.2a.6.6 0 01.1.8zm-.9 2.6a.5.5 0 01-.7.1c-2.1-1.3-4.8-1.6-7.9-.9a.5.5 0 01-.6-.4.5.5 0 01.4-.6c3.4-.7 6.4-.4 8.7 1a.5.5 0 01.1.8z" fill="white"/></svg>',
    apple: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="appleGR" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FC5C7D"/><stop offset="100%" stop-color="#6A3DE8"/></linearGradient></defs><rect width="24" height="24" rx="5" fill="url(#appleGR)"/><path d="M15.5 5.5h-4a.5.5 0 00-.5.5v7.3a2.3 2.3 0 10.9 1.8V9h3.1a.5.5 0 00.5-.5V6a.5.5 0 00-.5-.5z" fill="white"/></svg>',
    amazon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="3" fill="#232F3E"/><path d="M5 15.2c3.2 2 7.4 3.1 11.8 2.3-.4.3-1 .6-1.5.8-2.9.9-6 .4-8.5-1.1-.3-.2-.4-.5-.2-.8.2-.3.4-.3.4-.2z" fill="#FF9900"/><text x="4.5" y="13.5" font-family="Arial" font-weight="700" font-size="6.5" fill="white">music</text></svg>',
    tidal: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="3" fill="#232F3E"/><g fill="white"><polygon points="6,8 8,12 6,16 4,12"/><polygon points="12,8 14,12 12,16 10,12"/><polygon points="18,8 20,12 18,16 16,12"/></g></svg>',
    bandcamp: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="3" fill="#1DA0C3"/><path d="M4.5 15.5l5.5-7h10l-5.5 7z" fill="white"/></svg>'
  };
  const NAMES = { spotify: 'Spotify', apple: 'Apple Music', amazon: 'Amazon Music', tidal: 'Tidal', bandcamp: 'Bandcamp' };

  // Fecha en ambos idiomas para que el toggle ES/EN la cambie
  const fmtDate = locale => new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City'
  }).format(new Date(releaseTime));
  const dateEs = fmtDate('es-MX');
  const dateEn = fmtDate('en-US');

  // Texto bilingüe en un <span> (el toggle solo toca spans con data-es/data-en)
  const t = (es, en) => `<span data-es="${esc(es)}" data-en="${esc(en)}">${esc(es)}</span>`;

  const coverHtml = () => `
    <div class="release-cover">
      <img src="${esc(RELEASE.cover)}" alt="${esc(RELEASE.title)}">
      <div class="release-cover-fallback" aria-hidden="true">
        <span>${esc(RELEASE.title)}</span>
      </div>
    </div>`;

  const metaHtml = () => `
    <p class="release-kind">
      ${t(RELEASE.kind.es, RELEASE.kind.en)}
      <span class="release-dot">·</span>
      <span data-es="${esc(dateEs)}" data-en="${esc(dateEn)}">${esc(dateEs)}</span>
    </p>
    <h2 class="section-title release-title" id="release-dialog-title">${esc(RELEASE.title)}</h2>
    ${RELEASE.artist ? `<p class="release-artist">${esc(RELEASE.artist)}</p>` : ''}
    <p class="release-blurb" data-es="${esc(RELEASE.blurb.es)}" data-en="${esc(RELEASE.blurb.en)}">${esc(RELEASE.blurb.es)}</p>`;

  const closeButton = () => `
    <button class="release-close" type="button" data-dialog-close autofocus>
      <span aria-hidden="true">×</span>
      <span class="release-close-label" data-es="Cerrar lanzamiento" data-en="Close release">Cerrar lanzamiento</span>
    </button>`;

  function renderPresave() {
    const hasUrl = !!RELEASE.presaveUrl;
    const main = hasUrl
      ? `<a class="btn-blue release-cta" href="${esc(RELEASE.presaveUrl)}" target="_blank" rel="noopener" data-track="click_presave">${t('Pre-guardar', 'Pre-save')} →</a>`
      : `<span class="btn-blue release-cta is-disabled" aria-disabled="true">${t('Pre-guardar', 'Pre-save')} →</span>`;
    const order = RELEASE.preorderUrl
      ? `<a class="btn-ghost release-cta-2" href="${esc(RELEASE.preorderUrl)}" target="_blank" rel="noopener" data-track="click_preorder">${t('Pre-order en Bandcamp', 'Pre-order on Bandcamp')}</a>`
      : '';

    section.innerHTML = `
      ${closeButton()}
      <div class="release-inner">
        ${coverHtml()}
        <div class="release-info">
          <div class="section-eyebrow">${t('Próximo lanzamiento', 'Upcoming release')}</div>
          ${metaHtml()}
          <div class="release-countdown" role="timer" aria-live="off">
            <div class="cd-cell"><span class="cd-num" data-cd="d">--</span><span class="cd-label">${t('Días', 'Days')}</span></div>
            <div class="cd-cell"><span class="cd-num" data-cd="h">--</span><span class="cd-label">${t('Horas', 'Hours')}</span></div>
            <div class="cd-cell"><span class="cd-num" data-cd="m">--</span><span class="cd-label">${t('Min', 'Min')}</span></div>
            <div class="cd-cell"><span class="cd-num" data-cd="s">--</span><span class="cd-label">${t('Seg', 'Sec')}</span></div>
          </div>
          <div class="release-actions">${main}${order}</div>
          <p class="release-note">${t(
            'Pre-guarda y se agregará a tu biblioteca el día del lanzamiento.',
            'Pre-save it and it will be added to your library on release day.'
          )}</p>
        </div>
      </div>`;
  }

  function renderLive() {
    const buttons = Object.keys(NAMES)
      .filter(k => RELEASE.links[k])
      .map(k => `
        <a class="platform-btn platform-btn--lg" href="${esc(RELEASE.links[k])}" target="_blank" rel="noopener" data-track="click_release_platform" data-label="${NAMES[k]}">
          ${ICONS[k]}${NAMES[k]}
        </a>`).join('');

    section.innerHTML = `
      ${closeButton()}
      <div class="release-inner">
        ${coverHtml()}
        <div class="release-info">
          <div class="section-eyebrow">${t('Ya disponible', 'Out now')}</div>
          ${metaHtml()}
          <div class="release-actions release-actions--platforms">
            ${buttons || `<span class="release-note">${t('Pronto los links en cada plataforma.', 'Platform links coming soon.')}</span>`}
          </div>
        </div>
      </div>`;
  }

  let timer = null;
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const diff = releaseTime - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      renderLive();
      afterRender();
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);
    const set = (k, v) => { const el = section.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = v; };
    set('d', pad(d)); set('h', pad(h)); set('m', pad(m)); set('s', pad(s));
  }

  function watchCover() {
    // Si la portada no carga, muestra el título como respaldo
    const img = section.querySelector('.release-cover img');
    if (!img) return;
    const fallback = () => { img.remove(); section.querySelector('.release-cover')?.classList.add('no-img'); };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  }

  function afterRender() {
    watchCover();
    // Traduce solo los textos recién creados al idioma activo
    // (sin volver a llamar applyLang, para no duplicar el evento de GA4)
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'es';
    section.querySelectorAll('[data-es][data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
  }

  // Seguimiento en GA4 (usa trackClick de main.js)
  section.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-dialog-close]') || target === section) {
      section.close();
    }
    const el = target.closest('[data-track]');
    if (!el || typeof trackClick !== 'function') return;
    trackClick(el.dataset.track, el.dataset.label || RELEASE.title);
  });

  section.hidden = false;
  if (releaseTime > Date.now()) {
    renderPresave();
    tick();
    timer = setInterval(tick, 1000);
  } else {
    renderLive();
  }
  afterRender();
  section.showModal();
})();
