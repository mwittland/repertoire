"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { quickAddToRepertoire } from "@/app/actions/repertoire";
import { ConfidenceBar } from "@/components/confidence-form";
import type { RecommendedShot } from "@/lib/repertoire/queries";

export function RecommendedShots({
  shots,
  showShotTypeFilter = false,
}: {
  shots: RecommendedShot[];
  showShotTypeFilter?: boolean;
}) {
  const [added, setAdded] = useState<string[]>([]);
  const [pendingShot, setPendingShot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [shotType, setShotType] = useState("All");
  const shotTypes = ["All", ...new Set(shots.map((shot) => shot.shotType))];
  const visibleShots =
    shotType === "All"
      ? shots
      : shots.filter((shot) => shot.shotType === shotType);

  function addShot(shotId: string) {
    const formData = new FormData();
    formData.set("shotId", shotId);
    setError(null);
    setPendingShot(shotId);
    startTransition(async () => {
      const result = await quickAddToRepertoire(formData);
      if (result.success) setAdded((current) => [...current, shotId]);
      else setError(result.error ?? "Unable to add this shot right now.");
      setPendingShot(null);
    });
  }

  return (
    <section className="mt-10">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Recommended next
        </p>
        <h2 className="mt-3 text-4xl">Shots to add or work on.</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          These shots target areas with the lowest current coverage in your repertoire.
        </p>
      </div>
      {shots.length > 0 ? (
        <>
        {showShotTypeFilter && (
          <label className="mt-6 flex max-w-xs flex-col gap-2 text-sm font-bold text-[var(--muted)]">
            Filter by shot type
            <select
              value={shotType}
              onChange={(event) => setShotType(event.target.value)}
              className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 font-normal text-[var(--ink)]"
            >
              {shotTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {visibleShots.map((shot) => {
          const isAdded = added.includes(shot.id);
          const isPending = pending && pendingShot === shot.id;
          return (
            <article
              key={shot.id}
              className={`rounded-2xl border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow)] ${
                shot.inRepertoire ? "transition hover:border-[var(--teal)]" : ""
              }`}
            >
              {shot.inRepertoire ? (
                <Link href={`/shots/${shot.id}`} className="block p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                    {shot.shotType}
                  </p>
                  <h3 className="mt-3 text-2xl">{shot.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {shot.description}
                  </p>
                  <p className="mt-5 text-sm text-[var(--muted)]">
                    Current area coverage:{" "}
                    <span className="font-bold text-[var(--ink)]">
                      {shot.coverage}%
                    </span>
                  </p>
                  <div className="mt-4">
                    <ConfidenceBar confidence={shot.confidence ?? null} />
                  </div>
                  <ScoreBar label="Aggression" value={shot.aggressionScore ?? 0} />
                  <ScoreBar label="Difficulty" value={shot.difficulty ?? 0} blue />
                </Link>
              ) : isAdded ? (
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                    {shot.shotType}
                  </p>
                  <h3 className="mt-3 text-2xl">{shot.name}</h3>
                  <p className="mt-5 font-bold text-[var(--teal)]">
                    Added to your repertoire
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                    {shot.shotType}
                  </p>
                  <h3 className="mt-3 text-2xl">{shot.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {shot.description}
                  </p>
                  <p className="mt-5 text-sm text-[var(--muted)]">
                    Current area coverage:{" "}
                    <span className="font-bold text-[var(--ink)]">
                      {shot.coverage}%
                    </span>
                  </p>
                  <div className="mt-4 space-y-3">
                    <ScoreBar label="Aggression" value={shot.aggressionScore ?? 0} />
                    <ScoreBar label="Difficulty" value={shot.difficulty ?? 0} blue />
                  </div>
                  <button
                    type="button"
                    onClick={() => addShot(shot.id)}
                    disabled={pending}
                    className="mt-5 rounded-xl bg-[var(--ink)] px-4 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {isPending ? "Adding..." : "Add to repertoire"}
                  </button>
                </div>
              )}
            </article>
          );
          })}
        </div>
        {visibleShots.length === 0 && (
          <p className="mt-6 text-[var(--muted)]">No recommendations match this shot type.</p>
        )}
        </>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
          Recommendations will appear as soon as shots are available in the catalog.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-[var(--coral)]">
          {error}
        </p>
      )}
    </section>
  );
}

function ScoreBar({ label, value, blue = false }: { label: string; value: number; blue?: boolean }) {
  return (
    <div className="mt-3 text-xs text-[var(--muted)]">
      <div className="mb-1 flex justify-between"><span>{label}</span><span>{value}</span></div>
      <div className="h-1.5 rounded-full bg-[#d4e0d6]">
        <div className={`h-1.5 rounded-full ${blue ? "bg-[#648ac0]" : "bg-[var(--coral)]"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
