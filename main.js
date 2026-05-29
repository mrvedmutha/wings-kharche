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
  activeIndex:   0,
  animType:      1,       // 1 or 2
  gap:           24,
  zindex:        true,
  scrollEnabled: false,
  introComplete: false,
};

// Prevent browser from overriding our manual scroll restoration
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let savedScroll = 0;

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
const gapSlider   = $('gap-slider');
const gapVal      = $('gap-val');
const zindexCb    = $('zindex-cb');
const zindexLbl   = $('zindex-lbl');

/* ── BUILD SIDE LISTS ───────────────────────────────────────── */
function buildLists() {
  PROJECTS.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p.name;
    li.dataset.idx = i;
    if (i === 0) li.classList.add('is-active');
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
    img.src = `assets/${p.img}`;
    img.alt = p.name;
    img.loading = i < 3 ? 'eager' : 'lazy';

    wrap.appendChild(img);
    imageTrack.appendChild(wrap);
  });
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
      tile.style.transition = `transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`;
      tile.style.transform  = `translate(0px, ${dy}px) scale(${s})`;
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
    introEl.style.transition = 'opacity 0.55s ease';
    introEl.style.opacity    = '0';

    // Remove overflow: hidden so scroll restoration works,
    // then jump while the overlay is still fading (fixed overlay hides the jump)
    document.body.classList.remove('intro-running');
    window.scrollTo({ top: savedScroll, behavior: 'instant' });

    topNav.classList.add('visible');
    leftCol.classList.add('visible');
    rightCol.classList.add('visible');
    pgToggle.classList.add('visible');

    state.scrollEnabled = true;
    state.activeIndex   = getActiveIndex();
    updateLists();
    updateParallax();
    updateProgress();
    updateBottomNav();
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

/* ── PARALLAX ───────────────────────────────────────────────── */
function updateParallax() {
  const parallax = 100;
  imageTrack.querySelectorAll('.img-wrap').forEach(wrap => {
    const rect     = wrap.getBoundingClientRect();
    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const offset   = (progress - 0.5) * parallax;
    wrap.querySelector('img').style.transform = `translateY(${offset}px)`;
  });
}

/* ── SIDE LIST UPDATE ───────────────────────────────────────── */
function updateLists() {
  const idx = state.activeIndex;

  // Update active class — left
  leftList.querySelectorAll('li').forEach((li, i) => {
    li.classList.toggle('is-active', i === idx);
  });

  // Update active class — right
  const activeCat = PROJECTS[idx].category;
  rightList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('is-active', li.dataset.cat === activeCat);
  });

  if (state.animType === 1) {
    positionListType1(idx);
  } else {
    positionListType2(idx);
  }
}

/* ── LIST POSITIONING HELPERS ───────────────────────────────── */
function listTargetY(list, wrap, activeIdx) {
  const items  = [...list.querySelectorAll('li')];
  if (!items.length) return 0;
  // Measure real item height once (all items are identical style)
  const itemH  = items[0].getBoundingClientRect().height;
  const center = window.innerHeight / 2;
  const top    = wrap.getBoundingClientRect().top;
  return center - top - activeIdx * itemH - itemH / 2;
}

const LIST_EASE = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';

/* TYPE 1 — left list rises bottom→top, right list centers on active cat */
function positionListType1(idx) {
  leftList.style.transition  = LIST_EASE;
  leftList.style.transform   = `translateY(${listTargetY(leftList, leftWrap, idx)}px)`;

  const rItems = [...rightList.querySelectorAll('li')];
  const rIdx   = rItems.findIndex(li => li.classList.contains('is-active'));
  rightList.style.transition = LIST_EASE;
  rightList.style.transform  = `translateY(${listTargetY(rightList, rightWrap, rIdx)}px)`;
}

/* TYPE 2 — both lists: active item stays at viewport center */
function positionListType2(idx) {
  leftList.style.transition  = LIST_EASE;
  leftList.style.transform   = `translateY(${listTargetY(leftList, leftWrap, idx)}px)`;

  const rItems = [...rightList.querySelectorAll('li')];
  const rIdx   = rItems.findIndex(li => li.classList.contains('is-active'));
  rightList.style.transition = LIST_EASE;
  rightList.style.transform  = `translateY(${listTargetY(rightList, rightWrap, rIdx)}px)`;
}

/* ── PROGRESS INDICATOR ─────────────────────────────────────── */
function updateProgress() {
  const docH   = document.documentElement.scrollHeight - window.innerHeight;
  const pct    = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
  const rangeW = 100; // px of horizontal drift

  progressEl.textContent = `${pct}%`;
  progressEl.style.transform = `translateX(${(pct / 100) * rangeW}px)`;
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

    // Persist scroll so reload can restore position
    sessionStorage.setItem('kh_scroll', String(window.scrollY));

    const idx = getActiveIndex();
    if (idx !== state.activeIndex) {
      state.activeIndex = idx;
      updateLists();
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
    // Reset list transitions and reposition
    leftList.style.transition  = 'none';
    rightList.style.transition = 'none';
    updateLists();
  });
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

/* ── INIT ───────────────────────────────────────────────────── */
function init() {
  // Read scroll position saved before the last reload
  savedScroll = parseInt(sessionStorage.getItem('kh_scroll') || '0', 10);

  buildLists();
  buildTrack();

  // Apply initial body class for z-index
  document.body.classList.add('zindex-on');

  // Initial list positions (off-screen below center — they reveal after intro)
  leftList.style.transform  = `translateY(${window.innerHeight}px)`;
  rightList.style.transform = `translateY(${window.innerHeight}px)`;

  window.addEventListener('scroll', onScroll, { passive: true });

  // Small delay so fonts/layout settle before intro
  setTimeout(runIntro, 100);
}

document.addEventListener('DOMContentLoaded', init);
