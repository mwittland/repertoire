"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthNav() {
  const [supabase] = useState(createClient);
  const pathname = usePathname();
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
  }, [pathname, supabase]);

  if (authenticated === null) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-9 w-20 rounded-full border border-[var(--line)]"
      />
    );
  }

  return authenticated ? (
    <Link href="/profile" className="nav-action px-4 py-2">
      Profile
    </Link>
  ) : (
    <Link href="/login" className="nav-action px-4 py-2">
      Sign in
    </Link>
  );
}
