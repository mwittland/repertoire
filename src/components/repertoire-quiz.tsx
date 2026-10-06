"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { recordQuizCompletion } from "@/app/actions/metrics";
import { applyPreset } from "@/app/actions/repertoire-quiz";
import { saveMasteryUpdates } from "@/app/actions/mastery-update";
import { HowItWorksMap } from "@/components/how-it-works-map";
import { summarizeRepertoire } from "@/lib/repertoire/profile-summary";
import {
  getPreset,
  getPresetShotMastery,
  type RepertoirePreset,
} from "@/lib/repertoire/presets";
import type { DiscoverableShot } from "@/lib/discovery/types";

type Answer = {
  label: string;
  value: string;
  scores: Partial<Record<string, number>>;
};
type Question = {
  id: string;
  title: string;
  description: string;
  answers: Answer[];
};
type Handedness = "Right" | "Left";
type QuizPhase = "basic" | "personalized-prompt" | "personalized" | "complete";

const ratingAnswers = [
  { label: "Needs significant work at my level", value: "0", scores: {} },
  { label: "Developing for my level", value: "1", scores: {} },
  { label: "Solid for my level", value: "2", scores: {} },
  { label: "A clear strength at my level", value: "3", scores: {} },
];

const basicQuestions: Question[] = [
  {
    id: "skill",
    title: "What level do you usually play at?",
    description: "Choose the level that best matches your current games.",
    answers: [
      { label: "Beginner", value: "20", scores: {} },
      { label: "Around 3.0–3.5", value: "32", scores: {} },
      { label: "Around 3.5–4.0", value: "44", scores: {} },
      { label: "Around 4.0–4.5", value: "58", scores: {} },
      { label: "Around 4.5–5.0", value: "68", scores: {} },
      { label: "5.0+", value: "78", scores: {} },
    ],
  },
  ...(
    [
      [
        "left-side",
        "How would you rate your ability to play the left side?",
        "Think about positioning, decisions, and consistency when you play on the left side of the court.",
      ],
      [
        "right-side",
        "How would you rate your ability to play the right side?",
        "Think about positioning, decisions, and consistency when you play on the right side of the court.",
      ],
      [
        "forehand",
        "How would you rate your forehand compared with your peers?",
        "Think about consistency, placement, and confidence under pressure.",
      ],
      [
        "backhand",
        "How would you rate your backhand compared with your peers?",
        "Think about consistency, placement, and confidence under pressure.",
      ],
      [
        "baseline",
        "How would you rate your baseline game?",
        "Consider your ability to defend, drive, lob, and start moving forward.",
      ],
      [
        "transition",
        "How would you rate your transition game?",
        "Consider your drops, resets, footwork, and decisions moving to the kitchen.",
      ],
      [
        "kitchen",
        "How would you rate your kitchen game?",
        "Consider your dinks, counters, hand speed, patience, and shot selection.",
      ],
    ] as const
  ).map(([id, title, description]) => ({
    id,
    title,
    description,
    answers: ratingAnswers,
  })),
];

const personalizedQuestions: Question[] = [
  ...(
    [
      ["Dink", "soft"],
      ["Drop", "transition"],
      ["Drive", "baseline"],
      ["Reset", "transition"],
      ["Attack", "kitchen"],
      ["Putaway", "kitchen"],
      ["Lob", "baseline"],
    ] as const
  ).map(([shot, phase]) => ({
    id: `shot-${shot.toLowerCase()}`,
    title: `How well do you execute your ${shot.toLowerCase()}?`,
    description: `Rate your consistency and decision-making compared with players at your current level.`,
    answers: ratingAnswers,
    phase,
  })),
  {
    id: "passive-play",
    title: "How well do you execute passive, control-first shots?",
    description:
      "Rate your dinks, resets, drops, and patience compared with players at your current level.",
    answers: ratingAnswers,
  },
  {
    id: "aggressive-play",
    title: "How well do you execute aggressive shots?",
    description:
      "Rate your drives, attacks, pressure, and finishing opportunities compared with players at your current level.",
    answers: ratingAnswers,
  },
  {
    id: "simple-shots",
    title: "How well do you execute simple, repeatable shots?",
    description:
      "Rate your ability to make high-margin choices consistently at your current level.",
    answers: ratingAnswers,
  },
  {
    id: "difficult-shots",
    title: "How well do you execute challenging shots?",
    description:
      "Rate your precision, timing, and control on demanding shots compared with players at your current level.",
    answers: ratingAnswers,
  },
];

const questions = [...basicQuestions, ...personalizedQuestions];

const masteryWeights = {
  tier1: 7,
  tier2: 4,
  tier3: 2,
} as const;

const phaseRanges = {
  baseline: [8, 12],
  transition: [12, 16],
  kitchen: [16, 23],
} as const;

function ratingDelta(
  answers: Record<string, string>,
  questionId: string,
  weight: number,
) {
  return (Number(answers[questionId] ?? 1) - 1.5) * weight;
}

function overlapsRange(
  minimum: number,
  maximum: number,
  range: readonly [number, number],
) {
  return minimum <= range[1] && maximum >= range[0];
}

function overlapsSide(
  shot: DiscoverableShot,
  side: "left" | "right",
  handedness: Handedness,
) {
  const minimum = handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
  const maximum = handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
  return side === "left" ? minimum < 0 : maximum > 0;
}

function relativeTypeScore(
  shot: DiscoverableShot,
  shots: DiscoverableShot[],
  field: "aggressionScore" | "difficulty",
) {
  const values = shots
    .filter((candidate) => candidate.shotType === shot.shotType)
    .map((candidate) => candidate[field] ?? 50);
  const value = shot[field] ?? 50;
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  return minimum === maximum
    ? value / 100
    : (value - minimum) / (maximum - minimum);
}

function recommendPreset(answers: Record<string, string>) {
  const skill = Number(answers.skill ?? 20);
  const shotTypes = [
    "Dink",
    "Drop",
    "Drive",
    "Reset",
    "Attack",
    "Putaway",
    "Lob",
  ] as RepertoirePreset["shotTypes"];
  const phaseByShot: Record<string, keyof typeof phaseRatings> = {
    Dink: "kitchen",
    Drop: "transition",
    Drive: "baseline",
    Reset: "transition",
    Attack: "kitchen",
    Putaway: "kitchen",
    Lob: "baseline",
  };
  const shotRatings = Object.fromEntries(
    shotTypes.map((shot) => [
      shot,
      Number(answers[`shot-${shot.toLowerCase()}`] ?? 1),
    ]),
  ) as Record<string, number>;
  const phaseRatings = {
    baseline: Number(answers.baseline ?? 1),
    transition: Number(answers.transition ?? 1),
    kitchen: Number(answers.kitchen ?? 1),
  };
  const strongestShot = shotTypes.reduce(
    (best, shot) => (shotRatings[shot] > shotRatings[best] ? shot : best),
    shotTypes[0],
  );
  const weakestShot = shotTypes.reduce(
    (weakest, shot) =>
      shotRatings[shot] < shotRatings[weakest] ? shot : weakest,
    shotTypes[0],
  );
  const count = skill < 40 ? 4 : skill < 52 ? 5 : skill < 68 ? 6 : 7;
  const includedShots = [...shotTypes]
    .sort((a, b) => shotRatings[b] - shotRatings[a])
    .slice(0, count);
  if (!includedShots.includes(weakestShot))
    includedShots[includedShots.length - 1] = weakestShot;
  const forehandRating = Number(answers.forehand ?? 1);
  const backhandRating = Number(answers.backhand ?? 1);
  const sideAverage = (forehandRating + backhandRating) / 2;
  const sideBias = forehandRating - backhandRating;
  const shotMastery = Object.fromEntries(
    includedShots.map((shot) => [
      shot,
      Math.round(
        Math.max(
          5,
          Math.min(
            90,
            skill +
              (shotRatings[shot] - 1.5) * masteryWeights.tier3 +
              (phaseRatings[phaseByShot[shot]] - 1.5) * masteryWeights.tier2 +
              (sideAverage - 1.5) * masteryWeights.tier1 +
              sideBias * 2,
          ),
        ),
      ),
    ]),
  ) as RepertoirePreset["shotMastery"];
  const strongestPhase = Object.entries(phaseRatings).sort(
    ([, a], [, b]) => b - a,
  )[0][0];
  const sideScore = sideBias;
  const sideLabel =
    Math.abs(sideScore) < 1
      ? "balanced"
      : sideScore > 0
        ? "forehand-led"
        : "backhand-led";
  const leftSideRating = Number(answers["left-side"] ?? 1);
  const rightSideRating = Number(answers["right-side"] ?? 1);
  const strongerCourtSide =
    leftSideRating === rightSideRating
      ? "balanced court-side coverage"
      : leftSideRating > rightSideRating
        ? "left-side coverage"
        : "right-side coverage";
  return {
    id: `analytical-${sideLabel}-${strongestPhase}-${skill}-${strongestShot}-${weakestShot}`,
    name: `${sideLabel} ${strongestPhase} profile`,
    tagline: `A ${sideLabel} ${strongestPhase} game built around your ${strongestShot}.`,
    description: `Your strongest shot is the ${strongestShot}, while ${weakestShot} is the clearest development opportunity.`,
    bestFor: `Players building a ${strongestPhase} game`,
    mastery: Math.max(5, skill - 3),
    shotMastery,
    strengths: [
      `${strongestShot} is your current anchor`,
      `${sideLabel} decision-making`,
      strongerCourtSide,
      `${strongestPhase} awareness`,
    ],
    focusAreas: [
      `Build your ${weakestShot}`,
      `Connect your ${strongestPhase} game to the rest of the court`,
      "Use a skill-appropriate shot selection",
    ],
    shotTypes: includedShots,
    drillTypes: [],
    highlights: [
      `${includedShots.length} shot families`,
      "Skill-appropriate starting point",
      `${sideLabel} emphasis`,
    ],
  };
}

function getShotMastery(
  preset: RepertoirePreset,
  shot: DiscoverableShot,
  answers: Record<string, string>,
  handedness: Handedness,
  shots: DiscoverableShot[],
) {
  const baseMastery = getPresetShotMastery(preset, shot);
  let adjustment = 0;
  if (overlapsSide(shot, "left", handedness)) {
    adjustment += ratingDelta(answers, "left-side", masteryWeights.tier1);
  }
  if (overlapsSide(shot, "right", handedness)) {
    adjustment += ratingDelta(answers, "right-side", masteryWeights.tier1);
  }

  const forehandSide = handedness === "Right" ? "right" : "left";
  const backhandSide = forehandSide === "right" ? "left" : "right";
  const shotName = shot.name.toLowerCase();
  if (
    shotName.includes("forehand") &&
    overlapsSide(shot, forehandSide, handedness)
  ) {
    adjustment += ratingDelta(answers, "forehand", masteryWeights.tier1);
  }
  if (
    shotName.includes("backhand") &&
    overlapsSide(shot, backhandSide, handedness)
  ) {
    adjustment += ratingDelta(answers, "backhand", masteryWeights.tier1);
  }

  for (const phase of Object.keys(phaseRanges) as Array<
    keyof typeof phaseRanges
  >) {
    if (overlapsRange(shot.courtYMin, shot.courtYMax, phaseRanges[phase])) {
      adjustment += ratingDelta(answers, phase, masteryWeights.tier2);
    }
  }

  if (shot.shotType) {
    adjustment += ratingDelta(
      answers,
      `shot-${shot.shotType.toLowerCase()}`,
      masteryWeights.tier3,
    );
  }

  const aggressionPosition = relativeTypeScore(shot, shots, "aggressionScore");
  const difficultyPosition = relativeTypeScore(shot, shots, "difficulty");
  if (aggressionPosition <= 0.35) {
    adjustment += ratingDelta(answers, "passive-play", masteryWeights.tier2);
  }
  if (aggressionPosition >= 0.65) {
    adjustment += ratingDelta(answers, "aggressive-play", masteryWeights.tier2);
  }
  if (difficultyPosition <= 0.35) {
    adjustment += ratingDelta(answers, "simple-shots", masteryWeights.tier2);
  }
  if (difficultyPosition >= 0.65) {
    adjustment += ratingDelta(answers, "difficult-shots", masteryWeights.tier2);
  }

  return Math.round(Math.max(5, Math.min(90, baseMastery + adjustment)));
}

function PreviewList({
  preset,
  shots,
  answers,
  handedness,
}: {
  preset: RepertoirePreset;
  shots: DiscoverableShot[];
  answers: Record<string, string>;
  handedness: Handedness;
}) {
  const presetShots = shots
    .filter((shot) => shot.shotType && preset.shotTypes.includes(shot.shotType))
    .map((shot) => ({
      shot,
      mastery: getShotMastery(preset, shot, answers, handedness, shots),
    }));
  const bestShots = [...presetShots]
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 3);
  const worstShots = [...presetShots]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {[
        ["Best shots", bestShots],
        ["Shots to develop", worstShots],
      ].map(([label, entries]) => (
        <div key={label as string}>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            {label as string}
          </p>
          <ul className="mt-3 space-y-2 text-[var(--muted)]">
            {(entries as typeof bestShots).map(({ shot, mastery }) => (
              <li key={shot.id} className="flex justify-between gap-4">
                <span>• {shot.name}</span>
                <span className="font-bold text-[var(--ink)]">{mastery}%</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function QuizCoverageMap({
  preset,
  shots,
  answers,
  handedness,
}: {
  preset: RepertoirePreset;
  shots: DiscoverableShot[];
  answers: Record<string, string>;
  handedness: Handedness;
}) {
  const profileShots = shots
    .filter((shot) => shot.shotType && preset.shotTypes.includes(shot.shotType))
    .map((shot) => ({
      ...shot,
      confidence: getShotMastery(preset, shot, answers, handedness, shots),
    }));

  return (
    <HowItWorksMap
      shots={profileShots}
      mapModes={["relative"]}
      initialMapMode="relative"
      relativeMasteryNote
      mapSize="small"
      bare
      showShotTypeFilter={false}
      showShotTypeColors={false}
      showShotTypeLegend={false}
      showMasteryLegend
      showHandednessFilter={false}
      showBallHeightFilter={false}
      hideSidePanel
      heading="See your starting coverage."
      description="This map shows the relative strength of your recommended shot profile across the court."
    />
  );
}

export function RepertoireQuiz({
  shots,
  handedness,
  initialPresetId,
  reassessment = false,
  currentShots = [],
}: {
  shots: DiscoverableShot[];
  handedness: Handedness;
  initialPresetId?: string;
  reassessment?: boolean;
  currentShots?: DiscoverableShot[];
}) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>("basic");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPreset, setSelectedPreset] = useState<RepertoirePreset | null>(
    () => (initialPresetId ? getPreset(initialPresetId) : null),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const recommendation = useMemo(() => recommendPreset(answers), [answers]);

  function completeQuiz() {
    void recordQuizCompletion();
    setPhase("complete");
  }

  function applySelectedPreset(
    preset: RepertoirePreset | null = selectedPreset,
  ) {
    if (!preset) return;
    if (
      !window.confirm(
        "Replace your current shot repertoire with this preset? Your existing shots will be removed.",
      )
    ) {
      return;
    }

    const shotEntries = shots
      .filter(
        (shot) => shot.shotType && preset.shotTypes.includes(shot.shotType),
      )
      .map((shot) => ({
        id: shot.id,
        confidence: getShotMastery(preset, shot, answers, handedness, shots),
      }));
    const formData = new FormData();
    formData.set("shotEntries", JSON.stringify(shotEntries));
    formData.set("mode", "replace");
    setError(null);
    startTransition(async () => {
      const result = await applyPreset(formData);
      if (result.success) {
        router.push("/repertoire");
        router.refresh();
      } else {
        setError(result.error ?? "Unable to apply this preset.");
      }
    });
  }

  function saveReassessment() {
    const updates = currentShots.map((shot) => ({
      shotId: shot.id,
      confidence: Math.round(
        (shot.confidence ?? 25) * 0.7 +
          getShotMastery(recommendation, shot, answers, handedness, shots) * 0.3,
      ),
    }));
    const formData = new FormData();
    formData.set("updates", JSON.stringify(updates));
    setError(null);
    startTransition(async () => {
      const result = await saveMasteryUpdates(formData);
      if (result.success) {
        router.push("/repertoire");
        router.refresh();
      } else {
        setError(result.error ?? "Unable to save this reassessment.");
      }
    });
  }

  if (selectedPreset) {
    return (
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => router.push("/repertoire/build")}
          className="font-bold text-[var(--teal)]"
        >
          ← Back to builds
        </button>
        <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
            Preset preview
          </p>
          <h2 className="mt-3 text-4xl">{selectedPreset.name}</h2>
          <p className="mt-3 text-xl text-[var(--muted)]">
            {selectedPreset.tagline}
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
            {selectedPreset.description}
          </p>
          <div className="mt-8 border-t border-[var(--line)] pt-8">
            <PreviewList
              preset={selectedPreset}
              shots={shots}
              answers={answers}
              handedness={handedness}
            />
          </div>
          {error && (
            <p role="alert" className="mt-6 text-sm text-[var(--coral)]">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => applySelectedPreset(selectedPreset)}
            disabled={pending}
            className="mt-8 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
          >
            {pending ? "Replacing..." : "Replace my repertoire"}
          </button>
        </section>
      </div>
    );
  }

  if (phase === "personalized-prompt") {
    return (
      <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          Basic profile complete
        </p>
        <h2 className="mt-3 text-4xl">Want more personalized feedback?</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Your starting profile is ready. Continue with a few optional questions
          about shot types, aggression, and difficulty to make the mastery
          recommendations more specific.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              completeQuiz();
              setStep(-1);
            }}
            className="rounded-xl border border-[var(--line)] p-4 text-left font-bold transition hover:border-[var(--teal)]"
          >
            Use my basic profile
            <span className="mt-1 block text-sm font-normal text-[var(--muted)]">
              Show my recommendation now.
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("personalized");
              setStep(0);
            }}
            className="rounded-xl bg-[var(--ink)] p-4 text-left font-bold text-white transition hover:bg-[var(--teal)]"
          >
            Continue for more detail
            <span className="mt-1 block text-sm font-normal text-white/70">
              Answer {personalizedQuestions.length} more questions.
            </span>
          </button>
        </div>
      </section>
    );
  }

  if (phase === "complete") {
    const reassessmentShots = currentShots.map((shot) => ({
      ...shot,
      confidence: Math.round(
        (shot.confidence ?? 25) * 0.7 +
          getShotMastery(recommendation, shot, answers, handedness, shots) * 0.3,
      ),
    }));
    const profileShots = reassessment
      ? reassessmentShots
      : shots
          .filter(
            (shot) =>
              shot.shotType && recommendation.shotTypes.includes(shot.shotType),
          )
          .map((shot) => ({
            ...shot,
            confidence: getShotMastery(
              recommendation,
              shot,
              answers,
              handedness,
              shots,
            ),
          }));
    const profileTitle = summarizeRepertoire(profileShots).profileTitle;
    return (
      <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          {reassessment ? "Your updated mastery" : "Your recommendation"}
        </p>
        <h2 className="mt-3 text-4xl">
          {profileTitle}
        </h2>
        <p className="mt-3 text-xl text-[var(--muted)]">
          {recommendation.tagline}
        </p>
        <div className="mt-8 border-t border-[var(--line)] pt-8">
          <PreviewList
            preset={recommendation}
            shots={shots}
            answers={answers}
            handedness={handedness}
          />
        </div>
        {reassessment ? (
          <HowItWorksMap
            shots={reassessmentShots}
            handedness={handedness}
            mapModes={["relative"]}
            initialMapMode="relative"
            relativeMasteryNote
            mapSize="small"
            bare
            showShotTypeFilter={false}
            showShotTypeColors={false}
            showShotTypeLegend={false}
            showHandednessFilter={false}
            showBallHeightFilter={false}
            hideSidePanel
            heading="Preview your updated map."
            description="Your existing mastery counts for 70% and this reassessment counts for 30%."
          />
        ) : (
          <QuizCoverageMap
            preset={recommendation}
            shots={shots}
            answers={answers}
            handedness={handedness}
          />
        )}
        {error && (
          <p role="alert" className="mt-6 text-sm text-[var(--coral)]">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => reassessment ? saveReassessment() : applySelectedPreset(recommendation)}
          disabled={pending}
          className="mt-8 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : reassessment ? "Save updated mastery" : "Replace my repertoire"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setSelectedPreset(null);
            setPhase("basic");
            setStep(0);
          }}
          className="mt-6 font-bold text-[var(--teal)]"
        >
          Retake the quiz
        </button>
      </section>
    );
  }

  const currentQuestions =
    phase === "basic" ? basicQuestions : personalizedQuestions;
  const question = currentQuestions[step];
  function choose(value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setSelectedPreset(null);
    if (phase === "basic") {
      if (step === basicQuestions.length - 1) setPhase("personalized-prompt");
      else setStep((current) => current + 1);
    } else if (step === personalizedQuestions.length - 1) {
      completeQuiz();
    } else {
      setStep((current) => current + 1);
    }
  }

  const questionNumber =
    phase === "basic" ? step + 1 : basicQuestions.length + step + 1;
  const totalQuestions =
    phase === "basic" ? basicQuestions.length : questions.length;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          Question {questionNumber} of {totalQuestions}
        </p>
        <div className="h-2 w-24 rounded-full bg-[#d4e0d6]">
          <div
            className="h-2 rounded-full bg-[var(--teal)]"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="mt-5 text-3xl">{question.title}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">
        {question.description}
      </p>
      <div className="mt-8 grid gap-3">
        {question.answers.map((answer) => (
          <button
            type="button"
            key={answer.value}
            aria-pressed={answers[question.id] === answer.value}
            onClick={() => choose(answer.value)}
            className={`rounded-xl border p-4 text-left text-[var(--ink)] transition ${answers[question.id] === answer.value ? "border-[var(--teal)] bg-[var(--teal)] !text-[#101714]" : "border-[var(--line)] hover:border-[var(--teal)]"}`}
          >
            {answer.label}
          </button>
        ))}
      </div>
    </section>
  );
}
