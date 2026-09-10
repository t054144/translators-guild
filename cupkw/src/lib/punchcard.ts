/**
 * The punchcard field.
 *
 * The thumbler carries a grid of small dots down its front. Most sit dark; the
 * lit ones carry the engraving. A name is fed through the field as upright 5×7
 * dot-matrix glyphs stacked top to bottom — same name, same pattern, forever.
 */

export type FieldMode = "grid" | "name" | "sigil" | "life" | "draw";

export const COLS = 9;
export const MIN_ROWS = 44;
export const MAX_CHARS = 10;
export const GLYPH_W = 5;
export const GLYPH_H = 7;

/** A lit/unlit grid, row-major, `COLS` wide. */
export type Field = { cols: number; rows: number; cells: Uint8Array };

export function makeField(rows: number): Field {
  return { cols: COLS, rows, cells: new Uint8Array(COLS * rows) };
}

export function get(f: Field, x: number, y: number) {
  if (x < 0 || y < 0 || x >= f.cols || y >= f.rows) return 0;
  return f.cells[y * f.cols + x];
}
export function set(f: Field, x: number, y: number, v: number) {
  if (x < 0 || y < 0 || x >= f.cols || y >= f.rows) return;
  f.cells[y * f.cols + x] = v ? 1 : 0;
}

export function rowsForName(len: number) {
  return Math.max(MIN_ROWS, Math.max(1, len) * (GLYPH_H + 1) + 6);
}

/* ─────────────────────────── 5×7 dot-matrix font ─────────────────────────── */

/** Each glyph is 7 rows of 5 bits, MSB = leftmost column. */
const FONT: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x1f],
  J: [0x0f, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x19, 0x15, 0x13, 0x13, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  "3": [0x1f, 0x02, 0x04, 0x0e, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x1c],
  "&": [0x0c, 0x12, 0x12, 0x0c, 0x15, 0x12, 0x0d],
  ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  "-": [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  " ": [0, 0, 0, 0, 0, 0, 0],
};

export function normaliseName(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9&.\- ]/g, "")
    .slice(0, MAX_CHARS);
}

/** True when the field can actually render this character. */
export function isEngravable(ch: string) {
  return Boolean(FONT[ch.toUpperCase()]);
}

/* ─────────────────────────── modes ─────────────────────────── */

/** NAME — the name feeds through the field, one glyph per block, top to bottom. */
export function nameField(rawName: string): Field {
  const name = normaliseName(rawName) || "CUP KW";
  const chars = name.split("");
  const f = makeField(rowsForName(chars.length));
  const xOff = Math.floor((COLS - GLYPH_W) / 2);
  const top = Math.floor((f.rows - (chars.length * (GLYPH_H + 1) - 1)) / 2);

  chars.forEach((ch, i) => {
    const glyph = FONT[ch] ?? FONT[" "];
    const y0 = top + i * (GLYPH_H + 1);
    for (let gy = 0; gy < GLYPH_H; gy++) {
      const bits = glyph[gy];
      for (let gx = 0; gx < GLYPH_W; gx++) {
        if (bits & (1 << (GLYPH_W - 1 - gx))) set(f, xOff + gx, y0 + gy, 1);
      }
    }
  });

  return f;
}

/* ── a stable hash, so one name always makes one pattern ── */

export function hashName(raw: string) {
  const s = normaliseName(raw) || "CUP KW";
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** The four-hex-digit stamp shown under the input. */
export function sigilCode(raw: string) {
  return (hashName(raw) & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function rngFrom(seed: number) {
  let s = (seed || 1) >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** SIGIL — a mirror-symmetric mark derived from the name's hash. */
export function sigilField(rawName: string): Field {
  const seed = hashName(rawName);
  const rows = MIN_ROWS;
  const f = makeField(rows);
  const rnd = rngFrom(seed);
  const half = Math.ceil(COLS / 2);

  // a vertical spine plus symmetric limbs, so it always reads as a mark
  const cx = Math.floor(COLS / 2);
  for (let y = 4; y < rows - 4; y++) if (rnd() > 0.28) set(f, cx, y, 1);

  for (let y = 3; y < rows - 3; y++) {
    for (let x = 0; x < half; x++) {
      const bias = 1 - x / half; // denser near the spine
      if (rnd() < 0.2 + bias * 0.32) {
        set(f, cx - x, y, 1);
        set(f, cx + x, y, 1);
      }
    }
  }

  // knock out a few bands so it has structure rather than being pure noise
  for (let i = 0; i < 5; i++) {
    const y = 3 + Math.floor(rnd() * (rows - 6));
    const h = 1 + Math.floor(rnd() * 2);
    for (let yy = y; yy < y + h; yy++) for (let x = 0; x < COLS; x++) set(f, x, yy, 0);
  }

  return f;
}

/** LIFE — Conway's Game of Life, seeded from the name and wrapped on a torus. */
export function lifeSeed(rawName: string): Field {
  const base = nameField(rawName);
  // start from the name itself so the first frames still read as the engraving
  const f = makeField(base.rows);
  f.cells.set(base.cells);
  const rnd = rngFrom(hashName(rawName) ^ 0x9e3779b9);
  for (let i = 0; i < f.cells.length; i++) if (rnd() < 0.08) f.cells[i] = 1;
  return f;
}

export function lifeStep(f: Field): Field {
  const out = makeField(f.rows);
  for (let y = 0; y < f.rows; y++) {
    for (let x = 0; x < f.cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const xx = (x + dx + f.cols) % f.cols;
          const yy = (y + dy + f.rows) % f.rows;
          n += f.cells[yy * f.cols + xx];
        }
      }
      const alive = f.cells[y * f.cols + x];
      out.cells[y * f.cols + x] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return out;
}

/**
 * GRID — the field exactly as the shell is manufactured: a plain, uniform
 * punched grid, every dot lit. This is the stock thumbler, un-engraved.
 */
export function gridField(): Field {
  const f = makeField(MIN_ROWS);
  f.cells.fill(1);
  return f;
}

/** DRAW — a field the customer paints themselves. */
export function drawField(cells: string, rows = MIN_ROWS): Field {
  const f = makeField(rows);
  for (let i = 0; i < Math.min(cells.length, f.cells.length); i++) {
    f.cells[i] = cells[i] === "1" ? 1 : 0;
  }
  return f;
}

export function encodeCells(f: Field) {
  let s = "";
  for (let i = 0; i < f.cells.length; i++) s += f.cells[i] ? "1" : "0";
  return s;
}

/** Resolve whatever the customer picked into a concrete field. */
export function resolveField(opts: {
  mode: FieldMode;
  name: string;
  drawCells?: string;
  lifeGen?: number;
}): Field {
  if (opts.mode === "grid") return gridField();
  if (opts.mode === "sigil") return sigilField(opts.name);
  if (opts.mode === "draw") return drawField(opts.drawCells ?? "", MIN_ROWS);
  if (opts.mode === "life") {
    let f = lifeSeed(opts.name);
    const gens = Math.max(0, Math.min(400, opts.lifeGen ?? 0));
    for (let i = 0; i < gens; i++) f = lifeStep(f);
    return f;
  }
  return nameField(opts.name);
}
