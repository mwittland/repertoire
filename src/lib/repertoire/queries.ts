import { createClient } from "@/lib/supabase/server";
import type { DiscoverableShot } from "@/lib/discovery/types";

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
            confidence:
              entry.confidence === null ? null : Number(entry.confidence),
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
