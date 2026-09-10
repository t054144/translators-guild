"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CODE = "CUPKW10";
const SEEN_KEY = "cupkw.voucher.opened";

/**
 * THE VOUCHER BOX.
 *
 * A closed, physical-feeling object rather than a coupon banner: a lid
 * hinged on its back edge lifts open (`.voucher-lid` in globals.css, a
 * real 3D rotation via CSS perspective) to reveal the voucher sitting in
 * warm, glowing light. It never competes with the tumbler above it — it
 * is small, quiet, and off to one side of the page's rhythm.
 *
 * State (opened once) persists in localStorage so a returning visitor
 * finds it already open rather than replaying the same reveal.
 */
export default function VoucherBox() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY) === "1") setOpen(true);
    } catch {
      /* private mode — the box just starts closed */
    }
  }, []);

  const reveal = useCallback(() => {
    setOpen(true);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* nothing to persist */
    }
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the code is still selectable as plain text */
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink-2 py-16 lg:py-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[110px]" />

      <div className="relative mx-auto max-w-md px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5">
            <Sparkles size={12} className="text-brand-lift" />
            <span className="t-eyebrow text-white/60">{t("vb.eyebrow")}</span>
          </div>
        </div>

        {/* ── the box itself ── */}
        <div className="voucher-box relative mx-auto mt-8 w-full max-w-[280px]">
          <div className="relative w-full rounded-[22px] border border-white/12 bg-gradient-to-b from-[#171C2C] to-[#0A0D18] p-1.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)]">
            {/* the lid — flips open on its back edge; only clickable while closed */}
            {open ? (
              <div
                className="voucher-lid is-open relative overflow-hidden rounded-2xl border border-white/10"
                style={{ background: "linear-gradient(160deg,#1F44D8,#0B1F86 78%)" }}
                aria-hidden
              >
                <div className="voucher-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.35),transparent_60%)]" />
                <div className="flex flex-col items-center gap-2 px-6 py-9">
                  <Gift size={20} className="text-white/85" />
                  <span className="font-display text-sm tracking-[0.22em] text-white">{t("vb.label")}</span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={reveal}
                aria-label={t("vb.aria.closed")}
                className="voucher-lid group relative block w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 text-left"
                style={{ background: "linear-gradient(160deg,#1F44D8,#0B1F86 78%)" }}
              >
                <div className="voucher-glow pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.35),transparent_60%)]" />
                <div className="flex flex-col items-center gap-2 px-6 py-9 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <Gift size={20} className="text-white/85" />
                  <span className="font-display text-sm tracking-[0.22em] text-white">{t("vb.label")}</span>
                  <span className="text-[11px] text-white/60">{t("vb.sub")}</span>
                </div>
              </button>
            )}

            {/* interior — sits under the lid, only meaningfully visible once it lifts */}
            <div
              className="relative -mt-1.5 rounded-b-[18px] border border-t-0 border-white/8 bg-[#05060A] px-6 pb-7 pt-6 text-center"
              aria-hidden={!open}
            >
              <div
                className="transition-all duration-700 ease-out"
                style={{ opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(8px)" }}
              >
                <p className="font-display text-2xl text-white">{t("vb.opened.title")}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">{t("vb.opened.sub")}</p>

                <div className="mt-5 flex items-center justify-center gap-2">
                  <code className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-[13px] font-semibold tracking-[0.15em] text-white">
                    {CODE}
                  </code>
                  <button
                    type="button"
                    onClick={copy}
                    tabIndex={open ? 0 : -1}
                    aria-label={t("vb.copy")}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <Link href="/customize" tabIndex={open ? 0 : -1} className="btn btn-brand mt-5 w-full !py-2.5">
                  {t("vb.redeem")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
