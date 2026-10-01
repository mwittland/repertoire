"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminLink() {
  const [supabase] = useState(createClient);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadAdminStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (mounted) setIsAdmin(Boolean(profile?.is_admin));
    };

    void loadAdminStatus();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void loadAdminStatus());
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return isAdmin ? (
    <Link href="/admin" className="font-bold text-[var(--coral)]">
      Admin
    </Link>
  ) : null;
}
