"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addToRoutine } from "@/app/actions/drills";

export function RoutineAddButton({ drillId }: { drillId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function addDrill() {
    const formData = new FormData();
    formData.set("drillId", drillId);
    startTransition(async () => {
      const result = await addToRoutine(formData);
      if (result.success) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={addDrill}
      disabled={pending}
      className="mt-9 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
    >
      {pending ? "Adding..." : "Add to repertoire"}
    </button>
  );
}
