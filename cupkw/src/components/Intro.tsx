"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Stage from "@/components/three/Stage";
import { DEFAULT_BUILD, type Build } from "@/lib/build-store";
import { SIZES, type SizeDef } from "@/lib/config";
import { useI18n } from "@/lib/i18n";
import { setIntroPlaying } from "@/lib/intro-gate";

/**
 * The opening title sequence.
 *
 * Five beats: the mark, the arrival, the pieces coming apart, the three
 * sizes, then the ask. It plays once per browser session, is skippable at
 * any point, and is bypassed entirely for anyone who asked for less motion.
 *
 * The overlay is rendered on the server too, so the very first paint is the
 * black title card rather than a flash of the page underneath.
 *
 * The clock accumulates a clamped per-tick delta rather than reading
 * wall-clock elapsed time directly — see the comment on that effect. Without
 * it, a stall (a slow device compiling shaders, a backgrounded tab regaining
 * focus) can make the very next tick jump straight past every beat.
 */

/* Server has no layout phase; using the layout effect on the client only
   lets a returning visitor skip the sequence before anything is painted. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SEEN_KEY = "cupkw.intro.seen";

type Beat = "mark" | "arrive" | "pieces" | "sizes" | "ask";

/** start time of each beat, in ms from the top */
const CUE: Record<Beat, number> = {
  mark: 0,
  arrive: 1000,
  pieces: 4600,
  sizes: 8600,
  ask: 12600,
};
const END = 14600;

/** which size is on screen during the sizes beat */
const SIZE_CUES: { at: number; id: SizeDef["id"] }[] = [
  { at: 8600, id: "450" },
  { at: 9900, id: "750" },
  { at: 11200, id: "1000" },
];

export default function Intro() {
  const { t, pick, num, dir } = useI18n();

  const [playing, setPlaying] = useState(true);
  const [armed, setArmed] = useState(false);
  const [ms, setMs] = useState(0);
  const raf = useRef(0);

  /* The clock does not start until the vessel has drawn, so the arrival
     beat can never play against an empty stage on a slow device. A cap
     stops a WebGL failure from holding the whole page hostage. */
  const arm = useCallback(() => setArmed(true), []);
  useEffect(() => {
    if (!playing || armed) return;
    const cap = setTimeout(arm, 6000);
    return () => clearTimeout(cap);
  }, [playing, armed, arm]);

  /* Returning visitors and reduced-motion visitors never see it. */
  useIsoLayoutEffect(() => {
    let skip = false;
    try {
      skip = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* private mode — just play it */
    }
    if (!skip && typeof matchMedia === "function") {
      skip = matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (skip) setPlaying(false);
  }, []);

  const finish = useCallback(() => {
    setPlaying(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* nothing to do */
    }
  }, []);

  /* the clock

     Accumulates a CLAMPED delta each tick rather than reading wall-clock
     elapsed time directly. A raw `now - t0` reads fine until the tab stalls
     — a slow device compiling WebGL shaders, a background tab regaining
     focus, this sandbox's software renderer — at which point the very next
     tick can already exceed END, snapping straight past every beat instead
     of playing them. Clamping the per-tick delta means a stall pauses the
     sequence and it resumes where it left off, which is what the vessel's
     own render loop already does (`dt = Math.min(50, now - last)`). */
  useEffect(() => {
    if (!playing || !armed) return;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += Math.min(now - last, 100);
      last = now;
      setMs(acc);
      if (acc >= END) {
        finish();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, armed, finish]);

  /* claim the only WebGL context for the duration */
  useEffect(() => {
    setIntroPlaying(playing);
    return () => setIntroPlaying(false);
  }, [playing]);

  /* hold the page still underneath */
  useEffect(() => {
    if (!playing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [playing]);

  /* let people out with the keyboard */
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [playing, finish]);

  const beat: Beat =
    ms >= CUE.ask ? "ask" : ms >= CUE.sizes ? "sizes" : ms >= CUE.pieces ? "pieces" : ms >= CUE.arrive ? "arrive" : "mark";

  const sizeId = useMemo(() => {
    let id = SIZE_CUES[0].id;
    for (const c of SIZE_CUES) if (ms >= c.at) id = c.id;
    return id;
  }, [ms]);

  const size = SIZES.find((s) => s.id === sizeId) ?? SIZES[1];

  const build = useMemo<Build>(
    () => ({ ...DEFAULT_BUILD, size: beat === "sizes" ? size.id : DEFAULT_BUILD.size }),
    [beat, size.id]
  );

  if (!playing) return null;

  const showStage = armed && ms >= CUE.arrive - 350;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-[90] overflow-hidden bg-[#04060d]"
      role="dialog"
      aria-label={t("intro.aria")}
    >
      {/* the vessel, lit and turning */}
      <div
        className="absolute inset-0 transition-opacity duration-[900ms] ease-out"
        style={{ opacity: showStage ? 1 : 0 }}
      >
        <Stage
          build={build}
          thermal="ambient"
          exploded={beat === "pieces"}
          showLabels={beat === "pieces"}
          autoSpin
          cinematic
          interactive={false}
          mood="dark"
          duringIntro
          onFirstFrame={arm}
          zoom={beat === "sizes" ? 0.92 : 1}
          className="h-full w-full"
        />
      </div>

      {/* a slow wipe of light across the black, under the type */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120vh 90vh at 50% 42%, rgba(80,120,220,.16), transparent 70%)",
          opacity: beat === "mark" ? 1 : 0.5,
          transition: "opacity 1.2s ease",
        }}
      />

      {/* ── beat 1 · the mark ── */}
      <Card show={beat === "mark"}>
        <p className="intro-mark font-display">CUP.KW</p>
        <span className="intro-rule" />
        <p className="intro-kicker">{t("intro.mark")}</p>
      </Card>

      {/* ── beat 2 · the arrival ── */}
      <Card show={beat === "arrive"} bottom>
        <p className="intro-line font-display">{t("intro.arrive")}</p>
        <p className="intro-sub">{t("intro.arriveSub")}</p>
      </Card>

      {/* ── beat 3 · the pieces ── */}
      <Card show={beat === "pieces"} bottom>
        <p className="intro-eyebrow">{t("intro.piecesEyebrow")}</p>
        <p className="intro-line font-display">{t("intro.pieces")}</p>
        <p className="intro-sub">{t("intro.piecesSub")}</p>
      </Card>

      {/* ── beat 4 · the sizes ── */}
      <Card show={beat === "sizes"} bottom>
        <p className="intro-eyebrow">{t("intro.sizesEyebrow")}</p>
        <p className="intro-line font-display">{pick(size)}</p>
        <p className="intro-sub">
          {num(size.heightMm)} {t("intro.mm")} · {num(size.ml)} {t("intro.ml")} · {num(size.priceKD)}{" "}
          {t("intro.kd")}
        </p>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {SIZES.map((s) => (
            <span
              key={s.id}
              className="h-[3px] rounded-full transition-all duration-500"
              style={{
                width: s.id === size.id ? 34 : 14,
                background: s.id === size.id ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.22)",
              }}
            />
          ))}
        </div>
      </Card>

      {/* ── beat 5 · the ask ── */}
      <Card show={beat === "ask"}>
        <p className="intro-line font-display">{t("intro.ask")}</p>
        <span className="intro-rule" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/customize" className="btn btn-primary" onClick={finish}>
            {t("intro.cta")}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={finish}>
            {t("intro.enter")}
          </button>
        </div>
      </Card>

      {/* chrome */}
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-5 z-10 rounded-sm border border-white/15 px-3.5 py-2 text-[10.5px] font-medium tracking-[0.2em] text-white/45 uppercase transition-colors hover:border-white/40 hover:text-white end-5"
      >
        {t("intro.skip")}
      </button>
      <div className="absolute inset-x-0 bottom-0 z-10 h-[2px] bg-white/8">
        <div
          className="h-full bg-white/55"
          style={{ width: `${Math.min(100, (ms / END) * 100)}%` }}
        />
      </div>

      {/* letterbox */}
      <i className="pointer-events-none absolute inset-x-0 top-0 z-[5] block bg-black" style={{ height: "7vh" }} />
      <i className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] block bg-black" style={{ height: "7vh" }} />
    </div>
  );
}

function Card({
  show,
  bottom = false,
  children,
}: {
  show: boolean;
  bottom?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "pointer-events-none absolute inset-x-0 z-10 px-6 text-center transition-all duration-700 ease-out",
        bottom ? "bottom-[14vh]" : "top-1/2 -translate-y-1/2",
      ].join(" ")}
      style={{
        opacity: show ? 1 : 0,
        transform: bottom ? undefined : show ? "translateY(-50%)" : "translateY(-46%)",
      }}
      aria-hidden={!show}
    >
      <div className="pointer-events-auto mx-auto max-w-[52rem]">{children}</div>
    </div>
  );
}
