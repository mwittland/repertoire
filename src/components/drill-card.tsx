"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToRoutine, removeFromRoutine } from "@/app/actions/drills";
import { MasteryForm } from "@/components/mastery-form";
import type { Drill } from "@/lib/drills/types";

export function DrillCard({ drill }: { drill: Drill }) {
  const router = useRouter();
  const [inRoutine, setInRoutine] = useState(drill.mastery !== undefined);
  const [pending, startTransition] = useTransition();

  function changeRoutine() {
    const formData = new FormData();
    formData.set("drillId", drill.id);
    startTransition(async () => {
      const result = inRoutine ? await removeFromRoutine(formData) : await addToRoutine(formData);
      if (!result || result.success !== false) {
        setInRoutine(!inRoutine);
        router.refresh();
      }
    });
  }

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">{drill.type} drill</p>
      <Link href={`/drills/${drill.id}`} className="group block">
        <h3 className="mt-3 text-2xl group-hover:text-[var(--teal)]">{drill.name}</h3>
        <p className="mt-3 leading-6 text-[var(--muted)]">{drill.description}</p>
      </Link>
      {inRoutine && <MasteryForm drillId={drill.id} initialMastery={drill.mastery ?? 0} compact />}
      <button type="button" onClick={changeRoutine} disabled={pending} className="mt-5 text-sm font-bold text-[var(--teal)] disabled:opacity-50">
        {pending ? "Updating..." : inRoutine ? "Remove from repertoire" : "+ Add to repertoire"}
      </button>
    </article>
  );
}
