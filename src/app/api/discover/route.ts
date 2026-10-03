import { NextResponse } from "next/server";
import { z } from "zod";
import { findRelevantShotsFromDatabase } from "@/lib/shots/queries";
import { findRelevantDrills } from "@/lib/drills/queries";
import { createClient } from "@/lib/supabase/server";

const discoverySchema = z.object({
  courtX: z.number().min(-15).max(15),
  courtY: z.number().min(0).max(30),
  ballHeight: z.number().min(0).max(10),
  handedness: z.enum(["Right", "Left"]).default("Right"),
  kind: z.enum(["shots", "drills"]).default("shots"),
  shotType: z
    .enum(["Dink", "Drop", "Drive", "Reset", "Attack", "Putaway", "Lob"])
    .optional(),
});

export async function POST(request: Request) {
  const parsed = discoverySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid court situation." },
      { status: 400 },
    );

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let handedness = parsed.data.handedness;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("handedness")
        .eq("id", user.id)
        .maybeSingle();
      handedness = profile?.handedness === "Left" ? "Left" : "Right";
    }
    const input = {
      ...parsed.data,
      handedness,
    };
    if (parsed.data.kind === "drills") {
      const drills = await findRelevantDrills(input);
      return NextResponse.json({ drills });
    }
    const shots = await findRelevantShotsFromDatabase(input);
    return NextResponse.json({ shots });
  } catch {
    return NextResponse.json(
      { error: "We could not load discovery results right now." },
      { status: 500 },
    );
  }
}
