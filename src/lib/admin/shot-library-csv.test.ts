import { describe, expect, it } from "vitest";
import { createShotLibraryCsv, parseShotLibraryCsv } from "./shot-library-csv";

describe("shot library CSV", () => {
  it("round-trips quoted content and drill associations", () => {
    const csv = createShotLibraryCsv([{
      name: "Cross-court, soft",
      shot_type: "Dink",
      aggression_score: 35,
      difficulty: 50,
      court_x_min: -2,
      court_x_max: 2,
      court_y_min: 4,
      court_y_max: 12,
      ball_height_min: 1,
      ball_height_max: 3,
      description: "Keep it low, then reset.",
      instructions: "Breathe\nStay balanced",
      video_url: null,
      drills: "Kitchen reps|Cross-court patterns",
    }]);

    expect(parseShotLibraryCsv(csv)[0]).toMatchObject({
      name: "Cross-court, soft",
      description: "Keep it low, then reset.",
      instructions: "Breathe\nStay balanced",
      drills: ["Kitchen reps", "Cross-court patterns"],
    });
  });

  it("rejects missing columns", () => {
    expect(() => parseShotLibraryCsv("name\nDrop")).toThrow("Missing CSV columns");
  });
});
