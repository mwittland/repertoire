"use client";

import { useState } from "react";
import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";
import { RepertoireShotCard } from "@/components/repertoire-shot-card";

const shotTypes: Array<ShotType | "All"> = [
  "All",
  "Dink",
  "Drop",
  "Drive",
  "Reset",
  "Attack",
  "Putaway",
  "Lob",
];

export function RepertoireShotsList({ shots }: { shots: DiscoverableShot[] }) {
  const [shotType, setShotType] = useState<ShotType | "All">("All");
  const visibleShots = shots
    .filter((shot) => shotType === "All" || shot.shotType === shotType)

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl">
          Your shots <span className="text-base font-normal text-[var(--muted)]">{visibleShots.length}</span>
        </h2>
        <select
            value={shotType}
            onChange={(event) => setShotType(event.target.value as ShotType | "All")}
            className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-[var(--ink)]"
            aria-label="Filter repertoire shots by type"
          >
            {shotTypes.map((type) => <option key={type} value={type}>{type === "All" ? "All types" : type}</option>)}
        </select>
      </div>
      {visibleShots.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleShots.map((shot) => <RepertoireShotCard key={shot.id} shot={shot} />)}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
          No repertoire shots match this filter.
        </p>
      )}
    </section>
  );
}
