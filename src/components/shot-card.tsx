import Link from "next/link";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function ShotCard({ shot }: { shot: DiscoverableShot }) {
  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            {shot.shotType ?? "Shot"}
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
      <div className="mt-5 space-y-2">
        <Score label="Aggression" value={shot.aggressionScore ?? 0} />
        <Score label="Difficulty" value={shot.difficulty ?? 0} />
      </div>
    </article>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-xs text-[var(--muted)]">
      <div className="mb-1 flex justify-between">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#d4e0d6]">
        <div
          className="h-1.5 rounded-full bg-[var(--coral)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
