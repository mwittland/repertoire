import Link from "next/link";
import { ConfidenceBar } from "@/components/confidence-form";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function ShotCard({
  shot,
}: {
  shot: DiscoverableShot;
}) {
  return (
    <Link href={`/shots/${shot.id}`} className="group block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--teal)] hover:shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            {shot.shotType ?? "Shot"}
          </p>
          <h3 className="mt-2 text-2xl">{shot.name}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {shot.description}
      </p>
      <div className="mt-5 space-y-2">
        <Score label="Aggression" value={shot.aggressionScore ?? 0} />
        <Score label="Difficulty" value={shot.difficulty ?? 0} />
        {shot.confidence !== undefined && (
          <ConfidenceBar confidence={shot.confidence} />
        )}
      </div>
    </Link>
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
          className={`h-1.5 rounded-full ${label === "Difficulty" ? "bg-[#648ac0]" : "bg-[var(--coral)]"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
