import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";

const phaseByShotType: Record<ShotType, string> = {
  Dink: "kitchen",
  Drop: "transition",
  Drive: "baseline",
  Reset: "transition",
  Attack: "kitchen",
  Putaway: "kitchen",
  Lob: "baseline",
};

function average(values: number[]) {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function rankedFamily(shots: DiscoverableShot[], direction: "highest" | "lowest") {
  const families = new Map<string, number[]>();
  for (const shot of shots) {
    if (!shot.shotType || shot.confidence === null || shot.confidence === undefined) continue;
    families.set(shot.shotType, [...(families.get(shot.shotType) ?? []), shot.confidence]);
  }
  const ranked = [...families.entries()]
    .map(([type, values]) => ({ type, confidence: average(values) ?? 0 }))
    .sort((a, b) =>
      direction === "highest"
        ? b.confidence - a.confidence
        : a.confidence - b.confidence,
    );
  return ranked[0] ?? { type: "All-court", confidence: 0 };
}

function sideCoverage(shots: DiscoverableShot[], side: "left" | "right") {
  return average(
    shots.flatMap((shot) => {
      if (shot.confidence === null || shot.confidence === undefined) return [];
      const min = Math.max(shot.courtXMin, side === "left" ? -15 : 0);
      const max = Math.min(shot.courtXMax, side === "left" ? 0 : 15);
      return max > min ? Array(Math.max(1, Math.round((max - min) * 10))).fill(shot.confidence) : [];
    }),
  ) ?? 0;
}

export function summarizeRepertoire(shots: DiscoverableShot[]) {
  const strongestFamily = rankedFamily(shots, "highest");
  const weakestFamily = rankedFamily(shots, "lowest");
  const forehand = average(
    shots
      .filter((shot) => shot.name.toLowerCase().includes("forehand"))
      .map((shot) => shot.confidence ?? 0),
  ) ?? 0;
  const backhand = average(
    shots
      .filter((shot) => shot.name.toLowerCase().includes("backhand"))
      .map((shot) => shot.confidence ?? 0),
  ) ?? 0;
  const left = sideCoverage(shots, "left");
  const right = sideCoverage(shots, "right");
  const handDominance =
    Math.abs(forehand - backhand) < 5
      ? "Balanced"
      : forehand > backhand
        ? "Forehand-dominant"
        : "Backhand-dominant";
  const betterSide =
    Math.abs(left - right) < 5 ? "Balanced" : left > right ? "Left side" : "Right side";
  const profileTitle = `${strongestFamily.type}-led ${phaseByShotType[strongestFamily.type as ShotType] ?? "all-court"} profile`;

  return {
    strongestFamily,
    weakestFamily,
    handDominance,
    betterSide,
    profileTitle,
  };
}
