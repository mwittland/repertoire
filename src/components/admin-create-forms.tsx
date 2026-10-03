"use client";

import { useActionState } from "react";
import {
  createDrill,
  createShot,
  type AdminFormState,
} from "@/app/actions/admin";
import { AdminShotRangeEditor } from "@/components/admin-shot-range-editor";
import {
  AssociationPicker,
  type AssociationOption,
} from "@/components/association-picker";
import { ScoreInput } from "@/components/score-input";

function Field({
  name,
  label,
  type = "text",
  min,
  max,
  step = "any",
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  min?: number;
  max?: number;
  step?: string;
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
        step={step}
        required={required}
        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
      />
    </label>
  );
}

export function CreateShotForm({
  drills = [],
}: {
  drills?: AssociationOption[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createShot,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <Field name="name" label="Name" />
      <label className="block text-sm text-[var(--muted)]">
        Drill type
        <select name="type" defaultValue="Solo" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]">
          <option>Solo</option>
          <option>Wall</option>
          <option>Ball Machine</option>
          <option>Partner+</option>
        </select>
      </label>
      <AdminShotRangeEditor />
      <AssociationPicker
        name="drillIds"
        label="Related drills"
        options={drills}
      />
      <label className="block text-sm text-[var(--muted)]">
        Shot type
        <select
          name="shotType"
          defaultValue="Reset"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
        >
          {["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"].map(
            (type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ),
          )}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <ScoreInput
          name="aggressionScore"
          label="Aggression"
          initialValue={50}
        />
        <ScoreInput name="difficulty" label="Difficulty" initialValue={50} />
      </div>
      <Field
        name="videoUrl"
        label="Video URL (optional)"
        type="url"
        required={false}
      />
      <label className="block text-sm text-[var(--muted)]">
        Description
        <textarea
          name="description"
          required
          className="mt-2 min-h-24 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
        />
      </label>
      <label className="block text-sm text-[var(--muted)]">
        Instructions
        <textarea
          name="instructions"
          required
          className="mt-2 min-h-32 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create shot"}
      </button>
    </form>
  );
}

export function CreateDrillForm({
  shots = [],
}: {
  shots?: AssociationOption[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    createDrill,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <Field name="name" label="Name" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="courtXMin" label="Court X minimum" min={-15} max={15} />
        <Field name="courtXMax" label="Court X maximum" min={-15} max={15} />
        <Field name="courtYMin" label="Court Y minimum" min={0} max={30} />
        <Field name="courtYMax" label="Court Y maximum" min={0} max={30} />
        <Field name="ballHeightMin" label="Ball height minimum" min={0} max={10} />
        <Field name="ballHeightMax" label="Ball height maximum" min={0} max={10} />
      </div>
      <AssociationPicker
        name="shotIds"
        label="Shots in this drill"
        options={shots}
      />
      <label className="block text-sm text-[var(--muted)]">
        Description
        <textarea
          name="description"
          required
          className="mt-2 min-h-32 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-[var(--ink)]"
        />
      </label>
      <Field
        name="videoUrl"
        label="Video URL (optional)"
        type="url"
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
        {pending ? "Creating..." : "Create drill"}
      </button>
    </form>
  );
}
