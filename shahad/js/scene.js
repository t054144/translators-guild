/* ============================================================
   The 3D world.

   One long strip of "stations", one per slide. The camera dollies
   between them on every slide change, which is what makes the deck
   feel like a camera move rather than a slide change. Every prop is
   built from primitives, so nothing here needs an asset file.
   ============================================================ */

// A plain relative path, not a bare specifier: bare specifiers need an import
// map, which Safari only understands from iOS 16.4. An older iPhone would fail
// to resolve it and render nothing at all.
import * as THREE from '../vendor/three.module.min.js';

const GAP   = 26;      // distance between stations
const SHIFT = 4.6;     // pushes props to the right of the text column
const PAPER = 0xFDFBF5;

const C = {
  red:   0xD8382C,
  blue:  0x1E6FD9,
  green: 0x2E9E52,
  gold:  0xEFA81C,
  cream: 0xF6EEDC,
  dark:  0x2A2D42,
  white: 0xFFFFFF,
  pipeHi:0x4FBE70,
  pipeLo:0x1E7C3C
};

const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;

/* ---------- canvas textures ---------- */

function tex(size, draw){
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  draw(cv.getContext('2d'), size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const questionFace = () => tex(256, (g, s) => {
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, '#F9C956'); grd.addColorStop(1, '#E39C10');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(120,72,4,.55)'; g.lineWidth = s * .055;
  g.strokeRect(s * .028, s * .028, s * .944, s * .944);
  g.fillStyle = 'rgba(120,72,4,.55)';
  const r = s * .055, m = s * .105;
  [[m, m], [s - m - r, m], [m, s - m - r], [s - m - r, s - m - r]]
    .forEach(([x, y]) => g.fillRect(x, y, r, r));
  g.fillStyle = '#FFFFFF';
  g.font = `800 ${s * .62}px Outfit, system-ui, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(120,72,4,.4)'; g.shadowOffsetY = s * .022;
  g.fillText('?', s / 2, s * .55);
});

const coinFace = () => tex(256, (g, s) => {
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, '#FFD866'); grd.addColorStop(.55, '#F3B227'); grd.addColorStop(1, '#DC9410');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  // outer rim, then the classic inner oval
  g.strokeStyle = 'rgba(150,95,6,.5)'; g.lineWidth = s * .05;
  g.beginPath(); g.arc(s / 2, s / 2, s * .455, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(150,95,6,.62)'; g.lineWidth = s * .055;
  g.beginPath(); g.ellipse(s / 2, s / 2, s * .155, s * .265, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.42)'; g.lineWidth = s * .03;
  g.beginPath(); g.ellipse(s * .47, s * .47, s * .155, s * .265, 0, Math.PI * .75, Math.PI * 1.45); g.stroke();
});

const brickFace = () => tex(256, (g, s) => {
  g.fillStyle = '#C26A32'; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(90,40,10,.55)'; g.lineWidth = s * .035;
  const h = s / 4;
  for (let r = 0; r < 4; r++){
    g.beginPath(); g.moveTo(0, r * h); g.lineTo(s, r * h); g.stroke();
    const off = (r % 2) ? 0 : s / 2;
    g.beginPath(); g.moveTo(off, r * h); g.lineTo(off, r * h + h); g.stroke();
    g.beginPath(); g.moveTo(off + s / 2, r * h); g.lineTo(off + s / 2, r * h + h); g.stroke();
  }
});

/* ---------- material helpers ---------- */
const solid = (color, o = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: .58, metalness: 0, ...o });

const shiny = (color) =>
  new THREE.MeshStandardMaterial({ color, roughness: .26, metalness: .55 });

/* ---------- prop builders ---------- */

function questionBlock(size = 2, texture){
  const g = new THREE.Group();
  const side = new THREE.MeshStandardMaterial({ map: texture, roughness: .52, metalness: .04 });
  const top  = solid(0xE39C10);
  const box  = new THREE.Mesh(new THREE.BoxGeometry(size, size, size),
                              [side, side, top, top, side, side]);
  box.castShadow = true;
  g.add(box);
  g.userData.block = box;
  return g;
}

function brickBlock(size = 2, texture){
  const m = new THREE.MeshStandardMaterial({ map: texture, roughness: .8, metalness: 0 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), m);
  box.castShadow = true;
  return box;
}

function coin(r = .82, faceTex){
  const g = new THREE.Group();
  const side = new THREE.MeshStandardMaterial({ color: 0xF0B22A, roughness: .38, metalness: .28 });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, roughness: .36, metalness: .24 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * .17, 40), [side, face, face]);
  m.rotation.x = Math.PI / 2;
  m.castShadow = true;
  g.add(m);
  return g;
}

function starShape(outer, inner){
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++){
    const rad = i % 2 ? inner : outer;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

function star(size = 1){
  const geo = new THREE.ExtrudeGeometry(starShape(size, size * .44), {
    depth: size * .3, bevelEnabled: true,
    bevelThickness: size * .07, bevelSize: size * .07, bevelSegments: 2, curveSegments: 2
  });
  geo.center();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xFFD447, roughness: .3, metalness: .32, emissive: 0xF0A800, emissiveIntensity: .12
  }));
  m.castShadow = true;
  return m;
}

function mushroom(capColor = C.red, scale = 1){
  const g = new THREE.Group();
  const cream = solid(C.cream, { roughness: .72 });

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(1, 42, 26, 0, Math.PI * 2, 0, Math.PI * .55),
    solid(capColor, { roughness: .5 })
  );
  cap.castShadow = true;
  g.add(cap);

  const rimY = Math.cos(Math.PI * .55), rimR = Math.sin(Math.PI * .55);
  const under = new THREE.Mesh(new THREE.CircleGeometry(rimR, 42), cream);
  under.rotation.x = Math.PI / 2;
  under.position.y = rimY;
  g.add(under);

  const SPOTS = [[.52, .0, .26], [.86, 1.26, .30], [.46, 2.51, .22],
                 [.92, 3.77, .27], [.60, 5.03, .24], [.22, 2.0, .16]];
  SPOTS.forEach(([phi, theta, r]) => {
    const spot = new THREE.Mesh(new THREE.CircleGeometry(r, 26), cream);
    spot.position.setFromSphericalCoords(1.008, phi, theta);
    spot.lookAt(spot.position.clone().multiplyScalar(2));
    g.add(spot);
  });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.46, .56, .8, 28), cream);
  stem.position.y = rimY - .38;
  stem.castShadow = true;
  g.add(stem);

  g.scale.setScalar(scale);
  return g;
}

function pipe(h = 2.6){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, h, 34), solid(C.green, { roughness: .45 }));
  body.position.y = -h / 2;
  body.castShadow = true;
  g.add(body);

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .55, 34), solid(C.pipeHi, { roughness: .42 }));
  rim.position.y = .27;
  rim.castShadow = true;
  g.add(rim);

  const mouth = new THREE.Mesh(new THREE.CylinderGeometry(.92, .92, .08, 34), solid(0x14532B));
  mouth.position.y = .55;
  g.add(mouth);

  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.005, 1.005, h * .9, 34, 1, true),
    new THREE.MeshStandardMaterial({ color: C.pipeLo, roughness: .5, transparent: true, opacity: .32,
      side: THREE.BackSide }));
  stripe.position.y = -h / 2;
  g.add(stripe);
  return g;
}

function cloud(scale = 1){
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: C.white, roughness: 1, metalness: 0 });
  [[0, 0, 0, 1], [-1.05, -.2, 0, .72], [1.05, -.16, 0, .78], [.5, .34, .2, .62], [-.5, .3, -.15, .58]]
    .forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 22, 16), m);
      s.position.set(x, y, z);
      g.add(s);
    });
  g.scale.setScalar(scale);
  return g;
}

function book(color, w = 1.75, t = .34){
  const g = new THREE.Group();
  const cover = new THREE.Mesh(new THREE.BoxGeometry(w, t, w * .7), solid(color, { roughness: .66 }));
  cover.castShadow = true;
  g.add(cover);
  const pages = new THREE.Mesh(new THREE.BoxGeometry(w * .93, t * .72, w * .66), solid(C.cream, { roughness: .9 }));
  pages.position.x = w * .035;
  g.add(pages);
  return g;
}

function microbe(size = 1){
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1),
    solid(0x3FA96B, { roughness: .42 }));
  body.castShadow = true;
  g.add(body);

  const spikeGeo = new THREE.ConeGeometry(size * .11, size * .38, 10);
  const spikeMat = solid(0x1E6FD9, { roughness: .4 });
  const up = new THREE.Vector3(0, 1, 0);
  const pos = body.geometry.attributes.position;
  const seen = new Set();
  for (let i = 0; i < pos.count; i++){
    const v = new THREE.Vector3().fromBufferAttribute(pos, i).normalize();
    const key = v.toArray().map(n => n.toFixed(1)).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const sp = new THREE.Mesh(spikeGeo, spikeMat);
    sp.position.copy(v).multiplyScalar(size * 1.02);
    sp.quaternion.setFromUnitVectors(up, v);
    g.add(sp);
  }
  return g;
}

function flagpole(){
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 6.4, 14), solid(0xB9C2CC, { roughness: .35, metalness: .4 }));
  pole.position.y = 1.2;
  pole.castShadow = true;
  g.add(pole);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(.26, 24, 18), shiny(C.gold));
  knob.position.y = 4.5;
  g.add(knob);

  const tri = new THREE.Shape();
  tri.moveTo(0, 0); tri.lineTo(1.5, -.55); tri.lineTo(0, -1.1); tri.closePath();
  const flag = new THREE.Mesh(
    new THREE.ExtrudeGeometry(tri, { depth: .05, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: C.red, roughness: .6, side: THREE.DoubleSide })
  );
  flag.position.set(.06, 4.05, 0);
  g.add(flag);
  g.userData.flag = flag;

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, .5, 1.5), solid(C.pipeHi));
  base.position.y = -2.2;
  base.castShadow = true;
  g.add(base);
  return g;
}

function castle(brickTex){
  const g = new THREE.Group();
  const m    = new THREE.MeshStandardMaterial({ map: brickTex, roughness: .85 });
  const trim = solid(0xB05C28, { roughness: .8 });
  const add = (w, h, d, x, y, z, plain) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plain ? trim : m);
    b.position.set(x, y, z); b.castShadow = true; g.add(b); return b;
  };
  add(4.4, 2.2, 1.8, 0, -.5, 0);                       // curtain wall, top at 0.6
  add(1.1, 3.4, 1.1, -1.85, .1, 0);                    // towers, top at 1.8
  add(1.1, 3.4, 1.1,  1.85, .1, 0);
  add(1.9, 1.6, 1.4, 0, 1.4, 0);                       // keep, 0.6 -> 2.2
  [-1.42, -.86, .86, 1.42].forEach(x => add(.42, .42, .5, x, .81, 0, true));
  [-.58, 0, .58].forEach(x => add(.38, .4, .45, x, 2.4, 0, true));
  [-1.85, 1.85].forEach(cx => [-.34, .34].forEach(o => add(.32, .38, .34, cx + o, 1.99, 0, true)));
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.2, .12), solid(0x22252F));
  door.position.set(0, -.98, .92);
  g.add(door);
  const win = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .1), solid(0x22252F));
  win.position.set(0, 1.5, .72);
  g.add(win);
  g.scale.setScalar(.88);
  return g;
}

/* ============================================================
   World
   ============================================================ */

export function createWorld(canvas, slides){
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err){
    return null;                      // no WebGL — the deck still runs flat
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 24, 58);

  const camera = new THREE.PerspectiveCamera(42, 1, .1, 120);

  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0xE3DCC8, 2.1));
  const key = new THREE.DirectionalLight(0xFFFFFF, 2.5);
  key.position.set(5, 11, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 42;
  key.shadow.camera.left = -12; key.shadow.camera.right = 12;
  key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
  key.shadow.bias = -0.0012;
  scene.add(key, key.target);

  const rim = new THREE.DirectionalLight(0xFFE2A8, .7);
  rim.position.set(-7, 4, -6);
  scene.add(rim);

  // Shadow catcher: an invisible floor, so props sit on the paper.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(GAP * (slides.length + 2), 60),
    new THREE.ShadowMaterial({ opacity: .12 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(GAP * (slides.length / 2), -3.1, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  const T = { q: questionFace(), coin: coinFace(), brick: brickFace() };
  const spinners = [];      // { obj, spin, bob, phase, y0, tilt }

  const float = (obj, { spin = .3, bob = .22, speed = 1, tilt = 0 } = {}) => {
    spinners.push({ obj, spin, bob, speed, tilt, phase: Math.random() * Math.PI * 2, y0: obj.position.y });
    return obj;
  };

  /* ---- build one station per slide ---- */
  slides.forEach((slide, i) => {
    const st = new THREE.Group();
    st.position.x = i * GAP;
    scene.add(st);
    build(slide.motif, st);
  });

  function build(motif, st){
    const put = (obj, x, y, z, s = 1) => { obj.position.set(x, y, z); obj.scale.multiplyScalar(s); st.add(obj); return obj; };

    switch (motif){

      case 'title': {
        float(put(questionBlock(1.9, T.q), 6.6, 2.4, -2.4), { spin: .22, bob: .28 });
        float(put(coin(.72, T.coin), 5.4, -1.8, -1.4), { spin: 1.5, bob: .34, speed: 1.3 });
        float(put(coin(.56, T.coin), -6.9, 2.8, -2.6), { spin: 1.4, bob: .3, speed: .9 });
        float(put(star(.85), 7.4, -.4, -.6), { spin: .5, bob: .26, tilt: .2 });
        float(put(mushroom(C.red, .85), -6.2, -1.9, -.4), { spin: .28, bob: .18, speed: .8 });
        float(put(mushroom(C.pipeHi, .5), 8.4, 1.4, -4.6), { spin: .3, bob: .2, speed: 1.1 });
        put(cloud(1.5), -8.4, 8.4, -15);
        put(cloud(1.2), 8.2, 9.6, -18);
        float(put(brickBlock(1.4, T.brick), -7.6, .6, -3.2), { spin: .12, bob: .1, speed: .7 });
        float(put(star(.44), -4.6, 4.4, -5.4), { spin: .7, bob: .3, speed: 1.2 });
        break;
      }

      case 'block': {
        float(put(questionBlock(2.3, T.q), 0, 1.3, 0), { spin: .25, bob: .3 });
        float(put(coin(.7, T.coin), 2.5, 3.4, -1.2), { spin: 1.6, bob: .3, speed: 1.2 });
        float(put(coin(.5, T.coin), -2.4, 2.4, -2.4), { spin: 1.3, bob: .26, speed: .85 });
        put(cloud(1.4), -7.4, 8.2, -16);
        float(put(brickBlock(1.4, T.brick), -2.6, -1.6, .3), { spin: .1, bob: .12, speed: .6 });
        break;
      }

      case 'blocks': {
        [-2.4, 0, 2.4].forEach((x, n) =>
          float(put(questionBlock(1.7, T.q), x, 1.1 + (n === 1 ? .9 : 0), n === 1 ? -.4 : 0),
                { spin: .2, bob: .26, speed: .8 + n * .18 }));
        float(put(coin(.55, T.coin), 0, 4.4, -1), { spin: 1.6, bob: .3 });
        put(cloud(1.3), 7.2, 10.2, -19);
        break;
      }

      case 'mushroom': {
        float(put(mushroom(C.red, 1.25), 0, .8, 0), { spin: .24, bob: .26 });
        float(put(mushroom(C.pipeHi, .72), 2.9, -.6, -1.4), { spin: .3, bob: .22, speed: 1.2 });
        float(put(mushroom(C.blue, .56), -2.8, -1.1, -.8), { spin: .26, bob: .2, speed: .9 });
        float(put(microbe(.52), 2.4, 3.3, -2.2), { spin: .55, bob: .28, speed: 1.1 });
        put(cloud(1.4), -7.6, 9.1, -14);
        break;
      }

      case 'pipe': {
        put(pipe(3.2), -.5, .6, 0);
        float(put(coin(.7, T.coin), .4, 3.4, 0), { spin: 1.7, bob: .42, speed: 1.4 });
        float(put(coin(.55, T.coin), 2.9, 2.2, -1.8), { spin: 1.4, bob: .3, speed: 1 });
        float(put(mushroom(C.pipeHi, .62), -2.7, -1.2, -.4), { spin: .26, bob: .2 });
        put(cloud(1.3), 7.0, 8.6, -17);
        float(put(brickBlock(1.3, T.brick), -2.9, 1.6, -1.2), { spin: .1, bob: .14, speed: .7 });
        break;
      }

      case 'clouds': {
        put(cloud(1.9), 8.6, 5.4, -17);
        put(cloud(1.35), 2.4, 9.8, -19);
        put(cloud(1.1), -6.8, 8.6, -16);
        put(cloud(.85), 11.2, 10.4, -21);
        float(put(questionBlock(1.6, T.q), 2.2, -.4, 0), { spin: .22, bob: .3 });
        float(put(star(.62), -2.2, .6, -1), { spin: .6, bob: .3, speed: 1.2 });
        float(put(coin(.5, T.coin), .2, -1.6, .4), { spin: 1.5, bob: .26 });
        break;
      }

      case 'coins': {
        [[0, 1.6, 0, .92], [2.7, 2.9, -1.6, .7], [-2.6, 2.2, -1.2, .62],
         [1.6, -.9, .6, .58], [-1.9, -1.4, -.4, .5], [3.4, .2, -2.6, .46]]
          .forEach(([x, y, z, r], n) =>
            float(put(coin(r, T.coin), x, y, z), { spin: 1.3 + n * .12, bob: .3, speed: .8 + n * .12 }));
        float(put(questionBlock(1.5, T.q), -3.2, -.2, -2.2), { spin: .2, bob: .22 });
        put(cloud(1.35), 7.2, 9.3, -16);
        break;
      }

      case 'books': {
        const cols = [C.red, C.blue, C.gold, C.green];
        cols.forEach((c, n) => {
          const b = put(book(c), .2, -1.25 + n * .42, 0);
          b.rotation.y = (n - 1.5) * .12;
          b.rotation.z = (n % 2 ? .012 : -.012);
        });
        float(put(book(C.blue, 1.5, .3), 3.3, 2.2, -1.8), { spin: .34, bob: .26, tilt: .14 });
        float(put(star(.78), -2.6, 1.6, -.6), { spin: .55, bob: .3, speed: 1.1 });
        float(put(star(.46), 3.4, 4.0, -2.8), { spin: .7, bob: .26, speed: .85 });
        put(cloud(1.35), -7.4, 8.4, -15);
        break;
      }

      case 'sky': {
        put(cloud(1.8), 7.8, 4.6, -16);
        put(cloud(1.3), 1.8, 9.4, -19);
        put(cloud(1.0), -7.2, 8.8, -17);
        put(cloud(.8), 11.6, 10.2, -22);
        float(put(star(.68), -2.4, 1.2, -.6), { spin: .5, bob: .3 });
        float(put(coin(.6, T.coin), 1.4, .2, .4), { spin: 1.5, bob: .3, speed: 1.1 });
        float(put(mushroom(C.blue, .6), 3.2, -1.4, -1.2), { spin: .26, bob: .2, speed: .9 });
        float(put(questionBlock(1.4, T.q), -1.4, -1.8, .2), { spin: .18, bob: .2, speed: .8 });
        break;
      }

      case 'microbe': {
        float(put(microbe(1.0), 10.6, 4.2, -4.4), { spin: .42, bob: .26 });
        float(put(microbe(.55), -11.6, 6.6, -6.4), { spin: .6, bob: .3, speed: 1.2 });
        float(put(mushroom(C.red, .8), -8.6, -4.4, -2.6), { spin: .26, bob: .2 });
        float(put(mushroom(C.gold, .6), 8.8, -4.6, -3.6), { spin: .3, bob: .2, speed: 1.1 });
        float(put(coin(.5, T.coin), 12.2, .4, -5), { spin: 1.4, bob: .3 });
        float(put(coin(.44, T.coin), -12.4, 1.2, -5.6), { spin: 1.3, bob: .3, speed: .9 });
        put(cloud(1.5), -11.2, 12.6, -20);
        put(cloud(1.2), 10.4, 10.8, -19);
        break;
      }

      case 'question': {
        float(put(questionBlock(2.2, T.q), -.2, .9, 0), { spin: .2, bob: .3 });
        [[1.5, 3.4, -.4, .6], [-1.9, 3.6, -1.2, .5], [.1, 4.6, -2, .44]]
          .forEach(([x, y, z, r], n) =>
            float(put(coin(r, T.coin), x, y, z), { spin: 1.5 + n * .15, bob: .34, speed: 1 + n * .15 }));
        float(put(brickBlock(1.5, T.brick), 2.9, .9, -1.4), { spin: .1, bob: .14, speed: .7 });
        put(cloud(1.4), -7.6, 9.9, -20);
        break;
      }

      case 'flag': {
        put(flagpole(), 1.4, .6, 0);
        float(put(star(.7), -2.4, 2.4, -1), { spin: .55, bob: .3 });
        float(put(coin(.55, T.coin), -1.2, .4, .6), { spin: 1.5, bob: .3, speed: 1.2 });
        float(put(mushroom(C.red, .6), -3.1, -1.4, -.4), { spin: .26, bob: .2, speed: .9 });
        put(cloud(1.3), 7.2, 8.3, -15);
        break;
      }

      case 'castle': {
        put(castle(T.brick), 1.4, -1.35, -1.8);
        float(put(star(1.05), -2.8, 2.6, .8), { spin: .5, bob: .32 });
        float(put(star(.5), 3.6, 3.4, -1.4), { spin: .7, bob: .28, speed: 1.2 });
        float(put(coin(.55, T.coin), -3.2, -.4, 1), { spin: 1.5, bob: .3, speed: 1.1 });
        put(cloud(1.5), -7.8, 10.6, -18);
        put(cloud(1.15), 8.0, 9.3, -16);
        break;
      }
    }
  }

  /* ---- drifting props between stations, so travel never looks empty ---- */
  const span = GAP * (slides.length - 1);
  for (let i = 0; i < 40; i++){
    const pick = i % 3;
    const o = pick === 0 ? coin(.3 + Math.random() * .2, T.coin)
            : pick === 1 ? star(.26 + Math.random() * .16)
            : cloud(.4 + Math.random() * .3);
    o.position.set(
      -GAP * .5 + Math.random() * (span + GAP),
      7.6 + Math.random() * 9,
      -30 + Math.random() * 13
    );
    scene.add(o);
    float(o, { spin: .3 + Math.random(), bob: .3 + Math.random() * .4, speed: .5 + Math.random() });
  }

  /* ---- camera travel ---- */
  let index = 0, fromI = 0, toI = 0, from = 0, to = 0, t = 1, dur = 1050, dir = 1, start = 0;
  let narrow = innerWidth < 860;
  const pointer = { x: 0, y: 0, cx: 0, cy: 0 };
  const clock = new THREE.Clock();

  // Each slide gets its own framing: the centred title screen and the wide
  // three-column slide want the props spread around them, not shouldered aside.
  function frame(i){
    const s = slides[i] || slides[0];
    if (narrow)               return { shift: 0,     z: 16.5, y: s.layout === 'title' ? .6 : -1.9 };
    if (s.layout === 'title') return { shift: 0,     z: 13.8, y: 1.15 };
    if (s.wide)               return { shift: 0,     z: 17.5, y: 1.15 };
    return                           { shift: SHIFT, z: 12.6, y: 1.15 };
  }

  function resize(){
    const w = innerWidth, h = innerHeight;
    narrow = w < 860;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = narrow ? 52 : 42;
    camera.updateProjectionMatrix();
  }

  function goTo(i, instant){
    fromI = index; toI = i;
    from = index * GAP; to = i * GAP;
    dir = Math.sign(to - from) || 1;
    index = i;
    if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches){
      t = 1;
    } else {
      t = 0; start = performance.now();
      dur = 780 + Math.min(Math.abs(to - from) / GAP, 4) * 130;
    }
  }

  function setPointer(nx, ny){ pointer.x = nx; pointer.y = ny; }

  function render(){
    const now = performance.now();
    const el = clock.getElapsedTime();

    if (t < 1){
      t = Math.min(1, (now - start) / dur);
    }
    const k = ease(t);
    const x = from + (to - from) * k;

    // the cinematic part: pull back and bank slightly through the middle
    const arc = Math.sin(k * Math.PI);
    pointer.cx += (pointer.x - pointer.cx) * .05;
    pointer.cy += (pointer.y - pointer.cy) * .05;

    const fA = frame(fromI), fB = frame(toI);
    const sh = fA.shift + (fB.shift - fA.shift) * k;
    const cz = fA.z + (fB.z - fA.z) * k;
    const cy = fA.y + (fB.y - fA.y) * k;

    camera.position.set(
      x - sh + pointer.cx * .85,
      cy + arc * .55 + pointer.cy * .5,
      cz + arc * 3.4
    );
    camera.rotation.set(pointer.cy * -.012, pointer.cx * .012, arc * .026 * -dir);

    key.position.set(x + 5, 11, 8);
    key.target.position.set(x, 0, 0);
    key.target.updateMatrixWorld();

    for (const s of spinners){
      s.obj.rotation.y += s.spin * .009 * s.speed;
      if (s.tilt) s.obj.rotation.z = Math.sin(el * .6 * s.speed + s.phase) * s.tilt;
      s.obj.position.y = s.y0 + Math.sin(el * .85 * s.speed + s.phase) * s.bob;
    }

    renderer.render(scene, camera);
  }

  resize();
  return { goTo, setPointer, resize, render, renderer };
}
