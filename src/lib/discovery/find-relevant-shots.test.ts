import { describe, expect, it } from "vitest";
import { findRelevantShots, isShotRelevant } from "./find-relevant-shots";
import type { DiscoverableShot } from "./types";

const shot: DiscoverableShot = {
  id: "drop",
  name: "Third Shot Drop",
  courtXMin: -10,
  courtXMax: 0,
  courtXLeftMin: 0,
  courtXLeftMax: 10,
  courtYMin: 20,
  courtYMax: 30,
  ballHeightMin: 5,
  ballHeightMax: 8,
  shotType: "Drop",
  aggressionScore: 40,
  difficulty: 60,
};

const matchingSituation = {
  courtX: -5,
  courtY: 25,
  ballHeight: 7,
  handedness: "Right" as const,
};

describe("shot discovery", () => {
  it("matches a point inside every range", () => {
    expect(isShotRelevant(shot, matchingSituation)).toBe(true);
  });

  it("uses the mirrored range for left-handed players", () => {
    expect(
      isShotRelevant(shot, {
        ...matchingSituation,
        courtX: 5,
        handedness: "Left",
      }),
    ).toBe(true);
    expect(
      isShotRelevant(shot, { ...matchingSituation, handedness: "Left" }),
    ).toBe(false);
  });

  it.each([
    ["court X", { courtX: 5 }],
    ["court Y", { courtY: 19 }],
    ["ball height", { ballHeight: 9 }],
  ])("rejects a point outside the %s range", (_, change) => {
    expect(isShotRelevant(shot, { ...matchingSituation, ...change })).toBe(
      false,
    );
  });

  it("includes exact range boundaries", () => {
    expect(
      isShotRelevant(shot, {
        courtX: -10,
        courtY: 30,
        ballHeight: 5,
        handedness: "Right",
      }),
    ).toBe(true);
  });

  it("returns all matches in deterministic name order", () => {
    const secondShot = { ...shot, id: "volley", name: "Volley" };
    expect(
      findRelevantShots([secondShot, shot], matchingSituation).map(
        ({ name }) => name,
      ),
    ).toEqual(["Third Shot Drop", "Volley"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(
      findRelevantShots([shot], { ...matchingSituation, courtY: 0 }),
    ).toEqual([]);
  });
});
