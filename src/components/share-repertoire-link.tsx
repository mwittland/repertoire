"use client";

import { useState, useTransition } from "react";
import { createSharedRepertoire } from "@/app/actions/shared-repertoire";
import type { DiscoverableShot } from "@/lib/discovery/types";

export function ShareRepertoireLink({
  shots,
  handedness,
  profileName,
}: {
  shots: DiscoverableShot[];
  handedness: "Right" | "Left";
  profileName: string;
}) {
  const disabled = shots.length === 0;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function createLink() {
    if (disabled) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("profileName", profileName);
      formData.set("handedness", handedness);
      formData.set("shots", JSON.stringify(shots));
      const result = await createSharedRepertoire(formData);
      if (!result.success) {
        setError(result.error ?? "Unable to create a share link.");
        return;
      }
      const shareUrl = `${window.location.origin}/repertoire/shared/${result.token}`;
      const shareText = `Check out ${profileName}'s Repertoire.`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${profileName}'s Repertoire`,
            text: shareText,
            url: shareUrl,
          });
          setMessage("Share sheet opened.");
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          setMessage("Share link copied to your clipboard.");
        } else {
          setError("The link was created, but this browser cannot share or copy it.");
        }
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") {
          return;
        }
        setError("The link was created, but could not be shared.");
      }
    });
  }

  return (
    <div className="h-full">
      <button
        type="button"
        onClick={createLink}
        disabled={disabled || pending}
        className="block h-full w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-left text-2xl font-bold transition hover:border-[var(--teal)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Share your repertoire{" "}
        <span className="float-right text-[var(--teal)]">→</span>
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--coral)]">{error}</p>}
      {message && <p role="status" className="mt-2 text-sm text-[var(--teal)]">{message}</p>}
    </div>
  );
}
