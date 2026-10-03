"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";

const shotTypes: ShotType[] = [
  "Dink",
  "Drop",
  "Drive",
  "Reset",
  "Attack",
  "Putaway",
  "Lob",
];

const typeColors: Record<ShotType, string> = {
  Dink: "#3f8f83",
  Drop: "#df8064",
  Drive: "#d8a43f",
  Reset: "#648ac0",
  Attack: "#bd6e93",
  Putaway: "#806ab0",
  Lob: "#4c9a72",
};

const canvas = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

function percentX(value: number) {
  return ((value - canvas.xMin) / (canvas.xMax - canvas.xMin)) * 100;
}

function percentY(value: number) {
  return 100 - ((value - canvas.yMin) / (canvas.yMax - canvas.yMin)) * 100;
}

export function HowItWorksMap({
  shots,
  heading = "See the shot system at a glance.",
  description = "Every colored region is the combined coverage of the shots in that type. Adjust the ball-height range to see which regions stay available for the moment you are in.",
}: {
  shots: DiscoverableShot[];
  heading?: string;
  description?: string;
}) {
  const [enabledTypes, setEnabledTypes] = useState<ShotType[]>(shotTypes);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(10);
  const [handedness, setHandedness] = useState<"Right" | "Left">("Right");

  const visibleShots = shots.filter(
    (shot) =>
      shot.shotType &&
      enabledTypes.includes(shot.shotType) &&
      shot.ballHeightMax >= minHeight &&
      shot.ballHeightMin <= maxHeight,
  );

  function toggleType(type: ShotType) {
    setEnabledTypes((current) =>
      current.includes(type)
        ? current.filter((enabledType) => enabledType !== type)
        : [...current, type],
    );
  }

  return (
    <section className="mt-16 border-t border-[var(--line)] pt-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Coverage map
        </p>
        <h2 className="mt-3 text-4xl">{heading}</h2>
        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">{description}</p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 sm:p-7">
          <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd]">
            <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
              <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
            </div>
            {visibleShots.map((shot) => {
              const courtXMin =
                handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
              const courtXMax =
                handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
              const left = Math.max(0, Math.min(100, percentX(courtXMin)));
              const right = Math.max(0, Math.min(100, percentX(courtXMax)));
              const top = Math.max(0, Math.min(100, percentY(shot.courtYMax)));
              const bottom = Math.max(0, Math.min(100, percentY(shot.courtYMin)));
              const color = typeColors[shot.shotType!];
              return (
                <div
                  key={shot.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute border-2"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${Math.max(0, right - left)}%`,
                    height: `${Math.max(0, bottom - top)}%`,
                    borderColor: color,
                    backgroundColor: `${color}38`,
                  }}
                />
              );
            })}
            <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 z-20 overflow-hidden border-x-4 border-[#111714]">
              <div className="absolute inset-x-0 top-0 border-t-4 border-[#111714]" />
              <div className="absolute inset-x-0 top-[31.82%] border-t-2 border-[#111714]" />
              <div className="absolute inset-x-0 bottom-0 border-b-4 border-[#111714]" />
              <div className="absolute bottom-0 left-1/2 top-[31.82%] border-l-2 border-[#111714]" />
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {visibleShots.length} matching shot regions across {enabledTypes.length} enabled {enabledTypes.length === 1 ? "type" : "types"}.
          </p>
        </div>
        <aside className="space-y-7 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 sm:p-6">
          <fieldset>
            <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
              Shot types
            </legend>
            <div className="mt-4 space-y-3">
              {shotTypes.map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-3 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="h-4 w-4 accent-[var(--teal)]"
                  />
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: typeColors[type] }} />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="border-t border-[var(--line)] pt-6">
            <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
              Handedness
            </legend>
            <div className="mt-4 grid grid-cols-2 rounded-xl border border-[var(--line)] p-1 text-sm font-bold">
              {(["Right", "Left"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHandedness(option)}
                  className={`rounded-lg px-3 py-2 transition ${handedness === option ? "bg-[var(--button)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <BallHeightRange
            minHeight={minHeight}
            maxHeight={maxHeight}
            onMinChange={setMinHeight}
            onMaxChange={setMaxHeight}
          />
        </aside>
      </div>
    </section>
  );
}

function BallHeightRange({
  minHeight,
  maxHeight,
  onMinChange,
  onMaxChange,
}: {
  minHeight: number;
  maxHeight: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const top = 100 - (maxHeight / 10) * 100;
  const height = ((maxHeight - minHeight) / 10) * 100;

  function valueFromPointer(event: PointerEvent<HTMLDivElement>) {
    const bounds = trackRef.current!.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(10, Math.round((1 - (event.clientY - bounds.top) / bounds.height) * 10)),
    );
  }

  function updateFromPointer(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const value = valueFromPointer(event);
    if (dragging === "min") onMinChange(Math.min(value, maxHeight));
    else onMaxChange(Math.max(value, minHeight));
  }

  function startDragging(handle: "min" | "max", event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    trackRef.current?.setPointerCapture(event.pointerId);
    setDragging(handle);
  }

  function moveHandle(handle: "min" | "max", event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const direction = event.key === "ArrowUp" ? 1 : -1;
    if (handle === "min") onMinChange(Math.max(0, Math.min(maxHeight, minHeight + direction)));
    else onMaxChange(Math.min(10, Math.max(minHeight, maxHeight + direction)));
  }

  return (
    <fieldset className="border-t border-[var(--line)] pt-6">
      <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
        Ball height
      </legend>
      <div className="mt-4 grid h-[18rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-[var(--line)] bg-[#edf4ec] p-4">
        <div className="relative mx-auto aspect-[0.63] h-full w-full max-w-[8rem] overflow-hidden rounded-xl border border-[#c7d9c8] bg-[#f8fbf5]">
          <Image
            src="/ballHeight.jpg"
            alt="Six-foot pickleball player standing beside a regulation-height net"
            fill
            sizes="150px"
            className="object-cover"
          />
        </div>
        <div
          ref={trackRef}
          onPointerMove={updateFromPointer}
          onPointerUp={() => setDragging(null)}
          onPointerCancel={() => setDragging(null)}
          className="relative h-full w-8 touch-none"
        >
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[#d4e0d6]" />
          <div
            className="absolute left-1/2 w-3 -translate-x-1/2 rounded-full bg-[var(--coral)]"
            style={{ top: `${top}%`, height: `${height}%` }}
          />
          <button
            type="button"
            role="slider"
            aria-label="Minimum ball height"
            aria-valuemin={0}
            aria-valuemax={maxHeight}
            aria-valuenow={minHeight}
            onPointerDown={(event) => startDragging("min", event)}
            onKeyDown={(event) => moveHandle("min", event)}
            className="absolute left-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--coral)] shadow"
            style={{ top: `${100 - (minHeight / 10) * 100}%` }}
          />
          <button
            type="button"
            role="slider"
            aria-label="Maximum ball height"
            aria-valuemin={minHeight}
            aria-valuemax={10}
            aria-valuenow={maxHeight}
            onPointerDown={(event) => startDragging("max", event)}
            onKeyDown={(event) => moveHandle("max", event)}
            className="absolute left-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--coral)] shadow"
            style={{ top: `${100 - (maxHeight / 10) * 100}%` }}
          />
        </div>
      </div>
    </fieldset>
  );
}
