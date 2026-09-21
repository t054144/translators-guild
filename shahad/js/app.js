/* ============================================================
   Presentation engine: slide rendering, navigation, section
   transitions, and the loop that drives the 3D world.
   ============================================================ */

import { SLIDES, ACCENTS, ACCENT_INK } from './slides.js';
import { createWorld } from './scene.js';
import { Sound } from './audio.js';

const $  = (sel, root = document) => root.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const stage      = $('#stage');
const dots       = $('#dots');
const hudWorld   = $('#hudWorld');
const hudSection = $('#hudSection');
const hudCount   = $('#hudCount');
const progress   = $('#progressBar');
const curtain    = $('#curtain');
const sparks     = $('#sparks');
const overview   = $('#overview');
const ovGrid     = $('#ovGrid');
const help       = $('#help');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ?export=1 strips the on-screen controls, for capturing slides as images. */
if (new URLSearchParams(location.search).has('export')) document.body.classList.add('is-export');

/* ---------- build slide markup ---------- */

function chip(kind, glyph){
  if (kind === 'block') return `<span class="chip chip--block"><i>?</i></span>`;
  return `<span class="chip chip--${kind || 'coin'}"></span>`;
}

const head = (s) => `
  ${s.eyebrow ? `<p class="eyebrow rise">${s.eyebrow}</p>` : ''}
  ${s.title   ? `<h1 class="s-title rise">${s.title}</h1>` : ''}
  ${s.lede    ? `<p class="s-lede rise">${s.lede}</p>` : ''}`;

const LAYOUTS = {

  title: (s) => `
    <div class="title__plate rise">
      <p class="title__sup">${s.sup}</p>
      <h1 class="title__name">${s.name[0]}<span class="l2">${s.name[1]}</span></h1>
      <div class="title__rule"></div>
      <p class="title__sub">${s.sub}</p>
      <p class="title__start">PRESS &nbsp;SPACE&nbsp; TO START</p>
    </div>`,

  facts: (s) => head(s) + `
    <ul class="facts">
      ${s.items.map(i => `
        <li class="rise${i.wide ? ' wide' : ''}" style="--c:${ACCENTS[i.c]}">
          <span class="k">${i.k}</span>
          <span class="v">${i.v}</span>
        </li>`).join('')}
    </ul>`,

  points: (s) => head(s) + `
    <ul class="points">
      ${s.items.map(i => `
        <li class="rise">
          ${chip(i.chip || s.chip)}
          <span class="txt"><b>${i.b}</b>${i.s ? `<span>${i.s}</span>` : ''}</span>
        </li>`).join('')}
    </ul>`,

  grid2: (s) => head(s) + `
    <ul class="grid2">
      ${s.items.map(i => `<li class="rise">${chip(i.chip)}<span>${i.b}</span></li>`).join('')}
    </ul>`,

  cols: (s) => head(s) + `
    <ul class="cols">
      ${s.items.map(i => `
        <li class="rise" style="--c:${ACCENTS[i.c]}">
          <h3><span class="dot"></span>${i.icon} ${i.head}</h3>
          <ul>${i.rows.map(r => `<li>${r}</li>`).join('')}</ul>
        </li>`).join('')}
    </ul>`,

  closing: (s) => head(s) + `
    <ul class="points">
      ${s.items.map(i => `<li class="rise">${chip(s.chip)}<span class="txt"><b>${i.b}</b></span></li>`).join('')}
    </ul>
    <p class="quote rise"><span class="star"></span><span>&ldquo;${s.quote}&rdquo;</span></p>`
};

const nodes = SLIDES.map((s, i) => {
  const n = el('section', `slide slide--${s.layout}${s.wide ? ' slide--wide' : ''}`);
  n.id = `slide-${s.id}`;
  n.setAttribute('aria-hidden', 'true');
  n.innerHTML = LAYOUTS[s.layout](s);
  n.querySelectorAll('.rise').forEach((r, k) => r.style.setProperty('--i', k));
  stage.append(n);
  return n;
});

/* ---------- dots + overview ---------- */

SLIDES.forEach((s, i) => {
  const d = el('button', 'dot');
  d.type = 'button';
  d.title = s.ovTitle || (s.title || '').replace(/<[^>]+>/g, '');
  d.setAttribute('aria-label', `Go to slide ${i + 1}: ${d.title}`);
  d.addEventListener('click', () => go(i));
  dots.append(d);

  const card = el('button', 'ov__card');
  card.type = 'button';
  card.style.setProperty('--c', ACCENTS[s.accent]);
  card.innerHTML = `<small>${i === 0 ? 'START' : 'WORLD ' + s.world}</small><strong>${d.title}</strong>`;
  card.addEventListener('click', () => { closeOverview(); go(i); });
  ovGrid.append(card);
});

const dotEls = [...dots.children];
const ovEls  = [...ovGrid.children];

/* ---------- world ---------- */

const world = createWorld($('#world'), SLIDES);
if (!world) $('#world').style.display = 'none';

function loop(){
  world && world.render();
  requestAnimationFrame(loop);
}

addEventListener('resize', () => world && world.resize());
addEventListener('hashchange', () => {
  const i = SLIDES.findIndex(s => s.id === location.hash.replace('#', ''));
  if (i > -1 && i !== index){ if (!started) start(); go(i); }
});
addEventListener('pointermove', (e) => {
  if (!world) return;
  world.setPointer((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2);
}, { passive: true });

/* ---------- transitions ---------- */

function burst(count = 14){
  if (reduced) return;
  const cx = innerWidth * .74, cy = innerHeight * .52;
  for (let i = 0; i < count; i++){
    const s = el('span', 'spark');
    const a = (-0.5 - Math.random()) * Math.PI;
    const dist = 130 + Math.random() * 260;
    s.style.left = `${cx + (Math.random() - .5) * 180}px`;
    s.style.top  = `${cy + (Math.random() - .5) * 140}px`;
    s.style.setProperty('--x', `${Math.cos(a) * dist * (Math.random() < .5 ? -1 : 1)}px`);
    s.style.setProperty('--y', `${Math.sin(a) * dist}px`);
    s.style.setProperty('--d', `${700 + Math.random() * 500}ms`);
    sparks.append(s);
    setTimeout(() => s.remove(), 1300);
  }
}

let warpTimer;
function warp(){
  if (reduced) return;
  curtain.classList.remove('is-warping');
  void curtain.offsetWidth;                 // restart the animation
  curtain.classList.add('is-warping');
  clearTimeout(warpTimer);
  warpTimer = setTimeout(() => curtain.classList.remove('is-warping'), 950);
}

/* ---------- navigation ---------- */

let index = -1;
let visited = new Set();
let started = false;
let navToken = 0;          // guards against a presenter leaning on the arrow key

function go(i, instant){
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (i === index) return;

  const prev = SLIDES[index] || null;
  const s = SLIDES[i];
  const sectionChange = prev && prev.section !== s.section;
  const token = ++navToken;

  if (index > -1){
    const old = nodes[index];
    old.classList.add('is-leaving');
    old.setAttribute('aria-hidden', 'true');
    setTimeout(() => { old.classList.remove('is-active', 'is-leaving'); }, 380);
  }

  index = i;
  visited.add(i);

  document.documentElement.style.setProperty('--accent', ACCENTS[s.accent]);
  document.documentElement.style.setProperty('--accent-soft', ACCENTS[s.accent] + '1F');
  document.documentElement.style.setProperty('--accent-ink', ACCENT_INK[s.accent]);

  const delay = (prev && !instant && !reduced) ? (sectionChange ? 260 : 130) : 0;
  setTimeout(() => {
    if (token !== navToken) return;           // a newer move already won
    const n = nodes[i];
    n.classList.remove('is-leaving');
    void n.offsetWidth;
    n.classList.add('is-active');
    n.removeAttribute('aria-hidden');
    // sweep up anything an interrupted transition left on screen
    nodes.forEach((m, k) => {
      if (k !== i && !m.classList.contains('is-leaving')){
        m.classList.remove('is-active');
        m.setAttribute('aria-hidden', 'true');
      }
    });
  }, delay);

  world && world.goTo(i, instant);

  if (sectionChange){ warp(); burst(16); Sound.warp(); }
  else if (prev){ Sound.coin(); }

  hudWorld.textContent   = i === 0 ? '1-1' : s.world;
  hudSection.textContent = s.section;
  hudCount.textContent   = '×' + String(visited.size).padStart(2, '0');
  progress.style.width   = `${(i / (SLIDES.length - 1)) * 100}%`;

  dotEls.forEach((d, k) => d.classList.toggle('is-on', k === i));
  ovEls.forEach((c, k) => c.classList.toggle('is-on', k === i));

  history.replaceState(null, '', `#${s.id}`);
  document.title = i === 0
    ? 'Shahad Nawaf Alkhaldi — Microbiology & English'
    : `${(s.title || '').replace(/<[^>]+>/g, '')} — Shahad Nawaf Alkhaldi`;
}

const next = () => { if (!started) return start(); go(index + 1); };
const back = () => go(index - 1);

function start(){
  if (started) return;
  started = true;
  document.body.classList.add('is-running');
  Sound.enableGesture();
  go(1);
}

/* ---------- overview / help ---------- */

function openOverview(){ overview.hidden = false; ovEls[index] && ovEls[index].focus(); }
function closeOverview(){ overview.hidden = true; stage.focus(); }
$('#ovClose').addEventListener('click', closeOverview);
$('#helpClose').addEventListener('click', () => { help.hidden = true; });
$('#helpBtn').addEventListener('click', () => { help.hidden = !help.hidden; });

/* ---------- input ---------- */

addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key;

  if (!overview.hidden){
    if (k === 'Escape'){ e.preventDefault(); closeOverview(); }
    return;
  }
  if (!help.hidden && k === 'Escape'){ help.hidden = true; return; }

  switch (k){
    case 'ArrowRight': case ' ': case 'PageDown': case 'Enter':
      e.preventDefault(); next(); break;
    case 'ArrowLeft': case 'PageUp': case 'Backspace':
      e.preventDefault(); back(); break;
    case 'Home': e.preventDefault(); go(0); break;
    case 'End':  e.preventDefault(); go(SLIDES.length - 1); break;
    case 'Escape': e.preventDefault(); started ? openOverview() : start(); break;
    case 'f': case 'F':
      e.preventDefault();
      document.fullscreenElement ? document.exitFullscreen()
        : document.documentElement.requestFullscreen().catch(() => {});
      break;
    case 'm': case 'M': e.preventDefault(); toggleSound(); break;
    case '?': e.preventDefault(); help.hidden = !help.hidden; break;
    default:
      if (/^[0-9]$/.test(k)){ e.preventDefault(); go(Number(k) === 0 ? 9 : Number(k)); }
  }
});

$('#nextBtn').addEventListener('click', next);
$('#prevBtn').addEventListener('click', back);

// click / tap anywhere on the stage advances; the left eighth goes back
stage.addEventListener('click', (e) => {
  if (e.target.closest('a,button')) return;
  (e.clientX < innerWidth * .12) ? back() : next();
});

let tx = 0, ty = 0;
addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : back();
}, { passive: true });

/* ---------- sound ---------- */

const soundBtn = $('#soundBtn');
function toggleSound(){
  const on = Sound.toggle();
  soundBtn.setAttribute('aria-pressed', String(on));
  if (on) Sound.coin();
}
soundBtn.addEventListener('click', toggleSound);

/* ---------- boot ---------- */

requestAnimationFrame(() => {
  document.body.classList.remove('is-booting');

  const hash = location.hash.replace('#', '');
  const target = SLIDES.findIndex(s => s.id === hash);

  if (target > 0){
    started = true;
    document.body.classList.add('is-running');
    go(target, true);
  } else {
    go(0, true);
  }
  loop();
});
