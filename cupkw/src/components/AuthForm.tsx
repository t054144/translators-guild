"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Recycle, Snowflake, Flame } from "lucide-react";
import Stage from "@/components/three/Stage";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { DEFAULT_BUILD, type Build } from "@/lib/build-store";
import { THERMAL_SPECS } from "@/lib/config";

const SHOWCASE: Build = {
  ...DEFAULT_BUILD,
  size: "750",
  colorId: "coded-navy",
  dotColorId: "white",
  texture: "matte",
  fieldMode: "name",
  engraveName: "CUP KW",
};

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t, pick, num, lang } = useI18n();
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [community, setCommunity] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t("au.invalid"));
    if (password.length < 6) return setError(t("au.short"));
    if (isSignup && password !== confirm) return setError(t("au.mismatch"));
    if (isSignup && !name.trim()) return setError(pick({ en: "Add your name", ar: "أضف اسمك" }));

    setBusy(true);
    const res = isSignup
      ? await signUp({ email, password, name, community })
      : await signIn({ email, password });
    setBusy(false);

    if (res.error) return setError(res.error);
    setOk(true);
    setTimeout(() => router.push("/customize"), 900);
  };

  return (
    <section className="noise relative min-h-[100svh] overflow-hidden bg-ink pt-16">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[60vh] w-[60vh] rounded-full bg-brand/16 blur-[130px]" />

      <div className="relative mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-4 lg:px-10 lg:py-16">
        {/* ── form ── */}
        <div className="flex items-center lg:order-2">
          <div className="glass w-full rounded-3xl p-6 sm:p-9">
            {user && ok ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <Check size={24} />
                </span>
                <p className="font-display mt-5 text-2xl text-white">{t("au.welcome")}</p>
                <p className="mt-2 text-[13px] text-white/45">{user.name}</p>
              </div>
            ) : (
              <>
                <h1 className="font-display text-3xl text-white">{isSignup ? t("au.signup.title") : t("au.login.title")}</h1>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/45">
                  {isSignup ? t("au.signup.sub") : t("au.login.sub")}
                </p>

                <form onSubmit={submit} className="mt-7 space-y-4">
                  {isSignup && (
                    <div>
                      <label className="label" htmlFor="au-name">{t("au.name")}</label>
                      <input id="au-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    </div>
                  )}

                  <div>
                    <label className="label" htmlFor="au-email">{t("au.email")}</label>
                    <input
                      id="au-email"
                      type="email"
                      className="field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      dir="ltr"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="au-pass">{t("au.password")}</label>
                    <input
                      id="au-pass"
                      type="password"
                      className="field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      dir="ltr"
                    />
                  </div>

                  {isSignup && (
                    <div>
                      <label className="label" htmlFor="au-confirm">{t("au.confirm")}</label>
                      <input
                        id="au-confirm"
                        type="password"
                        className="field"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        dir="ltr"
                      />
                    </div>
                  )}

                  {isSignup && (
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-white/10 bg-white/3 p-3.5">
                      <input
                        type="checkbox"
                        checked={community}
                        onChange={(e) => setCommunity(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-brand-lift"
                      />
                      <span className="text-[12.5px] leading-relaxed text-white/65">{t("au.joinCommunity")}</span>
                    </label>
                  )}

                  {error && (
                    <p className="rounded-xl border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-[12.5px] text-rose">{error}</p>
                  )}

                  <button type="submit" disabled={busy} className="btn btn-brand w-full disabled:opacity-55">
                    {busy && <Loader2 size={15} className="animate-spin" />}
                    {isSignup ? t("au.signup.go") : t("au.login.go")}
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-5 text-[12.5px]">
                  <span className="text-white/40">{isSignup ? t("au.hasAccount") : t("au.noAccount")}</span>
                  <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-brand-lift transition-colors hover:text-white">
                    {isSignup ? t("au.login.go") : t("au.signup.go")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── showpiece ── */}
        <div className="relative lg:order-1">
          <div className="stage h-[42vh] min-h-[300px] w-full lg:h-[70vh]">
            <Stage build={SHOWCASE} thermal="ambient" autoSpin cinematic mood="dark" />
          </div>

          <div className="mt-2 flex flex-wrap gap-2 lg:absolute lg:bottom-2 lg:start-0">
            {[
              { icon: <Snowflake size={12} className="text-cool" />, v: `${num(THERMAL_SPECS.coldHours)}h`, l: t("cz.cold") },
              { icon: <Flame size={12} className="text-warm" />, v: `${num(THERMAL_SPECS.hotHours)}h`, l: t("cz.hot") },
              { icon: <Recycle size={12} className="text-emerald-400" />, v: "100%", l: lang === "ar" ? "قابل للتدوير" : "Recyclable" },
            ].map((r, i) => (
              <span key={i} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-2 backdrop-blur">
                {r.icon}
                <span className="font-display text-sm text-white">{r.v}</span>
                <span className="text-[11px] text-white/45">{r.l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
