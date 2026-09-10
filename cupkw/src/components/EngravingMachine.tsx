"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Play, Pause, Shuffle, Eraser, Type } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useBuild, dotOf, colorOf } from "@/lib/build-store";
import { DOT_COLORS, FIELD_MODES } from "@/lib/config";
import { COLS, MAX_CHARS, normaliseName, resolveField, sigilCode, type Field } from "@/lib/punchcard";
import { thermalColor } from "@/lib/shellTexture";

/* ─────────────────── the 2D field, as it appears on the shell ─────────────────── */

export function FieldPreview({
  field,
  dotHex,
  shellHex,
  onToggle,
  plate,
  className = "",
}: {
  field: Field;
  dotHex: string;
  shellHex: string;
  onToggle?: (index: number) => void;
  plate?: string;
  className?: string;
}) {
  const pitch = 100 / COLS;
  const r = pitch * 0.3;
  const viewH = field.rows * pitch;

  return (
    <div
      className={["relative overflow-hidden rounded-2xl", className].join(" ")}
      style={{ background: `linear-gradient(100deg, ${shellHex}CC, ${shellHex} 38%, ${shellHex}AA)` }}
    >
      <div className="flex flex-col items-center px-3 py-3">
        {/* CODED mark */}
        <span
          className="mb-2 rounded-[3px] border px-2 py-0.5 text-[8px] font-bold tracking-[0.18em]"
          style={{ borderColor: dotHex, color: dotHex }}
        >
          CODED
        </span>

        <svg
          viewBox={`0 0 100 ${viewH}`}
          className="w-full"
          style={{ maxHeight: 320 }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Punchcard field"
        >
          {Array.from({ length: field.rows }).map((_, y) =>
            Array.from({ length: COLS }).map((__, x) => {
              const i = y * COLS + x;
              const lit = field.cells[i] === 1;
              return (
                <circle
                  key={i}
                  cx={pitch * (x + 0.5)}
                  cy={pitch * (y + 0.5)}
                  r={lit ? r * 1.14 : r * 0.8}
                  fill={lit ? dotHex : dotHex}
                  opacity={lit ? 1 : 0.17}
                  onClick={onToggle ? () => onToggle(i) : undefined}
                  style={onToggle ? { cursor: "pointer" } : undefined}
                />
              );
            })
          )}
        </svg>

        {plate !== undefined && (
          <span className="mt-2 text-[8.5px] font-semibold tracking-[0.16em]" style={{ color: dotHex }}>
            [ {plate || "CUP KW"} ]
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── the machine ─────────────────── */

export default function EngravingMachine({ compact = false }: { compact?: boolean }) {
  const { t, pick, num } = useI18n();
  const { build, patch, toggleCell, clearDraw, thermal } = useBuild();
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);

  const color = colorOf(build);
  const shellHex = thermalColor({ base: color.base, cold: color.cold, hot: color.hot, thermal });
  const dotHex = dotOf(build).hex;

  // Life runs forward on a timer; the generation the customer keeps is build.lifeGen
  useEffect(() => {
    if (!running || build.fieldMode !== "life") return;
    const id = setInterval(() => setTick((n) => n + 1), 420);
    return () => clearInterval(id);
  }, [running, build.fieldMode]);

  useEffect(() => {
    if (!running || build.fieldMode !== "life") return;
    patch({ lifeGen: build.lifeGen > 300 ? 0 : build.lifeGen + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const field = useMemo(
    () =>
      resolveField({
        mode: build.fieldMode,
        name: build.engraveName,
        drawCells: build.drawCells,
        lifeGen: build.lifeGen,
      }),
    [build.fieldMode, build.engraveName, build.drawCells, build.lifeGen]
  );

  const litCount = useMemo(() => field.cells.reduce((n, v) => n + v, 0), [field]);
  const clean = normaliseName(build.engraveName);

  return (
    <div className="space-y-5">
      {!compact && (
        <div>
          <h3 className="font-display text-lg text-white">{t("eg.title")}</h3>
          <p className="mt-1 text-[12.5px] text-white/40 italic">{t("eg.tagline")}</p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/45">{t("eg.sub")}</p>
        </div>
      )}

      {/* ── the name input ── */}
      <div className="rounded-2xl border border-white/12 bg-black/25 p-4">
        <span className="label flex items-center gap-1.5">
          <Type size={11} /> {t("eg.name")}
        </span>
        <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/4 px-3 py-2">
          <span className="text-lg text-white/25">[</span>
          <input
            value={build.engraveName}
            onChange={(e) => patch({ engraveName: normaliseName(e.target.value) })}
            maxLength={MAX_CHARS}
            placeholder={t("eg.placeholder")}
            dir="ltr"
            className="min-w-0 flex-1 bg-transparent text-center font-display text-xl tracking-[0.22em] text-white outline-none placeholder:text-white/20"
            aria-label={t("eg.name")}
          />
          <span className="text-lg text-white/25">]</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between text-[10.5px]">
          <span className="text-white/35">
            {num(clean.length)}/{num(MAX_CHARS)} {t("eg.chars")}
          </span>
          <span className="text-white/45">
            {t("eg.sigilCode")}{" "}
            <span className="font-mono" dir="ltr">{sigilCode(build.engraveName)}</span>
          </span>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-white/25">{t("eg.latinOnly")}</p>
      </div>

      {/* ── mode ── */}
      <div>
        <span className="label">{t("eg.mode")}</span>
        <div className="grid grid-cols-4 gap-1.5">
          {FIELD_MODES.map((m) => {
            const on = build.fieldMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  patch({ fieldMode: m.id });
                  if (m.id !== "life") setRunning(false);
                }}
                className={[
                  "rounded-xl border px-2 py-2 text-[11px] font-bold tracking-wider uppercase transition-all",
                  on ? "border-white bg-white text-ink" : "border-white/12 bg-white/3 text-white/50 hover:border-white/35",
                ].join(" ")}
              >
                {pick(m)}
              </button>
            );
          })}
        </div>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/40">
          {pick({ en: FIELD_MODES.find((m) => m.id === build.fieldMode)!.enDesc, ar: FIELD_MODES.find((m) => m.id === build.fieldMode)!.arDesc })}
        </p>
      </div>

      {/* ── mode-specific controls ── */}
      {build.fieldMode === "life" && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label !mb-0">
              {t("eg.gen")} <span className="font-mono text-white/70">{num(build.lifeGen)}</span>
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setRunning((v) => !v)}
                className={[
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                  running ? "border-white bg-white text-ink" : "border-white/15 text-white/60 hover:border-white/45",
                ].join(" ")}
              >
                {running ? <Pause size={11} /> : <Play size={11} />}
                {running ? t("eg.pause") : t("eg.play")}
              </button>
              <button
                onClick={() => patch({ lifeGen: 0 })}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/60 transition-all hover:border-white/45"
              >
                <Shuffle size={11} />
                {t("eg.reseed")}
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={1}
            value={Math.min(120, build.lifeGen)}
            onChange={(e) => {
              setRunning(false);
              patch({ lifeGen: Number(e.target.value) });
            }}
            className="mt-3 w-full accent-brand-lift"
            aria-label={t("eg.gen")}
          />
        </div>
      )}

      {build.fieldMode === "draw" && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/3 p-3.5">
          <p className="text-[11.5px] leading-snug text-white/45">{t("eg.drawHint")}</p>
          <button
            onClick={clearDraw}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/60 transition-all hover:border-white/45"
          >
            <Eraser size={11} />
            {t("eg.clear")}
          </button>
        </div>
      )}

      {/* ── dot colour ── */}
      <div>
        <span className="label">{t("cz.dotColor")}</span>
        <div className="flex flex-wrap gap-2">
          {DOT_COLORS.map((d) => {
            const on = build.dotColorId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => patch({ dotColorId: d.id })}
                title={pick(d)}
                aria-label={pick(d)}
                className={[
                  "h-9 w-9 rounded-xl border-2 transition-all",
                  on ? "scale-110 border-white" : "border-white/15 hover:border-white/50",
                ].join(" ")}
                style={{ background: d.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* ── the field, flat ── */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="label !mb-0">{t("eg.preview")}</span>
          <span className="text-[10.5px] text-white/35">
            {num(litCount)} {t("eg.lit")} · {num(COLS)}×{num(field.rows)}
          </span>
        </div>
        <div className="mt-2.5">
          <FieldPreview
            field={field}
            dotHex={dotHex}
            shellHex={shellHex}
            plate={clean}
            onToggle={build.fieldMode === "draw" ? toggleCell : undefined}
          />
        </div>
        <p className="mt-2 text-center text-[10.5px] text-white/25 italic">{t("eg.scroll")}</p>
      </div>
    </div>
  );
}
