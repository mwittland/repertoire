"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AnonymousHandedness({
  value,
  onChange,
}: {
  value: "Right" | "Left";
  onChange: (value: "Right" | "Left") => void;
}) {
  const [supabase] = useState(createClient);
  const [anonymous, setAnonymous] = useState(false);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setAnonymous(!data.user));
  }, [supabase]);
  if (!anonymous) return null;
  return (
    <div className="mt-5">
      <p className="text-sm font-bold text-[var(--ink)]">Playing hand</p>
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-[var(--line)] p-1">
        <button
          type="button"
          onClick={() => onChange("Left")}
          className={`rounded-lg px-3 py-2 text-sm font-bold ${value === "Left" ? "bg-[var(--button)] text-[#101714]" : "text-[var(--muted)]"}`}
        >
          Lefty
        </button>
        <button
          type="button"
          onClick={() => onChange("Right")}
          className={`rounded-lg px-3 py-2 text-sm font-bold ${value === "Right" ? "bg-[var(--button)] text-[#101714]" : "text-[var(--muted)]"}`}
        >
          Righty
        </button>
      </div>
    </div>
  );
}
