"use client";

import React from "react";
import Link from "next/link";
import { Recycle, AtSign, Mail, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t, num } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-ink-2 pt-16 pb-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[11px] font-black text-white">KW</span>
              <span className="font-display text-xl text-white">
                CUP<span className="text-brand-lift">.</span>KW
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/50">{t("ft.tag")}</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-3.5 py-1.5 text-[12px] font-medium text-emerald-300">
              <Recycle size={13} />
              {t("tech.recycle.title")}
            </div>
          </div>

          <div>
            <h4 className="t-eyebrow text-white/40">{t("ft.shop")}</h4>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/60">
              <li><Link href="/customize" className="transition-colors hover:text-white">{t("nav.customize")}</Link></li>
              <li><Link href="/sizes" className="transition-colors hover:text-white">{t("sz.title")}</Link></li>
              <li><Link href="/collab" className="transition-colors hover:text-white">{t("nav.collab")}</Link></li>
              <li><Link href="/bag" className="transition-colors hover:text-white">{t("bag.title")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="t-eyebrow text-white/40">{t("ft.about")}</h4>
            <ul className="mt-4 space-y-2.5 text-[14px] text-white/60">
              <li><Link href="/technology" className="transition-colors hover:text-white">{t("nav.tech")}</Link></li>
              <li><Link href="/technology#recycle" className="transition-colors hover:text-white">{t("ft.care")}</Link></li>
              <li><Link href="/community" className="transition-colors hover:text-white">{t("nav.community")}</Link></li>
              <li className="flex items-center gap-2 pt-1 text-white/45">
                <MapPin size={12} /> {t("ft.made")}
              </li>
              <li className="flex items-center gap-2 text-white/45">
                <Mail size={12} /> hello@cup.kw
              </li>
              <li className="flex items-center gap-2 text-white/45">
                <AtSign size={12} /> @cup.kw
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/8 pt-6 text-[12px] text-white/35 sm:flex-row sm:items-center">
          <span>© {num(year)} CUP.KW — {t("ft.rights")}</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("ft.made")}
          </span>
        </div>
      </div>
    </footer>
  );
}
