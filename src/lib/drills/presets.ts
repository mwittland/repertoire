import type { DrillType } from "@/lib/drills/types";

export type DrillPreset = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  mastery: number;
  drillTypes: DrillType[];
  highlights: string[];
};

export const drillPresets: DrillPreset[] = [
  {
    id: "consistent-solo",
    name: "Consistent solo builder",
    tagline: "Short, repeatable sessions built around solo practice.",
    description: "A practical routine for players who currently get useful repetitions without needing a partner.",
    bestFor: "Players who currently practice with limited time or equipment",
    mastery: 25,
    drillTypes: ["Solo", "Wall"],
    highlights: ["Low setup", "Repeatable sessions", "Fundamentals first"],
  },
  {
    id: "live-play",
    name: "Live-play connector",
    tagline: "Partner work that reflects point-like play.",
    description: "A game-oriented routine for players whose current sessions emphasize movement, reactions, and point-like repetitions.",
    bestFor: "Players who currently practice with a partner",
    mastery: 40,
    drillTypes: ["Partner+"],
    highlights: ["Decision-making", "Point patterns", "Partner access"],
  },
  {
    id: "technical-lab",
    name: "Technical lab",
    tagline: "Focused repetitions for detail-oriented sessions.",
    description: "A deliberate routine for players whose current sessions isolate mechanics and emphasize precision.",
    bestFor: "Players who currently have regular practice time and equipment",
    mastery: 45,
    drillTypes: ["Solo", "Wall", "Ball Machine"],
    highlights: ["Technical focus", "High repetition", "Equipment-friendly"],
  },
];

export function getDrillPreset(id: string) {
  return drillPresets.find((preset) => preset.id === id) ?? drillPresets[0];
}
