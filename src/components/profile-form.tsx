"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateHandedness, type ProfileState } from "@/app/actions/profile";

export function ProfileForm({
  initialHandedness,
}: {
  initialHandedness: "Right" | "Left";
}) {
  const router = useRouter();
  const [handedness, setHandedness] = useState(initialHandedness);
  const [state, setState] = useState<ProfileState>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({});
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateHandedness(formData);
      setState(result);
      if (result.success) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-5">
      <label className="block text-sm text-[var(--muted)]">
        Handedness
        <select
          name="handedness"
          value={handedness}
          onChange={(event) =>
            setHandedness(event.target.value as "Right" | "Left")
          }
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
        >
          <option value="Right">Right handed</option>
          <option value="Left">Left handed</option>
        </select>
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm font-bold text-[var(--teal)]">Profile updated.</p>
      )}
      <button
        disabled={pending}
        className="site-action px-5 py-3 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save handedness"}
      </button>
    </form>
  );
}
