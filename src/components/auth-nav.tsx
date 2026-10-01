"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function AuthNav() {
  const [supabase] = useState(createClient);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) setAuthenticated(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (authenticated === null) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-9 w-20 rounded-full border border-[var(--line)]"
      />
    );
  }

  return authenticated ? (
    <form action={signOut}>
      <button
        type="submit"
        className="nav-action px-4 py-2"
      >
        Sign out
      </button>
    </form>
  ) : (
    <Link
      href="/login"
      className="nav-action px-4 py-2"
    >
      Sign in
    </Link>
  );
}
