"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeFromRepertoire } from "@/app/actions/repertoire";
import { ConfidenceForm } from "@/components/confidence-form";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function RepertoireShotCard({ shot }: { shot: DiscoverableShot }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [pending, startTransition] = useTransition();

  function openShot() {
    if (removing) return;
    router.push(`/shots/${shot.id}`);
  }

  function removeShot() {
    const formData = new FormData();
    formData.set("shotId", shot.id);
    startTransition(async () => {
      await removeFromRepertoire(formData);
      setRemoving(true);
      router.refresh();
    });
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openShot}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openShot();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--teal)] hover:shadow-[var(--shadow)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
        {shot.shotType ?? "Shot"}
      </p>
      <h2 className="mt-2 text-2xl">{shot.name}</h2>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {shot.description}
      </p>
      <div className="mt-5 space-y-2">
        <Score label="Aggression" value={shot.aggressionScore ?? 0} />
        <Score label="Difficulty" value={shot.difficulty ?? 0} />
      </div>
      <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <ConfidenceForm
          shotId={shot.id}
          initialConfidence={shot.confidence ?? null}
          compact
          flush
        />
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          removeShot();
        }}
        disabled={pending || removing}
        className="mt-4 text-sm font-bold text-[var(--coral)] disabled:opacity-50"
      >
        {pending || removing ? "Removing..." : "Remove from repertoire"}
      </button>
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
          className={`h-1.5 rounded-full ${label === "Difficulty" ? "bg-[#648ac0]" : "bg-[var(--coral)]"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
