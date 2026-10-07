"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resetRepertoire } from "@/app/actions/repertoire-quiz";

export function ResetRepertoireLink() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    if (
      !window.confirm(
        "Are you sure you want to clear your entire repertoire? This cannot be undone.",
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await resetRepertoire();
      if (result.success) {
        router.push("/repertoire");
      } else {
        setError(result.error ?? "Unable to reset your repertoire.");
      }
    });
  }

  return (
    <div className="h-full">
      <button
        type="button"
        onClick={reset}
        disabled={pending}
        className="block h-full w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-left text-2xl font-bold transition hover:border-[var(--teal)] disabled:opacity-50"
      >
        {pending ? "Resetting your repertoire..." : "Reset your repertoire"}{" "}
        <span className="float-right text-[var(--teal)]">→</span>
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--coral)]">
          {error}
        </p>
      )}
    </div>
  );
}
