"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { quickAddToRepertoire } from "@/app/actions/repertoire";
import { ConfidenceBar, ConfidenceForm } from "@/components/confidence-form";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function ShotCard({
  shot,
  editableConfidence = true,
}: {
  shot: DiscoverableShot;
  editableConfidence?: boolean;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(shot.confidence !== undefined);
  const [pending, startTransition] = useTransition();

  function openShot() {
    router.push(`/shots/${shot.id}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openShot();
    }
  }

  function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await quickAddToRepertoire(formData);
      if (result.success) {
        setAdded(true);
        router.refresh();
      }
    });
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openShot}
      onKeyDown={handleKeyDown}
      className="group block rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--teal)] hover:shadow-[var(--shadow)]"
    >
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
        {(shot.confidence !== undefined || added) && (
          <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            {editableConfidence ? (
              <ConfidenceForm
                shotId={shot.id}
                initialConfidence={added ? shot.confidence ?? 0 : shot.confidence ?? null}
                compact
                flush
              />
            ) : (
              <ConfidenceBar confidence={added ? shot.confidence ?? 0 : shot.confidence ?? null} />
            )}
          </div>
        )}
        {shot.confidence === undefined && !added && (
          <form
            onSubmit={handleQuickAdd}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className="pt-3"
          >
            <input type="hidden" name="shotId" value={shot.id} />
            <button
              type="submit"
              disabled={pending}
              className="text-sm font-bold text-[var(--teal)] disabled:opacity-50"
            >
              {pending ? "Adding..." : "+ Add to repertoire"}
            </button>
          </form>
        )}
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
          className={`h-1.5 rounded-full ${label === "Difficulty" ? "bg-[#648ac0]" : "bg-[var(--coral)]"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
