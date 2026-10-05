"use client";

import { useActionState } from "react";
import { submitShotVideoRequest, type ShotVideoRequestState } from "@/app/actions/shot-video-requests";

export function ShotVideoRequestForm({ shotId }: { shotId: string }) {
  const [state, action, pending] = useActionState<ShotVideoRequestState, FormData>(
    submitShotVideoRequest,
    {},
  );
  if (state.success) {
    return <p className="mt-4 text-sm text-[var(--teal)]">Video request submitted for review.</p>;
  }
  return (
    <form action={action} className="mt-6 space-y-4 border-t border-[var(--line)] pt-6">
      <input type="hidden" name="shotId" value={shotId} />
      <p className="text-sm font-bold text-[var(--muted)]">Suggest a video</p>
      <input name="videoUrl" type="url" required placeholder="YouTube URL" className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="startSeconds" type="number" min="0" required placeholder="Start seconds" className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]" />
        <input name="endSeconds" type="number" min="1" required placeholder="End seconds" className="w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]" />
      </div>
      {state.error && <p role="alert" className="text-sm text-[var(--coral)]">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-xl border border-[var(--line)] px-4 py-3 font-bold text-[var(--ink)] disabled:opacity-50">
        {pending ? "Submitting..." : "Request video review"}
      </button>
    </form>
  );
}
