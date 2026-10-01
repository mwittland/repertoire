import { describe, expect, it } from "vitest";
import { findRelevantShots, isShotRelevant } from "./find-relevant-shots";
import type { DiscoverableShot } from "./types";

const shot: DiscoverableShot = {
  id: "drop",
  name: "Third Shot Drop",
  courtXMin: -10,
  courtXMax: 0,
  courtYMin: 20,
  courtYMax: 30,
  ballHeightMin: 5,
  ballHeightMax: 8,
  intentMin: 60,
  intentMax: 90,
};

const matchingSituation = {
  courtX: -5,
  courtY: 25,
  ballHeight: 7,
  intent: 75,
};

describe("shot discovery", () => {
  it("matches a point inside every range", () => {
    expect(isShotRelevant(shot, matchingSituation)).toBe(true);
  });

  it.each([
    ["court X", { courtX: 5 }],
    ["court Y", { courtY: 19 }],
    ["ball height", { ballHeight: 9 }],
    ["intent", { intent: 59 }],
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
        intent: 90,
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
      findRelevantShots([shot], { ...matchingSituation, intent: 0 }),
    ).toEqual([]);
  });
});
