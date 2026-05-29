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

  // Phase 1: icon fades in
  setTimeout(() => {
    introIcon.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease';
    introIcon.style.opacity = '1';
    introIcon.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 200);

  // Phase 2: image tiles pop in one by one
  const tileW = 180;
  const tileH = 130;
  const cols  = 4;
  const startX = vw / 2 - (cols * tileW) / 2;

  PROJECTS.slice(0, 12).forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx  = startX + col * (tileW + 10);
    const ty  = vh / 2 - 200 + row * (tileH + 10);

    const tile = document.createElement('div');
    tile.className = 'intro-tile';
    tile.style.cssText = `
      left: ${tx}px;
      top:  ${ty}px;
      width:  ${tileW}px;
      height: ${tileH}px;
    `;

    const img = document.createElement('img');
    img.src = `assets/${p.img}`;
    img.alt = '';
    tile.appendChild(img);
    introTiles.appendChild(tile);

    const delay = 400 + i * 90;
    setTimeout(() => {
      tile.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
      tile.style.opacity = '1';
      tile.style.transform = 'scale(1)';
    }, delay);
  });

  // Phase 3: collapse tiles to vertical strip, bg fades to white
  setTimeout(() => {
    introEl.style.transition = 'background 0.8s ease';
    introEl.style.background = 'rgba(255,255,255,0.9)';
    introIcon.style.opacity = '0';

    document.querySelectorAll('.intro-tile').forEach((tile, i) => {
      const w = imageTrack.offsetWidth || 940;
      const cx = vw / 2 - w / 2 + 10;
      const oh = parseInt(tile.style.height);
      const targetTop = vh / 2 - oh / 2 + (i - 6) * (oh + 12);

      tile.style.transition = 'left 0.6s ease, top 0.6s ease, width 0.6s ease, opacity 0.5s ease';
      tile.style.left  = `${cx}px`;
      tile.style.top   = `${targetTop}px`;
      tile.style.width = `${w - 20}px`;
    });
  }, 1700);

  // Phase 4: reveal main layout
  setTimeout(() => {
    introEl.style.transition = 'opacity 0.7s ease';
    introEl.style.opacity = '0';
    topNav.classList.add('visible');
    leftCol.classList.add('visible');
    rightCol.classList.add('visible');
    pgToggle.classList.add('visible');
  }, 2600);

  // Phase 5: complete
  setTimeout(() => {
    introEl.style.display = 'none';
    document.body.classList.remove('intro-running');
    state.scrollEnabled = true;
    state.introComplete = true;
    updateLists();
  }, 3300);
}

/* ── ACTIVE INDEX DETECTION ─────────────────────────────────── */
function getActiveIndex() {
  const wraps = imageTrack.querySelectorAll('.img-wrap');
  const mid   = window.scrollY + window.innerHeight / 2;
  let   best  = 0;
  let   bestD = Infinity;

  wraps.forEach((w, i) => {
    const top    = w.offsetTop;
    const center = top + w.offsetHeight / 2;
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

/* TYPE 1 — left list rises from bottom to top ──────────────── */
function positionListType1(idx) {
  const itemH    = 23;  // approximate line height per item
  const center   = window.innerHeight / 2;
  const listTop  = leftWrap.getBoundingClientRect().top;
  const targetY  = center - listTop - idx * itemH - itemH / 2;

  leftList.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  leftList.style.transform  = `translateY(${targetY}px)`;

  // Right list stays fixed — just centered
  const rItemH   = 23;
  const rItems   = rightList.querySelectorAll('li');
  const rIdx     = [...rItems].findIndex(li => li.classList.contains('is-active'));
  const rCenter  = window.innerHeight / 2;
  const rListTop = rightWrap.getBoundingClientRect().top;
  const rTargetY = rCenter - rListTop - rIdx * rItemH - rItemH / 2;

  rightList.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  rightList.style.transform  = `translateY(${rTargetY}px)`;
}

/* TYPE 2 — both lists: active stays centered ───────────────── */
function positionListType2(idx) {
  const itemH    = 23;
  const center   = window.innerHeight / 2;

  // Left
  const lListTop = leftWrap.getBoundingClientRect().top;
  const lTargetY = center - lListTop - idx * itemH - itemH / 2;
  leftList.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  leftList.style.transform  = `translateY(${lTargetY}px)`;

  // Right — active category centered
  const rItems   = [...rightList.querySelectorAll('li')];
  const rIdx     = rItems.findIndex(li => li.classList.contains('is-active'));
  const rListTop = rightWrap.getBoundingClientRect().top;
  const rTargetY = center - rListTop - rIdx * itemH - itemH / 2;
  rightList.style.transition = 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
  rightList.style.transform  = `translateY(${rTargetY}px)`;
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
function onScroll() {
  if (!state.scrollEnabled) return;

  const idx = getActiveIndex();
  if (idx !== state.activeIndex) {
    state.activeIndex = idx;
    updateLists();
  }

  updateParallax();
  updateProgress();
  updateBottomNav();
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
