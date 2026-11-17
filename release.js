/* ─────────────────────────────────────────
   Diego Guasp — release.js
   Ventana emergente temporal "Próximo lanzamiento"

   CÓMO USARLO
   1. Edita SOLO el objeto RELEASE de abajo.
   2. Pon active: true cuando quieras mostrarla.
   3. Antes de la fecha → cuenta regresiva + "Pre-guardar".
      Desde la fecha → cambia sola a "Ya disponible".
   4. Al cerrar la ventana queda un botón flotante en la
      esquina inferior derecha para volver a abrirla.
   5. Cuando el release ya haya salido, agrégalo a la
      Discografía en index.html y pon active: false.
   6. Para el siguiente release, solo cambia los datos.

   VISTA PREVIA (sin publicarla): abre el sitio con
   ?preview=release al final de la URL.
   ───────────────────────────────────────── */

const RELEASE = {
  active: false,                      // true = visible para todos
  autoOpen: true,                     // true = se abre sola al entrar; false = solo aparece el botón flotante

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
  if (typeof section.showModal !== 'function') return; // navegador sin soporte de <dialog>

  const releaseTime = new Date(RELEASE.date).getTime();
  if (Number.isNaN(releaseTime)) return;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const ICONS = {
    spotify: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#191414"/><path fill="#1ED760" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    apple: '<img src="Imagenes/Iconos/apple-music.png" alt="" width="16" height="16">',
    amazon: '<img src="Imagenes/Iconos/amazon-music.png" alt="" width="16" height="16">',
    tidal: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tidalGR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F3F45"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="24" height="24" rx="5.4" fill="url(#tidalGR)"/><g fill="#F7F7F9"><polygon points="6.95,7.26 9.47,9.78 6.95,12.299999999999999 4.43,9.78"/><polygon points="12,7.26 14.52,9.78 12,12.299999999999999 9.48,9.78"/><polygon points="17.05,7.26 19.57,9.78 17.05,12.299999999999999 14.530000000000001,9.78"/><polygon points="12,12.32 14.52,14.84 12,17.36 9.48,14.84"/></g></svg>',
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
    <button class="release-close" type="button" data-dialog-close>
      <span aria-hidden="true">×</span>
      <span class="release-close-label" data-es="Cerrar lanzamiento" data-en="Close release">Cerrar lanzamiento</span>
    </button>`;

  // Estructura del diálogo: barra fija con la X + cuerpo con scroll
  const shell = inner => `
    <div class="release-bar">${closeButton()}</div>
    <div class="release-body">
      <div class="release-inner">${inner}</div>
    </div>`;

  function renderPresave() {
    const hasUrl = !!RELEASE.presaveUrl;
    const main = hasUrl
      ? `<a class="btn-blue release-cta" href="${esc(RELEASE.presaveUrl)}" target="_blank" rel="noopener" data-track="click_presave">${t('Pre-guardar', 'Pre-save')} →</a>`
      : `<span class="btn-blue release-cta is-disabled" aria-disabled="true">${t('Pre-guardar', 'Pre-save')} →</span>`;
    const order = RELEASE.preorderUrl
      ? `<a class="btn-ghost release-cta-2" href="${esc(RELEASE.preorderUrl)}" target="_blank" rel="noopener" data-track="click_preorder">${t('Pre-order en Bandcamp', 'Pre-order on Bandcamp')}</a>`
      : '';

    section.innerHTML = shell(`
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
        </div>`);
  }

  function renderLive() {
    const buttons = Object.keys(NAMES)
      .filter(k => RELEASE.links[k])
      .map(k => `
        <a class="platform-btn platform-btn--lg" href="${esc(RELEASE.links[k])}" target="_blank" rel="noopener" data-track="click_release_platform" data-label="${NAMES[k]}">
          ${ICONS[k]}${NAMES[k]}
        </a>`).join('');

    section.innerHTML = shell(`
        ${coverHtml()}
        <div class="release-info">
          <div class="section-eyebrow">${t('Ya disponible', 'Out now')}</div>
          ${metaHtml()}
          <div class="release-actions release-actions--platforms">
            ${buttons || `<span class="release-note">${t('Pronto los links en cada plataforma.', 'Platform links coming soon.')}</span>`}
          </div>
        </div>`);
  }

  // ─── Botón flotante (queda al cerrar la ventana) ───
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'release-launcher';
  launcher.hidden = true;
  launcher.setAttribute('aria-haspopup', 'dialog');
  document.body.appendChild(launcher);

  function renderLauncher(live) {
    launcher.innerHTML = `
      <span class="rl-thumb">
        <img src="${esc(RELEASE.cover)}" alt="">
        <span class="rl-thumb-fallback" aria-hidden="true">${esc(String(RELEASE.title).charAt(0))}</span>
      </span>
      <span class="rl-text">
        <span class="rl-label">${live ? t('Ya disponible', 'Out now') : t('Pre-guardar', 'Pre-save')}</span>
        <span class="rl-title">${esc(RELEASE.title)}</span>
      </span>
      <span class="rl-dot" aria-hidden="true"></span>`;
  }

  // ─── Abrir / cerrar ───
  const root = document.documentElement;

  function openDialog() {
    if (section.open) return;
    section.hidden = false;
    root.classList.add('release-open');   // bloquea el scroll de la página detrás
    launcher.hidden = true;
    section.showModal();
    section.scrollTop = 0;
    section.focus({ preventScroll: true }); // el foco va a la ventana, no a la X
  }

  // Se dispara con la X, ESC o clic en el fondo
  section.addEventListener('close', () => {
    root.classList.remove('release-open');
    launcher.hidden = false;
  });

  launcher.addEventListener('click', () => {
    if (typeof trackClick === 'function') trackClick('release_reopen', RELEASE.title);
    openDialog();
  });

  // ─── Clic: cerrar solo si fue en el fondo oscuro real ───
  const outsideBox = e => {
    const r = section.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  let downOnBackdrop = false;
  section.addEventListener('pointerdown', e => {
    downOnBackdrop = e.target === section && outsideBox(e);
  });

  // Seguimiento en GA4 (usa trackClick de main.js)
  section.addEventListener('click', e => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const onBackdrop = target === section && downOnBackdrop && outsideBox(e);
    downOnBackdrop = false;
    if (target.closest('[data-dialog-close]') || onBackdrop) {
      section.close();
      return;
    }
    const el = target.closest('[data-track]');
    if (!el || typeof trackClick !== 'function') return;
    trackClick(el.dataset.track, el.dataset.label || RELEASE.title);
  });

  // ─── Cuenta regresiva ───
  let timer = null;
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const diff = releaseTime - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      renderLive();
      renderLauncher(true);
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

  // Si una imagen no carga, muestra el título/inicial como respaldo
  function watchImg(img, box) {
    if (!img || !box) return;
    const fallback = () => { img.remove(); box.classList.add('no-img'); };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && img.naturalWidth === 0) fallback();
  }

  // Traduce solo los textos recién creados al idioma activo
  // (sin volver a llamar applyLang, para no duplicar el evento de GA4)
  function translate(node) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'es';
    node.querySelectorAll('[data-es][data-en]').forEach(el => {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
    });
  }

  function afterRender() {
    watchImg(section.querySelector('.release-cover img'), section.querySelector('.release-cover'));
    watchImg(launcher.querySelector('.rl-thumb img'), launcher.querySelector('.rl-thumb'));
    translate(section);
    translate(launcher);
  }

  // ─── Arranque ───
  const isLive = releaseTime <= Date.now();
  renderLauncher(isLive);
  if (isLive) {
    renderLive();
  } else {
    renderPresave();
    tick();
    timer = setInterval(tick, 1000);
  }
  afterRender();

  section.setAttribute('tabindex', '-1');
  if (RELEASE.autoOpen === false) {
    launcher.hidden = false;
  } else {
    openDialog();
  }
})();
