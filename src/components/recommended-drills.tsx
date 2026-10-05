"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfidenceBar } from "@/components/confidence-form";
import type { RecommendedDrill } from "@/lib/repertoire/queries";

export function RecommendedDrills({
  drills,
  showDrillTypeFilter = false,
}: {
  drills: RecommendedDrill[];
  showDrillTypeFilter?: boolean;
}) {
  const [drillType, setDrillType] = useState("All");
  const drillTypes = ["All", ...new Set(drills.map((drill) => drill.type))];
  const visibleDrills =
    drillType === "All" ? drills : drills.filter((drill) => drill.type === drillType);

  return (
    <section className="mt-10">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">Recommended next</p>
      <h2 className="mt-3 text-4xl">Drills to work on.</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
        These drills target areas with the lowest current coverage in your routine.
      </p>
      {drills.length > 0 ? (
        <>
        {showDrillTypeFilter && (
          <label className="mt-6 flex max-w-xs flex-col gap-2 text-sm font-bold text-[var(--muted)]">
            Filter by drill type
            <select
              value={drillType}
              onChange={(event) => setDrillType(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal text-[var(--ink)]"
            >
              {drillTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {visibleDrills.map((drill) => {
            return (
              <Link
                key={drill.id}
                href={`/drills/${drill.id}`}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] transition hover:border-[var(--teal)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">{drill.type}</p>
                <h3 className="mt-3 text-2xl">{drill.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{drill.description}</p>
                <p className="mt-5 text-sm text-[var(--muted)]">Current area coverage: <span className="font-bold text-[var(--ink)]">{drill.coverage}%</span></p>
                {drill.inRoutine && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-[var(--muted)]">
                      Current mastery:{" "}
                      <span className="font-bold text-[var(--ink)]">
                        {drill.mastery === null || drill.mastery === undefined
                          ? "Unknown"
                          : `${drill.mastery}%`}
                      </span>
                    </p>
                    <ConfidenceBar confidence={drill.mastery ?? null} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        {visibleDrills.length === 0 && (
          <p className="mt-6 text-[var(--muted)]">No recommendations match this drill type.</p>
        )}
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">Recommendations will appear as soon as drills are available in the catalog.</p>
      )}
    </section>
  );
}
