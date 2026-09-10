"use client";

import React, { useState } from "react";
import { Users, Check, Sparkles, Clock, Palette, Recycle, Gem } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const AREAS = [
  { en: "Kuwait City", ar: "مدينة الكويت" },
  { en: "Salmiya", ar: "السالمية" },
  { en: "Hawally", ar: "حولي" },
  { en: "Jabriya", ar: "الجابرية" },
  { en: "Farwaniya", ar: "الفروانية" },
  { en: "Ahmadi", ar: "الأحمدي" },
  { en: "Jahra", ar: "الجهراء" },
  { en: "Mangaf", ar: "المنقف" },
  { en: "Salwa", ar: "سلوى" },
  { en: "Mishref", ar: "مشرف" },
  { en: "Other", ar: "أخرى" },
];

export default function Community({ compact = false }: { compact?: boolean }) {
  const { t, pick, num } = useI18n();
  const { joinCommunity, user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [order, setOrder] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perks = [
    { icon: <Clock size={14} />, label: t("cm.perk1") },
    { icon: <Palette size={14} />, label: t("cm.perk2") },
    { icon: <Gem size={14} />, label: t("cm.perk3") },
    { icon: <Recycle size={14} />, label: t("cm.perk4") },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError(pick({ en: "Add your name", ar: "أضف اسمك" }));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t("au.invalid"));
    setBusy(true);
    const res = await joinCommunity({ name, email, phone, area, order });
    setBusy(false);
    if (res.error) return setError(res.error);
    setDone(true);
  };

  return (
    <section id="community" className="noise relative overflow-hidden bg-ink-2 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[50vh] w-[80vh] -translate-x-1/2 rounded-full bg-brand/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* ── pitch ── */}
          <div className={compact ? "" : "lg:pt-6"}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5">
              <Users size={12} className="text-brand-lift" />
              <span className="t-eyebrow text-white/70">{t("nav.community")}</span>
            </div>

            <h2 className="font-display t-section mt-4 text-white">{t("cm.title")}</h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/55">{t("cm.sub")}</p>

            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {perks.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-2xl border border-white/8 bg-white/3 p-3.5">
                  <span className="mt-0.5 text-brand-lift">{p.icon}</span>
                  <span className="text-[12.5px] leading-relaxed text-white/70">{p.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["#1F44D8", "#E86A8A", "#6E8C3A", "#F0A03C", "#B7A6DE"].map((c, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-ink-2"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
                  />
                ))}
              </div>
              <p className="text-[12.5px] text-white/45">
                <span className="font-display text-base text-white">{num(2840)}</span> {t("cm.members")}
              </p>
            </div>
          </div>

          {/* ── form ── */}
          <div>
            <div className="glass rounded-3xl p-6 sm:p-8">
              {done ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check size={24} />
                  </span>
                  <p className="font-display mt-5 text-2xl text-white">{t("cm.joined")}</p>
                  <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/45">{t("cm.perk1")}</p>
                  <button onClick={() => setDone(false)} className="btn btn-ghost mt-7">
                    {pick({ en: "Add someone else", ar: "أضف شخصاً آخر" })}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-lift" />
                    <span className="t-eyebrow text-white/45">{t("cm.join")}</span>
                  </div>

                  <div>
                    <label className="label" htmlFor="cm-name">{t("cm.name")}</label>
                    <input id="cm-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="cm-email">{t("cm.email")}</label>
                      <input id="cm-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
                    </div>
                    <div>
                      <label className="label" htmlFor="cm-phone">{t("cm.phone")}</label>
                      <input id="cm-phone" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+965" autoComplete="tel" dir="ltr" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="cm-area">{t("cm.city")}</label>
                      <select id="cm-area" className="field" value={area} onChange={(e) => setArea(e.target.value)}>
                        <option value="" className="bg-ink">—</option>
                        {AREAS.map((a) => (
                          <option key={a.en} value={a.en} className="bg-ink">
                            {pick(a)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="cm-order">{t("cm.fav")}</label>
                      <input
                        id="cm-order"
                        className="field"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder={pick({ en: "Iced spanish latte", ar: "آيس سبانيش لاتيه" })}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-xl border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-[12.5px] text-rose">{error}</p>
                  )}

                  <button type="submit" disabled={busy} className="btn btn-brand w-full disabled:opacity-55">
                    {busy ? t("common.loading") : t("cm.join")}
                  </button>

                  <p className="text-center text-[11px] text-white/30">
                    {pick({ en: "No spam. Leave any time.", ar: "لا رسائل مزعجة. يمكنك الإلغاء وقتما تشاء." })}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
