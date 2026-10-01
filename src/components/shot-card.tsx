import Link from "next/link";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function ShotCard({ shot }: { shot: DiscoverableShot }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            Difficulty {shot.difficulty ?? "-"} / 5
          </p>
          <h3 className="mt-2 text-2xl">{shot.name}</h3>
        </div>
        <Link
          href={`/shots/${shot.id}`}
          className="text-sm font-bold text-[var(--teal)]"
        >
          Learn →
        </Link>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {shot.description}
      </p>
    </article>
  );
}
