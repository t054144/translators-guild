"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Gift, Info, ArrowRight } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { useBuild, colorOf, sizeOf, fieldModeOf } from "@/lib/build-store";
import { TEXTURES } from "@/lib/config";
import { normaliseName } from "@/lib/punchcard";

export default function BagPage() {
  const { t, pick, num, lang } = useI18n();
  const { bag, removeFromBag, setQty, bagTotal } = useBuild();
  const [note, setNote] = useState(false);

  return (
    <section className="noise relative min-h-[100svh] overflow-hidden bg-ink pt-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />

      <div className="relative mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <h1 className="font-display t-section text-white">{t("bag.title")}</h1>

        {bag.length === 0 ? (
          <div className="glass mt-8 flex flex-col items-center rounded-3xl px-6 py-20 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/8 text-white/50">
              <ShoppingBag size={22} />
            </span>
            <p className="mt-5 text-[15px] text-white/50">{t("bag.empty")}</p>
            <Link href="/customize" className="btn btn-brand mt-7">
              {t("bag.emptyCta")} <ArrowRight size={15} className={lang === "ar" ? "rotate-180" : ""} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-12">
            {/* ── lines ── */}
            <div className="space-y-3 lg:col-span-8">
              {bag.map((line) => {
                const b = line.build;
                return (
                  <div key={line.key} className="glass flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:p-5">
                    {/* preview */}
                    <div className="stage h-36 w-full shrink-0 rounded-2xl bg-white/[0.03] sm:h-32 sm:w-32">
                      {b ? (
                        <Stage build={b} thermal="ambient" autoSpin interactive={false} mood="dark" zoom={1.15} />
                      ) : (
                        <div className="grid h-full place-items-center text-brand-lift">
                          <Gift size={30} />
                        </div>
                      )}
                    </div>

                    {/* details */}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-tight text-white">
                        {lang === "ar" ? line.labelAr : line.label}
                      </p>
                      {b ? (
                        <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
                          {pick(sizeOf(b))} · {pick(colorOf(b))} ·{" "}
                          {pick(TEXTURES.find((x) => x.id === b.texture)!)}
                          {" · "}
                          <span className="text-white/70">
                            [ {normaliseName(b.engraveName) || "CUP KW"} ] {pick(fieldModeOf(b))}
                          </span>
                          {b.pedazlMode !== "none" && (
                            <>
                              {" · "}
                              <span className="text-white/70">
                                {t("cz.step.pedazl")}: {b.pedazlMode === "image" ? pick({ en: "image", ar: "صورة" }) : b.pedazlText}
                              </span>
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[12px] text-white/45">{t("cb.locked")}</p>
                      )}

                      <div className="mt-3.5 flex items-center gap-3">
                        <div className="flex items-center gap-1 rounded-full border border-white/12 p-1">
                          <button
                            onClick={() => setQty(line.key, line.qty - 1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-[13px] font-semibold text-white tabular-nums">{num(line.qty)}</span>
                          <button
                            onClick={() => setQty(line.key, line.qty + 1)}
                            className="grid h-6 w-6 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromBag(line.key)}
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] text-white/40 transition-colors hover:bg-white/8 hover:text-rose"
                        >
                          <Trash2 size={12} /> {t("bag.remove")}
                        </button>
                      </div>
                    </div>

                    <p className="font-display shrink-0 text-xl text-white sm:text-end">
                      {num(line.unitPrice * line.qty, 3)} <span className="text-xs text-white/45">{t("kd")}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── summary ── */}
            <div className="lg:col-span-4">
              <div className="glass sticky top-20 rounded-3xl p-6">
                <h2 className="t-eyebrow text-white/40">{t("cz.summary")}</h2>

                <div className="mt-5 space-y-2.5 text-[13.5px]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/50">{t("bag.subtotal")}</span>
                    <span className="text-white/85 tabular-nums">
                      {num(bagTotal, 3)} {t("kd")}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/50">{t("bag.delivery")}</span>
                    <span className="text-emerald-400">{t("bag.free")}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-5">
                  <span className="font-semibold text-white">{t("cz.total")}</span>
                  <span className="font-display text-3xl text-white">
                    {num(bagTotal, 3)} <span className="text-base text-white/45">{t("kd")}</span>
                  </span>
                </div>

                <button onClick={() => setNote(true)} className="btn btn-brand mt-6 w-full">
                  {t("bag.checkout")}
                </button>

                {note && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 text-[12px] leading-relaxed text-white/60">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    {t("bag.soon")}
                  </p>
                )}

                <Link href="/customize" className="btn btn-ghost mt-3 w-full !text-[12.5px]">
                  {t("hero.cta")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
