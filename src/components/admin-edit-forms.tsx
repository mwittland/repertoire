"use client";

import { useActionState } from "react";
import {
  updateDrill,
  updateShot,
  type AdminFormState,
} from "@/app/actions/admin";
import type { DiscoverableShot } from "@/lib/discovery/types";
import type { Drill } from "@/lib/drills/queries";
import { AdminShotRangeEditor } from "@/components/admin-shot-range-editor";
import {
  AssociationPicker,
  type AssociationOption,
} from "@/components/association-picker";
import { ScoreInput } from "@/components/score-input";

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

export function EditShotForm({
  shot,
  drills = [],
  selectedDrillIds = [],
}: {
  shot: DiscoverableShot;
  drills?: AssociationOption[];
  selectedDrillIds?: string[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    updateShot,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="id" value={shot.id} />
      <Input name="name" label="Name" defaultValue={shot.name} />
      <AdminShotRangeEditor
        initial={{
          courtXMin: shot.courtXMin,
          courtXMax: shot.courtXMax,
          courtYMin: shot.courtYMin,
          courtYMax: shot.courtYMax,
          ballHeightMin: shot.ballHeightMin,
          ballHeightMax: shot.ballHeightMax,
        }}
      />
      <AssociationPicker
        name="drillIds"
        label="Related drills"
        options={drills}
        selectedIds={selectedDrillIds}
      />
      <label className="block text-sm text-[var(--muted)]">
        Shot type
        <select
          name="shotType"
          defaultValue={shot.shotType}
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
          initialValue={shot.aggressionScore}
        />
        <ScoreInput
          name="difficulty"
          label="Difficulty"
          initialValue={shot.difficulty}
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

export function EditDrillForm({
  drill,
  shots = [],
}: {
  drill: Drill;
  shots?: AssociationOption[];
}) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    updateDrill,
    {},
  );
  return (
    <form action={action} className="mt-8 space-y-6">
      <input type="hidden" name="id" value={drill.id} />
      <Input name="name" label="Name" defaultValue={drill.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="courtXMin" label="Court X minimum" type="number" defaultValue={drill.courtXMin} />
        <Input name="courtXMax" label="Court X maximum" type="number" defaultValue={drill.courtXMax} />
        <Input name="courtYMin" label="Court Y minimum" type="number" defaultValue={drill.courtYMin} />
        <Input name="courtYMax" label="Court Y maximum" type="number" defaultValue={drill.courtYMax} />
        <Input name="ballHeightMin" label="Ball height minimum" type="number" defaultValue={drill.ballHeightMin} />
        <Input name="ballHeightMax" label="Ball height maximum" type="number" defaultValue={drill.ballHeightMax} />
      </div>
      <AssociationPicker
        name="shotIds"
        label="Shots in this drill"
        options={shots}
        selectedIds={drill.shots.map((shot) => shot.id)}
      />
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
