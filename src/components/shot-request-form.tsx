"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  submitShotRequest,
  type ShotRequestState,
} from "@/app/actions/shot-requests";

export function ShotRequestForm() {
  const [state, action, pending] = useActionState<ShotRequestState, FormData>(
    submitShotRequest,
    {},
  );
  if (state.success)
    return (
      <div className="mt-8 rounded-2xl border border-[#9ac6af] bg-[#e5f0e9] p-6">
        <h2 className="text-2xl">Request received.</h2>
        <p className="mt-2 text-[var(--muted)]">
          We&apos;ll review the video and add the shot when it is ready.
        </p>
        <Link
          href="/discover"
          className="mt-5 inline-block font-bold text-[var(--teal)]"
        >
          Back to discovery →
        </Link>
      </div>
    );

  return (
    <form action={action} className="mt-8 space-y-5">
      <label className="block text-sm text-[var(--muted)]">
        Requested shot name
        <input
          name="requestedName"
          required
          minLength={2}
          placeholder="e.g. Backhand roll"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
        />
      </label>
      <label className="block text-sm text-[var(--muted)]">
        Video URL
        <input
          name="videoUrl"
          type="url"
          required
          placeholder="https://..."
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit request"}
      </button>
    </form>
  );
}
