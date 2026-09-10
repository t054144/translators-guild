"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Gem, Palette, Sparkles, Grid3x3, Type } from "lucide-react";
import Stage from "@/components/three/Stage";
import { FieldPreview } from "@/components/EngravingMachine";
import { useI18n } from "@/lib/i18n";
import { useBuild, DEFAULT_BUILD, type Build } from "@/lib/build-store";
import { COLORS, DOT_COLORS, FIELD_MODES, TEXTURES, PEDAZL_STONES } from "@/lib/config";
import { MAX_CHARS, normaliseName, resolveField, sigilCode } from "@/lib/punchcard";
import { thermalColor } from "@/lib/shellTexture";

/**
 * A working miniature of the studio on the home page: type a name, watch the
 * punchcard field re-weave on the model, then hand the whole build off to the
 * full studio.
 */
export default function CustomizeTeaser() {
  const { t, pick, num, lang } = useI18n();
  const { patch } = useBuild();

  const [demo, setDemo] = useState<Build>({
    ...DEFAULT_BUILD,
    colorId: "coded-navy",
    texture: "matte",
    fieldMode: "name",
    engraveName: "RETAJ",
    dotColorId: "white",
    stoneId: "gold",
    density: 0.6,
  });

  const set = <K extends keyof Build>(k: K, v: Build[K]) => setDemo((d) => ({ ...d, [k]: v }));

  const quickColors = ["coded-navy", "moudhi-rose", "matcha", "butter", "ink", "lavender", "terracotta", "pearl"];
  const color = COLORS.find((c) => c.id === demo.colorId)!;
  const shellHex = thermalColor({ base: color.base, cold: color.cold, hot: color.hot, thermal: "ambient" });
  const dotHex = DOT_COLORS.find((d) => d.id === demo.dotColorId)!.hex;
  const field = resolveField({ mode: demo.fieldMode, name: demo.engraveName, drawCells: demo.drawCells, lifeGen: demo.lifeGen });
  const clean = normaliseName(demo.engraveName);

  return (
    <section className="noise relative overflow-hidden bg-ink py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* ── the model ── */}
          <div className="lg:col-span-5">
            <div className="stage relative h-[54vh] min-h-[360px] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <Stage build={demo} thermal="ambient" autoSpin cinematic animateLife mood="dark" />
            </div>
          </div>

          {/* ── the flat field, as it will be punched ── */}
          <div className="hidden lg:col-span-2 lg:block">
            <FieldPreview field={field} dotHex={dotHex} shellHex={shellHex} plate={clean} />
          </div>

          {/* ── controls ── */}
          <div className="lg:col-span-5 lg:ps-4">
            <span className="t-eyebrow text-brand-lift">{t("eg.title")}</span>
            <h2 className="font-display t-section mt-3 text-white">{t("cz.title")}</h2>
            <p className="mt-3 text-[13px] text-white/35 italic">{t("eg.tagline")}</p>
            <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/50">{t("eg.sub")}</p>

            <div className="mt-7 space-y-5">
              {/* the name */}
              <div className="rounded-2xl border border-white/12 bg-black/25 p-4">
                <span className="label flex items-center gap-1.5">
                  <Type size={11} /> {t("eg.name")}
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/4 px-3 py-2">
                  <span className="text-lg text-white/25">[</span>
                  <input
                    value={demo.engraveName}
                    onChange={(e) => set("engraveName", normaliseName(e.target.value))}
                    maxLength={MAX_CHARS}
                    placeholder={t("eg.placeholder")}
                    dir="ltr"
                    aria-label={t("eg.name")}
                    className="min-w-0 flex-1 bg-transparent text-center font-display text-xl tracking-[0.2em] text-white outline-none placeholder:text-white/20"
                  />
                  <span className="text-lg text-white/25">]</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-[10.5px]">
                  <span className="text-white/35">
                    {num(clean.length)}/{num(MAX_CHARS)} {t("eg.chars")}
                  </span>
                  <span className="text-white/45">
                    {t("eg.sigilCode")}{" "}
                    <span className="font-mono" dir="ltr">{sigilCode(demo.engraveName)}</span>
                  </span>
                </div>
              </div>

              {/* mode */}
              <div>
                <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  <Grid3x3 size={12} /> {t("eg.mode")}
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {FIELD_MODES.map((m) => {
                    const on = demo.fieldMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => set("fieldMode", m.id)}
                        className={[
                          "rounded-xl border px-2 py-2 text-[10.5px] font-bold tracking-wider uppercase transition-all",
                          on ? "border-white bg-white text-ink" : "border-white/12 bg-white/3 text-white/50 hover:border-white/35",
                        ].join(" ")}
                      >
                        {pick(m)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* colour */}
              <div>
                <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  <Palette size={12} /> {t("cz.step.color")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickColors.map((id) => {
                    const c = COLORS.find((x) => x.id === id)!;
                    const on = demo.colorId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => set("colorId", id)}
                        title={pick(c)}
                        aria-label={pick(c)}
                        className={[
                          "h-9 w-9 rounded-xl border-2 transition-all",
                          on ? "scale-110 border-white" : "border-white/15 hover:border-white/50",
                        ].join(" ")}
                        style={{ background: `linear-gradient(140deg, ${c.base}, ${c.base}AA)` }}
                      />
                    );
                  })}
                  <Link
                    href="/customize"
                    className="grid h-9 place-items-center rounded-xl border border-white/15 px-3 text-[11px] font-semibold text-white/60 transition-colors hover:border-white/45 hover:text-white"
                  >
                    +{num(COLORS.length - quickColors.length)}
                  </Link>
                </div>
              </div>

              {/* finish + dots + pedazl */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                    <Sparkles size={12} /> {t("cz.step.texture")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXTURES.map((x) => {
                      const on = demo.texture === x.id;
                      return (
                        <button
                          key={x.id}
                          onClick={() => set("texture", x.id)}
                          className={[
                            "rounded-full border px-3 py-1.5 text-[10.5px] font-medium transition-all",
                            on ? "border-white bg-white text-ink" : "border-white/12 text-white/50 hover:border-white/40",
                          ].join(" ")}
                        >
                          {pick(x)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                    {t("cz.dotColor")}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DOT_COLORS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => set("dotColorId", d.id)}
                        title={pick(d)}
                        aria-label={pick(d)}
                        className={[
                          "h-7 w-7 rounded-lg border-2 transition-all",
                          demo.dotColorId === d.id ? "scale-110 border-white" : "border-white/15 hover:border-white/45",
                        ].join(" ")}
                        style={{ background: d.hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* pedazl */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
                <span className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  <Gem size={12} /> {t("cz.pedazl.title")}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={demo.pedazlText}
                    onChange={(e) =>
                      setDemo((d) => ({
                        ...d,
                        pedazlText: e.target.value.slice(0, 3),
                        pedazlMode: e.target.value ? "initials" : "none",
                      }))
                    }
                    maxLength={3}
                    placeholder={pick({ en: "Initials", ar: "أحرفك" })}
                    aria-label={t("cz.pedazl.initials")}
                    className="field !w-24 !py-2 text-center !text-[13px] font-semibold tracking-widest uppercase"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PEDAZL_STONES.slice(0, 7).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => set("stoneId", s.id)}
                        title={pick(s)}
                        aria-label={pick(s)}
                        className={[
                          "h-7 w-7 rounded-full border-2 transition-all",
                          demo.stoneId === s.id ? "scale-110 border-white" : "border-white/15 hover:border-white/50",
                        ].join(" ")}
                        style={{ background: `radial-gradient(circle at 34% 30%, ${s.spec}, ${s.hex} 58%, #00000055)` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2.5 text-[10.5px] text-white/30">
                  {pick({ en: "Crystals set on the back panel.", ar: "الكريستال يُرصّ على الجهة الخلفية." })}
                </p>
              </div>
            </div>

            <Link href="/customize" onClick={() => patch(demo)} className="btn btn-primary mt-8">
              {lang === "ar" ? "افتح الاستوديو كاملاً" : "Open the full studio"}
              <ArrowRight size={15} className={lang === "ar" ? "rotate-180" : ""} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
