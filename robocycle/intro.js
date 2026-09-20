/* ══════════════════════════════════════════════════════════════
   ROBOCYCLE — cinematic opening sequence

   Rendered live on a canvas rather than played from a film file,
   so the beats stay editable and the whole thing costs a few
   kilobytes. If a filmed plate is ever shot it drops into #plate
   and inherits this clock, these titles and the skip control.

   The sequence is cut as a documentary would cut it: a wide
   establishing frame, then observational close work across the
   room, then the event. Each entry in SHOTS is a camera setup
   with its own framing and a slow drift; the cuts dip through
   black the way a field edit does.

   The track, in seconds (desktop). Phones run SCENE beats at
   0.64 speed, which lands the whole thing near thirty seconds.

     0.5   the room fades up — WIDE
     6.0   the router, still awake        12.0  buzz enters
    10.5   the shelf of dead devices      15.5  the strip flickers
    15.0   the power strip                19.8  a device runs hot
    19.5   batteries and old phones       24.0  a spark
    23.5   macro: the strip               27.0  smoke
    27.5   smoke through the devices      30.0  it thickens
    31.5   WIDE — fire                    31.8  ignition
                                          34.5  the cables catch
                                          35.5  emergency light
    37.5   fade to black
    39.6   "Electronic waste doesn't disappear."
    ...    "It goes somewhere."  ·  "RoboCycle"  ·  the promise
    48.2   the homepage
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var SEEN_KEY = 'robocycle.intro.v1';
  /* Seen recently, rather than seen ever: a visitor who comes back a
     month later gets the film again, and there are two explicit ways
     to ask for it before then. */
  var SEEN_FOR = 30 * 24 * 60 * 60 * 1000;
  var W = 1600, H = 900;
  var ORIGIN  = { x: 812, y: 598 };    // the power strip: where it starts
  var ORIGIN2 = { x: 1180, y: 606 };   // the cable tangle: where it goes next

  var intro    = document.getElementById('intro');
  var canvas   = document.getElementById('stage');
  var site     = document.getElementById('site');
  var skipBtn  = document.getElementById('skip');
  var soundBtn = document.getElementById('sound');
  var progress = document.getElementById('intro-progress');
  var frame    = document.getElementById('frame');
  var cards    = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var captions = Array.prototype.slice.call(document.querySelectorAll('.caption'));

  var isPhone   = Math.min(window.innerWidth, window.innerHeight) < 620;
  var reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var returning = readSeen();

  var S = isPhone ? 0.64 : 1;
  function b(t) { return t * S; }

  var BEAT = {
    fadeUp:   b(0.5),
    buzz:     b(12.0),
    flicker:  b(15.5),
    heat:     b(19.8),
    spark:    b(24.0),
    smoke:    b(27.0),
    thicken:  b(30.0),
    ignite:   b(31.8),
    spread:   b(34.5),
    sirens:   b(35.5),
    fadeOut:  b(37.5)
  };
  var SCENE_END = BEAT.fadeOut + b(2.1);

  /* Camera setups. z is the zoom; drift is world units per second,
     applied for the length of the shot so nothing ever sits still. */
  var SHOTS = [
    { at: b(0.0),  cx: 800,  cy: 548, z: 1.16, dx: 14,  dy: -2, dz: 0.030 },
    { at: b(6.0),  cx: 1055, cy: 578, z: 2.45, dx: -9,  dy: 2,  dz: 0.030 },
    { at: b(10.5), cx: 690,  cy: 404, z: 1.85, dx: 22,  dy: 3,  dz: 0.018 },
    { at: b(15.0), cx: 812,  cy: 592, z: 2.25, dx: -7,  dy: 0,  dz: 0.028 },
    { at: b(19.5), cx: 1432, cy: 590, z: 2.55, dx: -11, dy: 1,  dz: 0.022 },
    { at: b(23.5), cx: 812,  cy: 594, z: 3.55, dx: 5,   dy: -3, dz: 0.040 },
    { at: b(27.5), cx: 856,  cy: 508, z: 1.82, dx: -6,  dy: -9, dz: 0.020 },
    { at: b(31.5), cx: 830,  cy: 548, z: 1.24, dx: 9,   dy: -4, dz: 0.016 }
  ];
  var DIP = b(0.34);   // how long a cut sits in black

  /* Field captions, in the documentary register: what is on screen,
     not commentary about it. */
  var CAPS = [
    { el: 0, in: b(1.4),  out: b(5.6) },
    { el: 1, in: b(11.0), out: b(14.6) },
    { el: 2, in: b(20.2), out: b(23.2) },
    { el: 3, in: b(32.4), out: b(35.2) }
  ];

  var C = isPhone ? 0.84 : 1;
  var CARDS = [
    { el: 0, in: SCENE_END + 0.6,            hold: 1.95 * C },
    { el: 1, in: SCENE_END + 0.6 + 2.45 * C, hold: 1.75 * C },
    { el: 2, in: SCENE_END + 0.6 + 4.55 * C, hold: 1.55 * C },
    { el: 3, in: SCENE_END + 0.6 + 6.35 * C, hold: 1.70 * C }
  ];
  var TOTAL = CARDS[3].in + CARDS[3].hold + 0.9;

  /* ── entry points ───────────────────────────────────────────── */

  if (!intro || !canvas || reduced || returning) {
    if (intro) intro.remove();
    document.body.classList.remove('intro-running');
    if (site) site.setAttribute('data-enter', 'done');
    wireReplay(); wireReveal(); wireLogos();
    return;
  }

  start();

  /* ══════════════════════════  canvas  ═════════════════════════ */

  var ctx = canvas.getContext('2d');
  var view = { w: 0, h: 0, scale: 1, ox: 0, oy: 0 };

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = intro.clientWidth, h = intro.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var s = Math.max(w / W, h / H);
    view = { w: w, h: h, scale: s, ox: (w - W * s) / 2, oy: (h - H * s) / 2 };
  }
  window.addEventListener('resize', resize);
  resize();

  var noise = makeNoiseTile();

  /* ══════════════════════════  particles  ═════════════════════ */

  var smoke = [], flames = [], sparks = [];
  var SMOKE_CAP = isPhone ? 110 : 230;
  var FLAME_CAP = isPhone ? 130 : 280;

  function spawnSmoke(n, spread, power, src) {
    for (var i = 0; i < n && smoke.length < SMOKE_CAP; i++) {
      smoke.push({
        x: src.x + (Math.random() - 0.5) * spread,
        y: src.y - Math.random() * 12,
        vx: (Math.random() - 0.5) * 7,
        vy: -(16 + Math.random() * 26) * power,
        r: 26 + Math.random() * 44,
        grow: 16 + Math.random() * 26,
        life: 0, max: 3.4 + Math.random() * 2.8,
        seed: Math.random() * 6.28, tone: Math.random()
      });
    }
  }

  function spawnFlame(n, spread, src) {
    for (var i = 0; i < n && flames.length < FLAME_CAP; i++) {
      flames.push({
        x: src.x + (Math.random() - 0.5) * spread,
        y: src.y + 4 - Math.random() * 6,
        vx: (Math.random() - 0.5) * 16,
        vy: -(135 + Math.random() * 170),
        r: 24 + Math.random() * 30,
        life: 0, max: 0.8 + Math.random() * 0.95,
        seed: Math.random() * 6.28
      });
    }
  }

  function spawnSparks(n, spread, src) {
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      var sp = 140 + Math.random() * 300;
      sparks.push({
        x: src.x + (Math.random() - 0.5) * spread, y: src.y - 2,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 0, max: 0.4 + Math.random() * 0.7
      });
    }
  }

  function stepParticles(dt, t) {
    var i, p;
    for (i = smoke.length - 1; i >= 0; i--) {
      p = smoke[i]; p.life += dt;
      if (p.life > p.max) { smoke.splice(i, 1); continue; }
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
      p.vy *= (1 - 0.42 * dt);
      p.r *= (1 - 0.62 * dt);
    }
    for (i = sparks.length - 1; i >= 0; i--) {
      p = sparks[i]; p.life += dt;
      if (p.life > p.max) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 620 * dt; p.vx *= (1 - 1.1 * dt);
    }
  }

  /* ══════════════════════════  the room  ══════════════════════ */

  function drawWallAndWindow(t, fire) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080b10'); g.addColorStop(0.62, '#05070a'); g.addColorStop(1, '#030406');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    var wx = 1010, wy = 96, ww = 470, wh = 300;
    var sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sky.addColorStop(0, '#060c14'); sky.addColorStop(0.68, '#0b1520'); sky.addColorStop(1, '#14202a');
    ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);

    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
    var haze = ctx.createRadialGradient(wx + ww * 0.62, wy + wh, 8, wx + ww * 0.62, wy + wh, 300);
    haze.addColorStop(0, 'rgba(180,130,70,.20)'); haze.addColorStop(1, 'rgba(180,130,70,0)');
    ctx.fillStyle = haze; ctx.fillRect(wx, wy, ww, wh);

    var towers = [[30,120,54],[96,78,40],[150,170,62],[224,104,46],[282,196,74],[368,134,52],[428,92,38]];
    for (var i = 0; i < towers.length; i++) {
      var tx = wx + towers[i][0], th = towers[i][1], tw = towers[i][2];
      ctx.fillStyle = '#04070b';
      ctx.fillRect(tx, wy + wh - th, tw, th);
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

    ctx.strokeStyle = 'rgba(150,180,200,.11)'; ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.stroke();

    if (fire > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.14 * fire;
      var fg = ctx.createRadialGradient(950, 520, 10, 950, 520, 330);
      fg.addColorStop(0, 'rgba(255,140,60,.75)'); fg.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.fillStyle = fg; ctx.fillRect(840, 180, 200, 360);
      ctx.restore();
    }
  }

  function drawSurfaces() {
    var fg = ctx.createLinearGradient(0, 700, 0, H);
    fg.addColorStop(0, '#04060a'); fg.addColorStop(1, '#020304');
    ctx.fillStyle = fg; ctx.fillRect(0, 700, W, H - 700);

    // The shelf the second tier of devices sits on.
    ctx.fillStyle = '#0a0e13'; ctx.fillRect(120, 446, 1400, 14);
    ctx.fillStyle = 'rgba(190,215,230,.06)'; ctx.fillRect(120, 446, 1400, 1.5);

    var tg = ctx.createLinearGradient(0, 620, 0, 704);
    tg.addColorStop(0, '#11161c'); tg.addColorStop(1, '#070a0e');
    ctx.fillStyle = tg; ctx.fillRect(0, 620, W, 84);
    ctx.fillStyle = 'rgba(190,215,230,.07)'; ctx.fillRect(0, 620, W, 1.5);
  }

  function slab(x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    roundRect(x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = 'rgba(190,215,230,.09)'; ctx.lineWidth = 1; ctx.stroke();
  }

  function cable(x1, y1, cx, cy, x2, y2, a) {
    ctx.strokeStyle = 'rgba(150,175,195,' + a + ')';
    ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
  }

  /* Everything in the room, in one pass. The room is crowded on
     purpose: this is what a household actually accumulates. */
  function drawProps(t, heat, flick) {

    /* ── the shelf ─────────────────────────────────────────── */

    // Flat television, dark, still plugged in.
    slab(196, 318, 232, 128, 5, '#080c11');
    slab(206, 328, 212, 106, 3, '#0b1017');
    ctx.fillStyle = 'rgba(160,190,210,.05)'; ctx.fillRect(206, 328, 212, 40);
    slab(294, 446, 36, 10, 2, '#0a0e13');
    dot(414, 440, 1.8, 'rgba(255,70,50,.26)', 9);

    // Bluetooth speaker.
    slab(456, 372, 62, 74, 14, '#0c1117');
    ctx.strokeStyle = 'rgba(190,215,230,.07)';
    for (var sp = 0; sp < 5; sp++) {
      ctx.beginPath(); ctx.moveTo(462, 384 + sp * 11); ctx.lineTo(512, 384 + sp * 11); ctx.stroke();
    }

    // Tablet, leaning against the wall.
    ctx.save();
    ctx.translate(596, 446); ctx.rotate(-0.07);
    slab(0, -118, 88, 118, 5, '#0a0e14');
    ctx.restore();

    // Headphones, hooked over the shelf edge.
    ctx.strokeStyle = 'rgba(150,175,195,.2)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(726, 420, 26, Math.PI * 0.08, Math.PI * 0.92, true); ctx.stroke();
    slab(694, 414, 20, 30, 7, '#0b1015');
    slab(738, 414, 20, 30, 7, '#0b1015');

    // A small drone, one rotor arm bent.
    slab(806, 410, 56, 22, 5, '#0b1016');
    ctx.strokeStyle = 'rgba(150,175,195,.18)'; ctx.lineWidth = 3;
    var arms = [[806,410,-26,-16],[862,410,26,-16],[806,432,-26,14],[862,432,26,12]];
    for (var d = 0; d < arms.length; d++) {
      ctx.beginPath(); ctx.moveTo(arms[d][0], arms[d][1]);
      ctx.lineTo(arms[d][0] + arms[d][2], arms[d][1] + arms[d][3]); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(arms[d][0] + arms[d][2], arms[d][1] + arms[d][3], 14, 3, 0, 0, 6.2832);
      ctx.strokeStyle = 'rgba(150,175,195,.10)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(150,175,195,.18)';
    }

    // External drives and two remotes.
    slab(912, 416, 74, 14, 3, '#0b1015');
    slab(912, 430, 74, 14, 3, '#090d12');
    slab(1002, 402, 22, 44, 4, '#0a0e13');
    slab(1030, 398, 22, 48, 4, '#090d12');

    // A stack of dead devices, four deep.
    slab(1084, 410, 150, 12, 3, '#0b1015');
    slab(1092, 398, 134, 12, 3, '#0a0e14');
    slab(1100, 386, 118, 12, 3, '#090d12');
    slab(1108, 374, 102, 12, 3, '#080c10');

    // Coiled extension cords.
    ctx.strokeStyle = 'rgba(150,175,195,.15)'; ctx.lineWidth = 3.4;
    for (var co = 0; co < 4; co++) {
      ctx.beginPath();
      ctx.ellipse(1348 + co * 8, 424 - co * 3, 62 - co * 8, 18 - co * 2, 0.1, 0, 6.2832);
      ctx.stroke();
    }

    /* ── the table ─────────────────────────────────────────── */

    // Printer, lid up, out of ink for years.
    slab(58, 556, 132, 64, 5, '#0b1016');
    slab(66, 544, 116, 14, 3, '#0a0e13');
    dot(178, 566, 2, 'rgba(90,220,255,.20)', 10);

    // Three old phones, face down.
    slab(206, 604, 74, 16, 4, '#0b1015');
    slab(214, 592, 62, 12, 3, '#0a0e14');
    slab(220, 582, 52, 10, 3, '#090d12');

    // A heap of charger bricks.
    slab(296, 596, 30, 24, 4, '#0b1016');
    slab(330, 602, 26, 18, 4, '#0a0e13');
    slab(300, 574, 24, 22, 4, '#090d12');
    slab(332, 580, 22, 20, 4, '#0b1015');

    // Compact camera with its lens out.
    slab(388, 586, 62, 34, 4, '#0a0e14');
    ctx.fillStyle = '#05080b';
    ctx.beginPath(); ctx.arc(420, 602, 12, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(190,215,230,.10)'; ctx.stroke();

    // Two laptops, closed, stacked.
    slab(472, 596, 128, 24, 5, '#0d1218');
    slab(484, 578, 108, 18, 5, '#0b1015');

    // The phone on charge, and its LED, breathing.
    slab(614, 600, 78, 20, 5, '#0c1116');
    var led = 0.25 + 0.22 * Math.sin(t * 1.4);
    dot(684, 605, 3.2, 'rgba(120,255,190,' + led.toFixed(3) + ')', 15);
    cable(692, 612, 730, 640, 762, 612, .2);

    // THE POWER STRIP. Detailed enough to hold a macro frame.
    slab(648, 590, 330, 30, 7, '#0e131a');
    ctx.fillStyle = 'rgba(190,215,230,.05)'; ctx.fillRect(654, 594, 318, 1);
    for (var s = 0; s < 4; s++) {
      var sx = 676 + s * 76;
      ctx.fillStyle = '#05080b';
      roundRect(sx - 15, 596, 30, 18, 3); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.8)';
      ctx.fillRect(sx - 7, 600, 3, 8); ctx.fillRect(sx + 4, 600, 3, 8);
      var base = 0.30 + 0.10 * Math.sin(t * 2 + s);
      var a = Math.max(0, base * (1 - flick * (0.5 + 0.5 * Math.sin(t * 46 + s * 2))));
      dot(sx, 588, 2.6, 'rgba(255,90,70,' + a.toFixed(3) + ')', 13);
      // vent slots and a screw head, for the close frame
      ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx - 12, 617); ctx.lineTo(sx + 12, 617); ctx.stroke();
    }
    slab(690, 566, 34, 26, 4, '#0b1015');
    slab(764, 570, 30, 22, 4, '#0a0e13');
    slab(840, 564, 36, 28, 4, '#0b1015');
    slab(900, 572, 30, 20, 4, '#0a0e14');
    cable(700, 566, 690, 520, 640, 470, .14);
    cable(858, 564, 900, 512, 960, 470, .12);

    // Router, still awake: the only thing in the room doing work.
    slab(994, 574, 108, 46, 6, '#0b1016');
    ctx.strokeStyle = 'rgba(150,175,195,.2)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(1010, 574); ctx.lineTo(1000, 520); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1086, 574); ctx.lineTo(1096, 520); ctx.stroke();
    for (var L = 0; L < 5; L++) {
      // Each LED keeps its own rhythm; one is a link light and blinks.
      var blink = L === 2 ? (Math.sin(t * 9.3) > 0.2 ? 1 : 0.15) : (0.55 + 0.45 * Math.sin(t * 1.1 + L));
      dot(1010 + L * 18, 588, 2.2, 'rgba(110,220,255,' + (0.30 * blink).toFixed(3) + ')', 11);
    }

    // The tangle of cables — where the fire goes second.
    var knots = [
      [1118, 612, 1198, 556, 1276, 616], [1132, 618, 1228, 602, 1284, 570],
      [1156, 606, 1204, 640, 1290, 606], [1110, 596, 1186, 624, 1268, 588],
      [1126, 590, 1210, 570, 1282, 598]
    ];
    for (var k = 0; k < knots.length; k++) {
      cable(knots[k][0], knots[k][1], knots[k][2], knots[k][3], knots[k][4], knots[k][5], .16);
    }

    // Games console and a controller.
    slab(1300, 592, 96, 28, 4, '#0b1016');
    slab(1312, 576, 72, 16, 3, '#0a0e13');
    slab(1404, 600, 44, 20, 8, '#0a0e14');

    // A tray of loose batteries — the part nobody thinks about.
    slab(1462, 596, 112, 24, 3, '#090d12');
    for (var ba = 0; ba < 6; ba++) {
      ctx.fillStyle = '#12181f';
      roundRect(1470 + ba * 17, 584, 12, 30, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(190,215,230,.08)'; ctx.stroke();
      ctx.fillStyle = 'rgba(190,215,230,.06)';
      ctx.fillRect(1470 + ba * 17, 584, 12, 4);
    }

    /* ── the floor ─────────────────────────────────────────── */

    // A box of devices nobody has opened.
    slab(120, 714, 224, 78, 3, '#080c11');
    ctx.fillStyle = 'rgba(190,215,230,.04)'; ctx.fillRect(120, 714, 224, 2);
    slab(150, 690, 60, 26, 3, '#0a0e14');
    slab(228, 684, 74, 32, 3, '#090d12');
    slab(262, 668, 46, 18, 3, '#0b1015');

    // And a tower of them beside it.
    slab(1290, 738, 206, 26, 3, '#0a0e14');
    slab(1306, 712, 174, 26, 3, '#090d12');
    slab(1322, 690, 142, 22, 3, '#080c10');
    slab(1340, 672, 110, 18, 3, '#070b0f');

    /* Heat reads inside the plastic before any flame exists. */
    if (heat > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      var hg = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y, 2, ORIGIN.x, ORIGIN.y, 90);
      hg.addColorStop(0, 'rgba(255,120,50,' + (0.5 * heat).toFixed(3) + ')');
      hg.addColorStop(0.45, 'rgba(210,60,20,' + (0.2 * heat).toFixed(3) + ')');
      hg.addColorStop(1, 'rgba(180,40,10,0)');
      ctx.fillStyle = hg; ctx.fillRect(ORIGIN.x - 100, ORIGIN.y - 100, 200, 200);
      ctx.restore();
    }
  }

  /* ══════════════════════════  fire and smoke  ════════════════ */

  function drawSmoke(fire) {
    for (var i = 0; i < smoke.length; i++) {
      var p = smoke[i];
      var k = p.life / p.max;
      var a = Math.sin(Math.min(1, k) * Math.PI) * 0.17;
      if (a <= 0) continue;
      var lift = Math.max(0, 1 - (ORIGIN.y - p.y) / 260) * fire * 0.55;
      var r = Math.round(52 + 130 * lift + p.tone * 14);
      var gch = Math.round(53 + 54 * lift);
      var bch = Math.round(58 + 12 * lift);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(' + r + ',' + gch + ',' + bch + ',' + a.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + r + ',' + gch + ',' + bch + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
  }

  function drawFire() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < flames.length; i++) {
      var p = flames[i];
      var k = p.life / p.max;
      var a = Math.pow(1 - k, 1.5) * 0.85;
      var core = 1 - Math.min(1, k * 1.9);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(1, p.r));
      g.addColorStop(0, 'rgba(255,' + Math.round(196 + 44 * core) + ',' + Math.round(96 + 96 * core) + ',' + a.toFixed(3) + ')');
      g.addColorStop(0.34, 'rgba(255,' + Math.round(120 + 40 * core) + ',36,' + (a * 0.72).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(180,38,6,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, Math.max(1, p.r) * 0.60, Math.max(1, p.r) * 1.55,
                  Math.sin(p.seed + p.life * 3) * 0.16, 0, 6.2832);
      ctx.fill();
    }
    for (var j = 0; j < sparks.length; j++) {
      var s = sparks[j];
      var sa = (1 - s.life / s.max);
      ctx.strokeStyle = 'rgba(255,214,150,' + (sa * 0.85).toFixed(3) + ')';
      ctx.lineWidth = 1.7;
      ctx.beginPath(); ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.016, s.y - s.vy * 0.016); ctx.stroke();
    }
    ctx.restore();
  }

  function fireBed(src, fire, flicker) {
    var bw = 60 + 300 * fire;
    var bed = ctx.createRadialGradient(src.x, src.y, 4, src.x, src.y, bw);
    bed.addColorStop(0, 'rgba(255,214,150,' + (0.50 * fire * flicker).toFixed(3) + ')');
    bed.addColorStop(0.45, 'rgba(255,120,40,' + (0.22 * fire * flicker).toFixed(3) + ')');
    bed.addColorStop(1, 'rgba(200,50,10,0)');
    ctx.save();
    ctx.translate(src.x, src.y); ctx.scale(1, 0.38); ctx.translate(-src.x, -src.y);
    ctx.fillStyle = bed;
    ctx.beginPath(); ctx.arc(src.x, src.y, bw, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function drawFireLight(t, fire, fire2) {
    if (fire <= 0) return;
    var flicker = 0.82 + 0.18 * Math.sin(t * 13.3) * Math.sin(t * 7.1);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var g = ctx.createRadialGradient(ORIGIN.x, ORIGIN.y - 40, 16, ORIGIN.x, ORIGIN.y - 40, 300 + 240 * fire);
    g.addColorStop(0, 'rgba(255,150,64,' + (0.20 * fire * flicker).toFixed(3) + ')');
    g.addColorStop(0.38, 'rgba(210,78,22,' + (0.07 * fire * flicker).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(120,30,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    fireBed(ORIGIN, fire, flicker);
    if (fire2 > 0) fireBed(ORIGIN2, fire2, flicker);

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

  /* ══════════════════════════  grade  ═════════════════════════ */

  function grade(fire, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(150,180,215,1)');
    g.addColorStop(1, 'rgba(120,145,175,1)');
    ctx.fillStyle = g; ctx.globalAlpha = 0.30 - 0.05 * fire;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

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

  /* ══════════════════════════  camera  ════════════════════════ */

  function shotAt(t) {
    var i = 0;
    for (var s = 0; s < SHOTS.length; s++) if (t >= SHOTS[s].at) i = s;
    var cur = SHOTS[i];
    var next = SHOTS[i + 1];
    var el = t - cur.at;                      // elapsed within the shot
    // A cut dips through black: out at the end of one shot, in at
    // the start of the next.
    var cover = 0;
    if (el < DIP && i > 0) cover = 1 - el / DIP;
    if (next && next.at - t < DIP) cover = Math.max(cover, 1 - (next.at - t) / DIP);
    return {
      cx: cur.cx + cur.dx * el,
      cy: cur.cy + cur.dy * el,
      z:  cur.z * (1 + cur.dz * el),
      cover: Math.max(0, Math.min(1, cover))
    };
  }

  /* ══════════════════════════  frame  ═════════════════════════ */

  var lastSpark = 0, lastSmoke = 0, lastFlame = 0;

  function render(t, dt) {
    var heat    = ramp(t, BEAT.heat, BEAT.heat + b(3.4));
    var flick   = ramp(t, BEAT.flicker, BEAT.flicker + b(0.6)) * (1 - ramp(t, BEAT.ignite, BEAT.ignite + b(0.6)));
    var fire    = ease(ramp(t, BEAT.ignite, BEAT.ignite + b(3.0)));
    var fire2   = ease(ramp(t, BEAT.spread, BEAT.spread + b(2.4)));
    var sirens  = ramp(t, BEAT.sirens, BEAT.sirens + b(1.6));
    var fadeIn  = ramp(t, 0, BEAT.fadeUp + b(1.8));
    var fadeOut = ramp(t, BEAT.fadeOut, SCENE_END);

    if (t > BEAT.spark && t < BEAT.ignite && t - lastSpark > 1.4 * S) {
      spawnSparks(6 + Math.floor(Math.random() * 7), 40, ORIGIN); lastSpark = t;
    }
    if (t > BEAT.ignite && t - lastSpark > 0.35 * S) {
      spawnSparks(3, 90 + 260 * fire, ORIGIN); lastSpark = t;
    }
    if (t > BEAT.smoke && t - lastSmoke > 0.14 * S) {
      var thick = 1 + 2.1 * ramp(t, BEAT.thicken, BEAT.thicken + b(2.6)) + 2.4 * fire;
      spawnSmoke(Math.ceil(thick), 30 + 300 * fire, 0.5 + 0.9 * fire, ORIGIN);
      if (fire2 > 0) spawnSmoke(Math.ceil(thick * 0.7), 30 + 220 * fire2, 0.5 + 0.8 * fire2, ORIGIN2);
      lastSmoke = t;
    }
    if (t > BEAT.ignite && t - lastFlame > 0.035) {
      spawnFlame(Math.ceil(3 + 9 * fire), 34 + 250 * fire, ORIGIN);
      if (fire2 > 0) spawnFlame(Math.ceil(2 + 6 * fire2), 30 + 190 * fire2, ORIGIN2);
      lastFlame = t;
    }
    stepParticles(dt, t);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, view.w, view.h);

    var cam = shotAt(t);

    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);
    ctx.translate(W / 2, H / 2);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.cx, -cam.cy);

    ctx.save();
    ctx.beginPath(); ctx.rect(-400, -400, W + 800, H + 800); ctx.clip();

    if (supportsFilter()) ctx.filter = 'blur(3.5px)';
    drawWallAndWindow(t, fire);
    ctx.filter = 'none';

    drawSurfaces();
    drawProps(t, heat, flick);
    drawFireLight(t, fire, fire2);
    drawFire();
    drawSmoke(fire);
    drawSirens(t, sirens);
    ctx.restore();
    ctx.restore();

    grade(fire, view.w, view.h);
    grain(view.w, view.h);

    var black = Math.max(cam.cover, 1 - fadeIn, fadeOut);
    if (black > 0) {
      ctx.fillStyle = 'rgba(0,0,0,' + black.toFixed(3) + ')';
      ctx.fillRect(0, 0, view.w, view.h);
    }

    if (audio) audio.update(t, heat, fire, flick, sirens, fadeOut);
  }

  /* ══════════════════════════  run loop  ══════════════════════ */

  var t0 = 0, raf = 0, finished = false, prev = 0, cleared = false;

  function start() {
    document.body.classList.add('intro-running');
    if (site) site.setAttribute('data-enter', 'pending');
    skipBtn.addEventListener('click', finish);
    soundBtn.addEventListener('click', toggleSound);
    document.addEventListener('keydown', onKey);
    if (frame) setTimeout(function () { frame.classList.add('is-on'); }, 900);
    t0 = performance.now(); prev = t0;
    raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    var t = (now - t0) / 1000;
    var dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    if (t < SCENE_END + 0.2) render(t, dt);
    else if (!cleared) { clearToBlack(); cleared = true; }

    runCaptions(t);
    runCards(t);
    progress.style.width = Math.min(100, (t / TOTAL) * 100).toFixed(2) + '%';

    if (t >= TOTAL) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }

  function clearToBlack() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, view.w, view.h);
    if (frame) frame.classList.remove('is-on');
  }

  function runCaptions(t) {
    for (var i = 0; i < CAPS.length; i++) {
      var c = CAPS[i], el = captions[c.el];
      if (el) el.classList.toggle('is-on', t >= c.in && t < c.out);
    }
  }

  function runCards(t) {
    for (var i = 0; i < CARDS.length; i++) {
      var c = CARDS[i], el = cards[c.el];
      if (el) el.classList.toggle('is-on', t >= c.in && t < c.in + c.hold);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') finish();
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
    wireReplay(); wireReveal(); wireLogos();
  }

  /* ══════════════════════════  sound  ═════════════════════════ */

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

    var hum = ac.createGain(); hum.gain.value = 0;
    var o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 50;
    var o2 = ac.createOscillator(); o2.type = 'square';  o2.frequency.value = 150;
    var hp = ac.createBiquadFilter(); hp.type = 'lowpass'; hp.frequency.value = 900;
    o1.connect(hum); o2.connect(hum); hum.connect(hp); hp.connect(out);
    o1.start(); o2.start();

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
        var buzz = ramp(t, BEAT.buzz, BEAT.buzz + b(2.6));
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

  /* ══════════════════════════  helpers  ══════════════════════ */

  function ramp(t, a, c) { return Math.max(0, Math.min(1, (t - a) / (c - a))); }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  function dot(x, y, r, color, glow) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var g = ctx.createRadialGradient(x, y, 0, x, y, glow);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
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

  function readSeen() {
    try {
      var v = window.localStorage.getItem(SEEN_KEY);
      if (!v) return false;
      if (v === '1') return true;                 // written by an earlier version
      return (Date.now() - parseInt(v, 10)) < SEEN_FOR;
    } catch (e) { return false; }
  }
  function writeSeen() {
    try { window.localStorage.setItem(SEEN_KEY, String(Date.now())); } catch (e) { /* private mode */ }
  }

  function wireReplay() {
    var btns = [document.getElementById('replay'), document.getElementById('watch')];
    for (var i = 0; i < btns.length; i++) {
      if (!btns[i]) continue;
      btns[i].addEventListener('click', function () {
        try { window.localStorage.removeItem(SEEN_KEY); } catch (e) {}
        window.location.reload();
      });
    }
  }

  /* The logo is dropped in as logo.png. Until it is there — or if it
     ever fails to load — the wordmark carries the brand on its own,
     so the page never shows a broken image. (This cannot be an inline
     onerror: our own CSP blocks inline script, deliberately.) */
  function wireLogos() {
    var imgs = document.querySelectorAll('img[data-logo]');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (img.complete && img.naturalWidth === 0) { img.remove(); return; }
        img.addEventListener('error', function () { img.remove(); });
      })(imgs[i]);
    }
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
