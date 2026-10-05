import { createClient } from "@/lib/supabase/server";
import type { DiscoverableShot } from "@/lib/discovery/types";
import { listShots } from "@/lib/shots/queries";
import { listDrills } from "@/lib/drills/queries";
import type { Drill } from "@/lib/drills/types";

export type RepertoireEntry = {
  shotId: string;
  shotName: string;
  difficulty: number;
  confidence: number | null;
};

export async function listRepertoireEntries() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("repertoire_entries")
    .select("shot_id,confidence,shots(id,name,difficulty)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Unable to load repertoire: ${error.message}`);

  return (data ?? []).flatMap((entry) => {
    const shot = entry.shots as {
      id?: unknown;
      name?: unknown;
      difficulty?: unknown;
    } | null;
    return shot?.id && shot.name
      ? [
          {
            shotId: String(shot.id),
            shotName: String(shot.name),
            difficulty: Number(shot.difficulty),
            confidence: entry.confidence === null ? null : Number(entry.confidence),
          },
        ]
      : [];
  });
}

export async function listRepertoireShots(): Promise<DiscoverableShot[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("repertoire_entries")
    .select(
      "shot_id,confidence,shots(id,name,court_x_min,court_x_max,court_x_left_min,court_x_left_max,court_y_min,court_y_max,ball_height_min,ball_height_max,shot_type,aggression_score,video_url,description,difficulty,instructions)",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Unable to load repertoire shots: ${error.message}`);

  return (data ?? []).flatMap((entry) => {
    const relatedShot = Array.isArray(entry.shots)
      ? entry.shots[0]
      : entry.shots;
    const shot = relatedShot as unknown as Record<string, unknown> | null;
    return shot?.id && shot.name
      ? [{
          id: String(shot.id),
          name: String(shot.name),
          courtXMin: Number(shot.court_x_min),
          courtXMax: Number(shot.court_x_max),
          courtXLeftMin: Number(shot.court_x_left_min),
          courtXLeftMax: Number(shot.court_x_left_max),
          courtYMin: Number(shot.court_y_min),
          courtYMax: Number(shot.court_y_max),
          ballHeightMin: Number(shot.ball_height_min),
          ballHeightMax: Number(shot.ball_height_max),
          shotType: String(shot.shot_type) as DiscoverableShot["shotType"],
          aggressionScore: Number(shot.aggression_score),
          videoUrl: typeof shot.video_url === "string" ? shot.video_url : null,
          description: String(shot.description ?? ""),
          difficulty: Number(shot.difficulty),
          instructions: String(shot.instructions ?? ""),
          confidence: entry.confidence === null ? null : Number(entry.confidence),
        }]
      : [];
  });
}

export type RecommendedShot = DiscoverableShot & {
  coverage: number;
  inRepertoire: boolean;
};

export type RecommendedDrill = Drill & {
  coverage: number;
};

function areaCoverage(
  drill: Drill,
  repertoireShots: DiscoverableShot[],
  handedness: "Right" | "Left",
) {
  const drillXMin =
    handedness === "Left" ? drill.courtXLeftMin : drill.courtXMin;
  const drillXMax =
    handedness === "Left" ? drill.courtXLeftMax : drill.courtXMax;
  const xSamples = [0, 0.25, 0.5, 0.75, 1];
  const ySamples = [0, 0.25, 0.5, 0.75, 1];
  const pointCoverages = xSamples.flatMap((xRatio) =>
    ySamples.map((yRatio) => {
      const x = drillXMin + (drillXMax - drillXMin) * xRatio;
      const y =
        drill.courtYMin +
        (drill.courtYMax - drill.courtYMin) * yRatio;
      return repertoireShots.reduce((bestCoverage, shot) => {
        const shotXMin =
          handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
        const shotXMax =
          handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
        const coversPoint =
          x >= shotXMin &&
          x <= shotXMax &&
          y >= shot.courtYMin &&
          y <= shot.courtYMax;
        return coversPoint
          ? Math.max(bestCoverage, shot.confidence ?? 0)
          : bestCoverage;
      }, 0);
    }),
  );

  return pointCoverages.reduce((sum, coverage) => sum + coverage, 0) /
    pointCoverages.length;
}

export async function listRecommendedShots(
  handedness: "Right" | "Left",
  limit = 3,
): Promise<RecommendedShot[]> {
  const [catalogShots, repertoireShots] = await Promise.all([
    listShots(),
    listRepertoireShots(),
  ]);
  const repertoireIds = new Set(repertoireShots.map((shot) => shot.id));
  const ownedShots = repertoireShots.filter(
    (shot) => shot.confidence !== null && shot.confidence !== undefined,
  );
  const recommended = catalogShots.map((shot) => {
      const xMin =
        handedness === "Left" ? shot.courtXLeftMin : shot.courtXMin;
      const xMax =
        handedness === "Left" ? shot.courtXLeftMax : shot.courtXMax;
      const centerX = (xMin + xMax) / 2;
      const centerY = (shot.courtYMin + shot.courtYMax) / 2;
      const coveringShots = ownedShots.filter((ownedShot) => {
        const ownedXMin =
          handedness === "Left"
            ? ownedShot.courtXLeftMin
            : ownedShot.courtXMin;
        const ownedXMax =
          handedness === "Left"
            ? ownedShot.courtXLeftMax
            : ownedShot.courtXMax;
        return (
          centerX >= ownedXMin &&
          centerX <= ownedXMax &&
          centerY >= ownedShot.courtYMin &&
          centerY <= ownedShot.courtYMax
        );
      });
      const coverage = coveringShots.length
        ? coveringShots.reduce((sum, shot) => sum + (shot.confidence ?? 0), 0) /
          coveringShots.length
        : 0;
      return {
        ...shot,
        coverage: Math.round(coverage),
        inRepertoire: repertoireIds.has(shot.id),
      };
    })
    .sort(
      (a, b) => {
        const aUnknown = !a.inRepertoire || a.confidence === null || a.confidence === undefined;
        const bUnknown = !b.inRepertoire || b.confidence === null || b.confidence === undefined;
        return (
          Number(bUnknown) - Number(aUnknown) ||
          a.coverage - b.coverage ||
          (a.difficulty ?? 0) - (b.difficulty ?? 0) ||
          a.name.localeCompare(b.name)
        );
      },
    );
  return limit > 0 ? recommended.slice(0, limit) : recommended;
}

export async function listRecommendedDrills(
  handedness: "Right" | "Left",
  limit = 3,
): Promise<RecommendedDrill[]> {
  const [catalogDrills, repertoireShots] = await Promise.all([
    listDrills(),
    listRepertoireShots(),
  ]);
  const recommended = catalogDrills
    .map((drill) => {
      const coverage = areaCoverage(drill, repertoireShots, handedness);
      return {
        ...drill,
        coverage: Math.round(coverage),
      };
    })
    .sort((a, b) => {
      return (
        a.coverage - b.coverage ||
        a.name.localeCompare(b.name)
      );
    });
  return limit > 0 ? recommended.slice(0, limit) : recommended;
}

export async function getRepertoireEntry(shotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("repertoire_entries")
    .select("shot_id,confidence")
    .eq("user_id", user.id)
    .eq("shot_id", shotId)
    .maybeSingle();
  if (error)
    throw new Error(`Unable to load repertoire entry: ${error.message}`);
  return data
    ? {
        confidence: data.confidence === null ? null : Number(data.confidence),
      }
    : null;
}
