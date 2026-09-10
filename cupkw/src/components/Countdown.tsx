"use client";

import React, { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { COLLAB_BOX } from "@/lib/config";

const LS_KEY = "cupkw-drop-deadline";

/**
 * Resolves the drop deadline. A hard date can be set with
 * NEXT_PUBLIC_DROP_DEADLINE (any Date-parsable string); otherwise the drop runs
 * for four days from a visitor's first look, persisted so the clock doesn't
 * reset on every reload.
 */
function resolveDeadline(): number {
  const env = process.env.NEXT_PUBLIC_DROP_DEADLINE;
  if (env) {
    const t = Date.parse(env);
    if (!Number.isNaN(t)) return t;
  }
  try {
    const saved = window.localStorage.getItem(LS_KEY);
    if (saved) {
      const t = Number(saved);
      if (!Number.isNaN(t) && t > Date.now() - 40 * 24 * 3600e3) return t;
    }
  } catch {
    /* private mode */
  }
  const t = Date.now() + COLLAB_BOX.countdownDays * 24 * 3600e3;
  try {
    window.localStorage.setItem(LS_KEY, String(t));
  } catch {
    /* ignore */
  }
  return t;
}

export type CountdownProps = {
  tone?: "dark" | "light";
  size?: "sm" | "lg";
  onEnded?: (ended: boolean) => void;
};

export default function Countdown({ tone = "dark", size = "lg", onEnded }: CountdownProps) {
  const { t, num } = useI18n();
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => setDeadline(resolveDeadline()), []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = deadline === null ? null : Math.max(0, deadline - now);
  const ended = left !== null && left === 0;

  useEffect(() => {
    if (left !== null) onEnded?.(ended);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended, left === null]);

  const d = left === null ? 0 : Math.floor(left / 86400000);
  const h = left === null ? 0 : Math.floor((left % 86400000) / 3600000);
  const m = left === null ? 0 : Math.floor((left % 3600000) / 60000);
  const s = left === null ? 0 : Math.floor((left % 60000) / 1000);

  const cells = [
    { v: d, label: t("cb.days") },
    { v: h, label: t("cb.hours") },
    { v: m, label: t("cb.mins") },
    { v: s, label: t("cb.secs") },
  ];

  const dark = tone === "dark";
  const big = size === "lg";

  if (ended) {
    return (
      <div className={["rounded-2xl border px-4 py-3 text-center text-[13px] font-semibold", dark ? "border-white/15 bg-white/5 text-white/60" : "border-black/10 bg-black/4 text-black/55"].join(" ")}>
        {t("cb.ended")}
      </div>
    );
  }

  return (
    <div>
      <p className={["t-eyebrow mb-2.5", dark ? "text-white/40" : "text-black/40"].join(" ")}>{t("cb.endsIn")}</p>
      <div className="flex gap-2" dir="ltr">
        {cells.map((c, i) => (
          <div
            key={i}
            className={[
              "flex-1 rounded-2xl border text-center tabular-nums",
              big ? "px-2 py-3" : "px-1.5 py-2",
              dark ? "border-white/12 bg-white/[0.06] backdrop-blur" : "border-black/10 bg-white",
            ].join(" ")}
          >
            <p
              className={[
                "font-display leading-none",
                big ? "text-4xl" : "text-2xl",
                dark ? "text-white" : "text-[#16181F]",
              ].join(" ")}
            >
              {deadline === null ? "–" : num(c.v).padStart(2, num(0))}
            </p>
            <p className={["mt-1.5 text-[9.5px] tracking-wider uppercase", dark ? "text-white/35" : "text-black/35"].join(" ")}>
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
