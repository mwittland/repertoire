import type { DiscoverableShot } from "@/lib/discovery/types";
import { summarizeRepertoire } from "@/lib/repertoire/profile-summary";

export function RepertoireProfileSummary({
  shots,
  empty = false,
}: {
  shots: DiscoverableShot[];
  empty?: boolean;
}) {
  const summary = summarizeRepertoire(shots);
  const value = (calculated: string) => (empty ? "?" : calculated);

  return (
    <section className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Strongest shot family", value(`${summary.strongestFamily.type} · ${Math.round(summary.strongestFamily.confidence)}%`)],
          ["Weakest shot family", value(`${summary.weakestFamily.type} · ${Math.round(summary.weakestFamily.confidence)}%`)],
          ["Fore stroke preference", value(summary.foreStrokePreference)],
          ["Stronger court side", value(summary.betterSide)],
          ["Strongest court zone", value(capitalize(summary.strongestCourtZone.zone))],
          ["Weakest court zone", value(capitalize(summary.weakestCourtZone.zone))],
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

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
