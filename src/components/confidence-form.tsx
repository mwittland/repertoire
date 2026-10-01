"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateConfidence } from "@/app/actions/repertoire";

export function ConfidenceForm({
  shotId,
  initialConfidence,
  compact = false,
}: {
  shotId: string;
  initialConfidence: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [confidence, setConfidence] = useState(initialConfidence);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateConfidence(formData);
      if (result.success) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.error ?? "Unable to save confidence.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "flex items-center justify-between border-t border-[var(--line)] pt-5"
          : "mt-9"
      }
    >
      <input type="hidden" name="shotId" value={shotId} />
      <label className="text-sm text-[var(--muted)]">
        {compact ? "Confidence" : "Your confidence"}
        <select
          name="confidence"
          value={confidence}
          onChange={(event) => setConfidence(Number(event.target.value))}
          className={
            compact
              ? "ml-3 rounded-lg border border-[var(--line)] bg-transparent px-2 py-1 font-bold text-[var(--ink)]"
              : "mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-3 font-bold text-[var(--ink)]"
          }
        >
          {[0, 1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} / 5
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={pending}
        className={
          compact
            ? "text-sm font-bold text-[var(--teal)] disabled:opacity-50"
            : "mt-4 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
        }
      >
        {pending
          ? "Saving..."
          : saved
            ? "Saved"
            : compact
              ? "Save"
              : "Save confidence"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--coral)]">
          {error}
        </p>
      )}
    </form>
  );
}
