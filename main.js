/* ═══════════════════════════════════════════════════════════════════
   KHARCHE — Drum Gallery
   - Wheel → angular velocity → 3D cylinder rotation
   - SVG clip-path: barrel (scroll down) / pincushion (scroll up)
   - True infinite loop: drum just keeps rotating, no clones/teleport
   - Side lists auto-centre via GSAP
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
const N          = PROJECTS.length;
const CATEGORIES = [...new Set(PROJECTS.map(p => p.category))];
const ITEM_ANGLE = 360 / N;   // degrees each slot occupies on the drum

/* ─── CONFIG ────────────────────────────────────────────────────── */
const CFG = {
  friction:         0.88,
  wheelMult:        0.018,    // wheel delta → angular velocity (deg/frame)
  maxAngVelocity:   10,       // deg/frame cap
  snapDuration:     1.0,
  snapEase:         'power2.inOut',
  barrelMax:        130,
  barrelCurve:      1.8,      // power exponent for velocity → distortion curve
  barrelLerp:       0.14,
  barrelRelaxDur:   0.7,
  magnetThreshold:  1.2,      // deg/frame: below this, slot-machine pull activates
  magnetStrength:   0.12,
  listEaseDur:      0.8,
  listEase:         'power2.inOut',
  itemGap:          30,       // extra arc-gap between items (px)
  snapIdleMs:       100,
};

/* ─── STATE ─────────────────────────────────────────────────────── */
let drumAngle   = 0;     // cumulative drum rotation in degrees
let angVelocity = 0;     // degrees per frame
let currentD    = 0;     // current barrel/pincushion distortion
let activeReal  = 0;
let isSnapping  = false;
let scrolling   = false;
let snapTimer   = null;
let metrics     = [];    // { el, imgEl, realIndex }
let RADIUS      = 0;     // drum cylinder radius in px
let ITEM_H      = 0;     // measured height of one drum item

/* ─── DOM REFS ──────────────────────────────────────────────────── */
const drum        = document.getElementById('drum');
const filmClipper = document.getElementById('filmClipper');
const leftTrack   = document.getElementById('leftTrack');
const rightTrack  = document.getElementById('rightTrack');
const clipEl      = document.getElementById('filmClipPath');

/* ════════════════════════════════════════════════════════════════════
   BUILD DOM
   ════════════════════════════════════════════════════════════════════ */
function buildDOM() {
  PROJECTS.forEach((p, i) => {
    const li = document.createElement('div');
    li.className = `list__item${i === 0 ? ' is-active' : ''}`;
    li.dataset.realIndex = i;
    li.textContent = p.name;
    leftTrack.appendChild(li);
  });

  CATEGORIES.forEach(cat => {
    const li = document.createElement('div');
    li.className = `list__item${cat === PROJECTS[0].category ? ' is-active' : ''}`;
    li.dataset.category = cat;
    li.textContent = cat;
    rightTrack.appendChild(li);
  });

  PROJECTS.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'drum__item';
    el.dataset.realIndex = i;

    const img = document.createElement('img');
    img.className = 'drum__img';
    img.src = p.img;
    img.alt = p.name;
    img.loading = i < 3 ? 'eager' : 'lazy';

    el.appendChild(img);
    drum.appendChild(el);
    metrics.push({ el, imgEl: img, realIndex: i });
  });
}

/* ════════════════════════════════════════════════════════════════════
   GEOMETRY
   ════════════════════════════════════════════════════════════════════ */
function measureItemHeight() {
  const div = document.createElement('div');
  div.className = 'drum__item';
  div.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
  document.body.appendChild(div);
  ITEM_H = div.getBoundingClientRect().height;
  document.body.removeChild(div);
}

function computeRadius() {
  // Arc spacing per item = height + gap.
  // Full circumference = N × spacing → radius = circumference / 2π
  RADIUS = ((ITEM_H + CFG.itemGap) * N) / (2 * Math.PI);
}

// Place each item at its fixed slot on the cylinder surface.
// The drum container's rotateX then spins the whole thing.
function placeItems() {
  metrics.forEach((m, i) => {
    m.el.style.transform = `rotateX(${i * ITEM_ANGLE}deg) translateZ(${RADIUS}px)`;
  });
}

/* ════════════════════════════════════════════════════════════════════
   DRUM RENDER
   ════════════════════════════════════════════════════════════════════ */
// translateZ(-RADIUS) shifts the whole drum back so the front item
// sits at Z = 0 (no perspective magnification). Items going around
// the back naturally end up at negative Z → appear smaller.
function renderDrum() {
  drum.style.transform = `translateZ(-${RADIUS}px) rotateX(${drumAngle}deg)`;

  metrics.forEach((m, i) => {
    // Angular distance from this item to the current front-facing direction.
    let diff = ((i * ITEM_ANGLE - drumAngle) % 360 + 360) % 360;
    if (diff > 180) diff -= 360;              // range –180 … +180
    // cos: 1 at front, 0 at 90°, negative at back → clamp to 0
    m.el.style.opacity = Math.max(0, Math.cos(diff * Math.PI / 180));
  });
}

/* ════════════════════════════════════════════════════════════════════
   HELPERS — angle ↔ real index
   ════════════════════════════════════════════════════════════════════ */
function angleToReal(angle) {
  const idx = Math.round(angle / ITEM_ANGLE);
  return ((idx % N) + N) % N;
}

function nearestSnap(angle) {
  return Math.round(angle / ITEM_ANGLE) * ITEM_ANGLE;
}

/* ════════════════════════════════════════════════════════════════════
   SVG CLIP-PATH  (barrel d>0 = scroll down, pincushion d<0 = scroll up)
   ════════════════════════════════════════════════════════════════════ */
const BARREL_MAX = CFG.barrelMax;

function updateClipPath(d) {
  const W = filmClipper.offsetWidth;
  const H = filmClipper.offsetHeight;
  if (!W || !H) return;
  d = Math.max(-BARREL_MAX, Math.min(BARREL_MAX, d));
  const margin = BARREL_MAX;
  const x0 = margin, x1 = W - margin;
  const xL = x0 - d, xR = x1 + d;
  const path = [
    `M ${x0},0`,
    `C ${x0+(x1-x0)*0.33},0  ${x0+(x1-x0)*0.66},0  ${x1},0`,
    `C ${xR},${H*0.33}  ${xR},${H*0.66}  ${x1},${H}`,
    `C ${x0+(x1-x0)*0.66},${H}  ${x0+(x1-x0)*0.33},${H}  ${x0},${H}`,
    `C ${xL},${H*0.66}  ${xL},${H*0.33}  ${x0},0`,
    `Z`,
  ].join(' ');
  clipEl.setAttribute('d', path);
}

/* ════════════════════════════════════════════════════════════════════
   ACTIVE STATE + LISTS
   ════════════════════════════════════════════════════════════════════ */
function setActive(realIdx) {
  if (realIdx === activeReal) return;
  activeReal = realIdx;
  refreshLists();
}

function refreshLists() {
  leftTrack.querySelectorAll('.list__item').forEach(item => {
    item.classList.toggle('is-active', parseInt(item.dataset.realIndex) === activeReal);
  });
  const activeCat = PROJECTS[activeReal].category;
  rightTrack.querySelectorAll('.list__item').forEach(item => {
    item.classList.toggle('is-active', item.dataset.category === activeCat);
  });
  scrollListTo(leftTrack,  leftTrack.querySelector(`[data-real-index="${activeReal}"]`));
  scrollListTo(rightTrack, rightTrack.querySelector(`[data-category="${activeCat}"]`));
}

function scrollListTo(track, el) {
  if (!el) return;
  const parentH = track.parentElement.offsetHeight;
  const y = parentH / 2 - el.offsetTop - el.offsetHeight / 2;
  gsap.to(track, { y, duration: CFG.listEaseDur, ease: CFG.listEase, overwrite: true });
}

/* ════════════════════════════════════════════════════════════════════
   SNAP
   ════════════════════════════════════════════════════════════════════ */
function snap() {
  if (isSnapping) return;
  isSnapping  = true;
  angVelocity = 0;

  const targetAngle = nearestSnap(drumAngle);
  setActive(angleToReal(targetAngle));

  // Relax distortion back to neutral
  const distortObj = { d: currentD };
  gsap.to(distortObj, {
    d:        0,
    duration: CFG.barrelRelaxDur,
    ease:     'power2.out',
    onUpdate() { currentD = distortObj.d; updateClipPath(currentD); },
  });

  // Rotate drum to snap position
  const obj = { a: drumAngle };
  gsap.to(obj, {
    a:        targetAngle,
    duration: CFG.snapDuration,
    ease:     CFG.snapEase,
    onUpdate()  { drumAngle = obj.a; renderDrum(); },
    onComplete() {
      drumAngle  = targetAngle;   // pin exactly — eliminates float drift
      isSnapping = false;
      scrolling  = false;
      renderDrum();
    },
  });
}

/* ════════════════════════════════════════════════════════════════════
   RAF LOOP
   ════════════════════════════════════════════════════════════════════ */
function tick() {
  requestAnimationFrame(tick);
  if (isSnapping) return;

  angVelocity *= CFG.friction;
  drumAngle   += angVelocity;

  const absV = Math.abs(angVelocity);

  // Slot-machine mode: gentle magnetic pull toward nearest + live active update
  if (scrolling && absV < CFG.magnetThreshold) {
    const target  = nearestSnap(drumAngle);
    drumAngle    += (target - drumAngle) * CFG.magnetStrength;
    const realIdx = angleToReal(drumAngle);
    if (realIdx !== activeReal) setActive(realIdx);
  }

  renderDrum();

  // Barrel/pincushion — power-curved so slow scrolls barely distort
  const normV   = Math.max(-1, Math.min(1, angVelocity / CFG.maxAngVelocity));
  const curved  = Math.sign(normV) * Math.pow(Math.abs(normV), CFG.barrelCurve);
  currentD     += (-curved * BARREL_MAX - currentD) * CFG.barrelLerp;
  if (Math.abs(currentD) > 0.5) updateClipPath(currentD);

  // Arm hard snap once fully decelerated
  if (scrolling && absV < 0.1) {
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
    scrolling = true;
    clearTimeout(snapTimer);

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 28;
    if (e.deltaMode === 2) delta *= 500;

    angVelocity += delta * CFG.wheelMult;
    angVelocity  = Math.max(-CFG.maxAngVelocity, Math.min(CFG.maxAngVelocity, angVelocity));
  }, { passive: false });
}

/* ════════════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════════════ */
function init() {
  buildDOM();

  requestAnimationFrame(() => {
    measureItemHeight();
    computeRadius();
    placeItems();
    updateClipPath(0);
    renderDrum();
    refreshLists();
    tick();
    initWheel();

    window.addEventListener('resize', () => {
      measureItemHeight();
      computeRadius();
      placeItems();
      updateClipPath(0);
    });
  });
}

init();
