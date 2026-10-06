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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function createLink() {
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
      const shareText = `Check out ${profileName}'s pickleball repertoire on Repertoire.`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${profileName}'s repertoire on Repertoire`,
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
    <div>
      <button
        type="button"
        onClick={createLink}
        disabled={pending}
        className="inline-block rounded-xl bg-[var(--teal)] px-5 py-4 font-bold text-white disabled:opacity-50"
      >
        Share
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--coral)]">{error}</p>}
    </div>
  );
}
