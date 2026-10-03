"use client";

import Link from "next/link";
import { useState } from "react";
import type { Drill } from "@/lib/drills/queries";
import type { DiscoverableShot } from "@/lib/discovery/types";
import { ShotCard } from "@/components/shot-card";

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
  const [sort, setSort] = useState("name");
  const visibleShots = shots
    .filter((shot) => shotType === "All" || shot.shotType === shotType)
    .sort((left, right) =>
      sort === "aggression"
        ? (right.aggressionScore ?? 0) - (left.aggressionScore ?? 0)
        : sort === "difficulty"
          ? (right.difficulty ?? 0) - (left.difficulty ?? 0)
          : left.name.localeCompare(right.name),
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
            <div className="flex gap-2">
              <select
                value={shotType}
                onChange={(event) => setShotType(event.target.value)}
                className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-[var(--ink)]"
              >
                <option>All types</option>
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
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-[var(--line)] bg-transparent px-2 py-2 text-sm text-[var(--ink)]"
              >
                <option value="name">Name</option>
                <option value="aggression">Aggression</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
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
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">
              Drills{" "}
              <span className="text-base font-normal text-[var(--muted)]">
                {drills.length}
              </span>
            </h2>
          </div>
          {drills.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drills.map((drill) => (
                <Link
                  href={`/drills/${drill.id}`}
                  key={drill.id}
                  className="group block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[var(--teal)] hover:shadow-[var(--shadow)]"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                    Practice drill
                  </p>
                  <h3 className="mt-3 text-2xl">{drill.name}</h3>
                  <p className="mt-3 leading-6 text-[var(--muted)]">
                    {drill.description}
                  </p>
                </Link>
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
