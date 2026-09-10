"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Snowflake, Flame, Recycle, MousePointer2 } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { THERMAL_SPECS, type ThermalState } from "@/lib/config";

const CYCLE: ThermalState[] = ["ambient", "cold", "hot"];

export default function Hero() {
  const { t, num, lang } = useI18n();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  // the hero demonstrates the thermochromic shell on its own
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setPhase((p) => (p + 1) % CYCLE.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  const thermal = CYCLE[phase];

  return (
    <section className="noise relative min-h-[100svh] overflow-hidden bg-ink pt-16">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 grid-lines radial-fade opacity-70" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[130vh] w-[130vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] transition-colors duration-[2500ms]"
        style={{
          background:
            thermal === "cold"
              ? "radial-gradient(circle, rgba(70,170,255,0.20), transparent 62%)"
              : thermal === "hot"
              ? "radial-gradient(circle, rgba(255,130,50,0.18), transparent 62%)"
              : "radial-gradient(circle, rgba(31,68,216,0.20), transparent 62%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] gap-6 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-4 lg:px-10 lg:pt-16">
        {/* ── copy ── */}
        <div className="z-10 lg:col-span-4 lg:pt-10">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur">
            <Recycle size={12} className="text-emerald-400" />
            <span className="t-eyebrow text-white/70">{t("hero.eyebrow")}</span>
          </div>

          <h1 className="rise font-display t-hero mt-6 text-white" style={{ animationDelay: "80ms" }}>
            {t("hero.title1")}
            <br />
            <span className="text-white/45">{t("hero.title2")}</span>
            <br />
            <span
              className="bg-clip-text text-transparent transition-all duration-[1800ms]"
              style={{
                backgroundImage:
                  thermal === "cold"
                    ? "linear-gradient(100deg,#6FC7FF,#B9E6FF)"
                    : thermal === "hot"
                    ? "linear-gradient(100deg,#FFB067,#FF6B4A)"
                    : "linear-gradient(100deg,#4E75FF,#9FB4FF)",
              }}
            >
              {t("hero.title3")}
            </span>
          </h1>

          <p className="rise mt-6 max-w-md text-[15px] leading-relaxed text-white/55" style={{ animationDelay: "160ms" }}>
            {t("hero.sub")}
          </p>

          <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/customize" className="btn btn-primary">
              {t("hero.cta")} <ArrowRight size={15} className={lang === "ar" ? "rotate-180" : ""} />
            </Link>
            <Link href="/collab" className="btn btn-ghost">
              {t("hero.cta2")}
            </Link>
          </div>

          {/* thermal legend */}
          <div className="rise mt-10 flex flex-wrap gap-2" style={{ animationDelay: "320ms" }}>
            {(
              [
                { s: "cold" as const, icon: <Snowflake size={13} />, h: THERMAL_SPECS.coldHours, label: t("tech.coldH"), tone: "text-cool border-cool/30 bg-cool/8" },
                { s: "hot" as const, icon: <Flame size={13} />, h: THERMAL_SPECS.hotHours, label: t("tech.hotH"), tone: "text-warm border-warm/30 bg-warm/8" },
              ]
            ).map((r) => (
              <button
                key={r.s}
                onMouseEnter={() => {
                  setPaused(true);
                  setPhase(CYCLE.indexOf(r.s));
                }}
                onMouseLeave={() => setPaused(false)}
                onClick={() => {
                  setPaused(true);
                  setPhase(CYCLE.indexOf(r.s));
                }}
                className={[
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-start transition-all",
                  thermal === r.s ? `${r.tone} scale-[1.02]` : "border-white/10 bg-white/3 text-white/45 hover:border-white/25",
                ].join(" ")}
              >
                {r.icon}
                <span className="font-display text-lg leading-none">{num(r.h)}</span>
                <span className="text-[11px] leading-tight opacity-80">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── the tumbler ── */}
        <div className="relative lg:col-span-5">
          <div className="stage relative h-[52vh] min-h-[340px] w-full sm:h-[60vh] lg:h-[78vh]">
            <Stage thermal={thermal} cinematic autoSpin mood="dark" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[10.5px] text-white/50 backdrop-blur">
              <MousePointer2 size={11} />
              {t("hero.scroll")}
            </span>
          </div>
        </div>

        {/* ── live state card ── */}
        <div className="z-10 flex items-end lg:col-span-3 lg:pb-20">
          <div className="glass w-full rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="t-eyebrow text-white/40">{t("cz.thermal")}</span>
              <div className="flex gap-1">
                {CYCLE.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPaused(true);
                      setPhase(i);
                    }}
                    aria-label={c}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === phase ? "w-6 bg-white" : "w-1.5 bg-white/25 hover:bg-white/45",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>

            <p className="font-display mt-4 text-3xl text-white">
              {thermal === "cold" ? t("cz.cold") : thermal === "hot" ? t("cz.hot") : t("cz.ambient")}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/45">
              {thermal === "cold"
                ? t("tech.thermo.body").split(".")[1] + "."
                : thermal === "hot"
                ? t("tech.thermo.body").split(".")[2] + "."
                : t("cz.thermalHint")}
            </p>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-white/45">{t("common.from")}</span>
                <span className="font-display text-2xl text-white">
                  {num(6)} <span className="text-sm text-white/50">{t("kd")}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
