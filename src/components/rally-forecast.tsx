"use client";

import { useMemo, useState } from "react";

type Prediction = {
  currentLength: number;
  skillLevel: string;
  shotTwoAgo: string;
  shotOneAgo: string;
  latestShot: string;
  probabilityRallyReaches11: number;
};

const shotLabels: Record<string, string> = {
  D: "Dink",
  HB: "Hand battle",
  R: "Return",
  SE: "Serve",
  tsDrp: "3rd-shot drop",
  tsDrv: "3rd-shot drive",
};

export function RallyForecast({ predictions }: { predictions: Prediction[] }) {
  const skillLevels = [...new Set(predictions.map((prediction) => prediction.skillLevel))];
  const lengths = [...new Set(predictions.map((prediction) => prediction.currentLength))];
  const [skillLevel, setSkillLevel] = useState(skillLevels[0]);
  const [currentLength, setCurrentLength] = useState(lengths[0]);
  const sequences = [
    ...new Set(
      predictions
        .filter((prediction) => prediction.currentLength === currentLength)
        .map(sequenceKey),
    ),
  ];
  const [sequence, setSequence] = useState(sequences[0]);
  const selectedSequence = sequences.includes(sequence) ? sequence : sequences[0];
  const selected = useMemo(
    () =>
      predictions.find(
        (prediction) =>
          prediction.skillLevel === skillLevel &&
          prediction.currentLength === currentLength &&
          sequenceKey(prediction) === selectedSequence,
      ),
    [currentLength, predictions, selectedSequence, skillLevel],
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Skill level" value={skillLevel} onChange={setSkillLevel} options={skillLevels} />
        <Select
          label="Current rally length"
          value={String(currentLength)}
          onChange={(value) => setCurrentLength(Number(value))}
          options={lengths.map(String)}
        />
        <Select
          label="Last three shots"
          value={selectedSequence}
          onChange={setSequence}
          options={sequences}
          formatOption={(value) => value.split("|").map((shot) => shotLabels[shot] ?? shot).join(" → ")}
        />
      </div>
      {selected ? (
        <div className="mt-7 rounded-xl border border-[var(--line)] p-6 text-center">
          <p className="text-5xl font-bold text-[var(--teal)]">
            {Math.round(selected.probabilityRallyReaches11 * 100)}%
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            estimated chance of reaching at least 11 shots
          </p>
        </div>
      ) : null}
    </div>
  );
}

function sequenceKey(prediction: Prediction) {
  return [prediction.shotTwoAgo, prediction.shotOneAgo, prediction.latestShot].join("|");
}

function Select({
  label,
  value,
  options,
  onChange,
  formatOption = (option) => option,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatOption?: (option: string) => string;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-3 font-normal text-[var(--ink)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
