"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applyDrillPreset } from "@/app/actions/drill-quiz";
import { getDrillPreset, type DrillPreset } from "@/lib/drills/presets";
import type { Drill } from "@/lib/drills/types";

const questions = [
  { id: "skill", title: "What level do you usually play at?", answers: [["Beginner", "20"], ["Around 3.0–3.5", "32"], ["Around 3.5–4.0", "44"], ["Around 4.0–4.5", "58"], ["Around 4.5–5.0", "68"], ["5.0+", "78"]] },
  { id: "access", title: "What practice access do you currently have?", answers: [["A ball and a wall", "solo"], ["A partner", "partner"], ["A ball machine", "machine"], ["A mix of equipment", "mix"]] },
  { id: "frequency", title: "How often do you currently drill?", answers: [["Rarely", "rare"], ["About once a week", "weekly"], ["A few times a week", "often"], ["Most days", "daily"]] },
  { id: "style", title: "What do your drill sessions usually emphasize?", answers: [["Technical repetitions", "technical"], ["Live-play decisions", "live"], ["A balanced mix", "balanced"], ["Short, simple habits", "simple"]] },
] as const;

function recommend(answers: Record<string, string>): DrillPreset {
  const skill = Number(answers.skill ?? 25);
  const access = answers.access ?? "solo";
  const frequency = answers.frequency ?? "weekly";
  const style = answers.style ?? "balanced";
  const drillTypes = style === "live" || access === "partner"
    ? ["Partner+"]
    : style === "technical" || access === "machine"
      ? ["Solo", "Wall", "Ball Machine"]
      : ["Solo", "Wall"];
  const name = style === "live" ? "Live-play connector" : style === "technical" ? "Technical lab" : frequency === "rare" ? "Consistent solo builder" : "Balanced practice builder";
  const mastery = Math.max(15, Math.min(65, Math.round(skill * (frequency === "daily" ? 0.9 : frequency === "rare" ? 0.65 : 0.78))));
  return {
    id: `generated-${access}-${frequency}-${style}-${skill}`,
    name,
    tagline: style === "live" ? "A profile based on your current point-like practice." : style === "technical" ? "A profile based on your current technical repetitions." : "A profile based on your current practice access.",
    description: `Your current pattern is ${frequency} ${style} work using ${access} practice access.`,
    bestFor: "Based on your current practice",
    mastery,
    drillTypes: drillTypes as DrillPreset["drillTypes"],
    highlights: [`${frequency} practice`, `${style} emphasis`, `${skill} current level`],
  };
}

function DrillList({ preset, drills }: { preset: DrillPreset; drills: Drill[] }) {
  const matches = getMatchingDrills(preset, drills);
  return (
    <div className="border-t border-[var(--line)] pt-6">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Drills · {matches.length}</p>
      <ul className="mt-3 grid gap-2 text-[var(--muted)] sm:grid-cols-2">
        {matches.slice(0, 12).map((drill) => <li key={drill.id} className="flex justify-between gap-3"><span>• {drill.name}</span><span className="font-bold text-[var(--ink)]">{getDrillMastery(preset, drill)}%</span></li>)}
      </ul>
      {matches.length > 12 && <p className="mt-3 text-sm text-[var(--muted)]">Plus {matches.length - 12} more drills.</p>}
    </div>
  );
}

function getDrillMastery(preset: DrillPreset, drill: Drill) {
  const variation = [...`${drill.id}:${drill.name}`].reduce((total, character) => total + character.charCodeAt(0), 0) % 11 - 5;
  return Math.round(Math.max(5, Math.min(90, preset.mastery + variation)));
}

function getMatchingDrills(preset: DrillPreset, drills: Drill[]) {
  const matches = drills.filter((drill) => preset.drillTypes.includes(drill.type));
  return matches.length > 0 ? matches : drills;
}

export function RepertoireDrillQuiz({ drills, initialPresetId }: { drills: Drill[]; initialPresetId?: string }) {
  const [step, setStep] = useState(initialPresetId ? questions.length : 0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<DrillPreset | null>(() => initialPresetId ? getDrillPreset(initialPresetId) : null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const recommendation = useMemo(() => recommend(answers), [answers]);

  function apply(preset: DrillPreset) {
    if (!window.confirm("Replace your current drill routine with this profile? Your existing drills will be removed.")) return;
    const matchingDrills = getMatchingDrills(preset, drills);
    if (matchingDrills.length === 0) {
      setError("No drills are available for this profile yet.");
      return;
    }
    const formData = new FormData();
    formData.set("drillEntries", JSON.stringify(
      matchingDrills.map((drill) => ({ id: drill.id, mastery: getDrillMastery(preset, drill) })),
    ));
    setError(null);
    startTransition(async () => {
      const result = await applyDrillPreset(formData);
      if (result.success) { router.push("/repertoire"); router.refresh(); }
      else setError(result.error ?? "Unable to apply this drill profile.");
    });
  }

  const preset = selected ?? recommendation;
  if (selected) {
    return (
      <div className="space-y-8">
        <button type="button" onClick={() => setSelected(null)} className="font-bold text-[var(--teal)]">← Back to quiz</button>
        <DrillResult preset={selected} drills={drills} pending={pending} error={error} onApply={apply} />
      </div>
    );
  }
  if (step >= questions.length) {
    return (
      <DrillResult preset={preset} drills={drills} pending={pending} error={error} onApply={apply} onBack={() => setStep(questions.length - 1)} />
    );
  }

  const question = questions[step];
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Question {step + 1} of {questions.length}</p>
        <div className="h-2 w-24 rounded-full bg-[#d4e0d6]"><div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
      </div>
      <h2 className="mt-5 text-3xl">{question.title}</h2>
      <div className="mt-8 grid gap-3">{question.answers.map(([label, value]) => <button key={value} type="button" aria-pressed={answers[question.id] === value} onClick={() => setAnswers((current) => ({ ...current, [question.id]: value }))} className={`rounded-xl border p-4 text-left text-[var(--ink)] transition ${answers[question.id] === value ? "border-[var(--teal)] bg-[var(--teal)] !text-[#101714]" : "border-[var(--line)] hover:border-[var(--teal)]"}`}>{label}</button>)}</div>
      <div className="mt-8 flex justify-between gap-4">
        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="font-bold text-[var(--teal)] disabled:invisible">← Back</button>
        <button type="button" onClick={() => setStep((current) => current + 1)} disabled={!answers[question.id]} className="rounded-xl bg-[var(--ink)] px-5 py-3 font-bold text-white disabled:opacity-40">{step === questions.length - 1 ? "See my routine" : "Next"}</button>
      </div>
    </section>
  );
}

function DrillResult({ preset, drills, pending, error, onApply, onBack }: { preset: DrillPreset; drills: Drill[]; pending: boolean; error: string | null; onApply: (preset: DrillPreset) => void; onBack?: () => void }) {
  return (
    <section className="rounded-2xl border border-[var(--teal)] bg-[var(--card)] p-6 shadow-[var(--shadow)] sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--coral)]">Your drill profile</p>
      <h2 className="mt-3 text-4xl">{preset.name}</h2>
      <p className="mt-3 text-xl text-[var(--muted)]">{preset.tagline}</p>
      <p className="mt-5 leading-7 text-[var(--muted)]">{preset.description}</p>
      <p className="mt-4 text-sm font-bold">Starting mastery: <span className="font-normal text-[var(--muted)]">{preset.mastery}%</span></p>
      <div className="mt-5 flex flex-wrap gap-2">{preset.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-[#e8eee6] px-3 py-1 text-sm text-[#101714]">{highlight}</span>)}</div>
      <div className="mt-8"><DrillList preset={preset} drills={drills} /></div>
      {error && <p role="alert" className="mt-6 text-sm text-[var(--coral)]">{error}</p>}
      <button type="button" onClick={() => onApply(preset)} disabled={pending} className="mt-8 w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-50">{pending ? "Replacing..." : "Replace my drill routine"}</button>
      {onBack && <button type="button" onClick={onBack} className="mt-6 font-bold text-[var(--teal)]">← Change my answers</button>}
    </section>
  );
}
