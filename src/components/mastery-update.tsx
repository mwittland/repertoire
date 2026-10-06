"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveMasteryUpdates } from "@/app/actions/mastery-update";
import { HowItWorksMap } from "@/components/how-it-works-map";
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

type ShotState = {
  confidence: number | null;
  learned?: boolean;
};

const checkinOptions = [
  { value: "better", label: "I have gotten better", delta: 8 },
  { value: "same", label: "About the same", delta: 0 },
  { value: "worse", label: "I have gotten worse", delta: -8 },
] as const;

const targetedShotCount = 5;

function buildInitialState(shots: DiscoverableShot[]) {
  return Object.fromEntries(
    shots.map((shot) => [
      shot.id,
      { confidence: shot.confidence ?? null } satisfies ShotState,
    ]),
  ) as Record<string, ShotState>;
}

export function MasteryUpdate({
  shots,
  handedness,
}: {
  shots: DiscoverableShot[];
  handedness: "Right" | "Left";
}) {
  const router = useRouter();
  const [states, setStates] = useState(() => buildInitialState(shots));
  const [mode, setMode] = useState<"families" | "targeted" | null>(null);
  const [selectedType, setSelectedType] = useState<ShotType | null>(null);
  const [familyStep, setFamilyStep] = useState(0);
  const [familyComplete, setFamilyComplete] = useState(false);
  const [targetedStep, setTargetedStep] = useState(0);
  const [targetedQuestion, setTargetedQuestion] = useState<"practice" | "games">("practice");
  const [targetedComplete, setTargetedComplete] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const changedShots = useMemo(
    () =>
      shots.filter((shot) => {
        const current = states[shot.id]?.confidence;
        return current !== shot.confidence && current !== null && current !== undefined;
      }),
    [shots, states],
  );
  const previewShots = useMemo(
    () =>
      shots
        .filter((shot) => states[shot.id]?.confidence !== null)
        .map((shot) => ({ ...shot, confidence: states[shot.id]?.confidence })),
    [shots, states],
  );
  const targetedShots = useMemo(
    () => {
      const unassessedShots = shots
        .filter((shot) => shot.confidence === null || shot.confidence === undefined)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 2);
      const weakestShots = shots
        .filter((shot) => shot.confidence !== null && shot.confidence !== undefined)
        .sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))
        .slice(0, targetedShotCount - unassessedShots.length);
      return [...unassessedShots, ...weakestShots];
    },
    [shots],
  );
  const targetedQuestionCount = targetedShots.length * 2;

  function updateShot(shotId: string, confidence: number | null, learned?: boolean) {
    setStates((current) => ({
      ...current,
      [shotId]: { confidence, learned },
    }));
    setSubmitted(false);
  }

  function selectAnswer(shotId: string, answer: string, confidence: number | null, learned?: boolean) {
    setSelections((current) => ({ ...current, [shotId]: answer }));
    updateShot(shotId, confidence, learned);
  }

  function selectShotType(type: ShotType) {
    setSelectedType(type);
    setFamilyStep(0);
    setFamilyComplete(false);
  }

  function startTargetedCheckin() {
    setMode("targeted");
    setTargetedStep(0);
    setTargetedQuestion("practice");
    setTargetedComplete(false);
  }

  function answerTargetedQuestion(shot: DiscoverableShot, answer: "yes" | "no" | "working" | "mixed" | "not-working") {
    const current = shot.confidence ?? 25;
    setSelections((currentSelections) => ({
      ...currentSelections,
      [`targeted-${shot.id}-${targetedQuestion}`]: answer,
    }));
    if (targetedQuestion === "practice") {
      setTargetedQuestion("games");
    } else {
      const practiceAnswer = selections[`targeted-${shot.id}-practice`];
      const delta =
        practiceAnswer === "yes" && answer === "working"
          ? 8
          : practiceAnswer === "yes" || answer === "mixed"
            ? 4
            : answer === "not-working"
              ? -4
              : 0;
      if (shot.confidence !== null && shot.confidence !== undefined || practiceAnswer === "yes") {
        updateShot(shot.id, Math.max(0, Math.min(100, current + delta)));
      }
      if (targetedStep >= targetedShots.length - 1) {
        setTargetedComplete(true);
      } else {
        setTargetedStep((currentStep) => currentStep + 1);
        setTargetedQuestion("practice");
      }
    }
  }

  function advanceFamily(total: number) {
    if (familyStep >= total - 1) {
      setFamilyComplete(true);
    } else {
      setFamilyStep((current) => current + 1);
    }
  }

  function save() {
    const updates = changedShots.map((shot) => ({
      shotId: shot.id,
      confidence: states[shot.id].confidence as number,
    }));
    if (updates.length === 0) {
      setError("Complete a check-in before saving.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("updates", JSON.stringify(updates));
      const result = await saveMasteryUpdates(formData);
      if (result.success) {
        router.push("/repertoire");
      } else {
        setError(result.error ?? "Unable to save these updates.");
      }
    });
  }

  if (!mode) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={startTargetedCheckin}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-left transition hover:border-[var(--coral)]"
        >
          <h2 className="text-2xl">Targeted check-in</h2>
          <p className="mt-2 leading-7 text-[var(--muted)]">
            Focus on five weaker shots with 10 quick questions about practice and game performance.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setMode("families")}
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-left transition hover:border-[var(--coral)]"
        >
          <h2 className="text-2xl">Check in by shot type</h2>
          <p className="mt-2 leading-7 text-[var(--muted)]">
            Review how each family of shots is developing and make focused updates.
          </p>
        </button>
        <a
          href="/repertoire/quiz?mode=reassessment"
          className="block w-full rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 text-left transition hover:border-[var(--coral)]"
        >
          <h2 className="text-2xl">Complete a total reassessment</h2>
          <p className="mt-2 leading-7 text-[var(--muted)]">
            Reassess your current repertoire. New answers will count for 30% and
            your existing mastery will count for 70%.
          </p>
        </a>
      </div>
    );
  }

  if (mode === "targeted") {
    const currentShot = targetedShots[targetedStep];
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => setMode(null)}
          className="font-bold text-[var(--teal)]"
        >
          ← Choose another update
        </button>
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            Targeted check-in
          </p>
          <h2 className="mt-3 text-3xl">Focus on your weaknesses.</h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            We selected your lowest-mastery shots. Tell us whether you have practiced each one.
          </p>
          {targetedShots.length < targetedShotCount ? (
            <p className="mt-8 text-[var(--muted)]">
              You need at least five shots in your catalog to take this check-in.
            </p>
          ) : targetedComplete ? (
            <>
              <p className="mt-8 font-bold text-[var(--teal)]">
                You completed all {targetedQuestionCount} questions.
              </p>
              <HowItWorksMap
                shots={previewShots}
                handedness={handedness}
                initialMapMode="relative"
                bare
                showShotTypeFilter={false}
                showShotTypeColors={false}
                showShotTypeLegend={false}
                showHandednessFilter={false}
                showBallHeightFilter={false}
                hideSidePanel
                heading="Preview your updated map."
                description="Practicing a targeted shot increases its mastery by 5 points."
              />
              {error && (
                <p role="alert" className="mt-6 text-sm text-[var(--coral)]">
                  {error}
                </p>
              )}
              {submitted ? (
                <p className="mt-8 font-bold text-[var(--teal)]">
                  Your targeted check-in was saved.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="mt-8 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
                >
                  {pending ? "Saving..." : "Save targeted updates"}
                </button>
              )}
            </>
          ) : currentShot ? (
            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Question {targetedStep * 2 + (targetedQuestion === "practice" ? 1 : 2)} of {targetedQuestionCount}
              </p>
              <h3 className="mt-4 text-2xl">{currentShot.name}</h3>
              <p className="mt-3 text-[var(--muted)]">
                {currentShot.confidence === null || currentShot.confidence === undefined
                  ? "Not currently in your repertoire"
                  : `Current mastery: ${currentShot.confidence}%`}
              </p>
              <p className="mt-6 text-sm text-[var(--muted)]">
                {targetedQuestion === "practice"
                  ? "Have you practiced this shot?"
                  : "How has this shot been working in games?"}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(targetedQuestion === "practice"
                  ? [
                      { value: "yes" as const, label: "Yes, I have practiced it" },
                      { value: "no" as const, label: "Not yet" },
                    ]
                  : [
                      { value: "working" as const, label: "It is working well" },
                      { value: "mixed" as const, label: "Sometimes" },
                      { value: "not-working" as const, label: "Not well yet" },
                    ]
                ).map((answer) => (
                  <button
                    key={answer.label}
                    type="button"
                    onClick={() => answerTargetedQuestion(currentShot, answer.value)}
                    className={`rounded-xl border p-4 text-left font-bold transition ${
                      selections[`targeted-${currentShot.id}-${targetedQuestion}`] === answer.value
                        ? "border-[var(--teal)] bg-[var(--teal)] !text-[#101714]"
                        : "border-[var(--line)] hover:border-[var(--teal)]"
                    }`}
                  >
                    {answer.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    );
  }

  if (mode === "families" && !selectedType) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setMode(null)}
          className="font-bold text-[var(--teal)]"
        >
          ← Choose another update
        </button>
        <h2 className="mt-8 text-3xl">Choose a shot type</h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          Pick a shot family to begin a focused mastery check-in.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {shotTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => selectShotType(type)}
              className="rounded-xl border border-[var(--line)] p-4 text-left font-bold transition hover:border-[var(--coral)]"
            >
              {type}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (!selectedType) return null;
  const activeType = selectedType;
  const familyShots = shots.filter((shot) => shot.shotType === activeType);
  const visibleShots = familyShots;
  const currentShot = visibleShots[familyStep];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode(null)} className="font-bold text-[var(--teal)]">
          ← Choose another update
        </button>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-3xl">
          {`${activeType} check-in`}
        </h2>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          {`How has your ${activeType.toLowerCase()} game changed since your last assessment?`}
        </p>
        <div className="mt-8">
          {visibleShots.length === 0 ? (
            <p className="text-[var(--muted)]">
              No shots are currently available in this section.
            </p>
          ) : familyComplete ? (
            <p className="font-bold text-[var(--teal)]">
              Check-in complete for all {selectedType.toLowerCase()} shots.
            </p>
          ) : currentShot ? (() => {
            const shot = currentShot;
            const state = states[shot.id];
            const current = state.confidence;
            return (
              <div key={shot.id}>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Shot {familyStep + 1} of {visibleShots.length}
                </p>
                <h3 className="text-xl">{shot.name}</h3>
                {current === null || current === undefined ? (
                  <div className="mt-4">
                    <p className="text-sm text-[var(--muted)]">Have you learned this shot?</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          selectAnswer(shot.id, "learned", 25, true);
                          advanceFamily(visibleShots.length);
                        }}
                        className={`rounded-xl border px-4 py-3 font-bold transition ${selections[shot.id] === "learned" ? "border-[var(--coral)] bg-[var(--coral)] text-white" : "border-[var(--line)] hover:border-[var(--coral)]"}`}
                      >
                        Yes, start tracking it
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          selectAnswer(shot.id, "not-learned", null, false);
                          advanceFamily(visibleShots.length);
                        }}
                        className={`rounded-xl border px-4 py-3 font-bold transition ${selections[shot.id] === "not-learned" ? "border-[var(--coral)] bg-[var(--coral)] text-white" : "border-[var(--line)] hover:border-[var(--coral)]"}`}
                      >
                        Not yet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-[var(--muted)]">
                      Current mastery: {current}%
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                    {checkinOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          selectAnswer(
                            shot.id,
                            option.value,
                            Math.max(0, Math.min(100, current + option.delta)),
                          );
                          advanceFamily(visibleShots.length);
                        }}
                        className={`rounded-xl border px-4 py-3 font-bold transition ${selections[shot.id] === option.value ? "border-[var(--coral)] bg-[var(--coral)] text-white" : "border-[var(--line)] hover:border-[var(--coral)]"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })() : null}
        </div>
      </section>

      {familyComplete && <section>
        <HowItWorksMap
          shots={previewShots}
          handedness={handedness}
          mapModes={["relative"]}
          initialMapMode="relative"
          relativeMasteryNote
          mapSize="small"
          showShotTypeFilter={false}
          showShotTypeColors={false}
          showShotTypeLegend={false}
          showHandednessFilter={false}
          showBallHeightFilter={false}
          hideSidePanel
          heading="Preview your updated map."
          description="Review the relative strength of your shot coverage before saving."
        />
      </section>}

      {familyComplete && <>
        {error && <p role="alert" className="text-sm text-[var(--coral)]">{error}</p>}
        {submitted && <p className="text-sm font-bold text-[var(--teal)]">Your mastery updates were saved.</p>}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save these results"}
        </button>
      </>}
    </div>
  );
}
