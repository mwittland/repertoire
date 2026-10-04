"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";

export type ShotRangeValues = {
  courtXMin: number;
  courtXMax: number;
  courtYMin: number;
  courtYMax: number;
  ballHeightMin: number;
  ballHeightMax: number;
};

type Point = { x: number; y: number };
type CourtHandle = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Interaction =
  | { kind: "box"; start: Point }
  | { kind: "handle"; handle: CourtHandle }
  | null;

const canvas = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

export function AdminShotRangeEditor({
  initial,
}: {
  initial?: ShotRangeValues;
}) {
  const [values, setValues] = useState<ShotRangeValues>(
    initial ?? {
      courtXMin: -10,
      courtXMax: 10,
      courtYMin: 8,
      courtYMax: 23,
      ballHeightMin: 2,
      ballHeightMax: 5,
    },
  );
  const courtRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction>(null);

  function pointFromEvent(event: PointerEvent<HTMLDivElement>): Point {
    const bounds = courtRef.current!.getBoundingClientRect();
    return {
      x: Math.max(
        canvas.xMin,
        Math.min(
          canvas.xMax,
          Math.round(
            canvas.xMin +
              ((event.clientX - bounds.left) / bounds.width) *
                (canvas.xMax - canvas.xMin),
          ),
        ),
      ),
      y: Math.max(
        canvas.yMin,
        Math.min(
          canvas.yMax,
          Math.round(
            canvas.yMax -
              ((event.clientY - bounds.top) / bounds.height) *
                (canvas.yMax - canvas.yMin),
          ),
        ),
      ),
    };
  }

  function startBox(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).dataset.courtHandle) return;
    courtRef.current?.setPointerCapture(event.pointerId);
    setInteraction({ kind: "box", start: pointFromEvent(event) });
  }

  function startHandle(
    event: PointerEvent<HTMLButtonElement>,
    handle: CourtHandle,
  ) {
    event.stopPropagation();
    courtRef.current?.setPointerCapture(event.pointerId);
    setInteraction({ kind: "handle", handle });
  }

  function moveCourt(event: PointerEvent<HTMLDivElement>) {
    if (!interaction) return;
    const point = pointFromEvent(event);
    setValues((current) => {
      if (interaction.kind === "box")
        return {
          ...current,
          courtXMin: Math.min(interaction.start.x, point.x),
          courtXMax: Math.max(interaction.start.x, point.x),
          courtYMin: Math.min(interaction.start.y, point.y),
          courtYMax: Math.max(interaction.start.y, point.y),
        };
      const next = { ...current };
      if (interaction.handle.includes("left"))
        next.courtXMin = Math.min(point.x, current.courtXMax - 1);
      if (interaction.handle.includes("right"))
        next.courtXMax = Math.max(point.x, current.courtXMin + 1);
      if (interaction.handle.includes("top"))
        next.courtYMax = Math.max(point.y, current.courtYMin + 1);
      if (interaction.handle.includes("bottom"))
        next.courtYMin = Math.min(point.y, current.courtYMax - 1);
      return next;
    });
  }

  function endCourt(event: PointerEvent<HTMLDivElement>) {
    if (courtRef.current?.hasPointerCapture(event.pointerId))
      courtRef.current.releasePointerCapture(event.pointerId);
    setInteraction(null);
  }

  const left =
    ((values.courtXMin - canvas.xMin) / (canvas.xMax - canvas.xMin)) * 100;
  const right =
    ((values.courtXMax - canvas.xMin) / (canvas.xMax - canvas.xMin)) * 100;
  const top =
    100 -
    ((values.courtYMax - canvas.yMin) / (canvas.yMax - canvas.yMin)) * 100;
  const bottom =
    100 -
    ((values.courtYMin - canvas.yMin) / (canvas.yMax - canvas.yMin)) * 100;

  return (
    <div className="space-y-8">
      <input type="hidden" name="courtXMin" value={values.courtXMin} />
      <input type="hidden" name="courtXMax" value={values.courtXMax} />
      <input type="hidden" name="courtYMin" value={values.courtYMin} />
      <input type="hidden" name="courtYMax" value={values.courtYMax} />
      <input type="hidden" name="ballHeightMin" value={values.ballHeightMin} />
      <input type="hidden" name="ballHeightMax" value={values.ballHeightMax} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
        <section>
          <h2 className="text-2xl">Court location</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Enter this location for a right-handed player.
          </p>
          <div
            ref={courtRef}
            onPointerDown={startBox}
            onPointerMove={moveCourt}
            onPointerUp={endCourt}
            className="relative mx-auto mt-4 aspect-square h-[18rem] w-[18rem] max-w-full cursor-crosshair overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd] touch-none"
          >
            <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
              <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
              <div className="absolute inset-x-0 top-0 border-t-4 border-white/90" />
              <div className="absolute inset-x-0 top-[31.82%] border-t-2 border-white/90" />
              <div className="absolute inset-x-0 bottom-0 border-b-4 border-white/90" />
              <div className="absolute bottom-0 left-1/2 top-[31.82%] border-l-2 border-white/90" />
            </div>
            <div
              className="pointer-events-none absolute border-2 border-[var(--coral)] bg-[var(--coral)]/15"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${right - left}%`,
                height: `${bottom - top}%`,
              }}
            />
            {(
              [
                ["top-left", left, top],
                ["top-right", right, top],
                ["bottom-left", left, bottom],
                ["bottom-right", right, bottom],
              ] as [CourtHandle, number, number][]
            ).map(([handle, x, y]) => (
              <button
                key={handle}
                type="button"
                data-court-handle={handle}
                onPointerDown={(event) => startHandle(event, handle)}
                className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--coral)] shadow"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`Move ${handle} corner`}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--muted)] sm:grid-cols-4">
            <RangeReadout label="X min" value={values.courtXMin} />
            <RangeReadout label="X max" value={values.courtXMax} />
            <RangeReadout label="Y min" value={values.courtYMin} />
            <RangeReadout label="Y max" value={values.courtYMax} />
          </div>
        </section>
        <RangeBand
          label="Ball height"
          min={0}
          max={10}
          minValue={values.ballHeightMin}
          maxValue={values.ballHeightMax}
          onChange={(minValue, maxValue) =>
            setValues((current) => ({
              ...current,
              ballHeightMin: minValue,
              ballHeightMax: maxValue,
            }))
          }
          vertical
        />
      </div>
    </div>
  );
}

function RangeBand({
  label,
  min,
  max,
  minValue,
  maxValue,
  onChange,
  vertical = false,
}: {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  vertical?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | "range" | null>(
    null,
  );
  function valueFromEvent(event: PointerEvent<HTMLDivElement>) {
    const bounds = trackRef.current!.getBoundingClientRect();
    const ratio = vertical
      ? 1 - (event.clientY - bounds.top) / bounds.height
      : (event.clientX - bounds.left) / bounds.width;
    return Math.max(min, Math.min(max, Math.round(min + ratio * (max - min))));
  }
  function start(
    event: PointerEvent<HTMLElement>,
    target: "min" | "max" | "range",
  ) {
    event.stopPropagation();
    trackRef.current?.setPointerCapture(event.pointerId);
    setDragging(target);
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const next = valueFromEvent(event);
    if (dragging === "min") onChange(Math.min(next, maxValue - 1), maxValue);
    else if (dragging === "max")
      onChange(minValue, Math.max(next, minValue + 1));
    else {
      const width = maxValue - minValue;
      const nextMin = Math.max(
        min,
        Math.min(max - width, next - Math.round(width / 2)),
      );
      onChange(nextMin, nextMin + width);
    }
  }
  const startPercent = ((minValue - min) / (max - min)) * 100;
  const endPercent = ((maxValue - min) / (max - min)) * 100;
  const upperTop = 100 - endPercent;
  const lowerTop = 100 - startPercent;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl">{label}</h2>
        <div className="flex gap-3 text-sm text-[var(--muted)]">
          <RangeReadout label="min" value={minValue} />
          <RangeReadout label="max" value={maxValue} />
        </div>
      </div>
      <div
        className={
          vertical ? "mt-4 flex items-center justify-center gap-5" : "mt-4"
        }
      >
        {vertical && (
          <div className="relative h-[18rem] w-[11.34rem] overflow-hidden rounded-xl border border-[#c7d9c8] bg-[#f8fbf5]">
            <Image
              src="/ballHeight.jpg"
              alt="Six-foot pickleball player standing beside a regulation-height net"
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
        )}
        <div
          ref={trackRef}
          onPointerMove={move}
          onPointerUp={() => setDragging(null)}
          className={`${vertical ? "h-[18rem] w-12" : "h-8 w-full"} relative touch-none rounded-full bg-transparent`}
        >
          {!vertical && (
            <div className="absolute inset-y-1/2 left-0 h-1 w-full -translate-y-1/2 bg-[#d4e0d6]" />
          )}
          <div
            onPointerDown={(event) => start(event, "range")}
            className={`absolute cursor-grab rounded-full bg-[var(--coral)] ${vertical ? "left-1/2 w-3 -translate-x-1/2" : "inset-y-1/2 left-0 h-3 -translate-y-1/2"}`}
            style={
              vertical
                ? {
                    top: `calc(${upperTop}% - 2px)`,
                    height: `calc(${lowerTop - upperTop}% + 4px)`,
                  }
                : {
                    left: `${startPercent}%`,
                    width: `${endPercent - startPercent}%`,
                  }
            }
          />
          <button
            type="button"
            onPointerDown={(event) => start(event, "min")}
            className={`absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--coral)] shadow ${vertical ? "left-1/2" : "top-1/2"}`}
            style={
              vertical ? { top: `${lowerTop}%` } : { left: `${startPercent}%` }
            }
            aria-label={`${label} minimum`}
          />
          <button
            type="button"
            onPointerDown={(event) => start(event, "max")}
            className={`absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--coral)] shadow ${vertical ? "left-1/2" : "top-1/2"}`}
            style={
              vertical ? { top: `${upperTop}%` } : { left: `${endPercent}%` }
            }
            aria-label={`${label} maximum`}
          />
        </div>
      </div>
    </section>
  );
}

function RangeReadout({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <strong className="text-[var(--ink)]">{label}</strong> {value}
    </span>
  );
}
