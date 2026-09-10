"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { useBuild, colorOf, sizeOf, stoneOf, dotOf, type Build } from "@/lib/build-store";
import type { ShellSpec } from "@/lib/shellTexture";
import type { ThermalState, PartId } from "@/lib/config";
import { normaliseName, resolveField } from "@/lib/punchcard";

/** WebGL only exists in the browser — never render the canvas on the server. */
const TumblerScene = dynamic(() => import("./TumblerScene"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

export function SceneSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
        <span className="text-[11px] tracking-[0.2em] text-white/35 uppercase">Rendering</span>
      </div>
    </div>
  );
}

/** Loads a Pedazl image file into something the texture engine can trace. */
export function usePedazlImage(url: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => setImg(el);
    el.onerror = () => setImg(null);
    el.src = url;
    return () => {
      el.onload = null;
      el.onerror = null;
    };
  }, [url]);
  return img;
}

/** Turns a build into a ShellSpec the renderer can consume. */
export function useShellSpec(
  build: Build,
  thermal: ThermalState,
  opts?: { lifeGenOverride?: number }
): ShellSpec {
  const img = usePedazlImage(build.pedazlImageUrl);
  const c = colorOf(build);
  const stone = stoneOf(build);
  const dot = dotOf(build);
  const gen = opts?.lifeGenOverride ?? build.lifeGen;

  const field = useMemo(
    () =>
      resolveField({
        mode: build.fieldMode,
        name: build.engraveName,
        drawCells: build.drawCells,
        lifeGen: gen,
      }),
    [build.fieldMode, build.engraveName, build.drawCells, gen]
  );

  return useMemo(
    () => ({
      base: c.base,
      cold: c.cold,
      hot: c.hot,
      thermal,
      dotColor: dot.hex,
      field,
      plate: normaliseName(build.engraveName) || "CUP KW",
      pedazlMode: build.pedazlMode,
      pedazlText: build.pedazlText,
      pedazlImage: img,
      stoneHex: stone.hex,
      stoneSpec: stone.spec,
      density: build.density,
    }),
    [c, thermal, dot.hex, field, build.engraveName, build.pedazlMode, build.pedazlText, img, stone.hex, stone.spec, build.density]
  );
}

/** Runs Conway's Life forward on a timer, so the field evolves on the model. */
function useLifeClock(active: boolean, from: number) {
  const [gen, setGen] = useState(from);
  useEffect(() => setGen(from), [from]);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setGen((g) => (g > 300 ? 0 : g + 1)), 420);
    return () => clearInterval(id);
  }, [active]);
  return active ? gen : from;
}

type StageProps = {
  build?: Build;
  thermal?: ThermalState;
  exploded?: boolean;
  showLabels?: boolean;
  autoSpin?: boolean;
  cinematic?: boolean;
  /** step Conway's Life forward on a timer while visible */
  animateLife?: boolean;
  preset?: "free" | "front" | "back" | "side" | "top" | "bottom";
  activePart?: PartId | null;
  onPickPart?: (p: PartId | null) => void;
  mood?: "dark" | "light";
  interactive?: boolean;
  zoom?: number;
  className?: string;
};

/** The one place the rest of the app touches the 3D renderer. */
export default function Stage({
  build: buildOverride,
  thermal: thermalOverride,
  animateLife = false,
  className = "stage h-full w-full",
  ...rest
}: StageProps) {
  const ctx = useBuild();
  const build = buildOverride ?? ctx.build;
  const thermal = thermalOverride ?? ctx.thermal;

  const running = animateLife && build.fieldMode === "life";
  const gen = useLifeClock(running, build.lifeGen);
  const shell = useShellSpec(build, thermal, { lifeGenOverride: gen });
  const size = sizeOf(build);

  return (
    <TumblerScene
      className={className}
      size={size}
      shell={shell}
      texture={build.texture}
      {...rest}
    />
  );
}
