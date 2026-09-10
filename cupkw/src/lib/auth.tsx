"use client";

/**
 * Auth for CUP.KW.
 *
 * If Supabase env vars are present the real Supabase client is used, so accounts
 * are stored properly. If they are not (a fresh preview deploy, say) the same
 * interface falls back to a browser-local account store, so login and sign-up
 * still work end to end and nothing in the UI has to know the difference.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string;
  name: string;
  community: boolean;
};

const URL_ENV = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const HAS_SUPABASE = Boolean(URL_ENV && KEY_ENV);

let cached: SupabaseClient | null = null;
async function client(): Promise<SupabaseClient | null> {
  if (!HAS_SUPABASE) return null;
  if (cached) return cached;
  const { createClient } = await import("@supabase/supabase-js");
  cached = createClient(URL_ENV!, KEY_ENV!);
  return cached;
}

/* ─────────────────── local fallback store ─────────────────── */

type LocalUser = { id: string; email: string; name: string; pass: string; community: boolean };

const LS_USERS = "cupkw-users";
const LS_SESSION = "cupkw-session";

function readUsers(): LocalUser[] {
  try {
    return JSON.parse(window.localStorage.getItem(LS_USERS) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(u: LocalUser[]) {
  try {
    window.localStorage.setItem(LS_USERS, JSON.stringify(u));
  } catch {
    /* private mode */
  }
}

/** not cryptography — just so a readable password never sits in localStorage */
function scramble(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36) + "." + s.length;
}

/* ─────────────────── context ─────────────────── */

type Ctx = {
  user: Profile | null;
  loading: boolean;
  signUp: (v: { email: string; password: string; name: string; community: boolean }) => Promise<{ error?: string }>;
  signIn: (v: { email: string; password: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  joinCommunity: (v: { name: string; email: string; phone?: string; area?: string; order?: string }) => Promise<{ error?: string }>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = await client();
      if (sb) {
        const { data } = await sb.auth.getSession();
        if (!alive) return;
        const s = data.session;
        if (s?.user) {
          setUser({
            id: s.user.id,
            email: s.user.email ?? "",
            name: (s.user.user_metadata?.name as string) ?? (s.user.email ?? "").split("@")[0],
            community: Boolean(s.user.user_metadata?.community),
          });
        }
        sb.auth.onAuthStateChange((_e, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? "",
              name: (session.user.user_metadata?.name as string) ?? (session.user.email ?? "").split("@")[0],
              community: Boolean(session.user.user_metadata?.community),
            });
          } else {
            setUser(null);
          }
        });
      } else {
        try {
          const raw = window.localStorage.getItem(LS_SESSION);
          if (raw) setUser(JSON.parse(raw));
        } catch {
          /* ignore */
        }
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persistLocal = (p: Profile | null) => {
    try {
      if (p) window.localStorage.setItem(LS_SESSION, JSON.stringify(p));
      else window.localStorage.removeItem(LS_SESSION);
    } catch {
      /* ignore */
    }
  };

  const signUp = useCallback<Ctx["signUp"]>(async ({ email, password, name, community }) => {
    const sb = await client();
    if (sb) {
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name, community } },
      });
      if (error) return { error: error.message };
      // email confirmation may be on; sign in straight away when it isn't
      await sb.auth.signInWithPassword({ email, password }).catch(() => null);
      return {};
    }
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "An account with that email already exists." };
    }
    const nu: LocalUser = {
      id: `u_${Date.now().toString(36)}`,
      email,
      name,
      pass: scramble(password),
      community,
    };
    writeUsers([...users, nu]);
    const p: Profile = { id: nu.id, email: nu.email, name: nu.name, community: nu.community };
    setUser(p);
    persistLocal(p);
    return {};
  }, []);

  const signIn = useCallback<Ctx["signIn"]>(async ({ email, password }) => {
    const sb = await client();
    if (sb) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    }
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { error: "No account with that email. Create one first." };
    if (found.pass !== scramble(password)) return { error: "That password doesn't match." };
    const p: Profile = { id: found.id, email: found.email, name: found.name, community: found.community };
    setUser(p);
    persistLocal(p);
    return {};
  }, []);

  const signOut = useCallback(async () => {
    const sb = await client();
    if (sb) await sb.auth.signOut();
    setUser(null);
    persistLocal(null);
  }, []);

  const joinCommunity = useCallback<Ctx["joinCommunity"]>(async (v) => {
    const sb = await client();
    if (sb) {
      const { error } = await sb.from("community_members").insert({
        name: v.name,
        email: v.email,
        phone: v.phone ?? null,
        area: v.area ?? null,
        favourite_order: v.order ?? null,
      });
      // the table may not exist yet on a fresh project — don't fail the user for that
      if (error && !/relation .* does not exist|schema cache/i.test(error.message)) {
        return { error: error.message };
      }
      return {};
    }
    try {
      const raw = window.localStorage.getItem("cupkw-community");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ ...v, at: new Date().toISOString() });
      window.localStorage.setItem("cupkw-community", JSON.stringify(list));
    } catch {
      /* ignore */
    }
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, joinCommunity }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
