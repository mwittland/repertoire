import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDrillLibraryCsv } from "@/lib/admin/drill-library-csv";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [{ data: drills, error }, { data: links, error: linksError }, { data: shots, error: shotsError }] = await Promise.all([
    supabase.from("drills").select("id,name,court_x_min,court_x_max,court_y_min,court_y_max,ball_height_min,ball_height_max,description,video_url").order("name"),
    supabase.from("shot_drills").select("shot_id,drill_id"),
    supabase.from("shots").select("id,name"),
  ]);
  if (error || linksError || shotsError) return NextResponse.json({ error: "Unable to export the drill library." }, { status: 500 });
  const names = new Map((shots ?? []).map((shot) => [shot.id, shot.name]));
  const related = new Map<string, string[]>();
  for (const link of links ?? []) {
    const name = names.get(link.shot_id);
    if (name) related.set(link.drill_id, [...(related.get(link.drill_id) ?? []), name]);
  }
  const csv = createDrillLibraryCsv((drills ?? []).map((drill) => ({ ...drill, shots: (related.get(drill.id) ?? []).join("|") })));
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="repertoire-drill-library.csv"', "Cache-Control": "no-store" } });
}
