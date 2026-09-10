"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Snowflake, Flame, Circle, ArrowRight } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { useBuild } from "@/lib/build-store";
import { COLORS, type ThermalState } from "@/lib/config";

export default function Thermal() {
  const { t, pick, lang } = useI18n();
  const { build, patch } = useBuild();
  const [state, setState] = useState<ThermalState>("cold");

  const states: { id: ThermalState; label: string; icon: React.ReactNode }[] = [
    { id: "ambient", label: t("cz.ambient"), icon: <Circle size={12} /> },
    { id: "cold", label: t("cz.cold"), icon: <Snowflake size={12} /> },
    { id: "hot", label: t("cz.hot"), icon: <Flame size={12} /> },
  ];

  return (
    <section className="paper relative overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          {/* ── live shell ── */}
          <div>
            <span className="t-eyebrow text-brand">{t("cz.thermal")}</span>
            <h2 className="font-display t-section mt-3 text-[#16181F]">{t("tech.thermo.title")}</h2>
            <p className="muted mt-4 max-w-lg text-[15px] leading-relaxed">{t("tech.thermo.body")}</p>

            <div className="mt-7 inline-flex rounded-full border border-black/10 bg-white p-1 shadow-sm">
              {states.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setState(s.id)}
                  className={[
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-all",
                    state === s.id
                      ? s.id === "cold"
                        ? "bg-[#E6F3FF] text-[#0B5D9E]"
                        : s.id === "hot"
                        ? "bg-[#FFEDDF] text-[#9A4210]"
                        : "bg-[#F0EEE9] text-[#16181F]"
                      : "text-black/45 hover:text-black/80",
                  ].join(" ")}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            <div
              className="stage relative mt-6 h-[46vh] min-h-[320px] rounded-3xl border border-black/8 transition-colors duration-1000"
              style={{
                background:
                  state === "cold"
                    ? "radial-gradient(ellipse at 50% 35%, #E8F5FF, #F7F4ED 70%)"
                    : state === "hot"
                    ? "radial-gradient(ellipse at 50% 35%, #FFF0E3, #F7F4ED 70%)"
                    : "radial-gradient(ellipse at 50% 35%, #FFFFFF, #F7F4ED 70%)",
              }}
            >
              <Stage thermal={state} autoSpin mood="light" />

              {state === "hot" && (
                <div className="steam pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2">
                  {[0, 0.9, 1.8].map((d) => (
                    <span
                      key={d}
                      className="absolute block h-16 w-1.5 rounded-full bg-gradient-to-t from-black/12 to-transparent"
                      style={{ left: `${(d - 0.9) * 18}px`, animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── the whole range, all three states ── */}
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="t-eyebrow text-black/40">{t("cz.step.color")}</span>
                <h3 className="font-display mt-2 text-2xl text-[#16181F]">
                  {COLORS.length} {lang === "ar" ? "لون × ٣ حالات" : "colours × 3 states"}
                </h3>
              </div>
              <Link href="/customize" className="btn btn-ghost !py-2 !text-[12.5px]">
                {t("hero.cta")} <ArrowRight size={14} className={lang === "ar" ? "rotate-180" : ""} />
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-black/8 bg-white">
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 border-b border-black/8 px-4 py-2.5 text-[10.5px] font-semibold tracking-wider text-black/40 uppercase">
                <span>{t("cz.step.color")}</span>
                <span className="w-12 text-center">{t("cz.ambient")}</span>
                <span className="w-12 text-center">{t("cz.cold")}</span>
                <span className="w-12 text-center">{t("cz.hot")}</span>
              </div>

              <div className="thin-scroll max-h-[52vh] overflow-y-auto">
                {COLORS.map((c) => {
                  const on = build.colorId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => patch({ colorId: c.id })}
                      className={[
                        "grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 border-b border-black/5 px-4 py-2.5 text-start transition-colors last:border-0",
                        on ? "bg-brand/8" : "hover:bg-black/3",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {on && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                        <span className={["truncate text-[13px]", on ? "font-semibold text-brand" : "text-[#16181F]"].join(" ")}>
                          {pick(c)}
                        </span>
                      </span>
                      {[c.base, c.cold, c.hot].map((hex, i) => (
                        <span
                          key={i}
                          className="h-7 w-12 rounded-md border border-black/8 shadow-inner"
                          style={{ background: hex }}
                        />
                      ))}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="muted mt-3 text-[12px] leading-relaxed">{t("cz.thermalHint")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
