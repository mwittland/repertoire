import { findRelevantShots } from "@/lib/discovery/find-relevant-shots";
import type { DiscoverableShot, DiscoveryInput } from "@/lib/discovery/types";
import { createClient } from "@/lib/supabase/server";

const shotFields =
  "id,name,court_x_min,court_x_max,court_x_left_min,court_x_left_max,court_y_min,court_y_max,ball_height_min,ball_height_max,shot_type,aggression_score,video_url,description,difficulty,instructions";

function toDiscoverableShot(shot: Record<string, unknown>): DiscoverableShot {
  return {
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
  };
}

async function addRepertoireConfidence(
  supabase: Awaited<ReturnType<typeof createClient>>,
  shots: DiscoverableShot[],
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || shots.length === 0) return shots;
  const { data, error } = await supabase
    .from("repertoire_entries")
    .select("shot_id,confidence")
    .eq("user_id", user.id)
    .in("shot_id", shots.map((shot) => shot.id));
  if (error) throw new Error(`Unable to load repertoire confidence: ${error.message}`);
  const confidenceByShotId = new Map(
    (data ?? []).map((entry) => [
      entry.shot_id,
      entry.confidence === null ? null : Number(entry.confidence),
    ]),
  );
  return shots.map((shot) =>
    confidenceByShotId.has(shot.id)
      ? { ...shot, confidence: confidenceByShotId.get(shot.id) ?? null }
      : shot,
  );
}

export async function findRelevantShotsFromDatabase(situation: DiscoveryInput) {
  const supabase = await createClient();
  const xMinColumn =
    situation.handedness === "Left" ? "court_x_left_min" : "court_x_min";
  const xMaxColumn =
    situation.handedness === "Left" ? "court_x_left_max" : "court_x_max";
  let query = supabase
    .from("shots")
    .select(shotFields)
    .gte(xMaxColumn, situation.courtX)
    .lte(xMinColumn, situation.courtX)
    .gte("court_y_max", situation.courtY)
    .lte("court_y_min", situation.courtY)
    .gte("ball_height_max", situation.ballHeight)
    .lte("ball_height_min", situation.ballHeight);
  if (situation.shotType) query = query.eq("shot_type", situation.shotType);
  const { data, error } = await query;

  if (error) throw new Error(`Unable to find shots: ${error.message}`);

  const relevantShots = findRelevantShots(
    (data ?? []).map((shot) => toDiscoverableShot(shot)),
    situation,
  );
  return addRepertoireConfidence(supabase, relevantShots);
}

export async function getShotById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shots")
    .select(shotFields)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load shot: ${error.message}`);
  return data ? toDiscoverableShot(data) : null;
}

export type ShotCatalogFilters = DiscoveryInput & { difficulty?: number };

export async function listShots(filters?: Partial<ShotCatalogFilters>) {
  const supabase = await createClient();
  let query = supabase.from("shots").select(shotFields).order("name");

  if (filters?.courtX !== undefined)
    query = query
      .gte("court_x_max", filters.courtX)
      .lte("court_x_min", filters.courtX);
  if (filters?.courtY !== undefined)
    query = query
      .gte("court_y_max", filters.courtY)
      .lte("court_y_min", filters.courtY);
  if (filters?.ballHeight !== undefined)
    query = query
      .gte("ball_height_max", filters.ballHeight)
      .lte("ball_height_min", filters.ballHeight);
  if (filters?.difficulty !== undefined)
    query = query.eq("difficulty", filters.difficulty);

  const { data, error } = await query;
  if (error) throw new Error(`Unable to list shots: ${error.message}`);
  return addRepertoireConfidence(
    supabase,
    (data ?? []).map((shot) => toDiscoverableShot(shot)),
  );
}

export async function searchShots(searchTerm = "") {
  const supabase = await createClient();
  let query = supabase.from("shots").select(shotFields).order("name");
  const term = searchTerm.trim();
  if (term) query = query.ilike("name", `%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to search shots: ${error.message}`);
  return addRepertoireConfidence(
    supabase,
    (data ?? []).map((shot) => toDiscoverableShot(shot)),
  );
}
