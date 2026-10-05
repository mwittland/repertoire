import Link from "next/link";
import type { Drill } from "@/lib/drills/types";

export function DrillCard({ drill }: { drill: Drill }) {
  return (
    <Link href={`/drills/${drill.id}`} className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] transition hover:border-[var(--teal)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">{drill.type}</p>
      <h3 className="mt-3 text-2xl">{drill.name}</h3>
      <p className="mt-3 leading-6 text-[var(--muted)]">{drill.description}</p>
    </Link>
  );
}
