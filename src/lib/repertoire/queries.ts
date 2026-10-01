import { createClient } from "@/lib/supabase/server";

export type RepertoireEntry = {
  shotId: string;
  shotName: string;
  difficulty: number;
  confidence: number;
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
            confidence: Number(entry.confidence),
          },
        ]
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
  return data ? { confidence: Number(data.confidence) } : null;
}
