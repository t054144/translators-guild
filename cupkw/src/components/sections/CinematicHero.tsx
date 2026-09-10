"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Snowflake, Flame, Circle, MousePointer2 } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { THERMAL_SPECS, type ThermalState } from "@/lib/config";

/**
 * THE MUG REVEAL — the hero's opening cinematic sequence.
 *
 * This is not a full-screen gate like the (unmounted) Intro overlay: it is
 * the hero section itself, so nothing ever blocks scrolling, the nav, or a
 * screen reader. The DOM is stable from first paint — every layer below is
 * always mounted, and the sequence only drives opacity/blur/transform, so
 * there is no layout shift as beats arrive and nothing to race (compare the
 * clock-vs-arming bug in Intro.tsx, which this deliberately avoids by using
 * one array of timeouts instead of two competing effects).
 *
 * Beats: darkness → dust → a glow gathers → a beam of light finds the
 * silhouette → the tumbler resolves into full reflection and colour → its
 * temperature display wakes and settles → the headline and CTA arrive last.
 * Reduced motion (or a JS-disabled skip) jumps straight to the final frame.
 */

const STAGE = {
  DARK: 0,
  PARTICLES: 1,
  GLOW: 2,
  BEAM: 3,
  SILHOUETTE: 4,
  REVEAL: 5,
  STEAM: 6,
  TEMP: 7,
  SETTLE: 8,
  TYPE: 9,
  CTA: 10,
  LIVE: 11,
} as const;

/** [stage reached, ms from mount] — kept slow and evenly paced, per the brief. */
const CUES: Array<[number, number]> = [
  [STAGE.PARTICLES, 350],
  [STAGE.GLOW, 1000],
  [STAGE.BEAM, 1650],
  [STAGE.SILHOUETTE, 2450],
  [STAGE.REVEAL, 3250],
  [STAGE.STEAM, 4100],
  [STAGE.TEMP, 4550],
  [STAGE.SETTLE, 5500],
  [STAGE.TYPE, 5900],
  [STAGE.CTA, 6600],
  [STAGE.LIVE, 7100],
];

const CYCLE: ThermalState[] = ["ambient", "cold", "hot"];
const TEMP_C: Record<ThermalState, number> = { ambient: 22, cold: 4, hot: 71 };
const GLOW_COLOR: Record<ThermalState, string> = {
  ambient: "rgba(78,117,255,.45)",
  cold: "rgba(111,199,255,.5)",
  hot: "rgba(240,160,60,.5)",
};

/** Deterministic dust motes — index-derived, so server and client agree and no two drift alike. */
const MOTES = Array.from({ length: 20 }, (_, i) => {
  const left = ((i * 53) % 100) + (i % 3) * 0.6;
  const top = ((i * 31 + 17) % 100) * 0.92 + 4;
  const size = 1 + (i % 3);
  const mx = ((i * 17) % 20) - 10;
  const my = -10 - ((i * 11) % 18);
  const mdur = 7 + (i % 5) * 1.6;
  const tdur = 3.4 + (i % 4) * 1.1;
  const mdelay = (i % 7) * -0.9;
  return { left, top, size, mx, my, mdur, tdur, mdelay };
});

/** A single RAF loop, restarted on target change — no dueling effects. */
function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const base = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(base + (target - base) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        from.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

export default function CinematicHero() {
  const { t, num, lang } = useI18n();

  const [stage, setStage] = useState<number>(STAGE.DARK);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const skip = useCallback(() => {
    clearTimers();
    setStage(STAGE.LIVE);
  }, [clearTimers]);

  useEffect(() => {
    CUES.forEach(([s, at]) => {
      const id = window.setTimeout(() => setStage((cur) => Math.max(cur, s)), at);
      timers.current.push(id);
    });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* reduced motion and "no JS clock" both land on the same finished frame */
  useEffect(() => {
    try {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) skip();
    } catch {
      /* matchMedia unavailable — keep the timed sequence */
    }
  }, [skip]);

  useEffect(() => {
    if (stage >= STAGE.LIVE) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [stage, skip]);

  /* the temperature demonstration — starts once the reveal has settled */
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (stage < STAGE.LIVE || paused) return;
    const id = setInterval(() => setPhaseIdx((p) => (p + 1) % CYCLE.length), 4200);
    return () => clearInterval(id);
  }, [stage, paused]);
  const thermal = CYCLE[phaseIdx];

  const mountCanvas = stage >= STAGE.GLOW;
  const revealed = stage >= STAGE.REVEAL;
  const tempOn = stage >= STAGE.TEMP;
  const displayTemp = useCountUp(TEMP_C[thermal], tempOn, 950);
  const settledCaption =
    thermal === "ambient" ? t("hc.tempPerfect") : thermal === "cold" ? t("cz.cold") : t("cz.hot");

  const glowStyle = useMemo(
    () => ({ background: `radial-gradient(closest-side, ${GLOW_COLOR[thermal]}, transparent 72%)` }),
    [thermal]
  );

  return (
    <section
      className="noise relative min-h-[100svh] overflow-hidden bg-ink"
      aria-label={t("hc.aria")}
    >
      {/* ── base atmosphere: vignette, faint grid, thermal-tinted ambience ── */}
      <div className="pointer-events-none absolute inset-0 grid-lines radial-fade opacity-40" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-opacity duration-[1600ms]"
        style={{ ...glowStyle, opacity: revealed ? 1 : 0 }}
      />
      {/* pure black floor for the opening beats — fades away once revealed */}
      <div
        className="pointer-events-none absolute inset-0 bg-ink transition-opacity duration-[1800ms] ease-out"
        style={{ opacity: revealed ? 0 : 1 }}
      />

      {/* ── dust: extremely subtle, floating, never busy ── */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1400ms]"
        style={{ opacity: stage >= STAGE.PARTICLES ? (revealed ? 0.55 : 1) : 0 }}
        aria-hidden
      >
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="hero-mote absolute rounded-full bg-white"
            style={
              {
                left: `${m.left}%`,
                top: `${m.top}%`,
                width: m.size,
                height: m.size,
                "--mx": `${m.mx}px`,
                "--my": `${m.my}px`,
                "--mdur": `${m.mdur}s`,
                "--tdur": `${m.tdur}s`,
                "--mdelay": `${m.mdelay}s`,
                "--mo-min": 0.05,
                "--mo-max": 0.4,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ── a single warm beam, sweeping once to find the silhouette ── */}
      {stage >= STAGE.BEAM && (
        <div
          className="hero-beam pointer-events-none absolute -inset-y-1/4 left-0 w-1/3"
          style={{ background: "linear-gradient(100deg, transparent, rgba(255,224,180,.5), transparent)" }}
          aria-hidden
        />
      )}

      {/* ── centre column: headline, tumbler, temperature, CTA ── */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-4 pt-24 pb-12 text-center sm:px-6">
        {/* headline — arrives only once the mug has fully resolved */}
        <div
          className="transition-all duration-[900ms] ease-out"
          style={{
            opacity: stage >= STAGE.TYPE ? 1 : 0,
            transform: stage >= STAGE.TYPE ? "translateY(0)" : "translateY(14px)",
          }}
        >
          <span className="t-eyebrow text-white/45">{t("hc.eyebrow")}</span>
          <h1 className="font-display t-hero mt-4 text-white">
            {t("hc.headline1")}
            <br />
            <span className="text-white/50">{t("hc.headline2")}</span>
          </h1>
        </div>

        {/* the tumbler, held in one place throughout the whole sequence */}
        <div className="relative mt-2 flex w-full max-w-md flex-1 items-center justify-center py-6" style={{ minHeight: "38vh" }}>
          {/* the silhouette / reveal container — opacity, blur and scale carry the whole beat */}
          <div
            className="stage relative h-[42vh] min-h-[300px] w-full transition-[opacity,filter,transform] duration-[1500ms] ease-out sm:h-[46vh]"
            style={{
              opacity: stage >= STAGE.SILHOUETTE ? (revealed ? 1 : 0.15) : 0,
              filter: revealed ? "blur(0px) brightness(1)" : "blur(22px) brightness(0.35)",
              transform: revealed ? "scale(1)" : "scale(0.92)",
            }}
          >
            {mountCanvas && (
              <Stage thermal={thermal} cinematic autoSpin mood="dark" interactive={stage >= STAGE.LIVE} />
            )}
          </div>

          {/* a subtle trail of steam, once, as the mug resolves */}
          {stage >= STAGE.STEAM && (
            <div
              className="steam pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2 transition-opacity duration-1000"
              style={{ opacity: revealed ? 1 : 0 }}
              aria-hidden
            >
              {[0, 0.9, 1.8].map((d) => (
                <span
                  key={d}
                  className="absolute block h-14 w-1.5 rounded-full bg-gradient-to-t from-white/18 to-transparent"
                  style={{ left: `${(d - 0.9) * 16}px`, animationDelay: `${d}s` }}
                />
              ))}
            </div>
          )}

          {/* ── the temperature display — integrated into the product, not floating loose ── */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 transition-all duration-700 ease-out"
            style={{
              opacity: tempOn ? 1 : 0,
              transform: tempOn ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <span className="h-5 w-px bg-white/15" />
            <div
              className={[
                "glass flex items-center gap-2.5 rounded-full px-4 py-2",
                stage === STAGE.TEMP ? "hero-temp-pulse" : "",
              ].join(" ")}
              style={{ boxShadow: `0 0 34px -8px ${GLOW_COLOR[thermal]}` }}
            >
              {thermal === "cold" ? (
                <Snowflake size={13} className="text-cool" />
              ) : thermal === "hot" ? (
                <Flame size={13} className="text-warm" />
              ) : (
                <Circle size={9} className="fill-current text-brand-lift" />
              )}
              <span className="font-display text-lg leading-none text-white tabular-nums">
                {num(Math.round(displayTemp))}°C
              </span>
              <span className="h-3 w-px bg-white/15" />
              <span className="text-[11px] font-medium whitespace-nowrap text-white/70">{settledCaption}</span>
            </div>
          </div>
        </div>

        {/* screen-reader / non-animated equivalent of the temperature beat above */}
        <p className="sr-only" aria-live="polite">
          {tempOn ? `${Math.round(displayTemp)}°C — ${settledCaption}` : ""}
        </p>

        {/* copy + CTA — the interface becomes prominent only after the reveal */}
        <div
          className="transition-all duration-[900ms] ease-out"
          style={{
            opacity: stage >= STAGE.CTA ? 1 : 0,
            transform: stage >= STAGE.CTA ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <p className="mx-auto max-w-sm text-[13px] tracking-wide text-white/45">{t("hc.tagline")}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="#anatomy" className="btn btn-ghost">
              {t("hc.cta")}
            </Link>
            <Link href="/customize" className="btn btn-primary">
              {t("hero.cta")} <ArrowRight size={15} className={lang === "ar" ? "rotate-180" : ""} />
            </Link>
          </div>

          {/* quick thermal legend — hover to preview, matches the live read-out above */}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
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
                  setPhaseIdx(CYCLE.indexOf(r.s));
                }}
                onMouseLeave={() => setPaused(false)}
                onClick={() => {
                  setPaused(true);
                  setPhaseIdx(CYCLE.indexOf(r.s));
                }}
                className={[
                  "flex items-center gap-2 rounded-full border px-3.5 py-2 text-start transition-all",
                  thermal === r.s ? `${r.tone} scale-[1.02]` : "border-white/10 bg-white/3 text-white/45 hover:border-white/25",
                ].join(" ")}
              >
                {r.icon}
                <span className="font-display text-sm leading-none">{num(r.h)}</span>
                <span className="text-[11px] leading-tight opacity-80">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── chrome: skip (during the sequence) / hint (once live) ── */}
      {stage < STAGE.LIVE ? (
        <button
          type="button"
          onClick={skip}
          className="absolute bottom-5 end-5 z-20 rounded-sm border border-white/15 px-3.5 py-2 text-[10.5px] font-medium tracking-[0.2em] text-white/40 uppercase backdrop-blur transition-colors hover:border-white/40 hover:text-white"
        >
          {t("hc.skip")}
        </button>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-2">
          <span className="rise inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-[10.5px] text-white/50 backdrop-blur">
            <MousePointer2 size={11} />
            {t("hero.scroll")}
          </span>
        </div>
      )}
    </section>
  );
}
