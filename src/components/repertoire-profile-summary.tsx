import type { DiscoverableShot } from "@/lib/discovery/types";
import { summarizeRepertoire } from "@/lib/repertoire/profile-summary";

export function RepertoireProfileSummary({
  shots,
}: {
  shots: DiscoverableShot[];
}) {
  const summary = summarizeRepertoire(shots);

  return (
    <section className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Strongest shot family", `${summary.strongestFamily.type} · ${Math.round(summary.strongestFamily.confidence)}%`],
          ["Weakest shot family", `${summary.weakestFamily.type} · ${Math.round(summary.weakestFamily.confidence)}%`],
          ["Hand preference", summary.handDominance],
          ["Stronger court side", summary.betterSide],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              {label}
            </p>
            <p className="mt-3 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
