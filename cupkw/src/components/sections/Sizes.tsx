"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Ruler } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useBuild, colorOf, dotOf } from "@/lib/build-store";
import { SIZES, type SizeKey } from "@/lib/config";
import { mix, shade } from "@/lib/shellTexture";

/**
 * A to-scale silhouette of the real tumbler: straight-wall cylinder, threaded
 * lid, centre straw, and the punchcard column down the front. Cheap to draw,
 * and the proportions are the actual millimetres.
 */
function Silhouette({
  heightMm, diameterMm, maxMm, color, dotHex, dim,
}: {
  heightMm: number;
  diameterMm: number;
  maxMm: number;
  color: string;
  dotHex: string;
  dim: boolean;
}) {
  const hPct = (heightMm / maxMm) * 100;
  const wPx = (diameterMm / 85) * 74;

  const shell = `linear-gradient(100deg, ${shade(color, -0.32)} 0%, ${shade(color, 0.16)} 24%, ${color} 50%, ${shade(color, -0.1)} 72%, ${shade(color, -0.34)} 100%)`;
  const lid = `linear-gradient(100deg, ${shade(color, -0.36)}, ${shade(color, 0.05)} 45%, ${shade(color, -0.4)})`;

  return (
    <div className="relative flex h-full items-end justify-center" style={{ opacity: dim ? 0.5 : 1, transition: "opacity .35s" }}>
      <div className="relative" style={{ height: `${hPct}%`, width: wPx }}>
        {/* straw */}
        <div
          className="absolute start-1/2 -translate-x-1/2 rounded-full"
          style={{ top: "-7%", height: "9%", width: Math.max(3, wPx * 0.08), background: shade(color, -0.28) }}
        />
        {/* lid */}
        <div className="absolute inset-x-0 top-0 rounded-t-[6px]" style={{ height: "13%", background: lid }} />
        {/* straw boss */}
        <div
          className="absolute start-1/2 -translate-x-1/2 rounded-[3px]"
          style={{ top: "0.6%", height: "2%", width: wPx * 0.34, background: shade(color, -0.2) }}
        />
        {/* seam */}
        <div className="absolute inset-x-0" style={{ top: "13%", height: 1, background: "rgba(0,0,0,0.28)" }} />

        {/* body — dead straight, rounded foot */}
        <div
          className="absolute inset-x-0"
          style={{ top: "13%", bottom: "1.6%", background: shell, borderRadius: "0 0 10px 10px" }}
        />

        {/* the front graphic: CODED box, dot column, name plate */}
        <div className="absolute start-1/2 -translate-x-1/2" style={{ top: "18%", bottom: "8%", width: wPx * 0.42 }}>
          <div
            className="mx-auto rounded-[2px] border"
            style={{ height: "5%", width: "88%", borderColor: dotHex, opacity: 0.85 }}
          />
          <div className="mt-[6%] flex h-[74%] flex-col justify-between">
            {Array.from({ length: 14 }).map((_, r) => (
              <div key={r} className="flex justify-between">
                {Array.from({ length: 5 }).map((__, c) => (
                  <span
                    key={c}
                    className="rounded-full"
                    style={{
                      width: 1.6,
                      height: 1.6,
                      background: dotHex,
                      opacity: (r * 5 + c * 3) % 4 === 0 ? 0.95 : 0.22,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mx-auto mt-[5%] rounded-[1px]" style={{ height: 2, width: "62%", background: dotHex, opacity: 0.8 }} />
        </div>

        {/* base */}
        <div
          className="absolute bottom-0 start-1/2 -translate-x-1/2 rounded-b-[7px]"
          style={{ width: wPx * 0.9, height: "1.8%", background: "#22232A" }}
        />
        {/* specular */}
        <div
          className="absolute rounded-full blur-[3px]"
          style={{ top: "18%", bottom: "10%", left: "20%", width: 4, background: mix("#ffffff", color, 0.3), opacity: 0.45 }}
        />
      </div>
    </div>
  );
}

export default function Sizes() {
  const { t, pick, num, lang } = useI18n();
  const { build, patch } = useBuild();
  const [hover, setHover] = useState<SizeKey | null>(null);
  const color = colorOf(build).base;
  const dotHex = dotOf(build).hex;
  const maxMm = Math.max(...SIZES.map((s) => s.heightMm)) * 1.12;

  return (
    <section id="sizes" className="paper relative overflow-hidden border-t border-black/8 py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="t-eyebrow text-brand">{t("nav.shop")}</span>
            <h2 className="font-display t-section mt-3 text-[#16181F]">{t("sz.title")}</h2>
            <p className="muted mt-4 text-[15px] leading-relaxed">{t("sz.sub")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[12px] text-black/55">
            <Ruler size={13} />
            {lang === "ar" ? "الرسم بمقياس حقيقي" : "Drawn to scale"}
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {SIZES.map((s) => {
            const selected = build.size === s.id;
            return (
              <div
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                className={[
                  "group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-400",
                  selected ? "border-brand shadow-[0_24px_60px_-30px_rgba(31,68,216,0.55)]" : "border-black/8 hover:border-black/25",
                ].join(" ")}
              >
                {selected && (
                  <span className="absolute end-4 top-4 z-10 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                    {lang === "ar" ? "مختار" : "Selected"}
                  </span>
                )}

                <div className="relative h-[300px] bg-gradient-to-b from-[#FAF8F3] to-[#EFEAE0] px-8 pt-8 pb-6">
                  <Silhouette
                    heightMm={s.heightMm}
                    diameterMm={s.diameterMm}
                    maxMm={maxMm}
                    color={color}
                    dotHex={dotHex}
                    dim={hover !== null && hover !== s.id}
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display t-card text-[#16181F]">{pick(s)}</h3>
                    <span className="font-display text-2xl text-[#16181F]">
                      {num(s.priceKD)} <span className="text-sm text-black/40">{t("kd")}</span>
                    </span>
                  </div>

                  <p className="muted mt-3 flex-1 text-[13.5px] leading-relaxed">{pick({ en: s.enBlurb, ar: s.arBlurb })}</p>

                  <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-black/8 pt-4 text-[11px]">
                    {[
                      { k: t("sz.holds"), v: `${num(s.ml)} ml` },
                      { k: t("sz.height"), v: `${num(s.heightMm)} mm` },
                      { k: t("sz.dia"), v: `${num(s.diameterMm)} mm` },
                    ].map((r) => (
                      <div key={r.k}>
                        <dt className="text-black/40">{r.k}</dt>
                        <dd className="mt-0.5 font-semibold text-[#16181F]">{r.v}</dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    href="/customize"
                    onClick={() => patch({ size: s.id })}
                    className={[
                      "btn mt-5 w-full",
                      selected ? "btn-brand" : "btn-ghost",
                    ].join(" ")}
                  >
                    {t("sz.pick")} <ArrowRight size={14} className={lang === "ar" ? "rotate-180" : ""} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
