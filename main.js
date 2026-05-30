/* ═══════════════════════════════════════════════════════════════
   KHARCHE — Homepage Animation  v3
   Clean build — no GSAP, no clones, no distortion effects
   ═══════════════════════════════════════════════════════════════ */

/* ── DATA ──────────────────────────────────────────────────── */
const PROJECTS = [
  { name: 'Notting Hill',              category: 'Homes',                      img: 'pexels-shox-37520403.jpg',                              orient: 'landscape' },
  { name: 'Ascot',                     category: 'Residentials',               img: 'pexels-airamdphoto-27675599.jpg',                       orient: 'portrait'  },
  { name: 'Tuxeda',                    category: 'Interiors',                  img: 'pexels-benni-fish-40038242-36756262.jpg',               orient: 'landscape' },
  { name: 'Richmond',                  category: 'Homes',                      img: 'pexels-raoul-turmond-1765272532-33811740.jpg',          orient: 'portrait'  },
  { name: 'IHeart',                    category: 'Retail & Hospitality',       img: 'pexels-navlakha-33803745.jpg',                          orient: 'landscape' },
  { name: 'Pristine Pavilion',         category: 'Residentials',               img: 'pexels-paco-esqueda-787628224-34065622.jpg',            orient: 'portrait'  },
  { name: 'Palm Grove',                category: 'Homes',                      img: 'pexels-peter-dyllong-2158803154-36780320.jpg',          orient: 'landscape' },
  { name: 'Nilaaa',                    category: 'Interiors',                  img: 'pexels-axp-photography-500641970-30683411.jpg',         orient: 'portrait'  },
  { name: 'Solomon Francis Residence', category: 'Homes',                      img: 'pexels-reneterp-14318813.jpg',                          orient: 'landscape' },
  { name: 'Shree Lynwood House',       category: 'Residentials',               img: 'pexels-tommaso-37555693.jpg',                           orient: 'portrait'  },
  { name: 'House Of Champions',        category: 'IT Parks & Offices',         img: 'pexels-robert-sliwinski-2155126657-37011539.jpg',       orient: 'landscape' },
  { name: 'Rathod Residence',          category: 'Homes',                      img: 'pexels-lucky-the-chocolate-boss-222331365-17064380.jpg',orient: 'portrait'  },
  { name: 'Sivaam',                    category: 'Institutional & Industrial', img: 'pexels-who0ne-36197805.jpg',                            orient: 'landscape' },
  { name: 'Serene Springs',            category: 'Residentials',               img: 'pexels-zulfugarkarimov-33719772.jpg',                   orient: 'portrait'  },
  { name: 'Elements',                  category: 'Interiors',                  img: 'pexels-wolfgang-weiser-467045605-27277417.jpg',         orient: 'landscape' },
  { name: 'Ajay Residence',            category: 'Homes',                      img: 'pexels-robert-sliwinski-2155126657-37011539.jpg',       orient: 'landscape' },
  { name: 'AMM School',                category: 'Institutional & Industrial', img: 'pexels-navlakha-33803745.jpg',                          orient: 'landscape' },
];

const CATEGORIES = [...new Set(PROJECTS.map(p => p.category))];

/* ── STATE ─────────────────────────────────────────────────── */
const state = {
  activeIndex:     0,
  animType:        1,       // 1 or 2
  gap:             24,
  parallax:        100,
  zindex:          true,
  scrollEnabled:   false,
  introComplete:   false,
  autoScroll:      false,
  autoScrollSpeed: 1,
  loop:            false,
};

// Prevent browser from overriding our manual scroll restoration
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let savedScroll      = 0;
let leftItemNaturalYs = []; // cached natural viewport-Y of each left li (fixed col, constant)

/* ── DOM REFS ───────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const introEl     = $('intro');
const introIcon   = $('intro-icon');
const introTiles  = $('intro-tiles');
const topNav      = $('top-nav');
const leftCol     = $('left-col');
const rightCol    = $('right-col');
const leftList    = $('left-list');
const rightList   = $('right-list');
const leftWrap    = $('left-list-wrap');
const rightWrap   = $('right-list-wrap');
const imageTrack  = $('image-track');
const progressEl  = $('progress-pct');
const bottomNav   = $('bottom-nav');
const pgToggle    = $('pg-toggle');
const pgPanel     = $('pg-panel');
const gapSlider      = $('gap-slider');
const gapVal         = $('gap-val');
const sizeSlider     = $('size-slider');
const sizeVal        = $('size-val');
const parallaxSlider = $('parallax-slider');
const parallaxVal    = $('parallax-val');
const zindexCb          = $('zindex-cb');
const zindexLbl         = $('zindex-lbl');
const autoscrollCb      = $('autoscroll-cb');
const autoscrollLbl     = $('autoscroll-lbl');
const speedSlider       = $('speed-slider');
const speedVal          = $('speed-val');
const loopCb            = $('loop-cb');
const loopLbl           = $('loop-lbl');

// Base image dimensions (100% scale)
const BASE = { lsW: 940, lsH: 530, ptW: 640, ptH: 860, parallax: 100 };

/* ── HELPERS ────────────────────────────────────────────────── */
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ── BUILD SIDE LISTS ───────────────────────────────────────── */
function buildLists() {
  PROJECTS.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p.name;
    li.dataset.idx = i;
    if (i === 0) li.classList.add('is-active');
    li.addEventListener('click', () => {
      const wrap = imageTrack.querySelector(`.img-wrap[data-idx="${i}"]`);
      if (!wrap) return;
      const rect   = wrap.getBoundingClientRect();
      const target = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    });
    leftList.appendChild(li);
  });

  CATEGORIES.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat;
    li.dataset.cat = cat;
    if (cat === PROJECTS[0].category) li.classList.add('is-active');
    rightList.appendChild(li);
  });
}

/* ── BUILD IMAGE TRACK ──────────────────────────────────────── */
function buildTrack() {
  PROJECTS.forEach((p, i) => {
    const wrap = document.createElement('div');
    wrap.className = `img-wrap ${p.orient}`;
    wrap.dataset.idx = i;

    const img = document.createElement('img');
    img.alt = p.name;

    const onLoaded = () => img.classList.add('is-loaded');

    if (i < 6) {
      img.src     = `assets/${p.img}`;
      img.loading = 'eager';
      if (i === 0) img.fetchPriority = 'high';
      img.addEventListener('load', onLoaded, { once: true });
      if (img.complete && img.naturalHeight > 0) onLoaded();
    } else {
      img.dataset.src = `assets/${p.img}`;
      img.addEventListener('load', onLoaded, { once: true });
    }

    wrap.appendChild(img);

    const link = document.createElement('a');
    link.href      = `/project/${slugify(p.name)}`;
    link.className = 'img-link';
    link.appendChild(wrap);
    imageTrack.appendChild(link);
  });
}

/* ── LAZY LOAD — IntersectionObserver, 800px ahead ─────────── */
function setupLazyLoad() {
  const lazyImgs = [...imageTrack.querySelectorAll('img[data-src]')];
  if (!lazyImgs.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img   = entry.target;
      img.src     = img.dataset.src;
      delete img.dataset.src;
      observer.unobserve(img);
    });
  }, { rootMargin: '800px 0px' });

  lazyImgs.forEach(img => observer.observe(img));
}

/* ── INTRO ANIMATION ────────────────────────────────────────── */
function runIntro() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Thumbnail height is fixed; width follows each image's aspect ratio
  const THUMB_H = 180;
  const tileW   = p => p.orient === 'landscape'
    ? Math.round(THUMB_H * 16 / 9)   // ~320px
    : Math.round(THUMB_H * 2  / 3);  // ~120px
  const cx = vw / 2;
  const cy = vh / 2;

  // Phase 1 — logo scales in
  setTimeout(() => {
    introIcon.style.transition = 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
    introIcon.style.opacity    = '1';
    introIcon.style.transform  = 'translate(-50%,-50%) scale(1) rotate(0deg)';
  }, 150);

  // Phase 2 — logo rotates 360°
  setTimeout(() => {
    introIcon.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1)';
    introIcon.style.transform  = 'translate(-50%,-50%) scale(1) rotate(360deg)';
  }, 480);

  // Phase 3 — images pop in one by one at the SAME centre position
  //           75% opacity, each scales 0→1, staggered
  const STAGGER   = 85;
  const POP_START = 900;

  PROJECTS.forEach((p, i) => {
    const tw   = tileW(p);
    const tile = document.createElement('div');
    tile.className = 'intro-tile';
    Object.assign(tile.style, {
      left:      `${cx - tw / 2}px`,
      top:       `${cy - THUMB_H / 2}px`,
      width:     `${tw}px`,
      height:    `${THUMB_H}px`,
      opacity:   '0.75',
      transform: 'scale(0)',
      zIndex:    String(i + 1),
    });

    const img = document.createElement('img');
    img.src  = `assets/${p.img}`;
    img.alt  = '';
    tile.appendChild(img);
    introTiles.appendChild(tile);

    setTimeout(() => {
      tile.style.transition = 'transform 0.36s cubic-bezier(0.34,1.1,0.64,1)';
      tile.style.transform  = 'scale(1)';
    }, POP_START + i * STAGGER);
  });

  // All images settled
  const allDone = POP_START + PROJECTS.length * STAGGER + 400;

  // Phase 4 — logo fades
  setTimeout(() => {
    introIcon.style.transition = 'opacity 0.25s ease';
    introIcon.style.opacity    = '0';
  }, allDone + 100);

  // Phase 5 — tiles arrange into a vertical strip (still thumbnail scale)
  //           transform only — center-to-center, uniform scale so no layout cost
  setTimeout(() => {
    const tiles = [...introTiles.querySelectorAll('.intro-tile')];
    const n     = tiles.length;

    // Scale tiles down to fit all of them in the viewport height
    const GAP     = 5;
    // Uniform scale so the strip fits in the viewport
    const s       = Math.min(1, (vh * 0.85 - (n - 1) * GAP) / (n * THUMB_H));
    const scaledH = THUMB_H * s;
    const totalH  = n * scaledH + (n - 1) * GAP;
    const stripTop = (vh - totalH) / 2;

    tiles.forEach((tile, i) => {
      const centerY = stripTop + i * (scaledH + GAP) + scaledH / 2;
      const dy      = centerY - cy;   // offset from stack centre (cy)
      // dx = 0: tiles stay horizontally centred
      // landscape tiles (wider) and portrait tiles (narrower) remain distinct

      const delay = i * 32;
      tile.style.transition = `transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, opacity 0.4s ease ${delay}ms`;
      tile.style.transform  = `translate(0px, ${dy}px) scale(${s})`;
      tile.style.opacity    = '1';
    });
  }, allDone + 380);

  // When last strip tile finishes settling
  const stripDone = allDone + 380 + 550 + (PROJECTS.length - 1) * 32;

  // Phase 6 — strip slides down, each tile scales up to its actual track position
  setTimeout(() => {
    const wraps = [...imageTrack.querySelectorAll('.img-wrap')];
    const tiles = [...introTiles.querySelectorAll('.intro-tile')];

    // Batch-read all track positions before any writes
    const targets = PROJECTS.map((p, i) => {
      const w  = wraps[i];
      const r  = w.getBoundingClientRect();
      const tw = p.orient === 'landscape'
        ? Math.round(THUMB_H * 16 / 9)
        : Math.round(THUMB_H * 2  / 3);
      return {
        dx: (r.left + w.offsetWidth  / 2) - cx,
        // Offset by savedScroll so tiles target where images appear at the restored position
        dy: (r.top  + w.offsetHeight / 2) - cy - savedScroll,
        sx: w.offsetWidth  / tw,
        sy: w.offsetHeight / THUMB_H,
      };
    });

    // Write: translate to track centre + scale to full size
    tiles.forEach((tile, i) => {
      const t = targets[i];
      if (!t) return;
      const delay = i * 22;
      tile.style.transition = `transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms`;
      tile.style.transform  = `translate(${t.dx}px, ${t.dy}px) scale(${t.sx}, ${t.sy})`;
    });
  }, stripDone + 250);

  // Phase 7 — overlay fades, scroll position restored, layout revealed
  const cascadeDone = stripDone + 250 + 750 + (PROJECTS.length - 1) * 22;

  setTimeout(() => {
    // Step 1: remove scroll lock + restore position while overlay is still FULLY opaque
    document.body.classList.remove('intro-running');
    window.scrollTo({ top: savedScroll, behavior: 'instant' });

    state.scrollEnabled = true;
    state.activeIndex   = getActiveIndex();
    cacheLeftItemYs();  // must happen before positionListType1 reads natural positions
    updateLists();
    updateParallax();
    updateProgress();
    updateBottomNav();

    // Step 2: one frame later — scroll is committed, NOW start the fade
    requestAnimationFrame(() => {
      introEl.style.transition = 'opacity 0.55s ease';
      introEl.style.opacity    = '0';
      topNav.classList.add('visible');
      leftCol.classList.add('visible');
      rightCol.classList.add('visible');
    });
  }, cascadeDone + 100);

  // Phase 8 — remove overlay element
  setTimeout(() => {
    introEl.style.display = 'none';
    state.introComplete   = true;
  }, cascadeDone + 700);
}

/* ── ACTIVE INDEX DETECTION ─────────────────────────────────── */
function getActiveIndex() {
  const wraps = imageTrack.querySelectorAll('.img-wrap');
  const vh    = window.innerHeight;
  const mid   = window.scrollY + vh / 2;
  let   best  = 0;
  let   bestD = Infinity;

  wraps.forEach((w, i) => {
    const rect   = w.getBoundingClientRect();
    const center = window.scrollY + rect.top + rect.height / 2;
    const d      = Math.abs(center - mid);
    if (d < bestD) { bestD = d; best = i; }
  });

  return best;
}

/* ── CONTINUOUS SCROLL FRACTION ────────────────────────────────*/
function getScrollFracIdx() {
  const wraps = [...imageTrack.querySelectorAll('.img-wrap')];
  if (!wraps.length) return 0;
  const mid = window.scrollY + window.innerHeight / 2;
  const centers = wraps.map(w => {
    const r = w.getBoundingClientRect();
    return window.scrollY + r.top + r.height / 2;
  });
  if (mid <= centers[0]) return 0;
  if (mid >= centers[centers.length - 1]) return centers.length - 1;
  for (let i = 0; i < centers.length - 1; i++) {
    if (mid >= centers[i] && mid < centers[i + 1]) {
      return i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
    }
  }
  return 0;
}

/* ── CACHE LEFT ITEM NATURAL POSITIONS ──────────────────────── */
function cacheLeftItemYs() {
  // Clear container transform AND per-item transforms before measuring
  leftList.style.transform = '';
  leftList.querySelectorAll('li').forEach(li => li.style.transform = '');
  leftItemNaturalYs = [...leftList.querySelectorAll('li')]
    .map(li => li.getBoundingClientRect().top);
}

/* ── PARALLAX ───────────────────────────────────────────────── */
function updateParallax() {
  imageTrack.querySelectorAll('.img-wrap').forEach(wrap => {
    const rect     = wrap.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const offset   = (progress - 0.5) * state.parallax;
    wrap.querySelector('img').style.transform = `translateY(${offset}px)`;
  });
}

function setParallax(px) {
  state.parallax = px;
  document.documentElement.style.setProperty('--parallax', `${px}px`);
  parallaxSlider.value  = px;
  parallaxVal.textContent = `${px}px`;
}

/* ── SIDE LIST UPDATE ───────────────────────────────────────── */
function updateActiveCls(idx) {
  leftList.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('is-active', i === idx);
  });
  const activeCat = PROJECTS[idx].category;
  rightList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('is-active', li.dataset.cat === activeCat);
  });
}

function updateLists() {
  updateActiveCls(state.activeIndex);
  if (state.animType === 1) {
    positionListType1();
  } else {
    positionListType2();
  }
}


/* TYPE 1 — each item travels individually from bottom to its slot ─ */
function positionListType1() {
  if (!leftItemNaturalYs.length) return;
  const rightItems = [...rightList.querySelectorAll('li')];
  if (!rightItems.length) return;

  const n       = PROJECTS.length;
  const fracIdx = getScrollFracIdx();
  // Scale fracIdx [0, n-1] → normalized [0, n] so item 0 starts at 0
  // and item n-1 (AMM School) fully parks at the last image center
  const norm    = fracIdx * n / Math.max(n - 1, 1);

  const anchorY = rightItems[0].getBoundingClientRect().top;
  const itemH   = leftItemNaturalYs.length > 1
    ? leftItemNaturalYs[1] - leftItemNaturalYs[0]
    : 22;

  leftList.querySelectorAll('li').forEach((li, i) => {
    const targetY  = anchorY + i * itemH;
    const naturalY = leftItemNaturalYs[i];
    const totalDY  = targetY - naturalY;
    // progress 0→1 as norm goes from i→i+1; stays 1 once parked
    const progress = Math.min(1, Math.max(0, norm - i));
    li.style.transition = 'none';
    li.style.transform  = `translateY(${totalDY * progress}px)`;
  });

  // Active = the item currently traveling (stays active until fully rested)
  const activeIdx = Math.min(Math.max(Math.floor(norm), 0), n - 1);
  if (activeIdx !== state.activeIndex) {
    state.activeIndex = activeIdx;
    updateActiveCls(activeIdx);
  }
}

/* TYPE 2 — whole list snaps so active item sits at center; no per-item movement */
function positionListType2() {
  if (!leftItemNaturalYs.length) return;

  const n         = PROJECTS.length;
  const fracIdx   = getScrollFracIdx();
  // Integer active index only — no fractional interpolation → no continuous movement
  const activeIdx = ((Math.round(fracIdx) % n) + n) % n;

  if (activeIdx !== state.activeIndex) {
    state.activeIndex = activeIdx;
    updateActiveCls(activeIdx);
  }

  const itemH   = leftItemNaturalYs.length > 1
    ? leftItemNaturalYs[1] - leftItemNaturalYs[0]
    : 22;
  const centerY = window.innerHeight / 2;
  const natY    = leftItemNaturalYs[activeIdx];

  // Move the whole list container so the active item is at viewport center.
  // No per-item transforms — items never move relative to each other.
  leftList.querySelectorAll('li').forEach(li => { li.style.transform = ''; });
  leftList.style.transition = 'none';
  leftList.style.transform  = `translateY(${centerY - (natY + itemH / 2)}px)`;
}

/* ── PROGRESS INDICATOR ─────────────────────────────────────── */
function updateProgress() {
  const docH  = document.documentElement.scrollHeight - window.innerHeight;
  const pct   = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
  // Travel left→right across the right column (col width ≈ 150px usable)
  const colW  = rightCol.offsetWidth;
  const rangeW = Math.max(colW - 20, 0);

  progressEl.textContent      = `${pct}%`;
  progressEl.style.transform  = `translateX(${(pct / 100) * rangeW}px)`;
}

/* ── BOTTOM NAV ─────────────────────────────────────────────── */
let navShown = false;
function updateBottomNav() {
  if (!navShown && window.scrollY > 80) {
    navShown = true;
    bottomNav.classList.add('visible');
  }
}

/* ── SCROLL HANDLER ─────────────────────────────────────────── */
let rafPending = false;
function onScroll() {
  if (!state.scrollEnabled || rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;

    sessionStorage.setItem('kh_scroll', String(window.scrollY));

    // Both types run every frame — continuous scroll-linked movement
    if (state.animType === 1) {
      positionListType1();
    } else {
      positionListType2();
    }

    updateParallax();
    updateProgress();
    updateBottomNav();
  });
}

/* ── PLAYGROUND ─────────────────────────────────────────────── */
pgToggle.addEventListener('click', () => {
  pgPanel.classList.toggle('open');
});

// Close panel when clicking outside
document.addEventListener('click', e => {
  if (!pgPanel.contains(e.target) && e.target !== pgToggle) {
    pgPanel.classList.remove('open');
  }
});

// Animation type buttons
pgPanel.querySelectorAll('.pg-btn[data-anim]').forEach(btn => {
  btn.addEventListener('click', () => {
    pgPanel.querySelectorAll('.pg-btn[data-anim]').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.animType = parseInt(btn.dataset.anim);
    // Reset both transform modes before switching
    leftList.style.transform = '';
    leftList.querySelectorAll('li').forEach(li => {
      li.style.transition = 'none';
      li.style.transform  = '';
    });
    updateLists();
  });
});

// Size slider — also auto-scales parallax proportionally
sizeSlider.addEventListener('input', () => {
  const s = parseInt(sizeSlider.value) / 100;
  sizeVal.textContent = `${sizeSlider.value}%`;
  const root = document.documentElement.style;
  root.setProperty('--ls-w', `${Math.round(BASE.lsW * s)}px`);
  root.setProperty('--ls-h', `${Math.round(BASE.lsH * s)}px`);
  root.setProperty('--pt-w', `${Math.round(BASE.ptW * s)}px`);
  root.setProperty('--pt-h', `${Math.round(BASE.ptH * s)}px`);
  setParallax(Math.round(BASE.parallax * s));
});

// Parallax slider — manual override
parallaxSlider.addEventListener('input', () => {
  setParallax(parseInt(parallaxSlider.value));
  updateParallax();
});

// Gap slider
gapSlider.addEventListener('input', () => {
  state.gap = parseInt(gapSlider.value);
  gapVal.textContent = `${state.gap}px`;
  imageTrack.style.gap = `${state.gap}px`;
});

// Z-index toggle
zindexCb.addEventListener('change', () => {
  state.zindex = zindexCb.checked;
  document.body.classList.toggle('zindex-on', state.zindex);
  zindexLbl.textContent = state.zindex ? 'On' : 'Off';
});

// Auto scroll toggle (logic wired in next session)
autoscrollCb.addEventListener('change', () => {
  state.autoScroll       = autoscrollCb.checked;
  autoscrollLbl.textContent = state.autoScroll ? 'On' : 'Off';
});

// Auto scroll speed
speedSlider.addEventListener('input', () => {
  state.autoScrollSpeed  = parseInt(speedSlider.value);
  speedVal.textContent   = `${state.autoScrollSpeed}×`;
});

// Seamless loop toggle (logic wired in next session)
loopCb.addEventListener('change', () => {
  state.loop       = loopCb.checked;
  loopLbl.textContent = state.loop ? 'On' : 'Off';
});

/* ── INIT ───────────────────────────────────────────────────── */
function init() {
  // Read scroll position saved before the last reload
  savedScroll = parseInt(sessionStorage.getItem('kh_scroll') || '0', 10);

  buildLists();
  buildTrack();
  setupLazyLoad();

  // Apply initial body class for z-index
  document.body.classList.add('zindex-on');

  // Left list sits at bottom — no initial offset needed

  window.addEventListener('scroll', onScroll, { passive: true });

  // Small delay so fonts/layout settle before intro
  setTimeout(runIntro, 100);
}

document.addEventListener('DOMContentLoaded', init);
