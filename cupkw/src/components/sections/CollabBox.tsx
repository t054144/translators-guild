"use client";

import React, { useState } from "react";
import { Lock, Gift, Ticket, Sparkles, Check } from "lucide-react";
import Stage from "@/components/three/Stage";
import Countdown from "@/components/Countdown";
import PartnerLogo from "@/components/PartnerLogo";
import { useI18n } from "@/lib/i18n";
import { useBuild, DEFAULT_BUILD, type Build } from "@/lib/build-store";
import { COLLAB_BOX, VOUCHER_PARTNERS } from "@/lib/config";

/** The collab thumbler is fixed. No colour, no pattern, no Pedazl — exactly as designed. */
const LOCKED_BUILD: Build = {
  ...DEFAULT_BUILD,
  size: "750",
  colorId: "coded-navy",
  dotColorId: "white",
  texture: "matte",
  fieldMode: "grid",
  engraveName: "MOUDHI",
  pedazlMode: "none",
  pedazlText: "",
  pedazlImageUrl: null,
};

export default function CollabBox() {
  const { t, pick, num, lang } = useI18n();
  const { addToBag } = useBuild();
  const [ended, setEnded] = useState(false);
  const [added, setAdded] = useState(false);

  const voucherValue = 14.25; // KD, indicative

  const contents = [t("cb.item1"), t("cb.item2"), t("cb.item3"), t("cb.item4")];

  const claim = () => {
    addToBag({
      kind: "box",
      qty: 1,
      unitPrice: COLLAB_BOX.priceKD,
      label: COLLAB_BOX.en,
      labelAr: COLLAB_BOX.ar,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2600);
  };

  return (
    <section id="collab" className="noise relative overflow-hidden bg-ink-3 py-20 lg:py-28">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[60vh] w-[60vh] rounded-full bg-brand/18 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[46vh] w-[46vh] rounded-full bg-rose/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        {/* ── header ── */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-rose/10 px-3.5 py-1.5">
              <Sparkles size={12} className="text-rose" />
              <span className="t-eyebrow text-rose">{t("cb.eyebrow")}</span>
            </div>
            <h2 className="font-display t-section mt-4 text-white">{t("cb.title")}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/55">{t("cb.sub")}</p>
          </div>

          <div className="w-full max-w-sm">
            <Countdown tone="dark" onEnded={setEnded} />
          </div>
        </div>

        {/* ── the box ── */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {/* presentation box */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-[#141A2E] to-[#0A0D18] p-5 sm:p-8">
              {/* box lid, tilted off */}
              <div className="pointer-events-none absolute -end-8 -top-10 hidden h-40 w-72 rotate-[-9deg] rounded-2xl border border-white/12 bg-gradient-to-br from-brand to-brand-deep shadow-2xl sm:block">
                <div className="flex h-full flex-col items-center justify-center gap-1">
                  <span className="font-display text-2xl tracking-[0.2em] text-white">CODED</span>
                  <span className="text-[10px] tracking-[0.3em] text-white/60">× MOUDHI</span>
                </div>
                <span className="shimmer absolute inset-0 rounded-2xl" />
              </div>

              {/* fixed colourway badge */}
              <div className="relative inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 backdrop-blur">
                <Lock size={11} className="text-white/60" />
                <span className="text-[11px] font-medium text-white/70">{t("cb.locked")}</span>
              </div>

              {/* the thumbler, in the box */}
              <div className="stage relative mt-2 h-[46vh] min-h-[330px]">
                <Stage
                  build={LOCKED_BUILD}
                  thermal="ambient"
                  cinematic
                  autoSpin
                  mood="dark"
                 
                />
                {/* box floor */}
                <div className="pointer-events-none absolute inset-x-6 bottom-2 h-16 rounded-[50%] bg-brand/22 blur-2xl" />
              </div>

              {/* vouchers fanned along the bottom */}
              <div className="relative -mt-2 flex flex-wrap justify-center gap-2">
                {VOUCHER_PARTNERS.map((p, i) => (
                  <div
                    key={p.id}
                    className="group relative w-[calc(50%-4px)] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-3 backdrop-blur transition-all duration-300 hover:border-white/35 hover:bg-white/10 sm:w-[calc(33.333%-6px)]"
                    style={{ transform: `rotate(${(i - 2) * 0.9}deg)` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1">
                        <PartnerLogo src={p.logo} name={pick(p)} brand={p.brand} ink={p.ink} className="h-full w-full" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-white">{pick(p)}</p>
                        <p className="truncate text-[10.5px] text-white/45">{pick({ en: p.enPerk, ar: p.arPerk })}</p>
                      </div>
                    </div>
                    <Ticket size={11} className="absolute end-2 top-2 text-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── contents + price ── */}
          <div className="lg:col-span-5">
            <div className="glass flex h-full flex-col rounded-[28px] p-6 sm:p-7">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-white">
                  <Gift size={16} />
                </span>
                <h3 className="font-display text-xl text-white">{t("cb.inside")}</h3>
              </div>

              <ul className="mt-5 space-y-2.5">
                {contents.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/70">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    {c}
                  </li>
                ))}
              </ul>

              {/* voucher strip */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between">
                  <span className="t-eyebrow text-white/40">{t("cb.vouchers")}</span>
                  <span className="text-[11px] text-white/35">
                    {t("cb.value")} {num(voucherValue, 3)} {t("kd")}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {VOUCHER_PARTNERS.map((p) => (
                    <span
                      key={p.id}
                      className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-white p-1"
                      title={pick(p)}
                    >
                      <PartnerLogo src={p.logo} name={pick(p)} brand={p.brand} ink={p.ink} className="h-full w-full" />
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-7">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="t-eyebrow text-white/35">{t("cz.total")}</p>
                    <p className="font-display mt-1 text-5xl leading-none text-white">
                      {num(COLLAB_BOX.priceKD, 3)}
                      <span className="ms-2 text-lg text-white/45">{t("kd")}</span>
                    </p>
                  </div>
                  <p className="pb-1.5 text-end text-[11px] leading-tight text-white/35">
                    {lang === "ar" ? "توصيل مجاني" : "Free delivery"}
                    <br />
                    {lang === "ar" ? "داخل الكويت" : "in Kuwait"}
                  </p>
                </div>

                <button onClick={claim} disabled={ended} className="btn btn-brand mt-5 w-full disabled:cursor-not-allowed disabled:opacity-45">
                  {added ? (
                    <>
                      <Check size={15} /> {t("cz.added")}
                    </>
                  ) : ended ? (
                    t("cb.ended")
                  ) : (
                    <>
                      <Gift size={15} /> {t("cb.claim")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
