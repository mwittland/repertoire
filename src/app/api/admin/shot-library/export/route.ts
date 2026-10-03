import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShotLibraryCsv } from "@/lib/admin/shot-library-csv";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: shots, error: shotsError } = await supabase.from("shots").select("name, shot_type, aggression_score, difficulty, court_x_min, court_x_max, court_y_min, court_y_max, ball_height_min, ball_height_max, description, instructions, video_url").order("name");
  if (shotsError) return NextResponse.json({ error: "Unable to export the shot library." }, { status: 500 });
  const csv = createShotLibraryCsv(shots ?? []);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="repertoire-shot-library.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
