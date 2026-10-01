"use client";

import { useActionState } from "react";
import {
  updateDrill,
  updateShot,
  type AdminFormState,
} from "@/app/actions/admin";
import type { DiscoverableShot } from "@/lib/discovery/types";
import type { Drill } from "@/lib/drills/queries";

function Input({
  name,
  label,
  defaultValue,
  type = "text",
  min,
  max,
  required = true,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
}) {
  return (
    <label className="block text-sm text-[var(--muted)]">
      {label}
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
      />
    </label>
  );
}

export function EditShotForm({ shot }: { shot: DiscoverableShot }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    updateShot,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="id" value={shot.id} />
      <Input name="name" label="Name" defaultValue={shot.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="courtXMin"
          label="Court X minimum"
          type="number"
          min={-15}
          max={15}
          defaultValue={shot.courtXMin}
        />
        <Input
          name="courtXMax"
          label="Court X maximum"
          type="number"
          min={-15}
          max={15}
          defaultValue={shot.courtXMax}
        />
        <Input
          name="courtYMin"
          label="Court Y minimum"
          type="number"
          min={0}
          max={30}
          defaultValue={shot.courtYMin}
        />
        <Input
          name="courtYMax"
          label="Court Y maximum"
          type="number"
          min={0}
          max={30}
          defaultValue={shot.courtYMax}
        />
        <Input
          name="ballHeightMin"
          label="Ball height minimum"
          type="number"
          min={0}
          max={10}
          defaultValue={shot.ballHeightMin}
        />
        <Input
          name="ballHeightMax"
          label="Ball height maximum"
          type="number"
          min={0}
          max={10}
          defaultValue={shot.ballHeightMax}
        />
        <Input
          name="intentMin"
          label="Intent minimum"
          type="number"
          min={0}
          max={100}
          defaultValue={shot.intentMin}
        />
        <Input
          name="intentMax"
          label="Intent maximum"
          type="number"
          min={0}
          max={100}
          defaultValue={shot.intentMax}
        />
        <Input
          name="difficulty"
          label="Difficulty (0 to 5)"
          type="number"
          min={0}
          max={5}
          defaultValue={shot.difficulty}
        />
      </div>
      <Input
        name="videoUrl"
        label="Video URL (optional)"
        type="url"
        defaultValue={shot.videoUrl}
        required={false}
      />
      <TextArea
        name="description"
        label="Description"
        defaultValue={shot.description}
      />
      <TextArea
        name="instructions"
        label="Instructions"
        defaultValue={shot.instructions}
      />
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save shot"}
      </button>
    </form>
  );
}

export function EditDrillForm({ drill }: { drill: Drill }) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    updateDrill,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="id" value={drill.id} />
      <Input name="name" label="Name" defaultValue={drill.name} />
      <TextArea
        name="description"
        label="Description"
        defaultValue={drill.description}
      />
      <Input
        name="videoUrl"
        label="Video URL (optional)"
        type="url"
        defaultValue={drill.videoUrl}
        required={false}
      />
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save drill"}
      </button>
    </form>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm text-[var(--muted)]">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        required
        className="mt-2 min-h-28 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
      />
    </label>
  );
}
