/* ═══════════════════════════════════════════════════════════════════
   KHARCHE — Scroll Gallery  v2
   - Wheel → velocity → RAF momentum
   - SVG clip-path: barrel (forward) / pincushion (backward)
   - Infinite loop via clones
   - Parallax (subtle)
   - List auto-centering via GSAP
   ═══════════════════════════════════════════════════════════════════ */

/* ─── DATA ──────────────────────────────────────────────────────── */
const PROJECTS = [
  { category: 'Home',      name: 'Home',        img: 'assets/pexels-shox-37520403.jpg' },
  { category: 'Editorial', name: 'Still Life',  img: 'assets/pexels-benni-fish-40038242-36756262.jpg' },
  { category: 'Editorial', name: 'Portraits',   img: 'assets/pexels-zulfugarkarimov-33719772.jpg' },
  { category: 'Editorial', name: 'Fashion',     img: 'assets/pexels-reneterp-14318813.jpg' },
  { category: 'Motion',    name: 'Urban Drift', img: 'assets/pexels-peter-dyllong-2158803154-36780320.jpg' },
  { category: 'Motion',    name: 'Landscapes',  img: 'assets/pexels-navlakha-33803745.jpg' },
  { category: 'Landscape', name: 'Mountains',   img: 'assets/pexels-wolfgang-weiser-467045605-27277417.jpg' },
  { category: 'Landscape', name: 'Coastline',   img: 'assets/pexels-who0ne-36197805.jpg' },
  { category: 'Portrait',  name: 'Closeup',     img: 'assets/pexels-robert-sliwinski-2155126657-37011539.jpg' },
];
const N         = PROJECTS.length;
const CATEGORIES = [...new Set(PROJECTS.map(p => p.category))];

/* ─── CLONE CONFIG ──────────────────────────────────────────────── */
// We prepend CLONE_COUNT clones from the END, and append CLONE_COUNT from the START
// So: [last CLONE_COUNT items] [all real items] [first CLONE_COUNT items]
const CLONE_COUNT = 3;

/* ─── CONFIG ────────────────────────────────────────────────────── */
const CFG = {
  friction:         0.86,   // per-frame velocity decay
  wheelMult:        0.55,   // wheel delta → velocity multiplier
  maxVelocity:      45,     // cap px/frame
  snapDuration:     1.0,
  snapEase:         'power2.inOut',
  barrelMax:        130,    // max bow in px (matches CSS --barrel-max)
  barrelCurve:      1.8,    // power exponent: >1 = slow scroll barely distorts, fast scroll hits max hard
  barrelLerp:       0.14,   // smoothing toward target distortion
  barrelRelaxDur:   0.7,    // ease back to 0 on snap
  magnetThreshold:  12,     // velocity (px/frame) below which slot-machine mode activates
  magnetStrength:   0.10,   // attraction pull per frame toward nearest center
  listEaseDur:      0.8,
  listEase:         'power2.inOut',
  parallaxStr:      0.025,  // raw pixel-distance multiplier — keep tiny
  parallaxLerp:     0.05,   // per-frame smoothing toward target (lower = more lag = silkier)
  imageGap:         20,     // px — matches CSS --gap
  snapIdleMs:       150,    // ms of near-zero velocity before snap fires
};

/* ─── STATE ─────────────────────────────────────────────────────── */
let velocity    = 0;
let trackY      = 0;
let currentD    = 0;     // current barrel/pincushion offset
let activeReal  = 0;     // real project index (0–N-1)
let isSnapping  = false;
let scrolling   = false; // true only after wheel input; cleared after snap completes
let snapTimer   = null;
let metrics     = [];    // per-slide {el, imgEl, realIndex or null for clone}
let SLIDE_H     = { active: 0, inactive: 0 }; // precomputed — immune to CSS transitions
let parallaxY   = [];    // per-slide smoothed parallax offset (%), lerped each frame

/* ─── DOM REFS ──────────────────────────────────────────────────── */
const filmTrack   = document.getElementById('filmTrack');
const filmClipper = document.getElementById('filmClipper');
const leftTrack   = document.getElementById('leftTrack');
const rightTrack  = document.getElementById('rightTrack');
const clipEl      = document.getElementById('filmClipPath');

/* ════════════════════════════════════════════════════════════════════
   BUILD DOM
   ════════════════════════════════════════════════════════════════════ */
function buildDOM() {
  // ── Build left list (sub-project names)
  PROJECTS.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = `list__item${i === 0 ? ' is-active' : ''}`;
    item.dataset.realIndex = i;
    item.textContent = p.name;
    leftTrack.appendChild(item);
  });

  // ── Build right list (category names)
  CATEGORIES.forEach(cat => {
    const item = document.createElement('div');
    item.className = `list__item${cat === PROJECTS[0].category ? ' is-active' : ''}`;
    item.dataset.category = cat;
    item.textContent = cat;
    rightTrack.appendChild(item);
  });

  // ── Build slides: [clones-top] [real items] [clones-bottom]
  const allItems = [];

  // Prepend: last CLONE_COUNT real items (as clones)
  for (let c = CLONE_COUNT; c >= 1; c--) {
    const realIdx = (N - c + N) % N;
    allItems.push({ realIndex: realIdx, isClone: true });
  }
  // Real items
  for (let i = 0; i < N; i++) {
    allItems.push({ realIndex: i, isClone: false });
  }
  // Append: first CLONE_COUNT real items (as clones)
  for (let c = 0; c < CLONE_COUNT; c++) {
    allItems.push({ realIndex: c % N, isClone: true });
  }

  allItems.forEach((item, domIdx) => {
    const p     = PROJECTS[item.realIndex];
    const isAct = !item.isClone && item.realIndex === 0;

    const slide = document.createElement('div');
    slide.className = `slide ${isAct ? 'slide--active' : 'slide--inactive'}`;
    slide.dataset.domIndex  = domIdx;
    slide.dataset.realIndex = item.realIndex;

    const img = document.createElement('img');
    img.className = 'slide__img';
    img.src = p.img;
    img.alt = p.name;
    img.loading = domIdx <= CLONE_COUNT + 1 ? 'eager' : 'lazy';

    slide.appendChild(img);
    filmTrack.appendChild(slide);
  });
}

/* ════════════════════════════════════════════════════════════════════
   MEASURE
   ════════════════════════════════════════════════════════════════════ */
function measure() {
  metrics = [];
  filmTrack.querySelectorAll('.slide').forEach((el) => {
    metrics.push({
      el,
      imgEl:     el.querySelector('.slide__img'),
      realIndex: parseInt(el.dataset.realIndex),
    });
  });
  parallaxY = new Array(metrics.length).fill(0);
}

// The DOM index where the real item 0 starts (= CLONE_COUNT)
function realStart() { return CLONE_COUNT; }

/* Precompute active/inactive heights once (and on resize).
   Uses throw-away elements with transition disabled so we always
   get the final intended height, never a mid-transition value. */
function precomputeHeights() {
  function measureClass(cls) {
    const div = document.createElement('div');
    div.className = `slide ${cls}`;
    div.style.cssText = 'position:absolute;visibility:hidden;transition:none;pointer-events:none;';
    document.body.appendChild(div);
    const h = div.getBoundingClientRect().height;
    document.body.removeChild(div);
    return h;
  }
  SLIDE_H.active   = measureClass('slide--active');
  SLIDE_H.inactive = measureClass('slide--inactive');
}

// Get target trackY so DOM slide [domIdx] is centered in viewport.
// Uses precomputed heights — immune to CSS transition intermediate values.
function getTargetY(domIdx) {
  const viewH = filmClipper.offsetHeight;
  let offset = 0;
  for (let i = 0; i < domIdx; i++) {
    const h = metrics[i].realIndex === activeReal ? SLIDE_H.active : SLIDE_H.inactive;
    offset += h + CFG.imageGap;
  }
  const slideH = metrics[domIdx].realIndex === activeReal ? SLIDE_H.active : SLIDE_H.inactive;
  return -(offset + slideH / 2 - viewH / 2);
}

// Pre-allocated positions cache — reused every frame to avoid GC churn
let posCache = [];

// Build all center-Y values in ONE O(n) pass.
// getTargetY(i) is O(n) itself, so calling it n times = O(n²).
// This replaces that pattern everywhere in the hot RAF loop.
function buildPositions() {
  if (posCache.length !== metrics.length) posCache = new Array(metrics.length);
  const viewH = filmClipper.offsetHeight;
  let offset  = 0;
  for (let i = 0; i < metrics.length; i++) {
    const h    = metrics[i].realIndex === activeReal ? SLIDE_H.active : SLIDE_H.inactive;
    posCache[i] = -(offset + h / 2 - viewH / 2);
    offset     += h + CFG.imageGap;
  }
  return posCache;
}

// Find which DOM index is closest to current trackY.
// Accepts a pre-built positions array (fast path from tick);
// builds its own if called cold (e.g. from snap).
function findNearest(pos) {
  if (!pos) pos = buildPositions();
  let best = realStart(), bestDist = Infinity;
  for (let i = 0; i < metrics.length; i++) {
    const dist = Math.abs(pos[i] - trackY);
    if (dist < bestDist) { bestDist = dist; best = i; }
  }
  return best;
}

// Convert dom index → real index
function domToReal(domIdx) {
  return metrics[domIdx].realIndex;
}

/* ════════════════════════════════════════════════════════════════════
   SVG CLIP-PATH  (barrel d>0, pincushion d<0)

   The clipper element is (active-w + 2×barrelMax) wide.
   At rest the clip-path shows the central active-w strip.
   d drives how much the sides bow in/out.
   ════════════════════════════════════════════════════════════════════ */
const BARREL_MAX = CFG.barrelMax;

function updateClipPath(d) {
  const W = filmClipper.offsetWidth;
  const H = filmClipper.offsetHeight;
  if (!W || !H) return;

  // Clamp
  d = Math.max(-BARREL_MAX, Math.min(BARREL_MAX, d));

  // Margin at rest (how far in from each side the clip sits)
  const margin = BARREL_MAX;

  // Corners (fixed, don't move with distortion)
  const x0 = margin;
  const x1 = W - margin;

  // Midpoint bow:
  // Barrel (d > 0): left bows LEFT (x0-d), right bows RIGHT (x1+d) → lens shape
  // Pincushion (d < 0): left bows RIGHT (x0-d = x0+|d|), right bows LEFT (x1+d = x1-|d|) → hourglass
  const xL = x0 - d;
  const xR = x1 + d;

  // Top/bottom edges stay perfectly straight — only left/right bow.
  // (Adding cy here caused the "wavy" effect on the image tops/bottoms.)
  const path = [
    // Start top-left corner
    `M ${x0},0`,
    // Top edge → top-right corner (straight line via coincident control points)
    `C ${x0 + (x1-x0)*0.33},0`,
    `  ${x0 + (x1-x0)*0.66},0`,
    `  ${x1},0`,
    // Right edge → bottom-right (bows right for barrel, left for pincushion)
    `C ${xR},${H*0.33}`,
    `  ${xR},${H*0.66}`,
    `  ${x1},${H}`,
    // Bottom edge → bottom-left (straight line)
    `C ${x0 + (x1-x0)*0.66},${H}`,
    `  ${x0 + (x1-x0)*0.33},${H}`,
    `  ${x0},${H}`,
    // Left edge → top-left (bows left for barrel, right for pincushion)
    `C ${xL},${H*0.66}`,
    `  ${xL},${H*0.33}`,
    `  ${x0},0`,
    `Z`,
  ].join(' ');

  clipEl.setAttribute('d', path);
}

/* ════════════════════════════════════════════════════════════════════
   ACTIVE STATE
   ════════════════════════════════════════════════════════════════════ */
function setActive(realIdx) {
  if (realIdx === activeReal) return;
  activeReal = realIdx;
  refreshActiveClasses();
}

function refreshActiveClasses() {
  // Slides — mark all DOM slides matching the active real index
  filmTrack.querySelectorAll('.slide').forEach(s => {
    const isAct = parseInt(s.dataset.realIndex) === activeReal;
    s.classList.toggle('slide--active',   isAct);
    s.classList.toggle('slide--inactive', !isAct);
  });

  // Left list
  leftTrack.querySelectorAll('.list__item').forEach(item => {
    item.classList.toggle('is-active', parseInt(item.dataset.realIndex) === activeReal);
  });

  // Right list
  const activeCat = PROJECTS[activeReal].category;
  rightTrack.querySelectorAll('.list__item').forEach(item => {
    item.classList.toggle('is-active', item.dataset.category === activeCat);
  });

  // Scroll lists
  const leftActive = leftTrack.querySelector(`[data-real-index="${activeReal}"]`);
  scrollListTo(leftTrack, leftActive);

  const rightActive = rightTrack.querySelector(`[data-category="${activeCat}"]`);
  scrollListTo(rightTrack, rightActive);
}

function scrollListTo(track, activeEl) {
  if (!activeEl) return;
  const parentH = track.parentElement.offsetHeight;
  const y = parentH / 2 - activeEl.offsetTop - activeEl.offsetHeight / 2;
  gsap.to(track, { y, duration: CFG.listEaseDur, ease: CFG.listEase, overwrite: true });
}

/* ════════════════════════════════════════════════════════════════════
   PARALLAX
   ════════════════════════════════════════════════════════════════════ */
// pos is optional: pass the frame's pre-built array for O(1) lookups;
// omit and it builds its own (used by snap's onUpdate).
// Direct style.transform instead of gsap.set — avoids 15× GSAP overhead/frame.
function applyParallax(pos) {
  if (!pos) pos = buildPositions();
  for (let i = 0; i < metrics.length; i++) {
    const raw    = (pos[i] - trackY) * CFG.parallaxStr;
    const target = Math.max(-3.5, Math.min(3.5, raw));
    parallaxY[i] += (target - parallaxY[i]) * CFG.parallaxLerp;
    metrics[i].imgEl.style.transform = `translateY(${-10 + parallaxY[i]}%)`;
  }
}

/* ════════════════════════════════════════════════════════════════════
   SNAP + INFINITE LOOP
   ════════════════════════════════════════════════════════════════════ */
function snap() {
  if (isSnapping) return;
  isSnapping = true;
  velocity   = 0;

  const targetDom = findNearest();
  const realIdx   = domToReal(targetDom);

  // Commit the new active state NOW — before computing snapY so that
  // getTargetY uses the correct (final) SLIDE_H for the incoming active slide.
  setActive(realIdx);

  const snapY = getTargetY(targetDom);

  // Relax distortion
  const distortObj = { d: currentD };
  gsap.to(distortObj, {
    d:        0,
    duration: CFG.barrelRelaxDur,
    ease:     'power2.out',
    onUpdate() { currentD = distortObj.d; updateClipPath(currentD); },
  });

  // Animate to snap position
  const trackObj = { y: trackY };
  gsap.to(trackObj, {
    y:        snapY,
    duration: CFG.snapDuration,
    ease:     CFG.snapEase,
    onUpdate() {
      trackY = trackObj.y;
      gsap.set(filmTrack, { y: trackY });
      applyParallax();
    },
    onComplete() {
      isSnapping = false;
      scrolling  = false;

      // ── Infinite loop teleport (invisible since content is identical)
      const totalDom  = metrics.length;
      const realFirst = CLONE_COUNT;
      const realLast  = CLONE_COUNT + N - 1;
      const cloneBot  = totalDom - CLONE_COUNT;

      let finalDom = targetDom;
      if (targetDom < realFirst) {
        finalDom = realLast - (realFirst - 1 - targetDom);
      } else if (targetDom > realLast) {
        finalDom = realFirst + (targetDom - cloneBot);
      }

      // Always pin to exact center — corrects any rounding drift and handles teleport
      trackY = getTargetY(finalDom);
      gsap.set(filmTrack, { y: trackY });
    },
  });
}

/* ════════════════════════════════════════════════════════════════════
   RAF LOOP
   ════════════════════════════════════════════════════════════════════ */
function tick() {
  requestAnimationFrame(tick);
  if (isSnapping) return;

  // Apply friction
  velocity *= CFG.friction;
  trackY   += velocity;

  // ── Build all positions ONCE this frame — O(n) total instead of O(n²)
  let pos = buildPositions();

  // ── SEAMLESS LOOP ─────────────────────────────────────────────────
  // Replace the old hard clamp with a continuous invisible teleport.
  // One full loop = the Y distance from real item 0 to its bottom clone.
  // If trackY drifts outside the real-item zone, shift by loopLen so
  // the visual is identical but we're back inside the real zone.
  // Fires every RAF frame → no jump is ever visible.
  const loopLen = pos[CLONE_COUNT] - pos[CLONE_COUNT + N];  // always positive
  if (trackY < pos[CLONE_COUNT + N - 1]) {
    trackY += loopLen;   // scrolled past last real item → wrap to top clones
  } else if (trackY > pos[CLONE_COUNT]) {
    trackY -= loopLen;   // scrolled past first real item → wrap to bottom clones
  }

  const absV = Math.abs(velocity);

  // ── SLOT-MACHINE MODE ──────────────────────────────────────────────
  if (scrolling && absV < CFG.magnetThreshold) {
    const nearestDom  = findNearest(pos);
    const nearestReal = domToReal(nearestDom);
    if (nearestReal !== activeReal) {
      setActive(nearestReal);
      pos = buildPositions();  // recompute after height change
    }
    trackY += (pos[nearestDom] - trackY) * CFG.magnetStrength;
  }

  gsap.set(filmTrack, { y: trackY });

  // Barrel/pincushion — power-curved
  const normV   = Math.max(-1, Math.min(1, velocity / CFG.maxVelocity));
  const curved  = Math.sign(normV) * Math.pow(Math.abs(normV), CFG.barrelCurve);
  const targetD = -curved * BARREL_MAX;
  currentD += (targetD - currentD) * CFG.barrelLerp;
  if (Math.abs(currentD) > 0.5) updateClipPath(currentD);

  // Parallax — pass pre-built pos; direct style.transform (no gsap.set per image)
  applyParallax(pos);

  // Snap trigger
  if (scrolling && absV < 0.3) {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, CFG.snapIdleMs);
  }
}

/* ════════════════════════════════════════════════════════════════════
   WHEEL
   ════════════════════════════════════════════════════════════════════ */
function initWheel() {
  window.addEventListener('wheel', e => {
    e.preventDefault();
    if (isSnapping) return;
    scrolling = true;   // ← user is actively scrolling; re-arm snap timer
    clearTimeout(snapTimer);

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 28;
    if (e.deltaMode === 2) delta *= 500;

    velocity -= delta * CFG.wheelMult;
    velocity  = Math.max(-CFG.maxVelocity, Math.min(CFG.maxVelocity, velocity));
  }, { passive: false });
}

/* ════════════════════════════════════════════════════════════════════
   SIZE CLIPPER & CLIP PATH
   ════════════════════════════════════════════════════════════════════ */
function sizeClipper() {
  // Width/height set in CSS (active-w + 2*barrel-max × 100vh)
  // Just draw the resting clip-path
  updateClipPath(0);
}

/* ════════════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════════════ */
function init() {
  buildDOM();

  requestAnimationFrame(() => {
    measure();
    precomputeHeights();   // must run after measure() so SLIDE_H is ready for getTargetY
    sizeClipper();

    // Start centered on the first REAL item (DOM index = CLONE_COUNT)
    trackY = getTargetY(realStart());
    gsap.set(filmTrack, { y: trackY });

    // Init list positions
    refreshActiveClasses();

    // Start loop + wheel
    tick();
    initWheel();

    window.addEventListener('resize', () => {
      measure();
      precomputeHeights();
      sizeClipper();
      trackY = getTargetY(
        realStart() + activeReal   // re-center on current real item
      );
      velocity = 0;
      gsap.set(filmTrack, { y: trackY });
    });
  });
}

init();
