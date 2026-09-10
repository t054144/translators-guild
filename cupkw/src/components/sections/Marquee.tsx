"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { THERMAL_SPECS } from "@/lib/config";

export default function Marquee() {
  const { pick, num } = useI18n();

  const items = [
    { en: `${THERMAL_SPECS.coldHours} hours cold`, ar: `${num(THERMAL_SPECS.coldHours)} ساعة باردة` },
    { en: "Fully recyclable", ar: "قابل لإعادة التدوير بالكامل" },
    { en: `${THERMAL_SPECS.hotHours} hours hot`, ar: `${num(THERMAL_SPECS.hotHours)} ساعة حارة` },
    { en: "36 shell colours", ar: "٣٦ لون قشرة" },
    { en: "Thermochromic shell", ar: "قشرة متغيّرة اللون" },
    { en: "Pedazl on anything", ar: "بيدازل على أي شيء" },
    { en: "3 sizes", ar: "٣ أحجام" },
    { en: "Leak-proof, always", ar: "لا يرشح، أبداً" },
    { en: "Made in Kuwait", ar: "صُنع في الكويت" },
  ];

  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink py-3.5">
      <div className="marquee-track flex w-max items-center gap-8">
        {row.map((it, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span className="text-[12px] font-medium tracking-wide text-white/45 whitespace-nowrap">{pick(it)}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-lift/70" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
