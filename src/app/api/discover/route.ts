import { NextResponse } from "next/server";
import { z } from "zod";
import { findRelevantShotsFromDatabase } from "@/lib/shots/queries";

const discoverySchema = z.object({
  courtX: z.number().min(-15).max(15),
  courtY: z.number().min(0).max(30),
  ballHeight: z.number().min(0).max(10),
  intent: z.number().min(0).max(100),
});

export async function POST(request: Request) {
  const parsed = discoverySchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid court situation." },
      { status: 400 },
    );

  try {
    const shots = await findRelevantShotsFromDatabase(parsed.data);
    return NextResponse.json({ shots });
  } catch {
    return NextResponse.json(
      { error: "We could not load shots right now." },
      { status: 500 },
    );
  }
}
