"use client";

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import {
  COLORS, SIZES, PEDAZL_STONES, DOT_COLORS, FIELD_MODES,
  PEDAZL_PRICE_PER_CHAR, PEDAZL_IMAGE_PRICE, ENGRAVE_PRICE, GLOSSY_PRICE, SMOOTH_PRICE,
  type SizeKey, type Texture, type ThermalState,
} from "./config";
import type { PedazlMode } from "./shellTexture";
import { COLS, MIN_ROWS, normaliseName, type FieldMode } from "./punchcard";

export type Build = {
  size: SizeKey;
  colorId: string;
  texture: Texture;
  /** what runs through the punchcard field */
  fieldMode: FieldMode;
  /** the name fed through the field, and printed on the [ NAME ] plate */
  engraveName: string;
  /** generation of Conway's Life to freeze on, for fieldMode "life" */
  lifeGen: number;
  /** hand-punched cells for fieldMode "draw" */
  drawCells: string;
  dotColorId: string;
  pedazlMode: PedazlMode;
  pedazlText: string;
  pedazlImageUrl: string | null;
  stoneId: string;
  density: number;
};

export const EMPTY_DRAW = "0".repeat(COLS * MIN_ROWS);

export const DEFAULT_BUILD: Build = {
  size: "750",
  colorId: "coded-navy",
  texture: "matte",
  fieldMode: "name",
  engraveName: "MOUDHI",
  lifeGen: 12,
  drawCells: EMPTY_DRAW,
  dotColorId: "white",
  pedazlMode: "none",
  pedazlText: "",
  pedazlImageUrl: null,
  stoneId: "crystal",
  density: 0.5,
};

export type BagLine = {
  key: string;
  kind: "thumbler" | "box";
  build?: Build;
  qty: number;
  unitPrice: number;
  label: string;
  labelAr: string;
};

export function colorOf(b: Build) {
  return COLORS.find((c) => c.id === b.colorId) ?? COLORS[0];
}
export function sizeOf(b: Build) {
  return SIZES.find((s) => s.id === b.size) ?? SIZES[1];
}
export function stoneOf(b: Build) {
  return PEDAZL_STONES.find((s) => s.id === b.stoneId) ?? PEDAZL_STONES[0];
}
export function dotOf(b: Build) {
  return DOT_COLORS.find((d) => d.id === b.dotColorId) ?? DOT_COLORS[0];
}
export function fieldModeOf(b: Build) {
  return FIELD_MODES.find((m) => m.id === b.fieldMode) ?? FIELD_MODES[0];
}

/** True when the field carries something the customer chose. */
function hasEngraving(b: Build) {
  if (b.fieldMode === "draw") return b.drawCells.includes("1");
  return Boolean(normaliseName(b.engraveName));
}

export function priceOf(b: Build) {
  let p = sizeOf(b).priceKD;
  if (hasEngraving(b)) p += ENGRAVE_PRICE;
  if (b.texture === "glossy") p += GLOSSY_PRICE;
  if (b.texture === "smooth") p += SMOOTH_PRICE;
  if (b.pedazlMode === "text") p += Math.max(1, b.pedazlText.trim().length) * PEDAZL_PRICE_PER_CHAR;
  if (b.pedazlMode === "initials") p += Math.max(1, b.pedazlText.trim().slice(0, 3).length) * PEDAZL_PRICE_PER_CHAR * 1.6;
  if (b.pedazlMode === "image") p += PEDAZL_IMAGE_PRICE;
  return Math.round(p * 1000) / 1000;
}

export function priceBreakdown(b: Build) {
  const rows: { key: string; en: string; ar: string; kd: number }[] = [];
  const s = sizeOf(b);
  rows.push({ key: "base", en: `${s.en} thumbler`, ar: `ترمس ${s.ar}`, kd: s.priceKD });

  if (hasEngraving(b)) {
    const m = fieldModeOf(b);
    rows.push({ key: "engrave", en: `Punchcard engraving · ${m.en}`, ar: `نقش الحقل · ${m.ar}`, kd: ENGRAVE_PRICE });
  }
  if (b.texture === "glossy") rows.push({ key: "tex", en: "Glossy finish", ar: "تشطيب لامع", kd: GLOSSY_PRICE });
  if (b.texture === "smooth") rows.push({ key: "tex", en: "Smooth finish", ar: "تشطيب ناعم", kd: SMOOTH_PRICE });

  if (b.pedazlMode === "text") {
    const n = Math.max(1, b.pedazlText.trim().length);
    rows.push({ key: "pz", en: `Pedazl · ${n} characters`, ar: `بيدازل · ${n} حرف`, kd: n * PEDAZL_PRICE_PER_CHAR });
  }
  if (b.pedazlMode === "initials") {
    const n = Math.max(1, b.pedazlText.trim().slice(0, 3).length);
    rows.push({ key: "pz", en: `Pedazl · ${n} initials`, ar: `بيدازل · ${n} حرف أول`, kd: n * PEDAZL_PRICE_PER_CHAR * 1.6 });
  }
  if (b.pedazlMode === "image") {
    rows.push({ key: "pz", en: "Pedazl · traced image", ar: "بيدازل · صورة مرصوصة", kd: PEDAZL_IMAGE_PRICE });
  }
  return rows;
}

/* ─────────────────────────── share links ─────────────────────────── */

export function encodeBuild(b: Build) {
  return [
    b.size, b.colorId, b.texture, b.fieldMode, b.dotColorId,
    String(b.lifeGen), b.pedazlMode, b.stoneId, String(Math.round(b.density * 100)),
    encodeURIComponent(b.engraveName), encodeURIComponent(b.pedazlText),
  ].join("~");
}

export function decodeBuild(s: string): Partial<Build> {
  const p = s.split("~");
  if (p.length < 9) return {};
  const out: Partial<Build> = {};
  if (SIZES.some((x) => x.id === p[0])) out.size = p[0] as SizeKey;
  if (COLORS.some((x) => x.id === p[1])) out.colorId = p[1];
  if (["smooth", "glossy", "matte"].includes(p[2])) out.texture = p[2] as Texture;
  if (FIELD_MODES.some((m) => m.id === p[3])) out.fieldMode = p[3] as FieldMode;
  if (DOT_COLORS.some((x) => x.id === p[4])) out.dotColorId = p[4];
  const g = Number(p[5]);
  if (!Number.isNaN(g)) out.lifeGen = Math.max(0, Math.min(400, g));
  if (["none", "text", "initials", "image"].includes(p[6])) out.pedazlMode = p[6] as PedazlMode;
  if (PEDAZL_STONES.some((x) => x.id === p[7])) out.stoneId = p[7];
  const d = Number(p[8]);
  if (!Number.isNaN(d)) out.density = Math.min(1, Math.max(0, d / 100));
  if (p[9]) out.engraveName = normaliseName(decodeURIComponent(p[9]));
  if (p[10]) out.pedazlText = decodeURIComponent(p[10]).slice(0, 24);
  return out;
}

/* ─────────────────────────── context ─────────────────────────── */

type Ctx = {
  build: Build;
  set: <K extends keyof Build>(k: K, v: Build[K]) => void;
  patch: (p: Partial<Build>) => void;
  reset: () => void;
  toggleCell: (index: number) => void;
  clearDraw: () => void;
  thermal: ThermalState;
  setThermal: (t: ThermalState) => void;
  price: number;
  bag: BagLine[];
  addToBag: (line: Omit<BagLine, "key">) => void;
  removeFromBag: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  bagCount: number;
  bagTotal: number;
};

const BuildContext = createContext<Ctx | null>(null);

export function BuildProvider({ children }: { children: React.ReactNode }) {
  const [build, setBuild] = useState<Build>(DEFAULT_BUILD);
  const [thermal, setThermal] = useState<ThermalState>("ambient");
  const [bag, setBag] = useState<BagLine[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#b=")) {
      const p = decodeBuild(hash.slice(3));
      if (Object.keys(p).length) setBuild((b) => ({ ...b, ...p }));
    }
    try {
      const saved = window.localStorage.getItem("cupkw-bag");
      if (saved) setBag(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("cupkw-bag", JSON.stringify(bag));
    } catch {
      /* ignore */
    }
  }, [bag]);

  const set = useCallback(<K extends keyof Build>(k: K, v: Build[K]) => {
    setBuild((b) => ({ ...b, [k]: v }));
  }, []);

  const patch = useCallback((p: Partial<Build>) => setBuild((b) => ({ ...b, ...p })), []);
  const reset = useCallback(() => setBuild(DEFAULT_BUILD), []);

  const toggleCell = useCallback((index: number) => {
    setBuild((b) => {
      const cells = b.drawCells.length === COLS * MIN_ROWS ? b.drawCells : EMPTY_DRAW;
      if (index < 0 || index >= cells.length) return b;
      const next = cells.slice(0, index) + (cells[index] === "1" ? "0" : "1") + cells.slice(index + 1);
      return { ...b, drawCells: next, fieldMode: "draw" };
    });
  }, []);

  const clearDraw = useCallback(() => setBuild((b) => ({ ...b, drawCells: EMPTY_DRAW })), []);

  const addToBag = useCallback((line: Omit<BagLine, "key">) => {
    setBag((prev) => [...prev, { ...line, key: `${line.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }]);
  }, []);

  const removeFromBag = useCallback((key: string) => {
    setBag((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setBag((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)));
  }, []);

  const price = useMemo(() => priceOf(build), [build]);
  const bagCount = useMemo(() => bag.reduce((n, l) => n + l.qty, 0), [bag]);
  const bagTotal = useMemo(() => Math.round(bag.reduce((n, l) => n + l.qty * l.unitPrice, 0) * 1000) / 1000, [bag]);

  return (
    <BuildContext.Provider
      value={{
        build, set, patch, reset, toggleCell, clearDraw,
        thermal, setThermal, price,
        bag, addToBag, removeFromBag, setQty, bagCount, bagTotal,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used inside BuildProvider");
  return ctx;
}
