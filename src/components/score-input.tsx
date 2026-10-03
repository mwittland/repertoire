"use client";

import { useState } from "react";

export function ScoreInput({
  name,
  label,
  initialValue = 50,
}: {
  name: string;
  label: string;
  initialValue?: number;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <label className="block text-sm text-[var(--muted)]">
      {label}
      <span className="float-right font-bold text-[var(--coral)]">{value}</span>
      <input
        name={name}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-3 w-full accent-[var(--coral)]"
      />
    </label>
  );
}
