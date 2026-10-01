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
      <Field
        name="aggressionScore"
        label="Aggression (0 to 100)"
        type="number"
        min={0}
        max={100}
        step="1"
      />
      <Field
        name="difficulty"
        label="Difficulty (0 to 100)"
        type="number"
        min={0}
        max={100}
        step="1"
      />
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
