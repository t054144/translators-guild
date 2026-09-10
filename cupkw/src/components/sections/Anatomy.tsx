"use client";

import React, { useState } from "react";
import { Layers, Package, Tag, RotateCw, Film, Crosshair } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { PARTS, type PartId } from "@/lib/config";

type Preset = "free" | "front" | "side" | "top" | "bottom";

export default function Anatomy() {
  const { t, pick, num } = useI18n();
  const [exploded, setExploded] = useState(true);
  const [labels, setLabels] = useState(true);
  const [spin, setSpin] = useState(true);
  const [cinematic, setCinematic] = useState(false);
  const [preset, setPreset] = useState<Preset>("free");
  const [active, setActive] = useState<PartId | null>(null);

  const views: { id: Preset; label: string }[] = [
    { id: "front", label: t("v3.front") },
    { id: "side", label: t("v3.side") },
    { id: "top", label: t("v3.top") },
    { id: "bottom", label: t("v3.bottom") },
  ];

  const toggles = [
    { on: exploded, set: setExploded, icon: <Layers size={13} />, label: exploded ? t("v3.assemble") : t("v3.explode") },
    { on: labels, set: setLabels, icon: <Tag size={13} />, label: t("v3.labels") },
    { on: spin, set: setSpin, icon: <RotateCw size={13} />, label: t("v3.spin") },
    { on: cinematic, set: setCinematic, icon: <Film size={13} />, label: t("v3.cinematic") },
  ];

  return (
    <section id="anatomy" className="noise relative overflow-hidden bg-ink-2 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[70vh] w-[70vh] -translate-x-1/2 rounded-full bg-brand/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="t-eyebrow text-brand-lift">{t("nav.tech")}</span>
          <h2 className="font-display t-section mt-3 text-white">{t("v3.title")}</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/50">{t("v3.sub")}</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          {/* ── viewer ── */}
          <div className="lg:col-span-8">
            <div className="glass relative overflow-hidden rounded-3xl">
              {/* toolbar */}
              <div className="thin-scroll flex items-center gap-2 overflow-x-auto border-b border-white/8 px-3 py-3">
                {toggles.map((tg, i) => (
                  <button
                    key={i}
                    onClick={() => tg.set(!tg.on)}
                    className={[
                      "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all",
                      tg.on
                        ? "border-white/70 bg-white text-ink"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                    ].join(" ")}
                  >
                    {tg.icon}
                    {tg.label}
                  </button>
                ))}

                <span className="mx-1 h-5 w-px shrink-0 bg-white/12" />

                {views.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setPreset(preset === v.id ? "free" : v.id)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-all",
                      preset === v.id
                        ? "border-brand-lift bg-brand text-white"
                        : "border-white/15 text-white/55 hover:border-white/40 hover:text-white",
                    ].join(" ")}
                  >
                    {v.label}
                  </button>
                ))}

                {preset !== "free" && (
                  <button
                    onClick={() => setPreset("free")}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] text-white/45 transition-colors hover:text-white"
                  >
                    <Crosshair size={12} />
                    {t("v3.reset")}
                  </button>
                )}
              </div>

              <div className="stage relative h-[58vh] min-h-[420px] sm:h-[68vh]">
                <Stage
                  exploded={exploded}
                  showLabels={labels}
                  autoSpin={spin}
                  cinematic={cinematic}
                  preset={preset}
                  activePart={active}
                  onPickPart={setActive}
                  mood="dark"
                 
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
                  <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-center text-[10.5px] text-white/45 backdrop-blur">
                    {t("v3.hint")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── parts list ── */}
          <div className="lg:col-span-4">
            <div className="glass h-full rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-white/40" />
                <span className="t-eyebrow text-white/40">
                  {num(PARTS.length)} {t("v3.parts")}
                </span>
              </div>

              <div className="thin-scroll mt-4 max-h-[62vh] space-y-1.5 overflow-y-auto pe-1">
                {PARTS.map((p, i) => {
                  const on = active === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActive(on ? null : p.id)}
                      className={[
                        "w-full rounded-2xl border p-3.5 text-start transition-all duration-300",
                        on
                          ? "border-white/60 bg-white text-ink"
                          : "border-white/8 bg-white/3 hover:border-white/25 hover:bg-white/6",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={[
                            "grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold",
                            on ? "bg-ink text-white" : "bg-white/10 text-white/60",
                          ].join(" ")}
                        >
                          {num(i + 1)}
                        </span>
                        <span className={["text-[13.5px] font-semibold", on ? "text-ink" : "text-white/85"].join(" ")}>
                          {pick(p)}
                        </span>
                      </div>
                      <div
                        className={[
                          "grid transition-all duration-400",
                          on ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        ].join(" ")}
                      >
                        <p className="overflow-hidden text-[12px] leading-relaxed text-ink/65">
                          {pick({ en: p.enDesc, ar: p.arDesc })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
