"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseShotLibraryCsv } from "@/lib/admin/shot-library-csv";

export type ShotLibraryImportState = { error?: string; success?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/library");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/");
  return supabase;
}

export async function importShotLibrary(_: ShotLibraryImportState, formData: FormData): Promise<ShotLibraryImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file first." };
  let rows;
  try {
    rows = parseShotLibraryCsv(await file.text());
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The CSV could not be read." };
  }

  const supabase = await requireAdmin();
  try {
    for (const row of rows) {
      const { data: existing } = await supabase.from("shots").select("id").eq("name", row.name).maybeSingle();
      if (existing) throw new Error(`A shot named "${row.name}" already exists.`);
      const { data: shot, error } = await supabase.from("shots").insert({ name: row.name, shot_type: row.shot_type, aggression_score: row.aggression_score, difficulty: row.difficulty, court_x_min: row.court_x_min, court_x_max: row.court_x_max, court_x_left_min: -row.court_x_max, court_x_left_max: -row.court_x_min, court_y_min: row.court_y_min, court_y_max: row.court_y_max, ball_height_min: row.ball_height_min, ball_height_max: row.ball_height_max, description: row.description, instructions: row.instructions, video_url: row.video_url }).select("id").single();
      if (error || !shot) throw new Error(`Unable to import "${row.name}".`);
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Import failed." };
  }
  revalidatePath("/shots");
  revalidatePath("/library");
  return { success: `Imported ${rows.length} shots.` };
}
