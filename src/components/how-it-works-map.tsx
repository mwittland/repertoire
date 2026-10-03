"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";
import type { Drill } from "@/lib/drills/queries";

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

function confidenceColor(value: number) {
  const stops = [
    { value: 0, color: [185, 215, 242] },
    { value: 50, color: [100, 138, 192] },
    { value: 100, color: [47, 95, 159] },
  ];
  const boundedValue = Math.max(0, Math.min(100, value));
  const upperStop = stops.find((stop) => stop.value >= boundedValue) ?? stops[stops.length - 1];
  const lowerStop = stops[stops.indexOf(upperStop) - 1] ?? upperStop;
  const ratio =
    upperStop.value === lowerStop.value
      ? 0
      : (boundedValue - lowerStop.value) / (upperStop.value - lowerStop.value);
  const color = lowerStop.color.map((channel, index) =>
    Math.round(channel + (upperStop.color[index] - channel) * ratio),
  );
  return `rgb(${color.join(", ")})`;
}

function masteryColor(value: number) {
  const boundedValue = Math.max(0, Math.min(100, value));
  const light = [245, 215, 125];
  const dark = [177, 123, 22];
  const color = light.map((channel, index) =>
    Math.round(channel + (dark[index] - channel) * (boundedValue / 100)),
  );
  return `rgb(${color.join(", ")})`;
}

export function HowItWorksMap({
  shots,
  drills = [],
  handedness: accountHandedness,
  showSubjectToggle = false,
  subjectLabels = { shots: "Shots", drills: "Drills" },
  showConfidenceToggle = false,
  heading = "See your game at a glance.",
  description = "Every colored region shows where your shots or drills apply. Adjust the ball-height range to see which options stay available for the moment you are in.",
}: {
  shots: DiscoverableShot[];
  drills?: Drill[];
  handedness?: "Right" | "Left";
  showSubjectToggle?: boolean;
  subjectLabels?: { shots: string; drills: string };
  showConfidenceToggle?: boolean;
  heading?: string;
  description?: string;
}) {
  const [enabledTypes, setEnabledTypes] = useState<ShotType[]>(shotTypes);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(10);
  const [selectedHandedness, setSelectedHandedness] = useState<"Right" | "Left">("Right");
  const [mapMode, setMapMode] = useState<"coverage" | "confidence">("coverage");
  const [mapSubject, setMapSubject] = useState<"shots" | "drills">("shots");
  const handedness = accountHandedness ?? selectedHandedness;

  const visibleShots = shots.filter(
    (shot) =>
      shot.shotType &&
      enabledTypes.includes(shot.shotType) &&
      shot.ballHeightMax >= minHeight &&
      shot.ballHeightMin <= maxHeight,
  );
  const visibleDrills = drills.filter(
    (drill) => drill.ballHeightMax >= minHeight && drill.ballHeightMin <= maxHeight,
  );
  const confidenceRegions = (() => {
    const xBoundaries = Array.from(
      new Set([
        canvas.xMin,
        canvas.xMax,
        ...visibleShots.flatMap((shot) => [
          handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin,
          handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax,
        ]),
      ]),
    ).sort((a, b) => a - b);
    const yBoundaries = Array.from(
      new Set([
        canvas.yMin,
        canvas.yMax,
        ...visibleShots.flatMap((shot) => [shot.courtYMin, shot.courtYMax]),
      ]),
    ).sort((a, b) => a - b);

    return xBoundaries.slice(0, -1).flatMap((xMin, column) =>
      yBoundaries.slice(0, -1).map((yMin, row) => {
        const xMax = xBoundaries[column + 1];
        const yMax = yBoundaries[row + 1];
        const centerX = (xMin + xMax) / 2;
        const centerY = (yMin + yMax) / 2;
        const confidenceValues = visibleShots.flatMap((shot) => {
          const shotXMin =
            handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
          const shotXMax =
            handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
          return centerX >= shotXMin &&
            centerX <= shotXMax &&
            centerY >= shot.courtYMin &&
            centerY <= shot.courtYMax &&
            shot.confidence !== null &&
            shot.confidence !== undefined
            ? [shot.confidence]
            : [];
        });
        return {
          xMin,
          xMax,
          yMin,
          yMax,
          confidence:
            confidenceValues.length > 0
              ? confidenceValues.reduce((sum, value) => sum + value, 0) /
                confidenceValues.length
              : null,
        };
      }),
    );
  })();
  const masteryRegions = (() => {
    const xBoundaries = Array.from(new Set([
      canvas.xMin,
      canvas.xMax,
      ...visibleDrills.flatMap((drill) => [
        handedness === "Left" ? drill.courtXLeftMin : drill.courtXMin,
        handedness === "Left" ? drill.courtXLeftMax : drill.courtXMax,
      ]),
    ])).sort((a, b) => a - b);
    const yBoundaries = Array.from(new Set([
      canvas.yMin,
      canvas.yMax,
      ...visibleDrills.flatMap((drill) => [drill.courtYMin, drill.courtYMax]),
    ])).sort((a, b) => a - b);
    return xBoundaries.slice(0, -1).flatMap((xMin, column) =>
      yBoundaries.slice(0, -1).map((yMin, row) => {
        const xMax = xBoundaries[column + 1];
        const yMax = yBoundaries[row + 1];
        const centerX = (xMin + xMax) / 2;
        const centerY = (yMin + yMax) / 2;
        const values = visibleDrills.flatMap((drill) => {
          const drillXMin = handedness === "Left" ? drill.courtXLeftMin : drill.courtXMin;
          const drillXMax = handedness === "Left" ? drill.courtXLeftMax : drill.courtXMax;
          return centerX >= drillXMin && centerX <= drillXMax &&
            centerY >= drill.courtYMin && centerY <= drill.courtYMax &&
            drill.mastery !== null && drill.mastery !== undefined
            ? [drill.mastery]
            : [];
        });
        return {
          xMin,
          xMax,
          yMin,
          yMax,
          mastery: values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : null,
        };
      }),
    );
  })();
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
      <div className="mt-8 grid gap-8 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {showSubjectToggle && (
          <div className="mx-auto grid w-full max-w-3xl grid-cols-2 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-2 shadow-[var(--shadow)] lg:col-span-2">
            {(["shots", "drills"] as const).map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setMapSubject(subject)}
                className={`rounded-xl px-5 py-4 text-lg font-bold transition ${mapSubject === subject ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
              >
                {subjectLabels[subject]}
              </button>
            ))}
          </div>
        )}
        <div>
          <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd]">
            <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
              <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
            </div>
            {mapSubject === "drills" && mapMode === "confidence"
              ? masteryRegions.map((region, index) =>
                  region.mastery === null ? null : (
                    <div
                      key={`mastery-${index}`}
                      aria-hidden="true"
                      className="pointer-events-none absolute"
                      style={{
                        left: `${percentX(region.xMin)}%`,
                        top: `${percentY(region.yMax)}%`,
                        width: `${percentX(region.xMax) - percentX(region.xMin)}%`,
                        height: `${percentY(region.yMin) - percentY(region.yMax)}%`,
                        backgroundColor: masteryColor(region.mastery),
                      }}
                    />
                  ),
                )
              : mapSubject === "shots" && mapMode === "confidence"
              ? confidenceRegions.map((region, index) => {
                  if (region.confidence === null) return null;
                  return (
                    <div
                      key={`confidence-${index}`}
                      aria-hidden="true"
                      className="pointer-events-none absolute"
                      style={{
                        left: `${percentX(region.xMin)}%`,
                        top: `${percentY(region.yMax)}%`,
                        width: `${percentX(region.xMax) - percentX(region.xMin)}%`,
                        height: `${percentY(region.yMin) - percentY(region.yMax)}%`,
                        backgroundColor: confidenceColor(region.confidence),
                      }}
                    />
                  );
                })
              : mapSubject === "drills"
                ? drills.map((drill) => {
                    const xMin = handedness === "Left" ? drill.courtXLeftMin : drill.courtXMin;
                    const xMax = handedness === "Left" ? drill.courtXLeftMax : drill.courtXMax;
                    return (
                      <div
                        key={drill.id}
                        aria-hidden="true"
                        className="pointer-events-none absolute border-2 border-[#b17b16]"
                        style={{
                          left: `${percentX(xMin)}%`,
                          top: `${percentY(drill.courtYMax)}%`,
                          width: `${percentX(xMax) - percentX(xMin)}%`,
                          height: `${percentY(drill.courtYMin) - percentY(drill.courtYMax)}%`,
                          backgroundColor: "#d8a43f38",
                        }}
                      />
                    );
                  })
                : visibleShots.map((shot) => {
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
                    opacity: 1,
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
            {mapSubject === "drills"
              ? mapMode === "confidence"
                ? "Each region shows the average mastery of routine drills covering that area."
                : `${visibleDrills.length} routine drill ${visibleDrills.length === 1 ? "region" : "regions"}.`
              : mapMode === "confidence"
                ? "Each region shows the average confidence of rated shots covering that area."
                : `${visibleShots.length} matching shot regions across ${enabledTypes.length} enabled ${enabledTypes.length === 1 ? "type" : "types"}.`}
          </p>
          {mapMode === "confidence" && (
            <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span>Low</span>
              <span className={`h-2 flex-1 rounded-full ${mapSubject === "drills" ? "bg-gradient-to-r from-[#f5d77d] to-[#b17b16]" : "bg-gradient-to-r from-[#b9d7f2] via-[#648ac0] to-[#2f5f9f]"}`} />
              <span>High</span>
            </div>
          )}
        </div>
        <aside className="space-y-7">
          {showConfidenceToggle && (
            <fieldset>
              <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                Map view
              </legend>
              <div className="mt-4 grid grid-cols-2 rounded-xl border border-[var(--line)] p-1 text-sm font-bold">
                {(["coverage", "confidence"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMapMode(option)}
                    className={`rounded-lg px-3 py-2 capitalize transition ${mapMode === option ? "bg-[var(--button)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                  >
                    {option === "confidence" && mapSubject === "drills"
                      ? "Mastery"
                      : option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {mapSubject === "shots" && <fieldset>
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
          </fieldset>}
          {mapSubject === "shots" && !accountHandedness && (
            <fieldset className="border-t border-[var(--line)] pt-6">
              <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                Handedness
              </legend>
              <div className="mt-4 grid grid-cols-2 rounded-xl border border-[var(--line)] p-1 text-sm font-bold">
                {(["Right", "Left"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedHandedness(option)}
                    className={`rounded-lg px-3 py-2 transition ${handedness === option ? "bg-[var(--button)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {(
            <BallHeightRange
              minHeight={minHeight}
              maxHeight={maxHeight}
              onMinChange={setMinHeight}
              onMaxChange={setMaxHeight}
            />
          )}
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
