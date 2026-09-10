"use client";

import React from "react";
import { Snowflake, Flame, IceCream2, Recycle, Wind, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { THERMAL_SPECS } from "@/lib/config";

const MATERIALS = [
  { en: "Outer + inner wall", ar: "الجدار الخارجي والداخلي", mat: { en: "18/8 stainless steel", ar: "ستانلس ستيل ١٨/٨" }, pct: 76, tone: "#B9BEC4" },
  { en: "Lid + sip cap", ar: "الغطاء وغطاء الشرب", mat: { en: "Tritan copolyester", ar: "تريتان كوبوليستر" }, pct: 14, tone: "#8FA9E8" },
  { en: "Gasket + base ring", ar: "الحلقة والقاعدة", mat: { en: "Food-grade silicone", ar: "سيليكون غذائي" }, pct: 7, tone: "#6E7280" },
  { en: "Straw", ar: "الشفاطة", mat: { en: "PP, single polymer", ar: "بولي بروبيلين، بوليمر واحد" }, pct: 3, tone: "#7ED0B4" },
];

export default function Technology() {
  const { t, pick, num, lang } = useI18n();

  const stats = [
    { icon: <Snowflake size={18} />, n: THERMAL_SPECS.coldHours, label: t("tech.coldH"), tone: "text-cool", ring: "border-cool/25 bg-cool/8" },
    { icon: <Flame size={18} />, n: THERMAL_SPECS.hotHours, label: t("tech.hotH"), tone: "text-warm", ring: "border-warm/25 bg-warm/8" },
    { icon: <IceCream2 size={18} />, n: THERMAL_SPECS.iceHours, label: t("tech.iceH"), tone: "text-white", ring: "border-white/20 bg-white/6" },
  ];

  return (
    <section id="technology" className="noise relative overflow-hidden bg-ink py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="t-eyebrow text-brand-lift">{t("nav.tech")}</span>
          <h2 className="font-display t-section mt-3 text-white">{t("tech.title")}</h2>
        </div>

        {/* ── the numbers ── */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={i} className={["rounded-3xl border p-6", s.ring].join(" ")}>
              <span className={s.tone}>{s.icon}</span>
              <p className={["font-display mt-4 text-5xl leading-none", s.tone].join(" ")}>{num(s.n)}</p>
              <p className="mt-2 text-[13px] text-white/50">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* ── vacuum ── */}
          <div className="glass relative overflow-hidden rounded-3xl p-7">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-white">
                <Wind size={16} />
              </span>
              <h3 className="font-display text-xl text-white">{t("tech.vac.title")}</h3>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-white/55">{t("tech.vac.body")}</p>

            {/* wall cross-section */}
            <div className="mt-7 rounded-2xl border border-white/8 bg-black/25 p-5">
              <div className="flex h-24 items-stretch gap-0 overflow-hidden rounded-xl">
                <div className="flex-1 bg-gradient-to-b from-[#D8DDE3] to-[#9BA3AC]" />
                <div className="relative w-16 bg-gradient-to-b from-[#0B1220] to-[#050A14]">
                  <span className="absolute inset-0 grid place-items-center text-[9.5px] font-bold tracking-[0.15em] text-cool/70 uppercase">
                    {lang === "ar" ? "فراغ" : "vacuum"}
                  </span>
                </div>
                <div className="flex-[1.4] bg-gradient-to-b from-brand-lift to-brand" />
              </div>
              <div className="mt-3 grid grid-cols-3 text-center text-[10px] text-white/40">
                <span>{pick({ en: "Inner steel", ar: "ستانلس داخلي" })}</span>
                <span className="text-cool/70">{pick({ en: "No air, no transfer", ar: "لا هواء، لا انتقال" })}</span>
                <span>{pick({ en: "Shell", ar: "القشرة" })}</span>
              </div>
            </div>
          </div>

          {/* ── recycling ── */}
          <div id="recycle" className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-7">
            <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/12 blur-3xl" />
            <div className="relative flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <Recycle size={16} />
              </span>
              <h3 className="font-display text-xl text-white">{t("tech.recycle.title")}</h3>
            </div>
            <p className="relative mt-4 text-[14px] leading-relaxed text-white/55">{t("tech.recycle.body")}</p>

            <div className="relative mt-7 space-y-3">
              {MATERIALS.map((m) => (
                <div key={m.en}>
                  <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="font-medium text-white/85">{pick(m)}</span>
                    <span className="text-white/40">{pick(m.mat)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.tone }} />
                    </div>
                    <span className="w-9 shrink-0 text-end text-[11px] text-white/45">{num(m.pct)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-[12px] text-emerald-300/85">
              {[
                { en: "Separates by hand in under a minute", ar: "يُفكّك باليد في أقل من دقيقة" },
                { en: "No bonded or mixed materials", ar: "لا مواد ملتصقة أو مخلوطة" },
                { en: "Bring it back for store credit", ar: "أعده واحصل على رصيد" },
              ].map((r) => (
                <span key={r.en} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {pick(r)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
