"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode } from "react";
import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";
import { drillTypes, type Drill, type DrillType } from "@/lib/drills/types";

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

const drillTypeColors: Record<DrillType, string> = {
  Solo: "#3f8f83",
  Wall: "#df8064",
  "Ball Machine": "#d8a43f",
  "Partner+": "#648ac0",
};

const canvas = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

function percentX(value: number) {
  return ((value - canvas.xMin) / (canvas.xMax - canvas.xMin)) * 100;
}

function percentY(value: number) {
  return 100 - ((value - canvas.yMin) / (canvas.yMax - canvas.yMin)) * 100;
}

function masteryGradientColor(value: number) {
  const stops = [
    { value: 0, color: [214, 65, 67] },
    { value: 25, color: [239, 128, 67] },
    { value: 50, color: [244, 201, 67] },
    { value: 75, color: [117, 177, 87] },
    { value: 100, color: [39, 132, 89] },
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

export function HowItWorksMap({
  shots,
  drills = [],
  handedness: accountHandedness,
  showSubjectToggle = false,
  subjectLabels = { shots: "Shots", drills: "Drills" },
  showConfidenceToggle = false,
  confidenceToggleAtTop = false,
  mapModes = ["confidence", "relative"],
  mapModeLabels,
  initialMapMode = mapModes[0],
  relativeMasteryNote = false,
  mapSize = "default",
  showShotTypeFilter = true,
  shotTypeFilterAtBottom = false,
  showShotTypeColors = true,
  showShotTypeLegend = true,
  showMasteryLegend = true,
  showDrillTypeFilter = true,
  drillTypeFilterAtBottom = false,
  showHandednessFilter = true,
  showBallHeightFilter = true,
  extraControls,
  sideControls,
  hideSidePanel = false,
  bare = false,
  hideHeader = false,
  heading = "See your game at a glance.",
  description = "Every colored region shows where your shots or drills apply. Adjust the ball-height range to see which options stay available for the moment you are in.",
}: {
  shots: DiscoverableShot[];
  drills?: Drill[];
  handedness?: "Right" | "Left";
  showSubjectToggle?: boolean;
  subjectLabels?: { shots: string; drills: string };
  showConfidenceToggle?: boolean;
  confidenceToggleAtTop?: boolean;
  mapModes?: Array<"coverage" | "confidence" | "relative">;
  mapModeLabels?: Partial<Record<"coverage" | "confidence" | "relative", string>>;
  initialMapMode?: "coverage" | "confidence" | "relative";
  relativeMasteryNote?: boolean;
  mapSize?: "default" | "small";
  showShotTypeFilter?: boolean;
  shotTypeFilterAtBottom?: boolean;
  showShotTypeColors?: boolean;
  showShotTypeLegend?: boolean;
  showMasteryLegend?: boolean;
  showDrillTypeFilter?: boolean;
  drillTypeFilterAtBottom?: boolean;
  showHandednessFilter?: boolean;
  showBallHeightFilter?: boolean;
  extraControls?: ReactNode;
  sideControls?: ReactNode;
  hideSidePanel?: boolean;
  bare?: boolean;
  hideHeader?: boolean;
  heading?: string;
  description?: string;
}) {
  const [enabledTypes, setEnabledTypes] = useState<ShotType[]>(shotTypes);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(10);
  const [selectedHandedness, setSelectedHandedness] = useState<"Right" | "Left">("Right");
  const [mapMode, setMapMode] = useState<"coverage" | "confidence" | "relative">(initialMapMode);
  const [mapSubject, setMapSubject] = useState<"shots" | "drills">("shots");
  const [enabledDrillTypes, setEnabledDrillTypes] = useState<DrillType[]>([...drillTypes]);
  const handedness = accountHandedness ?? selectedHandedness;
  const hasDetailedControls =
    showShotTypeFilter || showHandednessFilter || showBallHeightFilter;

  const visibleShots = shots.filter(
    (shot) =>
      shot.shotType &&
      enabledTypes.includes(shot.shotType) &&
      shot.ballHeightMax >= minHeight &&
      shot.ballHeightMin <= maxHeight,
  );
  const visibleDrills = drills.filter(
    (drill) =>
      enabledDrillTypes.includes(drill.type) &&
      drill.ballHeightMax >= minHeight &&
      drill.ballHeightMin <= maxHeight,
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
  const confidenceValues = confidenceRegions.flatMap((region) =>
    region.confidence === null ? [] : [region.confidence],
  );
  const masteryValues = masteryRegions.flatMap((region) =>
    region.mastery === null ? [] : [region.mastery],
  );
  function relativeValue(value: number, values: number[]) {
    const lowest = Math.min(...values);
    const highest = Math.max(...values);
    if (lowest === highest) return 50;
    return ((value - lowest) / (highest - lowest)) * 100;
  }
  function toggleType(type: ShotType) {
    setEnabledTypes((current) =>
      current.includes(type)
        ? current.filter((enabledType) => enabledType !== type)
        : [...current, type],
    );
  }
  function toggleDrillType(type: DrillType) {
    setEnabledDrillTypes((current) =>
      current.includes(type)
        ? current.filter((enabledType) => enabledType !== type)
        : [...current, type],
    );
  }

  return (
    <section className={hideHeader ? "mt-8" : "mt-16 border-t border-[var(--line)] pt-12"}>
      {!hideHeader && <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
          Coverage map
        </p>
        <h2 className="mt-3 text-4xl">{heading}</h2>
        <p className="mt-5 text-lg leading-8 text-[var(--muted)]">{description}</p>
      </div>}
      <div className={`mx-auto mt-8 grid ${bare ? "" : "rounded-2xl border border-[var(--line)] bg-[var(--card)]"} ${hideSidePanel ? `w-full max-w-5xl grid-cols-1 gap-6 ${bare ? "" : "p-4 sm:p-6"}` : hasDetailedControls ? `${bare ? "" : "p-5 sm:p-7 "}lg:justify-center lg:gap-7 lg:grid-cols-[minmax(0,42rem)_18rem]` : `${bare ? "" : "p-4 sm:p-6 "}lg:justify-center lg:grid-cols-[minmax(0,42rem)_12rem] lg:items-start`}`}>
        {extraControls}
        {confidenceToggleAtTop && showConfidenceToggle && (
          <MapViewToggle
            mapMode={mapMode}
            onChange={setMapMode}
            modes={mapModes}
            labels={mapModeLabels}
            className="w-full max-w-3xl justify-self-center lg:col-span-2"
          />
        )}
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
        <div className={`mx-auto w-full text-center ${mapSize === "small" ? "max-w-lg" : hideSidePanel ? "max-w-3xl" : "max-w-2xl"}`}>
          <div className={`relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd] ${mapSize === "small" ? "max-w-lg" : "max-w-2xl"}`}>
            <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
              <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
            </div>
            {mapSubject === "drills" && (mapMode === "confidence" || mapMode === "relative")
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
                        backgroundColor: masteryGradientColor(
                          mapMode === "relative"
                            ? relativeValue(region.mastery, masteryValues)
                            : region.mastery,
                        ),
                      }}
                    />
                  ),
                )
              : mapSubject === "shots" && (mapMode === "confidence" || mapMode === "relative")
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
                        backgroundColor: masteryGradientColor(
                          mapMode === "relative"
                            ? relativeValue(region.confidence, confidenceValues)
                            : region.confidence,
                        ),
                      }}
                    />
                  );
                })
              : mapSubject === "drills"
                ? visibleDrills.map((drill) => {
                    const xMin = handedness === "Left" ? drill.courtXLeftMin : drill.courtXMin;
                    const xMax = handedness === "Left" ? drill.courtXLeftMax : drill.courtXMax;
                    return (
                      <div
                        key={drill.id}
                        aria-hidden="true"
                        className="pointer-events-none absolute border-2"
                        style={{
                          left: `${percentX(xMin)}%`,
                          top: `${percentY(drill.courtYMax)}%`,
                          width: `${percentX(xMax) - percentX(xMin)}%`,
                          height: `${percentY(drill.courtYMin) - percentY(drill.courtYMax)}%`,
                          borderColor: drillTypeColors[drill.type],
                          backgroundColor: `${drillTypeColors[drill.type]}38`,
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
                ? "Total shows the absolute average mastery for each area."
                : mapMode === "relative"
                  ? relativeMasteryNote
                    ? "Relative compares each area with the player’s skill level."
                    : "Each region is colored relative to your lowest and highest drill mastery areas."
                : `${visibleDrills.length} drill ${visibleDrills.length === 1 ? "region" : "regions"}.`
              : mapMode === "confidence"
                ? "Total shows the absolute average mastery for each area."
                : mapMode === "relative"
                  ? relativeMasteryNote
                    ? "Relative compares each area with the player’s skill level."
                    : "Each region is colored relative to your lowest and highest shot mastery areas."
                : `${visibleShots.length} matching shot regions across ${enabledTypes.length} enabled ${enabledTypes.length === 1 ? "type" : "types"}.`}
          </p>
          {mapSubject === "shots" &&
            (mapMode === "confidence" || mapMode === "coverage") &&
            showShotTypeLegend && (
            <div className="mt-4 border-t border-[var(--line)] pt-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Shot types
              </p>
              {shotTypeFilterAtBottom && (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[var(--muted)] sm:grid-cols-3">
                  {shotTypes.map((type) => (
                    <label key={type} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabledTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="h-4 w-4 accent-[var(--teal)]"
                      />
                      {showShotTypeColors && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: typeColors[type] }} />}
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              )}
              {!shotTypeFilterAtBottom && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                {showShotTypeColors && shotTypes.map((type) => (
                  <span key={type} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: typeColors[type] }}
                    />
                    {type}
                  </span>
                ))}
              </div>}
            </div>
          )}
          {mapSubject === "drills" && mapMode === "confidence" && showDrillTypeFilter && drillTypeFilterAtBottom && (
            <div className="mt-4 border-t border-[var(--line)] pt-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Drill types
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[var(--muted)] sm:grid-cols-4">
                {drillTypes.map((type) => (
                  <label key={type} className="flex cursor-pointer items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabledDrillTypes.includes(type)}
                      onChange={() => toggleDrillType(type)}
                      className="h-4 w-4 accent-[var(--teal)]"
                    />
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: drillTypeColors[type] }} />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {showMasteryLegend && (
            <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]">
              <span>{mapMode === "relative" ? "Lower" : "Low"}</span>
              <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#d64143] via-[#f4c943] to-[#278459]" />
              <span>{mapMode === "relative" ? "Higher" : "High"}</span>
            </div>
          )}
        </div>
        {!hideSidePanel && <aside className="space-y-7 lg:pr-4">
          {sideControls}
          {!confidenceToggleAtTop && showConfidenceToggle && (
            <MapViewToggle
              mapMode={mapMode}
              onChange={setMapMode}
              modes={mapModes}
              labels={mapModeLabels}
            />
          )}
          {showShotTypeFilter && !shotTypeFilterAtBottom && mapSubject === "shots" && <fieldset>
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
                  {showShotTypeColors && <span className="h-3 w-3 rounded-full" style={{ backgroundColor: typeColors[type] }} />}
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>}
          {showShotTypeFilter && mapSubject === "drills" && showDrillTypeFilter && !drillTypeFilterAtBottom && <fieldset>
            <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
              Drill types
            </legend>
            <div className="mt-4 space-y-3">
              {drillTypes.map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-3 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={enabledDrillTypes.includes(type)}
                    onChange={() => toggleDrillType(type)}
                    className="h-4 w-4 accent-[var(--teal)]"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>}
          {showHandednessFilter && mapSubject === "shots" && !accountHandedness && (
            <fieldset className="border-t border-[var(--line)] pt-6">
              <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                Handedness
              </legend>
              <div className="mt-4 grid grid-cols-2 rounded-xl border border-[var(--line)] p-1 text-base font-bold sm:text-lg">
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
          {showBallHeightFilter && (
            <BallHeightRange
              minHeight={minHeight}
              maxHeight={maxHeight}
              onMinChange={setMinHeight}
              onMaxChange={setMaxHeight}
            />
          )}
        </aside>}
      </div>
    </section>
  );
}

function MapViewToggle({
  mapMode,
  onChange,
  modes,
  labels,
  className = "",
}: {
  mapMode: "coverage" | "confidence" | "relative";
  onChange: (mode: "coverage" | "confidence" | "relative") => void;
  modes: Array<"coverage" | "confidence" | "relative">;
  labels?: Partial<Record<"coverage" | "confidence" | "relative", string>>;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
        Coverage view
      </legend>
      <div
        className="mt-4 grid rounded-xl border border-[var(--line)] p-1 text-sm font-bold"
        style={{ gridTemplateColumns: `repeat(${modes.length}, minmax(0, 1fr))` }}
      >
        {modes.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-lg px-4 py-3 capitalize transition ${mapMode === option ? "bg-[var(--button)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
          >
            {labels?.[option] ?? (option === "confidence" ? "Total" : option === "relative" ? "Relative" : option)}
          </button>
        ))}
      </div>
    </fieldset>
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
