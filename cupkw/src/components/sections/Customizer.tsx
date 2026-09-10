"use client";

import React, { useRef, useState } from "react";
import {
  Ruler, Palette, Grid3x3, Sparkles, Gem, ClipboardCheck, Circle as CircleIcon,
  Snowflake, Flame, Upload, Check, RotateCcw, Link2, ShoppingBag, Layers, Tag, X,
} from "lucide-react";
import Stage from "@/components/three/Stage";
import EngravingMachine from "@/components/EngravingMachine";
import { useI18n } from "@/lib/i18n";
import { useBuild, priceBreakdown, colorOf, sizeOf, stoneOf, dotOf, fieldModeOf, encodeBuild } from "@/lib/build-store";
import {
  COLORS, SIZES, TEXTURES, PEDAZL_STONES, type ThermalState, type PartId,
} from "@/lib/config";
import { normaliseName, sigilCode } from "@/lib/punchcard";
import { luminance, type PedazlMode } from "@/lib/shellTexture";

type StepId = "size" | "color" | "dots" | "texture" | "pedazl" | "review";

export default function Customizer() {
  const { t, pick, num } = useI18n();
  const { build, patch, reset, thermal, setThermal, price, addToBag } = useBuild();

  const [step, setStep] = useState<StepId>("dots");
  const [exploded, setExploded] = useState(false);
  const [labels, setLabels] = useState(false);
  const [activePart, setActivePart] = useState<PartId | null>(null);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const color = colorOf(build);
  const size = sizeOf(build);
  const stone = stoneOf(build);
  const rows = priceBreakdown(build);

  const steps: { id: StepId; label: string; icon: React.ReactNode }[] = [
    { id: "dots", label: t("cz.step.dots"), icon: <Grid3x3 size={13} /> },
    { id: "size", label: t("cz.step.size"), icon: <Ruler size={13} /> },
    { id: "color", label: t("cz.step.color"), icon: <Palette size={13} /> },
    { id: "texture", label: t("cz.step.texture"), icon: <Sparkles size={13} /> },
    { id: "pedazl", label: t("cz.step.pedazl"), icon: <Gem size={13} /> },
    { id: "review", label: t("cz.step.review"), icon: <ClipboardCheck size={13} /> },
  ];

  const thermalBtns: { id: ThermalState; label: string; icon: React.ReactNode }[] = [
    { id: "ambient", label: t("cz.ambient"), icon: <CircleIcon size={11} /> },
    { id: "cold", label: t("cz.cold"), icon: <Snowflake size={11} /> },
    { id: "hot", label: t("cz.hot"), icon: <Flame size={11} /> },
  ];

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => patch({ pedazlImageUrl: String(r.result), pedazlMode: "image" });
    r.readAsDataURL(f);
  };

  const share = async () => {
    const url = `${window.location.origin}/customize#b=${encodeBuild(build)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.hash = `b=${encodeBuild(build)}`;
    }
  };

  const add = () => {
    addToBag({
      kind: "thumbler",
      qty: 1,
      unitPrice: price,
      build: { ...build },
      label: `${size.en} · ${color.en}`,
      labelAr: `${size.ar} · ${color.ar}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2600);
  };

  return (
    <section className="noise relative min-h-screen overflow-hidden bg-ink pt-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-35" />
      <div
        className="pointer-events-none absolute left-1/3 top-1/4 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full blur-[130px] transition-colors duration-1000"
        style={{
          background:
            thermal === "cold"
              ? "radial-gradient(circle, rgba(70,170,255,0.16), transparent 62%)"
              : thermal === "hot"
              ? "radial-gradient(circle, rgba(255,130,50,0.15), transparent 62%)"
              : `radial-gradient(circle, ${color.base}30, transparent 62%)`,
        }}
      />

      <div className="relative mx-auto max-w-[1500px] px-4 pt-10 pb-20 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="t-eyebrow text-brand-lift">{t("nav.customize")}</span>
          <h1 className="font-display t-section mt-3 text-white">{t("cz.title")}</h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/50">{t("cz.sub")}</p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-12">
          {/* ══════════ live model ══════════ */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="glass sticky top-20 overflow-hidden rounded-3xl">
              {/* viewer controls */}
              <div className="thin-scroll flex items-center gap-2 overflow-x-auto border-b border-white/8 px-3 py-2.5">
                <div className="flex shrink-0 rounded-full border border-white/12 p-0.5">
                  {thermalBtns.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setThermal(b.id)}
                      className={[
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-all",
                        thermal === b.id
                          ? b.id === "cold"
                            ? "bg-cool/20 text-cool"
                            : b.id === "hot"
                            ? "bg-warm/20 text-warm"
                            : "bg-white/12 text-white"
                          : "text-white/45 hover:text-white/85",
                      ].join(" ")}
                    >
                      {b.icon}
                      {b.label}
                    </button>
                  ))}
                </div>

                <span className="mx-0.5 h-5 w-px shrink-0 bg-white/12" />

                <button
                  onClick={() => setExploded((v) => !v)}
                  className={[
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all",
                    exploded ? "border-white/70 bg-white text-ink" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                  ].join(" ")}
                >
                  <Layers size={12} />
                  {exploded ? t("v3.assemble") : t("v3.explode")}
                </button>
                <button
                  onClick={() => setLabels((v) => !v)}
                  className={[
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all",
                    labels ? "border-white/70 bg-white text-ink" : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                  ].join(" ")}
                >
                  <Tag size={12} />
                  {t("v3.labels")}
                </button>
              </div>

              <div className="stage relative h-[52vh] min-h-[380px] sm:h-[62vh]">
                <Stage
                  exploded={exploded}
                  showLabels={labels}
                  autoSpin
                  animateLife
                  preset={step === "pedazl" ? "back" : "free"}
                  activePart={activePart}
                  onPickPart={setActivePart}
                  mood="dark"
                />
              </div>

              {/* live spec strip */}
              <div className="thin-scroll flex items-center gap-2 overflow-x-auto border-t border-white/8 px-4 py-3 text-[11.5px]">
                {[
                  { k: t("cz.step.size"), v: pick(size) },
                  { k: t("cz.step.color"), v: pick(color) },
                  { k: t("cz.step.dots"), v: `${pick(fieldModeOf(build))} · ${normaliseName(build.engraveName) || "—"}` },
                  { k: t("cz.step.texture"), v: pick(TEXTURES.find((x) => x.id === build.texture)!) },
                  {
                    k: t("cz.step.pedazl"),
                    v:
                      build.pedazlMode === "none"
                        ? "—"
                        : build.pedazlMode === "image"
                        ? pick({ en: "Image", ar: "صورة" })
                        : build.pedazlText || "—",
                  },
                ].map((r) => (
                  <span key={r.k} className="shrink-0 rounded-full bg-white/6 px-3 py-1.5">
                    <span className="text-white/40">{r.k}: </span>
                    <span className="font-medium text-white/90">{r.v}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ controls ══════════ */}
          <div className="lg:col-span-5 xl:col-span-5">
            {/* step rail */}
            <div className="-mx-1 flex flex-wrap gap-1.5 px-1 pb-3">
              {steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={[
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all",
                    step === s.id
                      ? "border-brand-lift bg-brand text-white"
                      : "border-white/12 text-white/50 hover:border-white/35 hover:text-white",
                  ].join(" ")}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            <div className="glass rounded-3xl p-5 sm:p-6">
              {/* ─── SIZE ─── */}
              {step === "size" && (
                <div className="space-y-3">
                  {SIZES.map((s) => {
                    const on = build.size === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => patch({ size: s.id })}
                        className={[
                          "flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition-all",
                          on ? "border-brand-lift bg-brand/12" : "border-white/10 bg-white/3 hover:border-white/30",
                        ].join(" ")}
                      >
                        {/* to-scale bar */}
                        <span className="flex h-16 w-8 shrink-0 items-end justify-center">
                          <span
                            className="rounded-t-[3px] rounded-b-[5px]"
                            style={{
                              height: `${(s.heightMm / 285) * 100}%`,
                              width: `${(s.diameterMm / 95) * 26}px`,
                              background: `linear-gradient(100deg, ${color.base}, ${color.cold})`,
                            }}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="font-display text-lg text-white">{pick(s)}</span>
                            <span className="font-display text-lg text-white">
                              {num(s.priceKD)} <span className="text-[11px] text-white/45">{t("kd")}</span>
                            </span>
                          </span>
                          <span className="mt-1 block text-[12px] leading-snug text-white/45">
                            {pick({ en: s.enBlurb, ar: s.arBlurb })}
                          </span>
                          <span className="mt-1.5 block text-[10.5px] text-white/30">
                            {num(s.heightMm)} × {num(s.diameterMm)} mm
                          </span>
                        </span>
                        {on && <Check size={16} className="shrink-0 text-brand-lift" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ─── COLOUR ─── */}
              {step === "color" && (
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="label !mb-0">{t("cz.step.color")}</span>
                    <span className="text-[12px] font-medium text-white/70">{pick(color)}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2.5 sm:grid-cols-6">
                    {COLORS.map((c) => {
                      const on = build.colorId === c.id;
                      const shown = thermal === "cold" ? c.cold : thermal === "hot" ? c.hot : c.base;
                      return (
                        <button
                          key={c.id}
                          onClick={() => patch({ colorId: c.id })}
                          title={pick(c)}
                          aria-label={pick(c)}
                          className={[
                            "relative aspect-square rounded-2xl border-2 transition-all duration-300",
                            on ? "scale-105 border-white shadow-[0_8px_24px_-8px_rgba(255,255,255,0.5)]" : "border-white/12 hover:scale-105 hover:border-white/45",
                          ].join(" ")}
                          style={{ background: `linear-gradient(140deg, ${shown}, ${shown}CC 55%, ${shown}88)` }}
                        >
                          {on && (
                            <Check
                              size={14}
                              className="absolute inset-0 m-auto drop-shadow"
                              color={luminance(shown) > 0.55 ? "#111" : "#fff"}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* the three states of the chosen shell */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <span className="label">{t("cz.thermal")}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["ambient", "cold", "hot"] as ThermalState[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setThermal(s)}
                          className={[
                            "rounded-xl border p-2 transition-all",
                            thermal === s ? "border-white/60" : "border-white/10 hover:border-white/30",
                          ].join(" ")}
                        >
                          <span
                            className="block h-10 w-full rounded-lg"
                            style={{ background: s === "cold" ? color.cold : s === "hot" ? color.hot : color.base }}
                          />
                          <span className="mt-1.5 block text-[10.5px] text-white/55">
                            {s === "cold" ? t("cz.cold") : s === "hot" ? t("cz.hot") : t("cz.ambient")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ENGRAVING ─── */}
              {step === "dots" && <EngravingMachine />}

              {/* ─── TEXTURE ─── */}
              {step === "texture" && (
                <div className="space-y-3">
                  {TEXTURES.map((x) => {
                    const on = build.texture === x.id;
                    const shown = thermal === "cold" ? color.cold : thermal === "hot" ? color.hot : color.base;
                    return (
                      <button
                        key={x.id}
                        onClick={() => patch({ texture: x.id })}
                        className={[
                          "flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition-all",
                          on ? "border-brand-lift bg-brand/12" : "border-white/10 bg-white/3 hover:border-white/30",
                        ].join(" ")}
                      >
                        <span
                          className="h-14 w-14 shrink-0 rounded-2xl"
                          style={{
                            background:
                              x.id === "glossy"
                                ? `linear-gradient(125deg, #fff 2%, ${shown} 26%, #ffffff55 44%, ${shown} 62%, #00000066)`
                                : x.id === "matte"
                                ? `linear-gradient(125deg, ${shown}, ${shown}DD)`
                                : `linear-gradient(125deg, ${shown}, #ffffff33 40%, ${shown})`,
                            boxShadow: x.id === "glossy" ? "inset 0 0 18px rgba(255,255,255,0.4)" : "inset 0 0 12px rgba(0,0,0,0.25)",
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-base text-white">{pick(x)}</span>
                          <span className="mt-1 block text-[12px] leading-snug text-white/45">
                            {pick({ en: x.enDesc, ar: x.arDesc })}
                          </span>
                        </span>
                        {on && <Check size={16} className="shrink-0 text-brand-lift" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ─── PEDAZL ─── */}
              {step === "pedazl" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-lg text-white">{t("cz.pedazl.title")}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">{t("cz.pedazl.sub")}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "none", label: t("cz.pedazl.none") },
                        { id: "text", label: t("cz.pedazl.text") },
                        { id: "initials", label: t("cz.pedazl.initials") },
                        { id: "image", label: t("cz.pedazl.image") },
                      ] as { id: PedazlMode; label: string }[]
                    ).map((m) => {
                      const on = build.pedazlMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            if (m.id === "image") {
                              if (build.pedazlImageUrl) patch({ pedazlMode: "image" });
                              else fileRef.current?.click();
                            } else {
                              patch({ pedazlMode: m.id });
                            }
                          }}
                          className={[
                            "rounded-2xl border px-3 py-2.5 text-[12.5px] font-semibold transition-all",
                            on ? "border-brand-lift bg-brand/15 text-white" : "border-white/10 bg-white/3 text-white/55 hover:border-white/30",
                          ].join(" ")}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

                  {(build.pedazlMode === "text" || build.pedazlMode === "initials") && (
                    <div>
                      <label className="label" htmlFor="pz-text">
                        {build.pedazlMode === "initials" ? t("cz.pedazl.initials") : t("cz.pedazl.text")}
                      </label>
                      <input
                        id="pz-text"
                        className="field"
                        value={build.pedazlText}
                        maxLength={build.pedazlMode === "initials" ? 3 : 22}
                        onChange={(e) => patch({ pedazlText: e.target.value })}
                        placeholder={t("cz.pedazl.placeholder")}
                      />
                      <p className="mt-1.5 text-end text-[10.5px] text-white/30">
                        {num(build.pedazlText.length)}/{num(build.pedazlMode === "initials" ? 3 : 22)}
                      </p>
                    </div>
                  )}

                  {build.pedazlMode === "image" && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 p-3.5">
                      {build.pedazlImageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={build.pedazlImageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
                          <p className="flex-1 text-[12px] leading-snug text-emerald-300">{t("cz.pedazl.uploaded")}</p>
                          <button
                            onClick={() => patch({ pedazlImageUrl: null, pedazlMode: "none" })}
                            className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Remove"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost w-full">
                          <Upload size={14} /> {t("cz.pedazl.upload")}
                        </button>
                      )}
                    </div>
                  )}

                  {build.pedazlMode !== "none" && (
                    <>
                      <div>
                        <span className="label">{t("cz.pedazl.stone")}</span>
                        <div className="flex flex-wrap gap-2">
                          {PEDAZL_STONES.map((s) => {
                            const on = build.stoneId === s.id;
                            return (
                              <button
                                key={s.id}
                                onClick={() => patch({ stoneId: s.id })}
                                title={pick(s)}
                                className={[
                                  "relative h-10 w-10 rounded-full border-2 transition-all",
                                  on ? "scale-110 border-white" : "border-white/15 hover:border-white/50",
                                ].join(" ")}
                                style={{
                                  background: `radial-gradient(circle at 34% 30%, ${s.spec}, ${s.hex} 58%, #00000055)`,
                                }}
                              />
                            );
                          })}
                        </div>
                        <p className="mt-2 text-[11.5px] text-white/45">{pick(stone)}</p>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="label !mb-0">{t("cz.pedazl.density")}</span>
                          <span className="text-[11.5px] text-white/50">
                            {build.density < 0.34 ? t("cz.pedazl.light") : build.density > 0.72 ? t("cz.pedazl.full") : "—"}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={build.density}
                          onChange={(e) => patch({ density: Number(e.target.value) })}
                          className="mt-3 w-full accent-brand-lift"
                        />
                        <div className="mt-1 flex justify-between text-[10.5px] text-white/30">
                          <span>{t("cz.pedazl.light")}</span>
                          <span>{t("cz.pedazl.full")}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ─── REVIEW ─── */}
              {step === "review" && (
                <div>
                  <span className="label">{t("cz.summary")}</span>
                  <dl className="space-y-2.5 rounded-2xl border border-white/10 bg-black/25 p-4 text-[13px]">
                    {[
                      { k: t("cz.step.size"), v: `${pick(size)} · ${num(size.ml)} ml` },
                      { k: t("cz.step.color"), v: pick(color) },
                      { k: t("cz.step.dots"), v: `${pick(fieldModeOf(build))} · ${pick(dotOf(build))}` },
                      { k: t("eg.plate"), v: `[ ${normaliseName(build.engraveName) || "CUP KW"} ] · ${t("eg.sigilCode")} ${sigilCode(build.engraveName)}` },
                      { k: t("cz.step.texture"), v: pick(TEXTURES.find((x) => x.id === build.texture)!) },
                      {
                        k: t("cz.step.pedazl"),
                        v:
                          build.pedazlMode === "none"
                            ? t("cz.pedazl.none")
                            : `${build.pedazlMode === "image" ? pick({ en: "Traced image", ar: "صورة مرصوصة" }) : build.pedazlText || "—"} · ${pick(stone)}`,
                      },
                    ].map((r) => (
                      <div key={r.k} className="flex items-baseline justify-between gap-3">
                        <dt className="shrink-0 text-white/40">{r.k}</dt>
                        <dd className="text-end font-medium text-white/90">{r.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4 space-y-2 rounded-2xl border border-white/10 p-4 text-[13px]">
                    {rows.map((r, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3">
                        <span className="text-white/50">{pick(r)}</span>
                        <span className="tabular-nums text-white/80">
                          {num(r.kd, r.kd % 1 === 0 ? 0 : 3)} {t("kd")}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
                      <span className="font-semibold text-white">{t("cz.total")}</span>
                      <span className="font-display text-2xl text-white">
                        {num(price, 3)} <span className="text-sm text-white/45">{t("kd")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={share} className="btn btn-ghost flex-1 !px-3 !text-[12px]">
                      {copied ? <Check size={14} /> : <Link2 size={14} />}
                      {copied ? t("cz.copied") : t("cz.share")}
                    </button>
                    <button onClick={reset} className="btn btn-ghost !px-3.5 !text-[12px]">
                      <RotateCcw size={14} />
                      {t("cz.reset")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── sticky price / add ── */}
            <div className="glass mt-3 flex items-center gap-3 rounded-2xl p-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] tracking-wider text-white/35 uppercase">{t("cz.total")}</p>
                <p className="font-display text-2xl leading-tight text-white">
                  {num(price, 3)} <span className="text-sm text-white/45">{t("kd")}</span>
                </p>
              </div>
              <button onClick={add} className="btn btn-brand shrink-0">
                {added ? (
                  <>
                    <Check size={15} /> {t("cz.added")}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} /> {t("cz.addToBag")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
