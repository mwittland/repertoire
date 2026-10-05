import type { DrillType } from "@/lib/drills/types";
import type { DiscoverableShot, ShotType } from "@/lib/discovery/types";

export type RepertoirePreset = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  mastery: number;
  shotMastery: Partial<Record<ShotType, number>>;
  strengths: string[];
  focusAreas: string[];
  shotTypes: ShotType[];
  drillTypes: DrillType[];
  highlights: string[];
};

export const repertoirePresets: RepertoirePreset[] = [
  {
    id: "foundation-builder",
    name: "Developing all-rounder",
    tagline: "Build a reliable game from the ground up.",
    description: "Learn the essential shots and patterns that help you make better decisions in every phase of a point.",
    bestFor: "Newer players who want a balanced foundation",
    mastery: 25,
    shotMastery: { Dink: 35, Drop: 25, Drive: 20, Reset: 20 },
    strengths: ["Balanced fundamentals", "Reliable rally choices"],
    focusAreas: ["Building a dependable backhand", "Transitioning forward with control"],
    shotTypes: ["Dink", "Drop", "Drive", "Reset"],
    drillTypes: ["Solo", "Wall"],
    highlights: ["Essential shot families", "Reliable point patterns", "A clear path to grow"],
  },
  {
    id: "recreational-all-court",
    name: "Confident recreational player",
    tagline: "Play relaxed, adaptable pickleball.",
    description: "Build a versatile game for open play, with enough control and offense to handle changing partners and opponents.",
    bestFor: "Regular recreational players who want more confidence",
    mastery: 40,
    shotMastery: { Dink: 50, Drop: 40, Drive: 35, Reset: 45, Lob: 30 },
    strengths: ["Balanced court coverage", "Adapting to different partners"],
    focusAreas: ["Choosing the right ball to attack", "Turning defense into offense"],
    shotTypes: ["Dink", "Drop", "Drive", "Reset", "Lob"],
    drillTypes: ["Solo", "Wall", "Partner+"],
    highlights: ["Balanced court coverage", "Flexible rally options", "Confidence in open play"],
  },
  {
    id: "defensive-anchor",
    name: "Defensive counterpuncher",
    tagline: "Turn pressure into patience.",
    description: "Develop the resets, drops, and lobs that let you absorb pace, extend rallies, and wait for the right opening.",
    bestFor: "Players who win through consistency and smart defense",
    mastery: 45,
    shotMastery: { Dink: 55, Drop: 50, Reset: 65, Lob: 45 },
    strengths: ["Resets and defensive patience", "Backhand reliability"],
    focusAreas: ["Creating offense after the reset", "Finishing at the kitchen"],
    shotTypes: ["Dink", "Drop", "Reset", "Lob"],
    drillTypes: ["Solo", "Wall", "Partner+"],
    highlights: ["Reset and recovery skills", "High-margin options", "Longer, calmer rallies"],
  },
  {
    id: "aggressive-attacker",
    name: "Pressure player",
    tagline: "Take initiative and make opponents react.",
    description: "Build an assertive repertoire around drives, attacks, and finishing opportunities without giving away control.",
    bestFor: "Players who like to create pressure and take the first opening",
    mastery: 40,
    shotMastery: { Drive: 60, Attack: 50, Putaway: 45, Drop: 30 },
    strengths: ["Forehand pace", "Taking initiative in transition"],
    focusAreas: ["Controlling attack selection", "Softening the game at the kitchen"],
    shotTypes: ["Drive", "Attack", "Putaway", "Drop"],
    drillTypes: ["Solo", "Ball Machine", "Partner+"],
    highlights: ["Early pressure", "Transition offense", "Finishing patterns"],
  },
  {
    id: "net-controller",
    name: "Kitchen strategist",
    tagline: "Win the point in the soft game.",
    description: "Develop touch, patience, and repeatable patterns for controlling exchanges and creating openings at the kitchen.",
    bestFor: "Players who want to dictate points from the non-volley zone",
    mastery: 45,
    shotMastery: { Dink: 70, Reset: 55, Drop: 45, Attack: 35 },
    strengths: ["Kitchen touch", "Reading and countering hands battles"],
    focusAreas: ["Creating offense from neutral", "Defending deep balls before moving forward"],
    shotTypes: ["Dink", "Reset", "Drop", "Attack"],
    drillTypes: ["Wall", "Partner+", "Ball Machine"],
    highlights: ["Dink consistency", "Counter-ready hands", "Kitchen-line patterns"],
  },
  {
    id: "competitive-toolkit",
    name: "Tournament competitor",
    tagline: "Prepare for pressure and variety.",
    description: "Expand your options with a competition-ready repertoire that supports disciplined decisions in more situations.",
    bestFor: "Club and tournament players sharpening their competitive game",
    mastery: 55,
    shotMastery: { Dink: 65, Drop: 55, Drive: 60, Reset: 60, Attack: 50, Putaway: 45, Lob: 40 },
    strengths: ["Broad shot selection", "Discipline under pressure"],
    focusAreas: ["Closing specific gaps", "Connecting every phase of the point"],
    shotTypes: ["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"],
    drillTypes: ["Wall", "Ball Machine", "Partner+"],
    highlights: ["Full shot coverage", "Pressure-ready decisions", "Reliable point patterns"],
  },
  {
    id: "solo-practice",
    name: "Consistency specialist",
    tagline: "Make every shot more dependable.",
    description: "Narrow your focus to repeatable shots and patterns that reduce unforced errors and make your strengths more reliable.",
    bestFor: "Players who want to turn a few dependable strengths into a complete game",
    mastery: 30,
    shotMastery: { Dink: 50, Drive: 35, Drop: 30, Reset: 45 },
    strengths: ["Repeatable core shots", "Low-error decision making"],
    focusAreas: ["Expanding beyond the strongest side", "Adding more transition offense"],
    shotTypes: ["Dink", "Drive", "Drop", "Reset"],
    drillTypes: ["Solo", "Wall"],
    highlights: ["Lower-error patterns", "Repeatable strengths", "Clear improvement focus"],
  },
  {
    id: "complete-all-court",
    name: "All-court strategist",
    tagline: "Adapt to whatever the point asks for.",
    description: "Build the widest repertoire for players who want to switch between control, defense, transition, and attack with intention.",
    bestFor: "Experienced players who want a complete and adaptable identity",
    mastery: 65,
    shotMastery: { Dink: 75, Drop: 65, Drive: 70, Reset: 70, Attack: 60, Putaway: 55, Lob: 50 },
    strengths: ["Forehand and backhand options", "Control from defense through attack"],
    focusAreas: ["Maintaining balance across every phase", "Specializing without becoming predictable"],
    shotTypes: ["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"],
    drillTypes: ["Solo", "Wall", "Ball Machine", "Partner+"],
    highlights: ["Every major shot family", "Adaptable point construction", "Room to specialize later"],
  },
];

export function getPreset(id: string) {
  return repertoirePresets.find((preset) => preset.id === id) ?? repertoirePresets[0];
}

export function getPresetShotMastery(
  preset: RepertoirePreset,
  shot: Pick<DiscoverableShot, "id" | "name" | "shotType" | "difficulty">,
) {
  const typeMastery = shot.shotType ? preset.shotMastery[shot.shotType] : undefined;
  const base = typeMastery ?? preset.mastery;
  const difficultyAdjustment = Math.round((50 - (shot.difficulty ?? 50)) * 0.12);
  const identity = `${shot.id}:${shot.name}`;
  const variation = [...identity].reduce((total, character) => total + character.charCodeAt(0), 0) % 9 - 4;
  return Math.max(0, Math.min(100, base + difficultyAdjustment + variation));
}
