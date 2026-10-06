"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { DiscoverableShot } from "@/lib/discovery/types";

const shotSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  courtXMin: z.number(),
  courtXMax: z.number(),
  courtXLeftMin: z.number(),
  courtXLeftMax: z.number(),
  courtYMin: z.number(),
  courtYMax: z.number(),
  ballHeightMin: z.number(),
  ballHeightMax: z.number(),
  shotType: z.string().optional(),
  aggressionScore: z.number().optional(),
  difficulty: z.number().optional(),
  confidence: z.number().nullable().optional(),
});

const createShareSchema = z.object({
  profileName: z.string().trim().min(1).max(100),
  handedness: z.enum(["Right", "Left"]),
  shots: z.string().transform((value, context) => {
    try {
      return JSON.parse(value);
    } catch {
      context.addIssue({ code: "custom", message: "Invalid repertoire snapshot." });
      return z.NEVER;
    }
  }).pipe(z.array(shotSchema).min(1).max(100)),
});

export async function createSharedRepertoire(formData: FormData) {
  const parsed = createShareSchema.safeParse({
    profileName: formData.get("profileName"),
    handedness: formData.get("handedness"),
    shots: String(formData.get("shots") ?? "[]"),
  });
  if (!parsed.success) {
    return { success: false, error: "Unable to create a share link." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");

  const token = crypto.randomBytes(18).toString("hex");
  const { error } = await supabase.from("shared_repertoires").insert({
    user_id: user.id,
    share_token: token,
    profile_name: parsed.data.profileName,
    handedness: parsed.data.handedness,
    shots: parsed.data.shots as DiscoverableShot[],
  });
  if (error) return { success: false, error: "Unable to create a share link." };

  return { success: true, token };
}
