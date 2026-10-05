import { createClient } from "@/lib/supabase/server";
import { drillTypes, type Drill, type DrillType } from "@/lib/drills/types";

export { drillTypes };
export type { Drill, DrillType };

const drillFields = "id,name,type,description,video_url,court_x_min,court_x_max,court_x_left_min,court_x_left_max,court_y_min,court_y_max,ball_height_min,ball_height_max";

function toDrill(row: Record<string, unknown>, shots: { id: string; name: string }[] = []): Drill {
  return {
    id: String(row.id),
    name: String(row.name),
    type: drillTypes.includes(row.type as DrillType) ? row.type as DrillType : "Solo",
    description: String(row.description ?? ""),
    videoUrl: typeof row.video_url === "string" ? row.video_url : null,
    courtXMin: Number(row.court_x_min),
    courtXMax: Number(row.court_x_max),
    courtXLeftMin: Number(row.court_x_left_min),
    courtXLeftMax: Number(row.court_x_left_max),
    courtYMin: Number(row.court_y_min),
    courtYMax: Number(row.court_y_max),
    ballHeightMin: Number(row.ball_height_min),
    ballHeightMax: Number(row.ball_height_max),
    shots,
  };
}

export async function listDrills() {
  const supabase = await createClient();
  const query = supabase.from("drills").select(drillFields).order("name");
  const { data, error } = await query;
  if (error) throw new Error(`Unable to list drills: ${error.message}`);
  return (data ?? []).map((drill) => toDrill(drill as unknown as Record<string, unknown>));
}

export async function searchDrills(searchTerm = "") {
  const supabase = await createClient();
  let query = supabase.from("drills").select(drillFields).order("name");
  const term = searchTerm.trim();
  if (term) query = query.ilike("name", `%${term}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to search drills: ${error.message}`);
  return (data ?? []).map((drill) => toDrill(drill));
}

export async function getDrillById(id: string) {
  const supabase = await createClient();
  const { data: drill, error: drillError } = await supabase.from("drills").select(drillFields).eq("id", id).maybeSingle();
  if (drillError) throw new Error(`Unable to load drill: ${drillError.message}`);
  if (!drill) return null;
  const { data: links, error: linksError } = await supabase.from("shot_drills").select("shot_id,shots(id,name)").eq("drill_id", id);
  if (linksError) throw new Error(`Unable to load drill shots: ${linksError.message}`);
  const shots = (links ?? []).flatMap((link) => {
    const shot = link.shots as { id?: unknown; name?: unknown } | null;
    return shot?.id && shot.name ? [{ id: String(shot.id), name: String(shot.name) }] : [];
  });
  return toDrill(drill as unknown as Record<string, unknown>, shots);
}

export async function listDrillsForShot(shotId: string) {
  const supabase = await createClient();
  const { data: links, error } = await supabase.from("shot_drills").select(`drill_id,drills(${drillFields})`).eq("shot_id", shotId);
  if (error) throw new Error(`Unable to load related drills: ${error.message}`);
  return (links ?? []).flatMap((link) => {
    const drills = Array.isArray(link.drills) ? link.drills : [link.drills];
    return drills.flatMap((drill) => drill && typeof drill === "object" && "id" in drill ? [toDrill(drill as Record<string, unknown>)] : []);
  });
}

export async function listDrillIdsForShot(shotId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("shot_drills").select("drill_id").eq("shot_id", shotId);
  if (error) throw new Error(`Unable to load shot drills: ${error.message}`);
  return (data ?? []).map((link) => String(link.drill_id));
}
