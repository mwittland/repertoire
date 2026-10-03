"use client";

import { useActionState } from "react";
import { importDrillLibrary, type DrillLibraryImportState } from "@/app/actions/drill-library";

const initialState: DrillLibraryImportState = {};

export function AdminDrillLibraryTools() {
  const [state, action, pending] = useActionState(importDrillLibrary, initialState);
  return (
    <section className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl">Move your drill library</h2>
          <p className="mt-2 max-w-2xl leading-6 text-[var(--muted)]">
            Export or import drills separately from shots. Existing drills are never overwritten or deleted.
          </p>
        </div>
        <a href="/api/admin/drill-library/export" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--teal)] px-5 py-3 font-bold text-[var(--ink)] transition hover:brightness-110">
          Export drills CSV
        </a>
      </div>
      <form action={action} className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-bold">
          Import drills CSV
          <input name="file" type="file" accept=".csv,text/csv" required className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-normal" />
        </label>
        <button type="submit" disabled={pending} className="rounded-full border border-[var(--teal)] px-5 py-3 font-bold text-[var(--teal)] transition hover:bg-[var(--teal)] hover:text-[var(--ink)] disabled:cursor-wait disabled:opacity-50">
          {pending ? "Importing..." : "Import drills CSV"}
        </button>
      </form>
      {state.error && <p role="alert" className="mt-4 text-sm font-bold text-[var(--coral)]">{state.error}</p>}
      {state.success && <p role="status" className="mt-4 text-sm font-bold text-[var(--teal)]">{state.success}</p>}
      <p className="mt-4 text-xs text-[var(--muted)]">Required columns: name, type, court and ball-height ranges, description, video URL, and related shot names separated by |.</p>
    </section>
  );
}
