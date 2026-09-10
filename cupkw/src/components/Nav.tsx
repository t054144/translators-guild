"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, User, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useBuild } from "@/lib/build-store";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/customize", key: "nav.customize" },
  { href: "/sizes", key: "nav.shop" },
  { href: "/collab", key: "nav.collab" },
  { href: "/technology", key: "nav.tech" },
  { href: "/community", key: "nav.community" },
];

export default function Nav() {
  const { t, lang, toggle } = useI18n();
  const { bagCount } = useBuild();
  const { user, signOut } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl" : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-brand text-[11px] font-black tracking-tight text-white shadow-[0_6px_20px_-6px] shadow-brand">
            KW
          </span>
          <span className="font-display text-lg tracking-tight text-white">
            CUP<span className="text-brand-lift">.</span>KW
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  active ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white",
                ].join(" ")}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/80 transition-colors hover:border-white/45 hover:text-white"
            aria-label="Switch language"
          >
            <Languages size={13} />
            {lang === "en" ? "ع" : "EN"}
          </button>

          <Link
            href="/bag"
            className="relative rounded-full border border-white/15 p-2 text-white/80 transition-colors hover:border-white/45 hover:text-white"
            aria-label={t("nav.cart")}
          >
            <ShoppingBag size={15} />
            {bagCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                {bagCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="max-w-[110px] truncate rounded-full bg-white/8 px-3 py-1.5 text-[12px] font-medium text-white/85">
                {user.name}
              </span>
              <button onClick={signOut} className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white/55 transition-colors hover:text-white">
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link href="/login" className="rounded-full px-3 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white">
                {t("nav.login")}
              </Link>
              <Link href="/signup" className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-white/85">
                {t("nav.signup")}
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-white/15 p-2 text-white lg:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div
        className={[
          "overflow-hidden border-t bg-ink/95 backdrop-blur-xl transition-all duration-400 lg:hidden",
          open ? "max-h-[80vh] border-white/10" : "max-h-0 border-transparent",
        ].join(" ")}
      >
        <div className="space-y-1 px-4 py-4 sm:px-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-xl px-4 py-3 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/6 hover:text-white"
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-4">
            {user ? (
              <>
                <span className="flex flex-1 items-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-[14px] text-white">
                  <User size={14} /> {user.name}
                </span>
                <button onClick={signOut} className="btn btn-ghost flex-1">
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost flex-1">
                  {t("nav.login")}
                </Link>
                <Link href="/signup" className="btn btn-primary flex-1">
                  {t("nav.signup")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
