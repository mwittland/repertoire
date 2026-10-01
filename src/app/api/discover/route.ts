import { NextResponse } from "next/server";
import { z } from "zod";
import { findRelevantShotsFromDatabase } from "@/lib/shots/queries";
import { createClient } from "@/lib/supabase/server";

const discoverySchema = z.object({
  courtX: z.number().min(-15).max(15),
  courtY: z.number().min(0).max(30),
  ballHeight: z.number().min(0).max(10),
  intent: z.number().min(0).max(100),
  handedness: z.enum(["Right", "Left"]).default("Right"),
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
    const shots = await findRelevantShotsFromDatabase({
      ...parsed.data,
      handedness,
    });
    return NextResponse.json({ shots });
  } catch {
    return NextResponse.json(
      { error: "We could not load shots right now." },
      { status: 500 },
    );
  }
}
