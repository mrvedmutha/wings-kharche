/* ═══════════════════════════════════════════════════════════════
   KHARCHE — Homepage Animation  v3
   Clean build — no GSAP, no clones, no distortion effects
   ═══════════════════════════════════════════════════════════════ */

/* ── DATA ──────────────────────────────────────────────────── */
const PROJECTS = [
  {
    name: "Notting Hill",
    category: "Homes",
    img: "pexels-shox-37520403.jpg",
    orient: "landscape",
  },
  {
    name: "Ascot",
    category: "Residentials",
    img: "pexels-airamdphoto-27675599.jpg",
    orient: "portrait",
  },
  {
    name: "Tuxeda",
    category: "Interiors",
    img: "pexels-benni-fish-40038242-36756262.jpg",
    orient: "landscape",
  },
  {
    name: "Richmond",
    category: "Homes",
    img: "pexels-raoul-turmond-1765272532-33811740.jpg",
    orient: "portrait",
  },
  {
    name: "IHeart",
    category: "Retail & Hospitality",
    img: "pexels-navlakha-33803745.jpg",
    orient: "landscape",
  },
  {
    name: "Pristine Pavilion",
    category: "Residentials",
    img: "pexels-paco-esqueda-787628224-34065622.jpg",
    orient: "portrait",
  },
  {
    name: "Palm Grove",
    category: "Homes",
    img: "pexels-peter-dyllong-2158803154-36780320.jpg",
    orient: "landscape",
  },
  {
    name: "Nilaaa",
    category: "Interiors",
    img: "pexels-axp-photography-500641970-30683411.jpg",
    orient: "portrait",
  },
  {
    name: "Solomon Francis Residence",
    category: "Homes",
    img: "pexels-reneterp-14318813.jpg",
    orient: "landscape",
  },
  {
    name: "Shree Lynwood House",
    category: "Residentials",
    img: "pexels-tommaso-37555693.jpg",
    orient: "portrait",
  },
  {
    name: "House Of Champions",
    category: "IT Parks & Offices",
    img: "pexels-robert-sliwinski-2155126657-37011539.jpg",
    orient: "landscape",
  },
  {
    name: "Rathod Residence",
    category: "Homes",
    img: "pexels-lucky-the-chocolate-boss-222331365-17064380.jpg",
    orient: "portrait",
  },
  {
    name: "Sivaam",
    category: "Institutional & Industrial",
    img: "pexels-who0ne-36197805.jpg",
    orient: "landscape",
  },
  {
    name: "Serene Springs",
    category: "Residentials",
    img: "pexels-zulfugarkarimov-33719772.jpg",
    orient: "portrait",
  },
  {
    name: "Elements",
    category: "Interiors",
    img: "pexels-wolfgang-weiser-467045605-27277417.jpg",
    orient: "landscape",
  },
  {
    name: "Ajay Residence",
    category: "Homes",
    img: "pexels-robert-sliwinski-2155126657-37011539.jpg",
    orient: "landscape",
  },
  {
    name: "AMM School",
    category: "Institutional & Industrial",
    img: "pexels-navlakha-33803745.jpg",
    orient: "landscape",
  },
];

const CATEGORIES = [...new Set(PROJECTS.map((p) => p.category))];

/* ── STATE ─────────────────────────────────────────────────── */
const state = {
  activeIndex: 0,
  animType: 1, // 1 or 2
  gap: 24,
  parallax: 100,
  scrollEnabled: false,
  introComplete: false,
  loop: false,
};

// Prevent browser from overriding our manual scroll restoration
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

let savedScroll = 0;
let leftItemNaturalYs = []; // cached natural viewport-Y of each left li (fixed col, constant)

// Layout cache — populated once after intro, zero DOM reads in scroll loop
let imageWraps = []; // .img-wrap elements
let imageEls = []; // inner <img> elements
let imageCenters = []; // absolute document-Y of each img-wrap centre
let imageSizes = []; // rendered height of each img-wrap
let rightAnchorY   = 0; // viewport-Y of first right-list item (fixed col)
let rightColW      = 0; // width of right column
let totalScrollH   = 0; // scrollHeight - innerHeight, cached
let progressRangeW = 0; // travel distance: left-col left edge → right-col right edge
let leftItems = []; // left list <li> refs
let rightItems = []; // right list <li> refs

// Seamless loop
let loopOneTrackH = 0; // pixel distance of one full cloned track segment
let loopJumping = false; // prevents recursive boundary checks

/* ── DOM REFS ───────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const introEl = $("intro");
const introIcon = $("intro-icon");
const introTiles = $("intro-tiles");
const topNav = $("top-nav");
const leftCol = $("left-col");
const rightCol = $("right-col");
const leftList = $("left-list");
const rightList = $("right-list");
const leftWrap = $("left-list-wrap");
const rightWrap = $("right-list-wrap");
const imageTrack = $("image-track");
const progressEl = $("progress-pct");
const bottomNav = $("bottom-nav");
const pgToggle = $("pg-toggle");
const pgPanel = $("pg-panel");
const gapSlider = $("gap-slider");
const gapVal = $("gap-val");
const sizeSlider = $("size-slider");
const sizeVal = $("size-val");
const parallaxSlider = $("parallax-slider");
const parallaxVal = $("parallax-val");
const loopCb = $("loop-cb");
const loopLbl = $("loop-lbl");

// Base image dimensions (100% scale)
const BASE = { lsW: 940, lsH: 530, ptW: 640, ptH: 860, parallax: 100 };

/* ── HELPERS ────────────────────────────────────────────────── */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ── BUILD SIDE LISTS ───────────────────────────────────────── */
function buildLists() {
  PROJECTS.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    li.dataset.idx = i;
    if (i === 0) li.classList.add("is-active");
    li.addEventListener("click", () => {
      // Target real item only (not a loop clone)
      const wrap = imageTrack.querySelector(
        `.img-wrap[data-real][data-idx="${i}"]`,
      );
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const target = Math.max(
        0,
        window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2,
      );
      if (lenis) lenis.scrollTo(target);
      else window.scrollTo({ top: target, behavior: "smooth" });
    });
    leftList.appendChild(li);
    leftItems.push(li);
  });

  CATEGORIES.forEach((cat) => {
    const li = document.createElement("li");
    li.textContent = cat;
    li.dataset.cat = cat;
    if (cat === PROJECTS[0].category) li.classList.add("is-active");
    rightList.appendChild(li);
    rightItems.push(li);
  });
}

/* ── BUILD IMAGE TRACK ──────────────────────────────────────── */
function buildTrack() {
  PROJECTS.forEach((p, i) => {
    const wrap = document.createElement("div");
    wrap.className = `img-wrap ${p.orient}`;
    wrap.dataset.idx = i;

    wrap.dataset.real = "true"; // marks real (non-clone) items for click targeting

    const img = document.createElement("img");
    img.alt = p.name;
    img.src = `assets/${p.img}`;
    img.decoding = "async";
    img.fetchPriority = i === 0 ? "high" : "auto";

    wrap.appendChild(img);

    const link = document.createElement("a");
    link.href = `/project/${slugify(p.name)}`;
    link.className = "img-link";
    link.appendChild(wrap);
    imageTrack.appendChild(link);
  });
}

/* ── INTRO ANIMATION ────────────────────────────────────────── */
function runIntro() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = vw / 2;
  const cy = vh / 2;

  // Always start centred on project index 3 ("line 4") — gives scroll room
  // above for seamless loop logic later
  const INTRO_START_IDX = 3;
  {
    const wraps = [...imageTrack.querySelectorAll(".img-wrap")];
    const w = wraps[INTRO_START_IDX];
    if (w) {
      const r = w.getBoundingClientRect(); // scrollY=0 during intro-running
      savedScroll = Math.max(0, Math.round(r.top + w.offsetHeight / 2 - cy));
    }
  }

  const THUMB_H = 180;
  const tileW = (p) =>
    p.orient === "landscape"
      ? Math.round((THUMB_H * 16) / 9)
      : Math.round((THUMB_H * 2) / 3);

  // Phase 1 — logo scales in
  setTimeout(() => {
    introIcon.style.transition =
      "opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
    introIcon.style.opacity = "1";
    introIcon.style.transform = "translate(-50%,-50%) scale(1) rotate(0deg)";
  }, 150);

  // Phase 2 — logo rotates 360°
  setTimeout(() => {
    introIcon.style.transition = "transform 0.65s cubic-bezier(0.4,0,0.2,1)";
    introIcon.style.transform = "translate(-50%,-50%) scale(1) rotate(360deg)";
  }, 480);

  // Phase 3 — images pop in one by one at the SAME centre position
  const STAGGER = 85;
  const POP_START = 900;

  PROJECTS.forEach((p, i) => {
    const tw = tileW(p);
    const tile = document.createElement("div");
    tile.className = "intro-tile";
    Object.assign(tile.style, {
      left: `${cx - tw / 2}px`,
      top: `${cy - THUMB_H / 2}px`,
      width: `${tw}px`,
      height: `${THUMB_H}px`,
      opacity: "0.80",
      transform: "scale(0)",
      zIndex: String(i + 1),
    });

    const img = document.createElement("img");
    img.src = `assets/${p.img}`;
    img.alt = "";
    img.decoding = "async";
    tile.appendChild(img);
    introTiles.appendChild(tile);

    setTimeout(
      () => {
        tile.style.transition = "transform 0.36s cubic-bezier(0.34,1.1,0.64,1)";
        tile.style.transform = "scale(1)";
      },
      POP_START + i * STAGGER,
    );
  });

  const allDone = POP_START + PROJECTS.length * STAGGER + 400;

  // Phase 4 — logo fades
  setTimeout(() => {
    introIcon.style.transition = "opacity 0.25s ease";
    introIcon.style.opacity = "0";
  }, allDone + 100);

  // Phase 5 — tiles fan into a vertical strip (thumbnail scale)
  // Store per-tile dy, uniform scale, and computed slide amount for Phase 6
  const stripDy = new Array(PROJECTS.length).fill(0);
  let stripS = 1;
  let slideAmt = 0;

  setTimeout(() => {
    const tiles = [...introTiles.querySelectorAll(".intro-tile")];
    const n = tiles.length;
    const GAP = 5;
    const s = Math.min(1, (vh * 0.85 - (n - 1) * GAP) / (n * THUMB_H));
    const scaledH = THUMB_H * s;
    const totalH = n * scaledH + (n - 1) * GAP;
    const stripTop = (vh - totalH) / 2;

    stripS = s;
    // Slide until tile 8's top hits the viewport bottom — leaves tiles 0–7 visible
    slideAmt = vh - stripTop - 8 * (scaledH + GAP);

    tiles.forEach((tile, i) => {
      const centerY = stripTop + i * (scaledH + GAP) + scaledH / 2;
      const dy = centerY - cy;
      stripDy[i] = dy;

      const delay = i * 32;
      tile.style.transition = `transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, opacity 0.4s ease ${delay}ms`;
      tile.style.transform = `translate(0px, ${dy}px) scale(${s})`;
      tile.style.opacity = "1";
    });
  }, allDone + 380);

  const stripDone = allDone + 380 + 550 + (PROJECTS.length - 1) * 32;

  // Phase 6 — strip slides DOWN, 4 thumbnails remain visible at the bottom
  setTimeout(() => {
    const tiles = [...introTiles.querySelectorAll(".intro-tile")];
    tiles.forEach((tile, i) => {
      tile.style.transition =
        "transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)";
      tile.style.transform = `translate(0px, ${stripDy[i] + slideAmt}px) scale(${stripS})`;
    });
  }, stripDone + 300);

  const slideDownDone = stripDone + 300 + 550;

  // Phase 7 — sweep UP + grow into full track, centred on project INTRO_START_IDX
  setTimeout(() => {
    const wraps = [...imageTrack.querySelectorAll(".img-wrap")];
    const tiles = [...introTiles.querySelectorAll(".intro-tile")];

    // Batch-read all track positions before any writes
    const targets = PROJECTS.map((p, i) => {
      const w = wraps[i];
      const r = w.getBoundingClientRect();
      const tw =
        p.orient === "landscape"
          ? Math.round((THUMB_H * 16) / 9)
          : Math.round((THUMB_H * 2) / 3);
      return {
        dx: r.left + w.offsetWidth / 2 - cx,
        dy: r.top + w.offsetHeight / 2 - cy - savedScroll,
        sx: w.offsetWidth / tw,
        sy: w.offsetHeight / THUMB_H,
      };
    });

    tiles.forEach((tile, i) => {
      const t = targets[i];
      if (!t) return;
      const delay = i * 18;
      tile.style.transition = `transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`;
      tile.style.transform = `translate(${t.dx}px, ${t.dy}px) scale(${t.sx}, ${t.sy})`;
    });
  }, slideDownDone + 150);

  const cascadeDone = slideDownDone + 150 + 800 + (PROJECTS.length - 1) * 18;

  // Phase 8 — scroll restored, overlay removed instantly (seamless cut)
  setTimeout(() => {
    document.body.classList.remove("intro-running");

    // Snap native scroll first so Lenis reads the correct starting position
    window.scrollTo({ top: savedScroll, behavior: "instant" });
    if (lenis) lenis.start();

    state.scrollEnabled = true;
    state.activeIndex = getActiveIndex();
    cacheLayout();
    updateLists();
    updateParallax();
    updateProgress();
    updateBottomNav();

    // One frame for scroll to commit, then cut overlay instantly
    requestAnimationFrame(() => {
      introEl.style.display = "none";
      state.introComplete = true;
      topNav.classList.add("visible");
      leftCol.classList.add("visible");
      rightCol.classList.add("visible");
    });
  }, cascadeDone + 100);
}

/* ── ACTIVE INDEX DETECTION — pure math, no DOM reads ───────── */
function getActiveIndex() {
  if (!imageCenters.length) return 0;
  const n = PROJECTS.length;
  const mid = window.scrollY + window.innerHeight / 2;
  // When loop is active, only search the real zone (indices n..2n-1) to avoid
  // clone indices leaking into the result
  const from = state.loop ? n : 0;
  const to = state.loop ? 2 * n : imageCenters.length;
  let best = from,
    bestD = Infinity;
  for (let i = from; i < to; i++) {
    const d = Math.abs(imageCenters[i] - mid);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best % n; // always return 0..n-1
}

/* ── CONTINUOUS SCROLL FRACTION — pure math, no DOM reads ──── */
function getScrollFracIdx() {
  if (!imageCenters.length) return 0;
  const n = PROJECTS.length;
  const mid = window.scrollY + window.innerHeight / 2;
  // When loop is on, search the full 3n array and then mod by n so the result
  // is always in [0, n) regardless of which clone zone we're momentarily in.
  const last = imageCenters.length - 1;
  if (mid <= imageCenters[0]) return 0;
  if (mid >= imageCenters[last]) return state.loop ? n - 1 : last;
  for (let i = 0; i < last; i++) {
    if (mid >= imageCenters[i] && mid < imageCenters[i + 1]) {
      const raw =
        i + (mid - imageCenters[i]) / (imageCenters[i + 1] - imageCenters[i]);
      return state.loop ? ((raw % n) + n) % n : raw;
    }
  }
  return 0;
}

/* ── CACHE LAYOUT — called once after intro, and on resize ──── */
function cacheLayout() {
  // ── Left list natural positions (clear transforms before measuring)
  leftList.style.transform = "";
  leftItems.forEach((li) => (li.style.transform = ""));
  leftItemNaturalYs = leftItems.map((li) => li.getBoundingClientRect().top);

  // ── Image track: batch all reads together, zero writes
  imageWraps = [...imageTrack.querySelectorAll(".img-wrap")];
  imageEls = imageWraps.map((w) => w.querySelector("img"));
  const sy = window.scrollY;
  const rects = imageWraps.map((w) => w.getBoundingClientRect()); // one batch
  imageCenters = rects.map((r) => sy + r.top + r.height / 2);
  imageSizes = rects.map((r) => r.height);

  // ── Right column measurements (fixed, constant after layout)
  rightAnchorY   = rightItems[0] ? rightItems[0].getBoundingClientRect().top : 0;
  rightColW      = rightCol.offsetWidth;
  totalScrollH   = document.documentElement.scrollHeight - window.innerHeight;
  // Full travel range: left edge of left-col → right edge of right-col
  const lcRect = leftCol.getBoundingClientRect();
  const rcRect = rightCol.getBoundingClientRect();
  progressRangeW = Math.max(rcRect.right - lcRect.left, 0);
}

/* ── PARALLAX — pure math, zero DOM reads per frame ─────────── */
function updateParallax() {
  if (!imageCenters.length) return;
  const vh = window.innerHeight;
  const sy = window.scrollY;
  for (let i = 0; i < imageCenters.length; i++) {
    const h = imageSizes[i];
    const top = imageCenters[i] - h / 2 - sy; // viewport-Y of wrap top
    const progress = (vh - top) / (vh + h);
    imageEls[i].style.transform =
      `translateY(${(progress - 0.5) * state.parallax}px)`;
  }
}

function setParallax(px) {
  state.parallax = px;
  document.documentElement.style.setProperty("--parallax", `${px}px`);
  parallaxSlider.value = px;
  parallaxVal.textContent = `${px}px`;
}

/* ── SIDE LIST UPDATE ───────────────────────────────────────── */
function updateActiveCls(idx) {
  leftItems.forEach((li, i) => li.classList.toggle("is-active", i === idx));
  const activeCat = PROJECTS[idx].category;
  rightItems.forEach((li) =>
    li.classList.toggle("is-active", li.dataset.cat === activeCat),
  );
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

  const n = PROJECTS.length;
  const fracIdx = getScrollFracIdx();
  const norm = (fracIdx * n) / Math.max(n - 1, 1);

  const anchorY = rightAnchorY; // cached — fixed col, no DOM read needed
  const itemH =
    leftItemNaturalYs.length > 1
      ? leftItemNaturalYs[1] - leftItemNaturalYs[0]
      : 22;

  leftItems.forEach((li, i) => {
    const targetY = anchorY + i * itemH;
    const naturalY = leftItemNaturalYs[i];
    const totalDY = targetY - naturalY;
    const progress = Math.min(1, Math.max(0, norm - i));
    li.style.transition = "none";
    li.style.transform = `translateY(${totalDY * progress}px)`;
  });

  // Active = the item currently traveling (stays active until fully rested)
  const activeIdx = Math.min(Math.max(Math.floor(norm), 0), n - 1);
  if (activeIdx !== state.activeIndex) {
    state.activeIndex = activeIdx;
    updateActiveCls(activeIdx);
  }
}

/* TYPE 2 — loop wrap using INTEGER active index; no fractional drift ── */
function positionListType2() {
  if (!leftItemNaturalYs.length) return;

  const n = PROJECTS.length;
  const fracIdx = getScrollFracIdx();
  // Integer only — items reposition once per active change, not every frame
  const activeIdx = ((Math.round(fracIdx) % n) + n) % n;

  if (activeIdx !== state.activeIndex) {
    state.activeIndex = activeIdx;
    updateActiveCls(activeIdx);
  }

  const itemH =
    leftItemNaturalYs.length > 1
      ? leftItemNaturalYs[1] - leftItemNaturalYs[0]
      : 22;
  const centerY = window.innerHeight / 2;

  leftList.style.transform = "";
  leftItems.forEach((li, i) => {
    let diff = i - activeIdx;
    diff -= Math.round(diff / n) * n;
    const targetY = centerY + diff * itemH;
    const naturalY = leftItemNaturalYs[i];
    li.style.transition = "none";
    li.style.transform = `translateY(${targetY - naturalY}px)`;
  });
}

/* ── PROGRESS INDICATOR — pure math, zero DOM reads ─────────── */
function updateProgress() {
  const n = PROJECTS.length;
  const pct = state.loop
    ? Math.round((state.activeIndex / Math.max(n - 1, 1)) * 100)
    : totalScrollH > 0
      ? Math.round((window.scrollY / totalScrollH) * 100)
      : 0;
  progressEl.textContent = `${pct}%`;
  progressEl.style.transform = `translateX(${(pct / 100) * progressRangeW}px)`;
}

/* ── BOTTOM NAV ─────────────────────────────────────────────── */
let navShown = false;
function updateBottomNav() {
  if (!navShown && window.scrollY > 80) {
    navShown = true;
    bottomNav.classList.add("visible");
  }
}

/* ── SEAMLESS LOOP ───────────────────────────────────────────── */

function enableLoop() {
  const n = PROJECTS.length;
  const realWraps = [...imageTrack.querySelectorAll(".img-wrap[data-real]")];
  if (!realWraps.length) return;

  // Append post-clones (visible when scrolling past the last real item)
  const postFrag = document.createDocumentFragment();
  realWraps.forEach((w) => {
    const cloneA = w.closest("a").cloneNode(true);
    cloneA.querySelector(".img-wrap").classList.add("is-clone");
    cloneA.querySelector(".img-wrap").removeAttribute("data-real");
    postFrag.appendChild(cloneA);
  });
  imageTrack.appendChild(postFrag);

  // Prepend pre-clones (visible when scrolling above the first real item)
  const preFrag = document.createDocumentFragment();
  realWraps.forEach((w) => {
    const cloneA = w.closest("a").cloneNode(true);
    cloneA.querySelector(".img-wrap").classList.add("is-clone");
    cloneA.querySelector(".img-wrap").removeAttribute("data-real");
    preFrag.appendChild(cloneA);
  });
  imageTrack.insertBefore(preFrag, imageTrack.firstChild);

  // Re-cache all layout measurements with 3n items in track
  cacheLayout();

  // Distance of one full track segment (pre-clone[0] → real[0])
  loopOneTrackH = imageCenters[n] - imageCenters[0];

  // Jump scroll so we land on the same real item (compensate for prepended clones)
  const newScroll = window.scrollY + loopOneTrackH;
  window.scrollTo({ top: newScroll, behavior: "instant" });
  if (lenis) lenis.scrollTo(newScroll, { immediate: true });
}

function disableLoop() {
  const savedTrackH = loopOneTrackH;

  // Remove all clones (pre + post)
  imageTrack.querySelectorAll(".img-wrap.is-clone").forEach((w) => {
    (w.closest("a") || w).remove();
  });

  loopOneTrackH = 0;
  cacheLayout(); // totalScrollH is now the real zone height

  // Restore equivalent scroll position in the real zone
  const realScroll = Math.max(
    0,
    Math.min(totalScrollH, window.scrollY - savedTrackH),
  );
  window.scrollTo({ top: realScroll, behavior: "instant" });
  if (lenis) lenis.scrollTo(realScroll, { immediate: true });
}

function checkLoopBoundary() {
  if (!state.loop || loopJumping || loopOneTrackH === 0) return;
  const n = PROJECTS.length;
  const mid = window.scrollY + window.innerHeight / 2;

  // Asymmetric triggers — fire as early as possible without causing oscillation.
  // DOWN (post): fire when last REAL item center passes viewport mid. Lands at
  //   last pre-clone center → safely in pre-clone zone, pre-trigger won't re-fire.
  // UP (pre): fire when last pre-clone center hits viewport mid. Lands just below
  //   last real item center → safely in real zone, post-trigger won't re-fire.
  // This fires before any clone pixels are visible (DOWN) so the jump is invisible.
  let delta = 0;
  if (mid <= imageCenters[n - 1])       delta = +loopOneTrackH; // UP: into pre-clone zone
  else if (mid > imageCenters[2 * n - 1]) delta = -loopOneTrackH; // DOWN: past last real item
  if (delta === 0) return;

  loopJumping = true;
  const newScroll = window.scrollY + delta;

  if (lenis) {
    // Capture where Lenis was animating BEFORE the immediate jump resets it.
    // Shifting targetScroll by the same delta carries in-flight momentum into
    // the real zone — without this, Lenis re-animates back into clone territory.
    const newTarget = lenis.targetScroll + delta;
    // Step 1: snap animatedScroll + native scroll to the real-zone position
    lenis.scrollTo(newScroll, { immediate: true });
    // Step 2: restart smooth animation toward the real-zone equivalent target
    if (Math.abs(newTarget - newScroll) > 1) {
      lenis.scrollTo(newTarget);
    }
  } else {
    window.scrollTo({ top: newScroll, behavior: "instant" });
  }

  requestAnimationFrame(() => {
    loopJumping = false;
  });
}

/* ── LENIS SMOOTH SCROLL ─────────────────────────────────────── */
let lenis = null;

function runAnimFrame() {
  if (!state.scrollEnabled) return;
  checkLoopBoundary();
  if (state.animType === 1) positionListType1();
  else positionListType2();
  updateParallax();
  updateProgress();
  updateBottomNav();
}

function initLenis() {
  if (typeof Lenis === "undefined") {
    // Fallback: native scroll if CDN fails
    window.addEventListener(
      "scroll",
      () => {
        if (state.scrollEnabled) requestAnimationFrame(runAnimFrame);
      },
      { passive: true },
    );
    return;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.stop(); // held until intro completes

  lenis.on("scroll", runAnimFrame);

  function tick(time) {
    lenis.raf(time);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── PLAYGROUND ─────────────────────────────────────────────── */
pgToggle.addEventListener("click", () => {
  pgPanel.classList.toggle("open");
});

// Close panel when clicking outside
document.addEventListener("click", (e) => {
  if (!pgPanel.contains(e.target) && e.target !== pgToggle) {
    pgPanel.classList.remove("open");
  }
});

// Animation type buttons
pgPanel.querySelectorAll(".pg-btn[data-anim]").forEach((btn) => {
  btn.addEventListener("click", () => {
    pgPanel
      .querySelectorAll(".pg-btn[data-anim]")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.animType = parseInt(btn.dataset.anim);
    document.body.classList.toggle("anim-type-2", state.animType === 2);
    // Reset all transforms before switching
    leftList.style.transform = "";
    leftList.querySelectorAll("li").forEach((li) => {
      li.style.transition = "none";
      li.style.transform = "";
    });
    cacheLayout();
    updateLists();
  });
});

// Size slider — also auto-scales parallax proportionally
sizeSlider.addEventListener("input", () => {
  const s = parseInt(sizeSlider.value) / 100;
  sizeVal.textContent = `${sizeSlider.value}%`;
  const root = document.documentElement.style;
  root.setProperty("--ls-w", `${Math.round(BASE.lsW * s)}px`);
  root.setProperty("--ls-h", `${Math.round(BASE.lsH * s)}px`);
  root.setProperty("--pt-w", `${Math.round(BASE.ptW * s)}px`);
  root.setProperty("--pt-h", `${Math.round(BASE.ptH * s)}px`);
  setParallax(Math.round(BASE.parallax * s));
});

// Parallax slider — manual override
parallaxSlider.addEventListener("input", () => {
  setParallax(parseInt(parallaxSlider.value));
  updateParallax();
});

// Gap slider
gapSlider.addEventListener("input", () => {
  state.gap = parseInt(gapSlider.value);
  gapVal.textContent = `${state.gap}px`;
  imageTrack.style.gap = `${state.gap}px`;
});

// Seamless loop toggle
loopCb.addEventListener("change", () => {
  state.loop = loopCb.checked;
  loopLbl.textContent = state.loop ? "On" : "Off";
  if (!state.introComplete) return; // don't enable during intro
  if (state.loop) enableLoop();
  else disableLoop();
});

/* ── INIT ───────────────────────────────────────────────────── */
function init() {
  buildLists();
  buildTrack();
  initLenis();
  setTimeout(runIntro, 100);
}

document.addEventListener("DOMContentLoaded", init);
