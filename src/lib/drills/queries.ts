import { createClient } from "@/lib/supabase/server";

export type Drill = {
  id: string;
  name: string;
  description: string;
  videoUrl: string | null;
  shots: { id: string; name: string }[];
};

function toDrill(
  row: Record<string, unknown>,
  shots: { id: string; name: string }[] = [],
): Drill {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    videoUrl: typeof row.video_url === "string" ? row.video_url : null,
    shots,
  };
}

export async function listDrills() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drills")
    .select("id,name,description,video_url")
    .order("name");
  if (error) throw new Error(`Unable to list drills: ${error.message}`);
  return (data ?? []).map((drill) => toDrill(drill));
}

export async function getDrillById(id: string) {
  const supabase = await createClient();
  const { data: drill, error: drillError } = await supabase
    .from("drills")
    .select("id,name,description,video_url")
    .eq("id", id)
    .maybeSingle();
  if (drillError)
    throw new Error(`Unable to load drill: ${drillError.message}`);
  if (!drill) return null;

  const { data: links, error: linksError } = await supabase
    .from("shot_drills")
    .select("shot_id,shots(id,name)")
    .eq("drill_id", id);
  if (linksError)
    throw new Error(`Unable to load drill shots: ${linksError.message}`);

  const shots = (links ?? []).flatMap((link) => {
    const shot = link.shots as { id?: unknown; name?: unknown } | null;
    return shot?.id && shot.name
      ? [{ id: String(shot.id), name: String(shot.name) }]
      : [];
  });
  return toDrill(drill, shots);
}

export async function listDrillsForShot(shotId: string) {
  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from("shot_drills")
    .select("drill_id,drills(id,name,description,video_url)")
    .eq("shot_id", shotId);
  if (error) throw new Error(`Unable to load related drills: ${error.message}`);

  return (links ?? []).flatMap((link) => {
    const nestedDrills = Array.isArray(link.drills)
      ? link.drills
      : [link.drills];
    return nestedDrills.flatMap((drill) => {
      if (!drill || typeof drill !== "object") return [];
      const record = drill as Record<string, unknown>;
      return record.id ? [toDrill(record)] : [];
    });
  });
}
