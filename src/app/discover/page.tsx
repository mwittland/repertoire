"use client";

import { useState } from "react";
import Link from "next/link";
import { ShotCard } from "@/components/shot-card";
import type { DiscoverableShot } from "@/lib/discovery/types";

const range = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

export default function DiscoverPage() {
  const [courtX, setCourtX] = useState(0);
  const [courtY, setCourtY] = useState(20);
  const [ballHeight, setBallHeight] = useState(5);
  const [intent, setIntent] = useState(60);
  const [shots, setShots] = useState<DiscoverableShot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const xPercent = ((courtX - range.xMin) / (range.xMax - range.xMin)) * 100;
  const yPercent =
    100 - ((courtY - range.yMin) / (range.yMax - range.yMin)) * 100;

  function setCourtPosition(x: number, y: number) {
    setCourtX(Math.max(range.xMin, Math.min(range.xMax, Math.round(x))));
    setCourtY(Math.max(range.yMin, Math.min(range.yMax, Math.round(y))));
  }

  function handleCourtClick(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x =
      range.xMin +
      ((event.clientX - bounds.left) / bounds.width) *
        (range.xMax - range.xMin);
    const y =
      range.yMax -
      ((event.clientY - bounds.top) / bounds.height) *
        (range.yMax - range.yMin);
    setCourtPosition(x, y);
  }

  function handleCourtKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 5 : 1;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    setCourtPosition(courtX + offset[0], courtY + offset[1]);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <section className="grid gap-12 pb-20 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-24">
          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-[var(--coral)]">
              Your next shot is here
            </p>
            <h1 className="max-w-xl text-6xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
              Play the moment, not the guess.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-[var(--muted)]">
              Tell us where you are, what the ball is doing, and how much
              pressure you want to apply. We will surface the shots that belong
              in that moment.
            </p>
            <div className="mt-9 flex items-center gap-4 text-sm text-[var(--muted)]">
              <span className="h-px w-10 bg-[var(--coral)]" />
              Built for the in-between balls
            </div>
          </div>
          <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[0_20px_80px_rgba(24,50,45,0.08)] sm:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  01 / Current situation
                </p>
                <h2 className="mt-2 text-3xl">Where are you?</h2>
              </div>
              <span className="rounded-full bg-[#e5f0e9] px-3 py-1 text-xs font-bold text-[var(--teal)]">
                Point input
              </span>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label={`Selected court position: X ${courtX}, Y ${courtY}. Click to move the position.`}
              onClick={handleCourtClick}
              onKeyDown={handleCourtKeyDown}
              className="relative mx-auto aspect-[1.55] max-w-lg cursor-crosshair overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd] outline-none transition focus:ring-4 focus:ring-[#f3b59c]"
            >
              <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-[#7aa996]" />
              <div className="absolute inset-y-0 left-1/2 border-l border-[#7aa996]" />
              <div className="absolute left-3 top-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#47766b]">
                Net
              </div>
              <div className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#47766b]">
                Baseline
              </div>
              <div
                className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[var(--coral)] shadow-lg transition-all"
                style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
                Court X{" "}
                <strong className="float-right text-[var(--ink)]">
                  {courtX}
                </strong>
              </div>
              <div className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
                Court Y{" "}
                <strong className="float-right text-[var(--ink)]">
                  {courtY}
                </strong>
              </div>
            </div>
            <div className="mt-8 space-y-7 border-t border-[var(--line)] pt-7">
              <RangeInput
                label="Ball height"
                hint="How high is the ball?"
                value={ballHeight}
                min={0}
                max={10}
                onChange={setBallHeight}
                suffix="/ 10"
              />
              <RangeInput
                label="Intent"
                hint="How much pressure do you want to apply?"
                value={intent}
                min={0}
                max={100}
                onChange={setIntent}
                suffix="/ 100"
              />
            </div>
            <button
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const response = await fetch("/api/discover", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      courtX,
                      courtY,
                      ballHeight,
                      intent,
                    }),
                  });
                  const result = (await response.json()) as {
                    shots?: DiscoverableShot[];
                    error?: string;
                  };
                  if (!response.ok) throw new Error(result.error);
                  setShots(result.shots ?? []);
                } catch (requestError) {
                  setError(
                    requestError instanceof Error
                      ? requestError.message
                      : "We could not load shots right now.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="mt-9 flex w-full items-center justify-between rounded-xl bg-[var(--ink)] px-5 py-4 text-left text-base font-bold text-white transition hover:bg-[var(--teal)]"
            >
              <span>
                {loading
                  ? "Finding your shots..."
                  : "Find shots for this moment"}
              </span>
              <span aria-hidden="true">→</span>
            </button>
            {error && (
              <p className="mt-4 text-sm text-[var(--coral)]">{error}</p>
            )}
          </section>
        </section>
        {shots && (
          <section className="border-t border-[var(--line)] pb-20 pt-12">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
                  Your matches
                </p>
                <h2 className="mt-2 text-4xl">Shots for this moment</h2>
              </div>
              <span className="text-sm text-[var(--muted)]">
                {shots.length} found
              </span>
            </div>
            {shots.length > 0 ? (
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {shots.map((shot) => (
                  <ShotCard key={shot.id} shot={shot} />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-[var(--line)] p-8">
                <h3 className="text-2xl">Can&apos;t find your shot?</h3>
                <p className="mt-2 text-[var(--muted)]">
                  Try a nearby situation or request a new shot for the catalog.
                </p>
                <Link
                  href="/request-shot"
                  className="mt-5 inline-block font-bold text-[var(--teal)]"
                >
                  Submit a new shot →
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function RangeInput({
  label,
  hint,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span>
          <strong className="text-base">{label}</strong>
          <span className="ml-2 text-sm text-[var(--muted)]">{hint}</span>
        </span>
        <strong className="text-base text-[var(--coral)]">
          {value} <span className="text-xs text-[var(--muted)]">{suffix}</span>
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-[var(--coral)]"
      />
    </label>
  );
}
