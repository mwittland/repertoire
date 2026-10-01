"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function LibrarySearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    const currentValue = searchParams.get("q") ?? "";
    if (deferredValue === currentValue) return;
    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (deferredValue.trim()) nextParams.set("q", deferredValue.trim());
      else nextParams.delete("q");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [deferredValue, pathname, router, searchParams]);

  return <div className="mt-10 flex max-w-3xl gap-3"><input aria-label="Search shots and drills" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search shots or drills" className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-[var(--ink)] shadow-[var(--shadow)]" />{value && <button type="button" onClick={() => setValue("")} className="nav-action shrink-0 px-4 py-3">Clear</button>}</div>;
}
