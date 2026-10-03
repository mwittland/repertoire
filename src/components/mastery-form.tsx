"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateDrillMastery } from "@/app/actions/drills";

export function MasteryForm({
  drillId,
  initialMastery,
  compact = false,
}: {
  drillId: string;
  initialMastery: number | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [mastery, setMastery] = useState(initialMastery ?? 0);
  const [pending, startTransition] = useTransition();

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await updateDrillMastery(formData);
      router.refresh();
    });
  }

  return (
    <form onSubmit={save} className={compact ? "mt-4" : "mt-6"}>
      <input type="hidden" name="drillId" value={drillId} />
      <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
        <span>Mastery</span>
        <span>{mastery}</span>
      </div>
      <div className="relative h-2 rounded-full bg-[#d4e0d6]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#d8a43f]"
          style={{ width: `${mastery}%` }}
        />
        <input
          aria-label="Drill mastery from 0 to 100"
          type="range"
          name="mastery"
          min="0"
          max="100"
          value={mastery}
          onChange={(event) => setMastery(Number(event.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <button
        disabled={pending}
        className="mt-3 text-sm font-bold text-[#b17b16] disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save mastery"}
      </button>
    </form>
  );
}
