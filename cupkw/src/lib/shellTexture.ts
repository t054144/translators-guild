import type { ThermalState } from "./config";
import { COLS, get, type Field } from "./punchcard";

export type PedazlMode = "none" | "text" | "initials" | "image";

export type ShellSpec = {
  base: string;
  cold: string;
  hot: string;
  thermal: ThermalState;
  /** colour the lit dots burn in */
  dotColor: string;
  /** the resolved punchcard field, or null for a bare shell */
  field: Field | null;
  /** what the [ NAME ] plate at the foot of the field reads */
  plate: string;
  pedazlMode: PedazlMode;
  pedazlText: string;
  pedazlImage: HTMLImageElement | null;
  stoneHex: string;
  stoneSpec: string;
  /** 0..1 — how tightly the crystals are packed */
  density: number;
};

/* ─────────────────────────── colour helpers ─────────────────────────── */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const s = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function shade(hex: string, amount: number) {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  const k = 1 + amount;
  return rgbToHex(r * k, g * k, b * k);
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** The colour the shell reads as, given what's inside it. */
export function thermalColor(spec: Pick<ShellSpec, "base" | "cold" | "hot" | "thermal">) {
  if (spec.thermal === "cold") return spec.cold;
  if (spec.thermal === "hot") return spec.hot;
  return spec.base;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   1. The shell — thermal gradient, condensation, heat bloom
   ═══════════════════════════════════════════════════════════════════════ */

const SHELL_W = 512;
const SHELL_H = 512;

export function buildShellCanvas(spec: ShellSpec): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SHELL_W;
  c.height = SHELL_H;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const target = thermalColor(spec);

  // The thermochromic layer only reacts where liquid touches the wall, so the
  // shift runs full at the base and fades out at the lip.
  const grad = ctx.createLinearGradient(0, SHELL_H, 0, 0);
  if (spec.thermal === "ambient") {
    grad.addColorStop(0, spec.base);
    grad.addColorStop(1, spec.base);
  } else {
    grad.addColorStop(0, target);
    grad.addColorStop(0.7, target);
    grad.addColorStop(0.9, mix(target, spec.base, 0.6));
    grad.addColorStop(1, spec.base);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SHELL_W, SHELL_H);

  if (spec.thermal === "cold") {
    const rng = makeRng(9001);
    for (let i = 0; i < 700; i++) {
      const x = rng() * SHELL_W;
      const y = SHELL_H * 0.06 + rng() * SHELL_H * 0.9;
      const r = 1 + rng() * 4.5;
      ctx.globalAlpha = 0.05 + rng() * 0.2;
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 18; i++) {
      const x = rng() * SHELL_W;
      const y0 = SHELL_H * 0.12 + rng() * SHELL_H * 0.3;
      ctx.globalAlpha = 0.08 + rng() * 0.12;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1 + rng() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x + (rng() - 0.5) * 6, y0 + 40 + rng() * 150);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (spec.thermal === "hot") {
    const g = ctx.createLinearGradient(0, SHELL_H, 0, 0);
    g.addColorStop(0, "rgba(255,120,40,0.20)");
    g.addColorStop(0.5, "rgba(255,160,60,0.08)");
    g.addColorStop(1, "rgba(255,220,180,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SHELL_W, SHELL_H);
  }

  return c;
}

/** Roughness map — matte is the original finish, glossy is near-mirror. */
export function buildRoughnessCanvas(texture: "smooth" | "glossy" | "matte"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const base = texture === "glossy" ? 24 : texture === "matte" ? 222 : 118;
  ctx.fillStyle = `rgb(${base},${base},${base})`;
  ctx.fillRect(0, 0, 256, 256);

  if (texture === "matte") {
    const rng = makeRng(4242);
    for (let i = 0; i < 5000; i++) {
      const v = 196 + rng() * 58;
      ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
      ctx.fillRect(rng() * 256, rng() * 256, 2, 2);
    }
  }
  return c;
}

/* ═══════════════════════════════════════════════════════════════════════
   2. The front decal — CODED mark, punchcard field, [ NAME ] plate
   ═══════════════════════════════════════════════════════════════════════ */

const DECAL_W = 256;
const DECAL_H = 1408;

/** Vertical layout of the front panel, as fractions of the decal height. */
const LAYOUT = {
  codedTop: 0.012,
  codedH: 0.052,
  fieldTop: 0.108,
  fieldBottom: 0.855,
  plateTop: 0.9,
  plateH: 0.052,
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * The boxed CODED mark above the field. On the real shell it is a hairline
 * rectangle with "COD" set light and "ED" set heavy — so the two weights are
 * drawn as separate runs rather than one string.
 */
function drawCodedMark(ctx: CanvasRenderingContext2D, ink: string) {
  const h = DECAL_H * LAYOUT.codedH;
  const y = DECAL_H * LAYOUT.codedTop;
  const w = DECAL_W * 0.8;
  const x = (DECAL_W - w) / 2;

  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.2, DECAL_W * 0.008); // hairline, as printed
  ctx.globalAlpha = 0.95;
  roundRect(ctx, x, y, w, h, h * 0.06);
  ctx.stroke();

  const size = h * 0.5;
  const track = size * 0.02;
  ctx.fillStyle = ink;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const lightFont = `300 ${size}px "Helvetica Neue", Arial, sans-serif`;
  const heavyFont = `800 ${size}px "Helvetica Neue", Arial, sans-serif`;

  ctx.letterSpacing = `${track}px`;
  ctx.font = lightFont;
  const wCod = ctx.measureText("COD").width;
  ctx.font = heavyFont;
  const wEd = ctx.measureText("ED").width;

  let tx = DECAL_W / 2 - (wCod + wEd) / 2;
  const ty = y + h * 0.53;

  ctx.font = lightFont;
  ctx.fillText("COD", tx, ty);
  tx += wCod;
  ctx.font = heavyFont;
  ctx.fillText("ED", tx, ty);

  ctx.restore();
}

/** The [ NAME ] plate at the foot of the field. */
function drawNamePlate(ctx: CanvasRenderingContext2D, ink: string, text: string) {
  const label = (text || "CUP KW").toUpperCase().slice(0, 12);
  const h = DECAL_H * LAYOUT.plateH;
  const y = DECAL_H * LAYOUT.plateTop;

  ctx.save();
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let size = h * 0.46;
  for (let i = 0; i < 30; i++) {
    ctx.font = `600 ${size}px "Helvetica Neue", Arial, sans-serif`;
    ctx.letterSpacing = `${size * 0.14}px`;
    if (ctx.measureText(`[ ${label} ]`).width <= DECAL_W * 0.88) break;
    size *= 0.93;
  }
  ctx.globalAlpha = 0.95;
  ctx.fillText(`[ ${label} ]`, DECAL_W / 2 + size * 0.07, y + h / 2);
  ctx.restore();
}

/**
 * The dot field. Every grid position carries a dot; the lit ones carry the
 * engraving. Unlit dots stay just visible, the way they do on the real shell.
 */
function drawField(ctx: CanvasRenderingContext2D, field: Field | null, dotColor: string, litOnDark: boolean) {
  const top = DECAL_H * LAYOUT.fieldTop;
  const bottom = DECAL_H * LAYOUT.fieldBottom;
  const areaH = bottom - top;
  const areaW = DECAL_W * 0.9;
  const left = (DECAL_W - areaW) / 2;

  const rows = field?.rows ?? 44;
  const pitchX = areaW / COLS;
  const pitchY = areaH / rows;
  const pitch = Math.min(pitchX, pitchY);
  const r = pitch * 0.29;

  // centre the grid in the panel
  const gridW = pitchX * COLS;
  const gridH = pitchY * rows;
  const ox = left + (areaW - gridW) / 2 + pitchX / 2;
  const oy = top + (areaH - gridH) / 2 + pitchY / 2;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < COLS; x++) {
      const cx = ox + x * pitchX;
      const cy = oy + y * pitchY;
      const lit = field ? get(field, x, y) : 0;

      ctx.beginPath();
      ctx.arc(cx, cy, lit ? r * 1.1 : r * 0.86, 0, Math.PI * 2);
      if (lit) {
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 1;
        ctx.fill();
        // a tiny shadow under the dot, the way the printed dots catch light
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy + r * 0.3, r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      } else {
        // unlit dots stay clearly visible — the grid is printed, not hidden
        ctx.fillStyle = litOnDark ? "#FFFFFF" : "#000000";
        ctx.globalAlpha = litOnDark ? 0.24 : 0.18;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

export function buildDecalCanvas(spec: ShellSpec): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = DECAL_W;
  c.height = DECAL_H;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  ctx.clearRect(0, 0, DECAL_W, DECAL_H);

  const shellLum = luminance(thermalColor(spec));
  const onDark = shellLum < 0.52;
  const ink = onDark ? "#FFFFFF" : "#15171C";

  drawCodedMark(ctx, ink);
  drawField(ctx, spec.field, spec.dotColor, onDark);
  drawNamePlate(ctx, ink, spec.plate);

  return c;
}

/* ═══════════════════════════════════════════════════════════════════════
   3. The Pedazl decal — hand-set crystals, on the back panel
   ═══════════════════════════════════════════════════════════════════════ */

const PZ = 640;

/**
 * Renders artwork as hand-set crystals: rasterise the source (text or image)
 * to a mask, then walk a hex grid over it and set a faceted stone wherever it
 * lands on ink. That is how a bedazzled piece is actually laid out.
 */
export function buildPedazlCanvas(spec: ShellSpec): HTMLCanvasElement | null {
  const { pedazlMode, pedazlText, pedazlImage, stoneHex, stoneSpec, density } = spec;
  if (pedazlMode === "none") return null;
  if (pedazlMode !== "image" && !pedazlText.trim()) return null;
  if (pedazlMode === "image" && !pedazlImage) return null;

  const c = document.createElement("canvas");
  c.width = PZ;
  c.height = PZ;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const mask = document.createElement("canvas");
  mask.width = PZ;
  mask.height = PZ;
  const m = mask.getContext("2d");
  if (!m) return null;

  m.clearRect(0, 0, PZ, PZ);
  m.fillStyle = "#000";

  if (pedazlMode === "image") {
    const img = pedazlImage!;
    const scale = Math.min((PZ * 0.92) / img.width, (PZ * 0.92) / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    m.drawImage(img, (PZ - dw) / 2, (PZ - dh) / 2, dw, dh);
  } else {
    const text = pedazlMode === "initials" ? pedazlText.slice(0, 3).toUpperCase() : pedazlText;
    const weight = pedazlMode === "initials" ? 800 : 700;
    m.textAlign = "center";
    m.textBaseline = "middle";
    let size = PZ * (pedazlMode === "initials" ? 0.62 : 0.3);
    for (let i = 0; i < 40; i++) {
      m.font = `${weight} ${size}px "Georgia", "Times New Roman", serif`;
      if (m.measureText(text).width <= PZ * 0.9) break;
      size *= 0.92;
    }
    m.fillText(text, PZ / 2, PZ / 2);
  }

  const data = m.getImageData(0, 0, PZ, PZ).data;
  const isInk = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= PZ || y >= PZ) return false;
    const i = (y * PZ + x) * 4;
    if (data[i + 3] < 60) return false;
    if (pedazlMode === "image") {
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      return lum < 0.72;
    }
    return true;
  };

  const stoneR = 17 - density * 8; // 17px .. 9px
  const pitch = stoneR * 2.02;
  const rowH = pitch * 0.866;

  let row = 0;
  for (let y = stoneR; y < PZ - stoneR / 2; y += rowH, row++) {
    const xOff = row % 2 ? pitch / 2 : 0;
    for (let x = stoneR + xOff; x < PZ - stoneR / 2; x += pitch) {
      if (!isInk(Math.round(x), Math.round(y))) continue;
      setStone(ctx, x, y, stoneR * 0.97, stoneHex, stoneSpec, (row * 31 + x) % 360);
    }
  }

  return c;
}

/** one faceted round-cut stone, drawn top-down */
function setStone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
  specHex: string,
  rot: number
) {
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.1, r * 1.02, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fill();

  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, shade(hex, 0.45));
  g.addColorStop(0.55, hex);
  g.addColorStop(1, shade(hex, -0.35));
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  const facets = 8;
  for (let i = 0; i < facets; i++) {
    const a0 = (i / facets) * Math.PI * 2;
    const a1 = ((i + 1) / facets) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a0) * r * 0.92, Math.sin(a0) * r * 0.92);
    ctx.lineTo(Math.cos(a1) * r * 0.92, Math.sin(a1) * r * 0.92);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? shade(hex, 0.22) : shade(hex, -0.12);
    ctx.globalAlpha = 0.85;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(cx - r * 0.22, cy - r * 0.28, r * 0.3, r * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = specHex;
  ctx.globalAlpha = 0.9;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx + r * 0.3, cy + r * 0.26, r * 0.11, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = 0.75;
  ctx.fill();
  ctx.globalAlpha = 1;
}
