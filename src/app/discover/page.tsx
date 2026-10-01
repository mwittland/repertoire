"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShotCard } from "@/components/shot-card";
import type { DiscoverableShot } from "@/lib/discovery/types";
import { AnonymousHandedness } from "@/components/anonymous-handedness";

const canvasRange = { xMin: -15, xMax: 15, yMin: 0, yMax: 30 };

export default function DiscoverPage() {
  const [courtX, setCourtX] = useState(0);
  const [courtY, setCourtY] = useState(20);
  const [ballHeight, setBallHeight] = useState(5);
  const [intent, setIntent] = useState(60);
  const [handedness, setHandedness] = useState<"Right" | "Left">("Right");
  const [shots, setShots] = useState<DiscoverableShot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const xPercent =
    ((courtX - canvasRange.xMin) / (canvasRange.xMax - canvasRange.xMin)) * 100;
  const yPercent =
    100 -
    ((courtY - canvasRange.yMin) / (canvasRange.yMax - canvasRange.yMin)) * 100;

  useEffect(() => {
    if (shots !== null) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [shots]);

  function setCourtPosition(x: number, y: number) {
    setCourtX(
      Math.max(canvasRange.xMin, Math.min(canvasRange.xMax, Math.round(x))),
    );
    setCourtY(
      Math.max(canvasRange.yMin, Math.min(canvasRange.yMax, Math.round(y))),
    );
  }

  function handleCourtClick(event: React.MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x =
      canvasRange.xMin +
      ((event.clientX - bounds.left) / bounds.width) *
        (canvasRange.xMax - canvasRange.xMin);
    const y =
      canvasRange.yMax -
      ((event.clientY - bounds.top) / bounds.height) *
        (canvasRange.yMax - canvasRange.yMin);
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
            <h1 className="max-w-xl text-6xl leading-[0.95] sm:text-7xl">
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
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(210px,0.65fr)]">
              <div>
                <h2 className="mb-3 text-2xl">Court location</h2>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Selected court position: X ${courtX}, Y ${courtY}. Click to move the position.`}
                  onClick={handleCourtClick}
                  onKeyDown={handleCourtKeyDown}
                  className="relative mx-auto h-[18rem] w-full max-w-lg cursor-crosshair overflow-hidden rounded-2xl border-4 border-[#4d8a7a] bg-[#dcebdd] outline-none transition focus:ring-4 focus:ring-[#f3b59c]"
                >
                  <div className="pointer-events-none absolute inset-x-[16.67%] bottom-[26.67%] top-0 overflow-hidden border-x-4 border-[#f9fff8] bg-[#dcebdd]">
                    <div className="absolute inset-x-0 top-0 h-[31.82%] bg-[#c8e5d3]" />
                    <div className="absolute inset-x-0 top-0 border-t-4 border-white/90" />
                    <div className="absolute inset-x-0 top-[31.82%] border-t-2 border-white/90" />
                    <div className="absolute inset-x-0 bottom-0 border-b-4 border-white/90" />
                    <div className="absolute bottom-0 left-1/2 top-[31.82%] border-l-2 border-white/90" />
                    <span className="absolute left-2 top-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#47766b]">
                      Net
                    </span>
                    <span className="absolute left-2 top-[34%] text-[10px] font-bold uppercase tracking-[0.16em] text-[#47766b]">
                      Kitchen
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#47766b]">
                      Baseline
                    </span>
                  </div>
                  <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#47766b]">
                    Out of bounds
                  </span>
                  <span className="pointer-events-none absolute left-1 top-1/2 -rotate-90 text-[9px] font-bold uppercase tracking-[0.14em] text-[#47766b]">
                    Out
                  </span>
                  <span className="pointer-events-none absolute right-1 top-1/2 rotate-90 text-[9px] font-bold uppercase tracking-[0.14em] text-[#47766b]">
                    Out
                  </span>
                  <div
                    className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[var(--coral)] shadow-lg transition-all"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  />
                </div>
              </div>
              <VerticalHeightInput
                value={ballHeight}
                onChange={setBallHeight}
              />
            </div>
            <div className="mt-8">
              <IntentInput value={intent} onChange={setIntent} />
            </div>
            <AnonymousHandedness value={handedness} onChange={setHandedness} />
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
                      handedness,
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
          <section
            ref={resultsRef}
            className="scroll-mt-24 border-t border-[var(--line)] pb-20 pt-12"
          >
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

function VerticalHeightInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-2xl">Ball height</h2>
      <div className="h-[18rem] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-2xl border border-[var(--line)] bg-[#edf4ec] p-4">
        <div className="relative mx-auto aspect-[0.63] h-full w-full max-w-[11.34rem] overflow-hidden rounded-xl border border-[#c7d9c8] bg-[#f8fbf5]">
          <Image
            src="/ballHeight.jpg"
            alt="Six-foot pickleball player standing beside a regulation-height net"
            fill
            sizes="(max-width: 640px) 60vw, 220px"
            className="object-cover"
          />
        </div>
        <input
          aria-label="Ball height in feet"
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-full w-8 accent-[var(--coral)] [writing-mode:vertical-lr] [direction:rtl]"
        />
      </div>
    </div>
  );
}

function IntentInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const label =
    value < 20
      ? "Defend"
      : value < 40
        ? "Reset"
        : value < 60
          ? "Build"
          : value < 80
            ? "Attack"
            : "Finish";

  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <h2 className="text-2xl">Intent</h2>
        <strong className="text-base text-[var(--coral)]">{label}</strong>
      </span>
      <input
        aria-label={`Intent: ${label}`}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-[var(--coral)]"
      />
    </label>
  );
}
