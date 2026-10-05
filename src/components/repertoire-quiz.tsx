"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applyPreset } from "@/app/actions/repertoire-quiz";
import { getPreset, getPresetShotMastery, type RepertoirePreset } from "@/lib/repertoire/presets";
import type { Drill } from "@/lib/drills/types";
import type { DiscoverableShot } from "@/lib/discovery/types";

type Answer = { label: string; value: string; scores: Partial<Record<string, number>> };
type Question = { id: string; title: string; description: string; answers: Answer[] };

const ratingAnswers = [
  { label: "Needs significant work", value: "0", scores: {} },
  { label: "Developing", value: "1", scores: {} },
  { label: "Solid for my level", value: "2", scores: {} },
  { label: "A clear strength", value: "3", scores: {} },
];

const questions: Question[] = [
  {
    id: "skill",
    title: "What level do you usually play at?",
    description: "Choose the level that best matches your current games.",
    answers: [
      { label: "Beginner", value: "25", scores: {} },
      { label: "Around 3.0–3.5", value: "40", scores: {} },
      { label: "Around 3.5–4.0", value: "52", scores: {} },
      { label: "Around 4.0–4.5", value: "68", scores: {} },
      { label: "Around 4.5–5.0", value: "80", scores: {} },
      { label: "5.0+", value: "92", scores: {} },
    ],
  },
  ...([
    ["forehand", "How would you rate your forehand compared with your peers?", "Think about consistency, placement, and confidence under pressure."],
    ["backhand", "How would you rate your backhand compared with your peers?", "Think about consistency, placement, and confidence under pressure."],
    ["baseline", "How would you rate your baseline game?", "Consider your ability to defend, drive, lob, and start moving forward."],
    ["transition", "How would you rate your transition game?", "Consider your drops, resets, footwork, and decisions moving to the kitchen."],
    ["kitchen", "How would you rate your kitchen game?", "Consider your dinks, counters, hand speed, patience, and shot selection."],
  ] as const).map(([id, title, description]) => ({
    id,
    title,
    description,
    answers: ratingAnswers,
  })),
  ...([
    ["Dink", "soft"],
    ["Drop", "transition"],
    ["Drive", "baseline"],
    ["Reset", "transition"],
    ["Attack", "kitchen"],
    ["Putaway", "kitchen"],
    ["Lob", "baseline"],
  ] as const).map(([shot, phase]) => ({
    id: `shot-${shot.toLowerCase()}`,
    title: `How would you rate your ${shot.toLowerCase()}?`,
    description: `Assess your ${shot.toLowerCase()} compared with players at your level.`,
    answers: ratingAnswers,
    phase,
  })),
];

function recommendPreset(answers: Record<string, string>) {
  const skill = Number(answers.skill ?? 25);
  const shotTypes = ["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"] as RepertoirePreset["shotTypes"];
  const phaseByShot: Record<string, keyof typeof phaseRatings> = {
    Dink: "kitchen", Drop: "transition", Drive: "baseline", Reset: "transition",
    Attack: "kitchen", Putaway: "kitchen", Lob: "baseline",
  };
  const shotRatings = Object.fromEntries(shotTypes.map((shot) => [shot, Number(answers[`shot-${shot.toLowerCase()}`] ?? 1)])) as Record<string, number>;
  const phaseRatings = {
    baseline: Number(answers.baseline ?? 1),
    transition: Number(answers.transition ?? 1),
    kitchen: Number(answers.kitchen ?? 1),
  };
  const strongestShot = shotTypes.reduce((best, shot) => shotRatings[shot] > shotRatings[best] ? shot : best, shotTypes[0]);
  const weakestShot = shotTypes.reduce((weakest, shot) => shotRatings[shot] < shotRatings[weakest] ? shot : weakest, shotTypes[0]);
  const count = skill < 40 ? 4 : skill < 52 ? 5 : skill < 68 ? 6 : 7;
  const includedShots = [...shotTypes].sort((a, b) => shotRatings[b] - shotRatings[a]).slice(0, count);
  if (!includedShots.includes(weakestShot)) includedShots[includedShots.length - 1] = weakestShot;
  const shotMastery = Object.fromEntries(includedShots.map((shot) => [
    shot,
    Math.max(5, Math.min(95, skill + (shotRatings[shot] - 1.5) * 12 + (phaseRatings[phaseByShot[shot]] - 1.5) * 6)),
  ])) as RepertoirePreset["shotMastery"];
  const strongestPhase = Object.entries(phaseRatings).sort(([, a], [, b]) => b - a)[0][0];
  const sideScore = Number(answers.forehand ?? 1) - Number(answers.backhand ?? 1);
  const sideLabel = Math.abs(sideScore) < 1 ? "balanced-side" : sideScore > 0 ? "forehand-led" : "backhand-led";
  return {
    id: `analytical-${sideLabel}-${strongestPhase}-${skill}-${strongestShot}-${weakestShot}`,
    name: `${sideLabel} ${strongestPhase} profile`,
    tagline: `A ${sideLabel} ${strongestPhase} game built around your ${strongestShot}.`,
    description: `Your strongest shot is the ${strongestShot}, while ${weakestShot} is the clearest development opportunity.`,
    bestFor: `Players building a ${strongestPhase} game`,
    mastery: skill,
    shotMastery,
    strengths: [`${strongestShot} is your current anchor`, `${sideLabel} decision-making`, `${strongestPhase} awareness`],
    focusAreas: [`Build your ${weakestShot}`, `Connect your ${strongestPhase} game to the rest of the court`, "Use a skill-appropriate shot selection"],
    shotTypes: includedShots,
    drillTypes: ["Solo", "Wall", "Partner+", "Ball Machine"] as RepertoirePreset["drillTypes"],
    highlights: [`${includedShots.length} shot families`, "Skill-appropriate starting point", `${sideLabel} emphasis`],
  };
}

function PreviewList({
  preset,
  shots,
  drills,
}: {
  preset: RepertoirePreset;
  shots: DiscoverableShot[];
  drills: Drill[];
}) {
  const presetShots = shots.filter((shot) => shot.shotType && preset.shotTypes.includes(shot.shotType));
  const presetDrills = drills.filter((drill) => preset.drillTypes.includes(drill.type));
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          Shots · {presetShots.length}
        </p>
        <ul className="mt-3 space-y-2 text-[var(--muted)]">
          {presetShots.slice(0, 8).map((shot) => <li key={shot.id} className="flex justify-between gap-4"><span>• {shot.name}</span><span className="font-bold text-[var(--ink)]">{getPresetShotMastery(preset, shot)}%</span></li>)}
        </ul>
        {presetShots.length > 8 && <p className="mt-3 text-sm text-[var(--muted)]">Plus {presetShots.length - 8} more catalog shots.</p>}
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
          Drills · {presetDrills.length}
        </p>
        <ul className="mt-3 space-y-2 text-[var(--muted)]">
          {presetDrills.slice(0, 8).map((drill) => <li key={drill.id}>• {drill.name}</li>)}
        </ul>
        {presetDrills.length > 8 && <p className="mt-3 text-sm text-[var(--muted)]">Plus {presetDrills.length - 8} more catalog drills.</p>}
      </div>
    </div>
  );
}

export function RepertoireQuiz({
  shots,
  drills,
  initialPresetId,
}: {
  shots: DiscoverableShot[];
  drills: Drill[];
  initialPresetId?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPreset, setSelectedPreset] = useState<RepertoirePreset | null>(() =>
    initialPresetId ? getPreset(initialPresetId) : null,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const recommendation = useMemo(() => recommendPreset(answers), [answers]);

  function applySelectedPreset(preset: RepertoirePreset | null = selectedPreset) {
    if (!preset) return;
    if (!window.confirm(
      "Replace your current repertoire with this preset? Your existing shots and drills will be removed.",
    )
    ) {
      return;
    }
    const shotEntries = shots
      .filter((shot) => shot.shotType && preset.shotTypes.includes(shot.shotType))
      .map((shot) => ({
        id: shot.id,
        confidence: getPresetShotMastery(preset, shot),
      }));
    const drillIds = drills
      .filter((drill) => preset.drillTypes.includes(drill.type))
      .map((drill) => drill.id);
    const formData = new FormData();
    formData.set("shotEntries", JSON.stringify(shotEntries));
    formData.set("drillIds", JSON.stringify(drillIds));
    formData.set("mastery", String(preset.mastery));
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

  if (selectedPreset) {
    return (
      <div className="space-y-8">
        <button type="button" onClick={() => setSelectedPreset(null)} className="font-bold text-[var(--teal)]">
          ← Back to recommendation
        </button>
        <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Preset preview</p>
          <h2 className="mt-3 text-4xl">{selectedPreset.name}</h2>
          <p className="mt-3 text-xl text-[var(--muted)]">{selectedPreset.tagline}</p>
          <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">{selectedPreset.description}</p>
          <p className="mt-5 text-sm font-bold">Best for: <span className="font-normal text-[var(--muted)]">{selectedPreset.bestFor}</span></p>
          <p className="mt-3 text-sm font-bold">Starting mastery: <span className="font-normal text-[var(--muted)]">{selectedPreset.mastery}%</span></p>
          <div className="mt-6 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Built around</p>
              <ul className="mt-3 space-y-2 text-[var(--muted)]">
                {selectedPreset.strengths.map((strength) => <li key={strength}>• {strength}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Development focus</p>
              <ul className="mt-3 space-y-2 text-[var(--muted)]">
                {selectedPreset.focusAreas.map((focus) => <li key={focus}>• {focus}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {selectedPreset.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-[#e8eee6] px-3 py-1 text-sm text-[#101714]">{highlight}</span>)}
          </div>
          <div className="mt-8 border-t border-[var(--line)] pt-8">
            <PreviewList preset={selectedPreset} shots={shots} drills={drills} />
          </div>
          {error && <p role="alert" className="mt-6 text-sm text-[var(--coral)]">{error}</p>}
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

  if (step >= questions.length) {
    return (
      <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Your recommendation</p>
        <h2 className="mt-3 text-4xl">{recommendation.name}</h2>
        <p className="mt-3 text-xl text-[var(--muted)]">{recommendation.tagline}</p>
        <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">{recommendation.description}</p>
        <p className="mt-5 text-sm font-bold">Best for: <span className="font-normal text-[var(--muted)]">{recommendation.bestFor}</span></p>
        <p className="mt-3 text-sm font-bold">Starting mastery: <span className="font-normal text-[var(--muted)]">{recommendation.mastery}%</span></p>
        <div className="mt-6 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Built around</p>
            <ul className="mt-3 space-y-2 text-[var(--muted)]">
              {recommendation.strengths.map((strength) => <li key={strength}>• {strength}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Development focus</p>
            <ul className="mt-3 space-y-2 text-[var(--muted)]">
              {recommendation.focusAreas.map((focus) => <li key={focus}>• {focus}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--line)] pt-8">
          <PreviewList preset={recommendation} shots={shots} drills={drills} />
        </div>
        {error && <p role="alert" className="mt-6 text-sm text-[var(--coral)]">{error}</p>}
        <button
          type="button"
          onClick={() => applySelectedPreset(recommendation)}
          disabled={pending}
          className="mt-8 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50"
        >
          {pending ? "Replacing..." : "Replace my repertoire"}
        </button>
        <button type="button" onClick={() => setStep(questions.length - 1)} className="mt-6 font-bold text-[var(--teal)]">← Change my answers</button>
      </section>
    );
  }

  const question = questions[step];
  const answered = answers[question.id] !== undefined;

  function choose(value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    setSelectedPreset(null);
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Question {step + 1} of {questions.length}</p>
        <div className="h-2 w-24 rounded-full bg-[#d4e0d6]">
          <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <h2 className="mt-5 text-3xl">{question.title}</h2>
      <p className="mt-3 leading-7 text-[var(--muted)]">{question.description}</p>
      <div className="mt-8 grid gap-3">
        {question.answers.map((answer) => (
          <button type="button" key={answer.value} aria-pressed={answers[question.id] === answer.value} onClick={() => choose(answer.value)} className={`rounded-xl border p-4 text-left text-[var(--ink)] transition ${answers[question.id] === answer.value ? "border-[var(--teal)] bg-[var(--teal)] !text-[#101714]" : "border-[var(--line)] hover:border-[var(--teal)]"}`}>
            {answer.label}
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-between gap-4">
        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="font-bold text-[var(--teal)] disabled:invisible">← Back</button>
        <button type="button" onClick={() => setStep((current) => current + 1)} disabled={!answered} className="rounded-xl bg-[var(--ink)] px-5 py-3 font-bold text-white disabled:opacity-40">
          {step === questions.length - 1 ? "See my recommendation" : "Next"}
        </button>
      </div>
    </section>
  );
}
