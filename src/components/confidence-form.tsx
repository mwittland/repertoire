"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateConfidence } from "@/app/actions/repertoire";

export function ConfidenceBar({
  confidence,
  interactive = false,
  onChange,
  large = false,
}: {
  confidence: number | null;
  interactive?: boolean;
  onChange?: (value: number) => void;
  large?: boolean;
}) {
  const value = confidence ?? 0;
  return (
    <div
      className={
        large ? "text-sm text-[var(--muted)]" : "text-xs text-[var(--muted)]"
      }
    >
      <div
        className={
          large ? "mb-2 flex justify-between" : "mb-1 flex justify-between"
        }
      >
        <span>Confidence</span>
        <span>{confidence === null ? "?" : confidence}</span>
      </div>
      <div
        className={`relative rounded-full bg-[#d4e0d6] ${large ? "h-2" : "h-1.5"}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--teal)] transition-[width]"
          style={{ width: `${value}%` }}
        />
        {interactive && (
          <input
            aria-label="Confidence from 0 to 100"
            type="range"
            name="confidence"
            min="0"
            max="100"
            value={value}
            onChange={(event) => onChange?.(Number(event.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        )}
      </div>
    </div>
  );
}

export function ConfidenceForm({
  shotId,
  initialConfidence,
  compact = false,
  flush = false,
}: {
  shotId: string;
  initialConfidence: number | null;
  compact?: boolean;
  flush?: boolean;
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
      className={compact ? (flush ? "" : "pt-5") : "mt-4"}
    >
      <input type="hidden" name="shotId" value={shotId} />
      <div className={compact && !flush ? "mt-4" : ""}>
        <ConfidenceBar
          confidence={confidence}
          interactive
          large={!compact}
          onChange={(value) => {
            setConfidence(value);
            setSaved(false);
          }}
        />
      </div>
      <button
        disabled={pending}
        className={
          compact
            ? "mt-3 text-sm font-bold text-[var(--teal)] disabled:opacity-50"
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
