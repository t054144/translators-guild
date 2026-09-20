/* ══════════════════════════════════════════════════════════════
   ROBOCYCLE — cinematic opening sequence

   The sequence is rendered in real time on a canvas rather than
   played from a film file. Every beat below is timed in seconds
   against one director track, so if a filmed plate is ever shot
   it can be dropped into #plate: the titles, the skip control,
   the progress bar and the returning-visitor memory all key off
   the same clock and need no changes.

   The track, in seconds (desktop):

     0.0   black
     0.6   the room fades up, camera begins a slow push
     3.4   a charger LED breathes; the first buzz enters
     5.0   the power strip flickers
     6.6   one device starts running hot
     8.2   a spark
     9.4   smoke
    11.6   the smoke thickens
    12.6   ignition
    15.2   emergency light reaches the room
    16.4   fade to black
    17.0   "Electronic waste doesn't disappear."
    19.0   "It goes somewhere."
    20.8   "RoboCycle"
    22.0   "Give electronics a second life."
    23.4   the homepage

   On phones the scene beats run at 0.58 speed, which lands the
   whole thing near fourteen seconds.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var SEEN_KEY = 'robocycle.intro.v1';
  var W = 1600, H = 900;                 // the frame we compose in
  var ORIGIN = { x: 812, y: 598 };       // the power strip: where it starts

  var intro    = document.getElementById('intro');
  var canvas   = document.getElementById('stage');
  var site     = document.getElementById('site');
  var skipBtn  = document.getElementById('skip');
  var soundBtn = document.getElementById('sound');
  var progress = document.getElementById('intro-progress');
  var cards    = Array.prototype.slice.call(document.querySelectorAll('.card'));

  var isPhone   = Math.min(window.innerWidth, window.innerHeight) < 620;
  var reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var returning = readSeen();

  /* ── the director track ─────────────────────────────────────── */

  var S = isPhone ? 0.58 : 1;            // scene compression on phones
  function b(t) { return t * S; }        // a scene beat

  var BEAT = {
    fadeUp:   b(0.6),
    breathe:  b(3.4),
    flicker:  b(5.0),
    heat:     b(6.6),
    spark:    b(8.2),
    smoke:    b(9.4),
    thicken:  b(11.6),
    ignite:   b(12.6),
    sirens:   b(15.2),
    fadeOut:  b(16.4)
  };
  var SCENE_END = BEAT.fadeOut + b(0.9);

  // Titles are barely compressed: reading speed does not change
  // because the screen got smaller.
  var C = isPhone ? 0.82 : 1;
  var CARDS = [
    { el: 0, in: SCENE_END + 0.5,            hold: 1.85 * C },
    { el: 1, in: SCENE_END + 0.5 + 2.35 * C, hold: 1.65 * C },
    { el: 2, in: SCENE_END + 0.5 + 4.35 * C, hold: 1.45 * C },
    { el: 3, in: SCENE_END + 0.5 + 6.05 * C, hold: 1.60 * C }
  ];
  var TOTAL = CARDS[3].in + CARDS[3].hold + 0.8;

  /* ── entry points ───────────────────────────────────────────── */

  // Someone who has been here before, or who has asked the system
  // for less motion, gets the page — not the fire.
  if (!intro || !canvas || reduced || returning) {
    if (intro) intro.remove();
    document.body.classList.remove('intro-running');
    if (site) site.setAttribute('data-enter', 'done');
    wireReplay();
    wireReveal();
    return;
  }

  start();

  /* ══════════════════════════════════════════════════════════════
     Canvas plumbing
     ══════════════════════════════════════════════════════════════ */

  var ctx = canvas.getContext('2d');
  var view = { w: 0, h: 0, scale: 1, ox: 0, oy: 0 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = intro.clientWidth, h = intro.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Cover, never letterbox the render itself — the black bars
    // are drawn by CSS on top.
    var s = Math.max(w / W, h / H);
    view = { w: w, h: h, scale: s, ox: (w - W * s) / 2, oy: (h - H * s) / 2 };
  }
  window.addEventListener('resize', resize);
  resize();

  var noise = makeNoiseTile();

  /* ══════════════════════════════════════════════════════════════
     Particles
     ══════════════════════════════════════════════════════════════ */

  var smoke = [], flames = [], sparks = [];
  var SMOKE_CAP = isPhone ? 90 : 190;
  var FLAME_CAP = isPhone ? 120 : 260;

  function spawnSmoke(n, spread, power) {
    for (var i = 0; i < n && smoke.length < SMOKE_CAP; i++) {
      smoke.push({
        x: ORIGIN.x + (Math.random() - 0.5) * spread,
        y: ORIGIN.y - Math.random() * 12,
        vx: (Math.random() - 0.5) * 7,
        vy: -(16 + Math.random() * 26) * power,
        r: 26 + Math.random() * 44,
        grow: 16 + Math.random() * 26,
        life: 0,
        max: 3.1 + Math.random() * 2.6,
        seed: Math.random() * 6.28,
        tone: Math.random()
      });
    }
  }

  function spawnFlame(n, spread) {
    for (var i = 0; i < n && flames.length < FLAME_CAP; i++) {
      flames.push({
        x: ORIGIN.x + (Math.random() - 0.5) * spread,
        y: ORIGIN.y + 4 - Math.random() * 6,
        vx: (Math.random() - 0.5) * 16,
        vy: -(135 + Math.random() * 170),
        r: 24 + Math.random() * 30,
        life: 0,
        max: 0.8 + Math.random() * 0.95,
        seed: Math.random() * 6.28
      });
    }
  }

  function spawnSparks(n, spread) {
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      var sp = 140 + Math.random() * 300;
      sparks.push({
        x: ORIGIN.x + (Math.random() - 0.5) * spread,
        y: ORIGIN.y - 2,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 0.4 + Math.random() * 0.7
      });
    }
  }

  function stepParticles(dt, t) {
    var i, p;
    for (i = smoke.length - 1; i >= 0; i--) {
      p = smoke[i]; p.life += dt;
      if (p.life > p.max) { smoke.splice(i, 1); continue; }
      // Rising smoke slows and wanders as it cools.
      p.x += (p.vx + Math.sin(t * 0.7 + p.seed) * 11) * dt;
      p.y += p.vy * dt;
      p.vy *= (1 - 0.34 * dt);
      p.r += p.grow * dt;
    }
    for (i = flames.length - 1; i >= 0; i--) {
      p = flames[i]; p.life += dt;
      if (p.life > p.max) { flames.splice(i, 1); continue; }
      p.x += (p.vx + Math.sin(t * 9 + p.seed) * 26) * dt;
      p.y += p.vy * dt;
      p.vy *= (1 - 0.42 * dt);      // buoyancy holds longer than drag
      p.r *= (1 - 0.62 * dt);       // and the tongue narrows as it climbs
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      p = sparks[i]; p.life += dt;
      if (p.life > p.max) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 620 * dt;                    // sparks fall; embers do not float
      p.vx *= (1 - 1.1 * dt);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     The room
     ══════════════════════════════════════════════════════════════ */

  function drawWallAndWindow(t, fire) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080b10');
    g.addColorStop(0.62, '#05070a');
    g.addColorStop(1, '#030406');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // A window onto a Kuwait night: sodium haze low on the horizon,
    // a few towers, scattered lit apartments.
    var wx = 1010, wy = 96, ww = 470, wh = 372;
    var sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, '#060c14');
    sky.addColorStop(0.68, '#0b1520');
    sky.addColorStop(1, '#14202a');
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);

    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();

    var haze = ctx.createRadialGradient(wx + ww * 0.62, wy + wh, 8, wx + ww * 0.62, wy + wh, 300);
    haze.addColorStop(0, 'rgba(180,130,70,.20)');
    haze.addColorStop(1, 'rgba(180,130,70,0)');
    ctx.fillStyle = haze; ctx.fillRect(wx, wy, ww, wh);

    var towers = [
      [30, 150, 54], [96, 96, 40], [150, 214, 62], [224, 128, 46],
      [282, 250, 74], [368, 168, 52], [428, 112, 38]
    ];
    for (var i = 0; i < towers.length; i++) {
      var tx = wx + towers[i][0], th = towers[i][1], tw = towers[i][2];
      ctx.fillStyle = '#04070b';
      ctx.fillRect(tx, wy + wh - th, tw, th);
      // lit windows
      for (var r = 0; r < Math.floor(th / 22); r++) {
        for (var c = 0; c < Math.floor(tw / 16); c++) {
          if (((i * 7 + r * 3 + c * 5) % 11) > 8) {
            ctx.fillStyle = 'rgba(255,196,120,.34)';
            ctx.fillRect(tx + 5 + c * 16, wy + wh - th + 9 + r * 22, 5, 7);
          }
        }
      }
    }
    ctx.restore();

    // Frame and mullion.
    ctx.strokeStyle = 'rgba(150,180,200,.11)';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh * 0.52); ctx.lineTo(wx + ww, wy + wh * 0.52);
    ctx.stroke();

    // Sheer curtain to the left of the window, which later catches
    // the firelight before anything else up there does.
    var cg = ctx.createLinearGradient(880, 0, 1010, 0);
    cg.addColorStop(0, 'rgba(120,140,160,0)');
    cg.addColorStop(1, 'rgba(120,140,160,.05)');
    ctx.fillStyle = cg; ctx.fillRect(880, 70, 130, 470);
    if (fire > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.14 * fire;
      var fg = ctx.createRadialGradient(950, 520, 10, 950, 520, 330);
      fg.addColorStop(0, 'rgba(255,140,60,.75)');
      fg.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.fillStyle = fg; ctx.fillRect(860, 180, 170, 360);
      ctx.restore();
    }
  }

  function drawTable() {
    // Floor.
    var fg = ctx.createLinearGradient(0, 700, 0, H);
    fg.addColorStop(0, '#04060a');
    fg.addColorStop(1, '#020304');
    ctx.fillStyle = fg; ctx.fillRect(0, 700, W, H - 700);

    // Console table. Its top edge is the line everything sits on.
    var tg = ctx.createLinearGradient(0, 620, 0, 704);
    tg.addColorStop(0, '#11161c');
    tg.addColorStop(1, '#070a0e');
    ctx.fillStyle = tg; ctx.fillRect(0, 620, W, 84);
    ctx.fillStyle = 'rgba(190,215,230,.07)';
    ctx.fillRect(0, 620, W, 1.5);
  }

  function slab(x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    roundRect(x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = 'rgba(190,215,230,.09)';
    ctx.lineWidth = 1; ctx.stroke();
  }

  function drawProps(t, heat, flick) {
    // An unused laptop, closed, and a second device under it.
    slab(196, 588, 268, 22, 5, '#0d1218');
    slab(214, 570, 236, 20, 5, '#0b1015');

    // The old phone, face down, charging. Its LED breathes.
    slab(508, 596, 86, 24, 6, '#0c1116');
    var led = 0.25 + 0.22 * Math.sin(t * 1.4);
    dot(586, 602, 3.4, 'rgba(120,255,190,' + led.toFixed(3) + ')', 16);

    // The tangle of old chargers and cables. Drawn as loose curves
    // so no two runs read as the same cable.
    ctx.strokeStyle = 'rgba(150,175,195,.16)';
    ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    var knots = [
      [1010, 612, 1090, 556, 1168, 616],
      [1024, 618, 1120, 602, 1206, 570],
      [1048, 606, 1096, 640, 1188, 606],
      [1002, 596, 1078, 624, 1160, 588]
    ];
    for (var i = 0; i < knots.length; i++) {
      var k = knots[i];
      ctx.beginPath();
      ctx.moveTo(k[0], k[1]);
      ctx.quadraticCurveTo(k[2], k[3], k[4], k[5]);
      ctx.stroke();
    }

    // A stack of dead electronics at the end of the table.
    slab(1268, 596, 190, 24, 4, '#0c1116');
    slab(1284, 574, 158, 22, 4, '#0a0f14');
    slab(1298, 554, 130, 20, 4, '#090d12');

    // The power strip — the prop the whole sequence turns on.
    slab(648, 590, 330, 30, 7, '#0e131a');
    for (var s = 0; s < 4; s++) {
      var sx = 676 + s * 76;
      // sockets
      ctx.fillStyle = '#05080b';
      roundRect(sx - 15, 596, 30, 18, 3); ctx.fill();
      // indicator LEDs, dimmed and then made unstable by the flicker
      var base = 0.30 + 0.10 * Math.sin(t * 2 + s);
      var a = Math.max(0, base * (1 - flick * (0.5 + 0.5 * Math.sin(t * 46 + s * 2))));
      dot(sx, 588, 2.6, 'rgba(255,90,70,' + a.toFixed(3) + ')', 13);
    }
    // Plug bodies crowding the strip.
    slab(690, 566, 34, 26, 4, '#0b1015');
    slab(764, 570, 30, 22, 4, '#0a0e13');
    slab(840, 564, 36, 28, 4, '#0b1015');

    // The device that runs hot, and the cable feeding it.
    ctx.strokeStyle = 'rgba(150,175,195,.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(594, 612);
    ctx.quadraticCurveTo(660, 648, 700, 606);
    ctx.stroke();

    if (heat > 0) {
      // Heat reads first as a glow inside the plastic, before any
      // flame exists.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      var hg = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y, 2, ORIGIN.x, ORIGIN.y, 90);
      hg.addColorStop(0, 'rgba(255,120,50,' + (0.5 * heat).toFixed(3) + ')');
      hg.addColorStop(0.45, 'rgba(210,60,20,' + (0.2 * heat).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(180,40,10,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(ORIGIN.x - 100, ORIGIN.y - 100, 200, 200);
      ctx.restore();
    }
  }

  /* ══════════════════════════════════════════════════════════════
     Fire, smoke, light
     ══════════════════════════════════════════════════════════════ */

  function drawSmoke(fire) {
    ctx.save();
    for (var i = 0; i < smoke.length; i++) {
      var p = smoke[i];
      var k = p.life / p.max;
      var a = Math.sin(Math.min(1, k) * Math.PI) * 0.17;
      if (a <= 0) continue;
      // Smoke near the flame is lit from below and reads warm; the
      // rest stays a cold grey.
      var lift = Math.max(0, 1 - (ORIGIN.y - p.y) / 260) * fire * 0.55;
      var r = Math.round(52 + 130 * lift + p.tone * 14);
      var gch = Math.round(53 + 54 * lift);
      var bch = Math.round(58 + 12 * lift);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(' + r + ',' + gch + ',' + bch + ',' + (a).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + r + ',' + gch + ',' + bch + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    ctx.restore();
  }

  function drawFire() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < flames.length; i++) {
      var p = flames[i];
      var k = p.life / p.max;
      var a = Math.pow(1 - k, 1.5) * 0.85;
      var core = 1 - Math.min(1, k * 1.9);   // the white core dies first
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(1, p.r));
      g.addColorStop(0, 'rgba(255,' + Math.round(196 + 44 * core) + ',' + Math.round(96 + 96 * core) + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.34, 'rgba(255,' + Math.round(120 + 40 * core) + ',36,' + (a * 0.72).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(180,38,6,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      // Taller than wide, and leaning with the draw of the rising air.
      ctx.ellipse(p.x, p.y, Math.max(1, p.r) * 0.60, Math.max(1, p.r) * 1.55,
                  Math.sin(p.seed + p.life * 3) * 0.16, 0, 6.2832);
      ctx.fill();
    }
    for (var j = 0; j < sparks.length; j++) {
      var s = sparks[j];
      var sa = (1 - s.life / s.max);
      ctx.strokeStyle = 'rgba(255,214,150,' + (sa * 0.85).toFixed(3) + ')';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.016, s.y - s.vy * 0.016);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFireLight(t, fire) {
    if (fire <= 0) return;
    // The room is lit by the fire, not by a lamp. One large unstable
    // source, warm, falling off fast.
    var flicker = 0.82 + 0.18 * Math.sin(t * 13.3) * Math.sin(t * 7.1);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var g = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y - 40, 16, ORIGIN.x, ORIGIN.y - 40, 300 + 240 * fire);
    g.addColorStop(0, 'rgba(255,150,64,' + (0.20 * fire * flicker).toFixed(3) + ')');
    g.addColorStop(0.38, 'rgba(210,78,22,' + (0.07 * fire * flicker).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(120,30,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // The burning length itself: a bright, unstable bed.
    var bw = 60 + 300 * fire;
    var bed = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y, 4, ORIGIN.x, ORIGIN.y, bw);
    bed.addColorStop(0, 'rgba(255,214,150,' + (0.50 * fire * flicker).toFixed(3) + ')');
    bed.addColorStop(0.45, 'rgba(255,120,40,' + (0.22 * fire * flicker).toFixed(3) + ')');
    bed.addColorStop(1, 'rgba(200,50,10,0)');
    ctx.save();
    ctx.translate(ORIGIN.x, ORIGIN.y);
    ctx.scale(1, 0.38);
    ctx.translate(-ORIGIN.x, -ORIGIN.y);
    ctx.fillStyle = bed;
    ctx.beginPath(); ctx.arc(ORIGIN.x, ORIGIN.y, bw, 0, 6.2832); ctx.fill();
    ctx.restore();

    // The polished table throws the flame back, smeared along the
    // surface rather than mirrored cleanly.
    var ry = 620 + (620 - (ORIGIN.y - 40));
    var rg = ctx.createRadialGradient(ORIGIN.x, ry, 8, ORIGIN.x, ry, 420 * (0.4 + fire));
    rg.addColorStop(0, 'rgba(255,138,56,' + (0.20 * fire * flicker).toFixed(3) + ')');
    rg.addColorStop(1, 'rgba(160,44,12,0)');
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 621, W, 84); ctx.clip();
    ctx.fillStyle = rg; ctx.fillRect(0, 621, W, 84);
    ctx.restore();

    ctx.restore();
  }

  function drawSirens(t, amt) {
    if (amt <= 0) return;
    // Emergency light arriving from outside: it sweeps, it does not
    // strobe, and it only ever reads through the smoke.
    var sweep = 0.5 + 0.5 * Math.sin(t * 2.6);
    var blue = 0.5 + 0.5 * Math.sin(t * 2.6 + Math.PI);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var g1 = ctx.createLinearGradient(W, 0, 520, H);
    g1.addColorStop(0, 'rgba(70,130,255,' + (0.20 * amt * blue).toFixed(3) + ')');
    g1.addColorStop(1, 'rgba(70,130,255,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createLinearGradient(W, H, 600, 0);
    g2.addColorStop(0, 'rgba(255,60,60,' + (0.12 * amt * sweep).toFixed(3) + ')');
    g2.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════════════════
     Grade
     ══════════════════════════════════════════════════════════════ */

  function grade(fire, w, h) {
    // Cold shadows, warm highlights — the ordinary grade for night
    // interiors, and the reason the fire reads as the only warmth
    // in the room.
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(150,180,215,1)');
    g.addColorStop(1, 'rgba(120,145,175,1)');
    ctx.fillStyle = g; ctx.globalAlpha = 0.30 - 0.05 * fire;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Vignette, plus the falloff that stands in for a fast lens.
    ctx.save();
    var v = ctx.createRadialGradient(w / 2, h * 0.56, h * 0.16, w / 2, h * 0.56, h * 0.92);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,' + (0.72 + 0.10 * fire).toFixed(3) + ')');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function makeNoiseTile() {
    var n = document.createElement('canvas');
    n.width = n.height = 160;
    var nc = n.getContext('2d');
    var img = nc.createImageData(160, 160);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 120 + Math.random() * 135;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nc.putImageData(img, 0, 0);
    return n;
  }

  function grain(w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.045;
    ctx.translate(-Math.random() * 160, -Math.random() * 160);
    ctx.fillStyle = ctx.createPattern(noise, 'repeat');
    ctx.fillRect(0, 0, w + 160, h + 160);
    ctx.restore();
  }

  /* ══════════════════════════════════════════════════════════════
     Frame
     ══════════════════════════════════════════════════════════════ */

  var lastSpark = 0, lastSmoke = 0, lastFlame = 0;

  function frame(t, dt) {
    var heat    = ramp(t, BEAT.heat, BEAT.heat + b(3.0));
    var flick   = ramp(t, BEAT.flicker, BEAT.flicker + b(0.6)) * (1 - ramp(t, BEAT.ignite, BEAT.ignite + b(0.6)));
    var fire    = ease(ramp(t, BEAT.ignite, BEAT.ignite + b(2.6)));
    var sirens  = ramp(t, BEAT.sirens, BEAT.sirens + b(1.4));
    var fadeIn  = ramp(t, 0, BEAT.fadeUp + b(1.6));
    var fadeOut = ramp(t, BEAT.fadeOut, SCENE_END);

    /* emission */
    if (t > BEAT.spark && t < BEAT.ignite && t - lastSpark > 1.5 * S) {
      spawnSparks(6 + Math.floor(Math.random() * 7), 40); lastSpark = t;
    }
    if (t > BEAT.ignite && t - lastSpark > 0.35 * S) {
      spawnSparks(3, 90 + 260 * fire); lastSpark = t;
    }
    if (t > BEAT.smoke && t - lastSmoke > 0.14 * S) {
      var thick = 1 + 2.1 * ramp(t, BEAT.thicken, BEAT.thicken + b(2.4)) + 2.4 * fire;
      spawnSmoke(Math.ceil(thick), 30 + 300 * fire, 0.5 + 0.9 * fire);
      lastSmoke = t;
    }
    if (t > BEAT.ignite && t - lastFlame > 0.035) {
      spawnFlame(Math.ceil(3 + 9 * fire), 34 + 250 * fire); lastFlame = t;
    }
    stepParticles(dt, t);

    /* compose */
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);

    // A slow push in, framed on the table rather than the room. The
    // window stays in the corner of the frame for depth; everything
    // that matters happens across the lower third.
    var k = ease(Math.min(1, t / SCENE_END));
    var push = 1.46 + 0.20 * k;
    ctx.translate(W / 2, H / 2);
    ctx.scale(push, push);
    ctx.translate(-(878 + 34 * k), -(520 + 8 * k));

    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

    // Background sits behind the focal plane, so it is soft.
    if (supportsFilter()) ctx.filter = 'blur(3.5px)';
    drawWallAndWindow(t, fire);
    ctx.filter = 'none';

    drawTable();
    drawProps(t, heat, flick);
    drawFireLight(t, fire);
    drawFire();
    drawSmoke(fire);
    drawSirens(t, sirens);

    ctx.restore();
    ctx.restore();

    grade(fire, view.w, view.h);
    grain(view.w, view.h);

    // Fades, drawn last so they cover everything.
    if (fadeIn < 1) {
      ctx.fillStyle = 'rgba(0,0,0,' + (1 - fadeIn).toFixed(3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
    }
    if (fadeOut > 0) {
      ctx.fillStyle = 'rgba(0,0,0,' + fadeOut.toFixed(3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
    }

    if (audio) audio.update(t, heat, fire, flick, sirens, fadeOut);
  }

  /* ══════════════════════════════════════════════════════════════
     Run loop
     ══════════════════════════════════════════════════════════════ */

  var t0 = 0, raf = 0, finished = false, prev = 0;

  function start() {
    document.body.classList.add('intro-running');
    if (site) site.setAttribute('data-enter', 'pending');

    skipBtn.addEventListener('click', finish);
    soundBtn.addEventListener('click', toggleSound);
    document.addEventListener('keydown', onKey);

    t0 = performance.now(); prev = t0;
    raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    var t = (now - t0) / 1000;
    var dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    if (t < SCENE_END + 0.2) frame(t, dt);
    else if (!cleared) { clearToBlack(); cleared = true; }

    runCards(t);
    progress.style.width = Math.min(100, (t / TOTAL) * 100).toFixed(2) + '%';

    if (t >= TOTAL) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }

  var cleared = false;
  function clearToBlack() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, view.w, view.h);
  }

  function runCards(t) {
    for (var i = 0; i < CARDS.length; i++) {
      var c = CARDS[i], el = cards[c.el];
      if (!el) continue;
      var on = t >= c.in && t < c.in + c.hold;
      el.classList.toggle('is-on', on);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { finish(); }
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
    if (audio) audio.stop();
    writeSeen();

    intro.classList.add('is-leaving');
    document.body.classList.remove('intro-running');
    if (site) {
      site.setAttribute('data-enter', 'running');
      site.addEventListener('animationend', function () {
        site.setAttribute('data-enter', 'done');
      }, { once: true });
    }
    setTimeout(function () { if (intro.parentNode) intro.remove(); }, 1200);
    wireReplay();
    wireReveal();
  }

  /* ══════════════════════════════════════════════════════════════
     Sound — synthesised, and off until asked for
     ══════════════════════════════════════════════════════════════ */

  var audio = null;

  function toggleSound() {
    if (audio) { audio.stop(); audio = null; setSoundLabel(false); return; }
    audio = makeAudio();
    setSoundLabel(!!audio);
  }
  function setSoundLabel(on) {
    soundBtn.textContent = on ? 'Sound on' : 'Sound off';
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function makeAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    var ac = new AC();
    if (ac.state === 'suspended') ac.resume();

    var out = ac.createGain(); out.gain.value = 0.0001; out.connect(ac.destination);

    // Mains buzz: the 50 Hz hum of a strip under load, and its
    // harmonic, which is the part the ear actually notices.
    var hum = ac.createGain(); hum.gain.value = 0;
    var o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 50;
    var o2 = ac.createOscillator(); o2.type = 'square';  o2.frequency.value = 150;
    var hp = ac.createBiquadFilter(); hp.type = 'lowpass'; hp.frequency.value = 900;
    o1.connect(hum); o2.connect(hum); hum.connect(hp); hp.connect(out);
    o1.start(); o2.start();

    // Broadband noise, filtered two ways: a crackle band for the
    // flame and a low rumble underneath it.
    var buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource(); src.buffer = buf; src.loop = true;

    var crack = ac.createBiquadFilter(); crack.type = 'bandpass';
    crack.frequency.value = 2400; crack.Q.value = 0.7;
    var crackG = ac.createGain(); crackG.gain.value = 0;

    var rumble = ac.createBiquadFilter(); rumble.type = 'lowpass';
    rumble.frequency.value = 160;
    var rumbleG = ac.createGain(); rumbleG.gain.value = 0;

    src.connect(crack); crack.connect(crackG); crackG.connect(out);
    src.connect(rumble); rumble.connect(rumbleG); rumbleG.connect(out);
    src.start();

    out.gain.setTargetAtTime(0.5, ac.currentTime, 0.4);

    return {
      update: function (t, heat, fire, flick, sirens, fadeOut) {
        var buzz = ramp(t, BEAT.breathe, BEAT.breathe + b(2.2));
        var unstable = 1 + flick * 0.9 * Math.sin(t * 37);
        hum.gain.value = Math.max(0, (0.020 * buzz + 0.030 * heat) * unstable * (1 - fire * 0.6));
        crackG.gain.value = 0.055 * fire;
        rumbleG.gain.value = 0.085 * fire;
        o1.frequency.value = 50 + 3 * heat;
        out.gain.value = Math.max(0, 0.5 * (1 - fadeOut));
      },
      stop: function () {
        try {
          out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.12);
          setTimeout(function () { ac.close(); }, 500);
        } catch (e) { /* the tab is going away anyway */ }
      }
    };
  }

  /* ══════════════════════════════════════════════════════════════
     Shared helpers
     ══════════════════════════════════════════════════════════════ */

  function ramp(t, a, c) { return Math.max(0, Math.min(1, (t - a) / (c - a))); }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  function dot(x, y, r, color, glow) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var g = ctx.createRadialGradient(x, y, 0, x, y, glow);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, glow, 0, 6.2832); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var _filter;
  function supportsFilter() {
    if (_filter === undefined) _filter = (typeof ctx.filter === 'string');
    return _filter;
  }

  /* Returning visitors. The preference is a convenience, so a
     browser that refuses storage simply means the intro plays. */
  function readSeen() {
    try { return window.localStorage.getItem(SEEN_KEY) === '1'; }
    catch (e) { return false; }
  }
  function writeSeen() {
    try { window.localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode */ }
  }

  function wireReplay() {
    var btn = document.getElementById('replay');
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { window.localStorage.removeItem(SEEN_KEY); } catch (e) {}
      window.location.reload();
    });
  }

  function wireReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }
})();
