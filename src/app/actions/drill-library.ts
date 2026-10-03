"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseDrillLibraryCsv } from "@/lib/admin/drill-library-csv";

export type DrillLibraryImportState = { error?: string; success?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/discover");
  return supabase;
}

export async function importDrillLibrary(_: DrillLibraryImportState, formData: FormData): Promise<DrillLibraryImportState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a drill CSV file first." };
  let rows;
  try {
    rows = parseDrillLibraryCsv(await file.text());
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The drill CSV could not be read." };
  }
  const supabase = await requireAdmin();
  try {
    for (const row of rows) {
      const { data: existing } = await supabase.from("drills").select("id").eq("name", row.name).maybeSingle();
      if (existing) throw new Error(`A drill named "${row.name}" already exists.`);
      const { data: drill, error } = await supabase.from("drills").insert({
        name: row.name,
        description: row.description,
        video_url: row.video_url,
        court_x_min: row.court_x_min,
        court_x_max: row.court_x_max,
        court_x_left_min: -row.court_x_max,
        court_x_left_max: -row.court_x_min,
        court_y_min: row.court_y_min,
        court_y_max: row.court_y_max,
        ball_height_min: row.ball_height_min,
        ball_height_max: row.ball_height_max,
      }).select("id").single();
      if (error || !drill) throw new Error(`Unable to import "${row.name}".`);
      for (const shotName of row.shots) {
        const { data: shot } = await supabase.from("shots").select("id").eq("name", shotName).maybeSingle();
        if (!shot) throw new Error(`Shot "${shotName}" was not found for drill "${row.name}".`);
        const { error: linkError } = await supabase.from("shot_drills").insert({ shot_id: shot.id, drill_id: drill.id });
        if (linkError) throw new Error(`Unable to link "${row.name}" to "${shotName}".`);
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Drill import failed." };
  }
  revalidatePath("/drills");
  revalidatePath("/library");
  return { success: `Imported ${rows.length} drills.` };
}
