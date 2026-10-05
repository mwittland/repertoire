"use client";

import { useState } from "react";
import { drillTypes, type Drill } from "@/lib/drills/types";
import type { DiscoverableShot } from "@/lib/discovery/types";
import { ShotCard } from "@/components/shot-card";
import { DrillCard } from "@/components/drill-card";

export function LibraryTabs({
  shots,
  drills,
  initialKind = "shots",
}: {
  shots: DiscoverableShot[];
  drills: Drill[];
  initialKind?: "shots" | "drills";
}) {
  const [kind, setKind] = useState<"shots" | "drills">(initialKind);
  const [shotType, setShotType] = useState("All");
  const [drillType, setDrillType] = useState("All");
  const visibleShots = shots
    .filter((shot) => shotType === "All" || shot.shotType === shotType)
  const visibleDrills = drills.filter(
    (drill) => drillType === "All" || drill.type === drillType,
  );
  return (
    <>
      <div className="mt-6 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setKind("shots")}
          className={`rounded-full px-4 py-2 font-bold ${kind === "shots" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--ink)]"}`}
        >
          Shots
        </button>
        <button
          type="button"
          onClick={() => setKind("drills")}
          className={`rounded-full px-4 py-2 font-bold ${kind === "drills" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--ink)]"}`}
        >
          Drills
        </button>
      </div>
      {kind === "shots" ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">
              Shots{" "}
              <span className="text-base font-normal text-[var(--muted)]">
                {visibleShots.length}
              </span>
            </h2>
            <select
              value={shotType}
              onChange={(event) => setShotType(event.target.value)}
              className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-[var(--ink)]"
            >
              <option value="All">All types</option>
              {[
                "Dink",
                "Drop",
                "Drive",
                "Reset",
                "Attack",
                "Putaway",
                "Lob",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          {visibleShots.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibleShots.map((shot) => (
                  <ShotCard key={shot.id} shot={shot} />
              ))}
            </div>
          ) : (
            <EmptySearch />
          )}
        </section>
      ) : (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">
              Drills{" "}
              <span className="text-base font-normal text-[var(--muted)]">
                {visibleDrills.length}
              </span>
            </h2>
            <select
              value={drillType}
              onChange={(event) => setDrillType(event.target.value)}
              aria-label="Filter drills by type"
              className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-[var(--ink)]"
            >
              <option value="All">All types</option>
              {drillTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {visibleDrills.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleDrills.map((drill) => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
            </div>
          ) : (
            <EmptySearch />
          )}
        </section>
      )}
    </>
  );
}

function EmptySearch() {
  return (
    <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
      No matches found. Try another search.
    </p>
  );
}
