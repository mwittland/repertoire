"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ShotRequestState = { error?: string; success?: boolean };

const requestSchema = z.object({
  requestedName: z.string().trim().min(2, "Give the shot a name."),
  videoUrl: z.string().url("Enter a valid video URL."),
});

export async function submitShotRequest(
  _: ShotRequestState,
  formData: FormData,
): Promise<ShotRequestState> {
  const parsed = requestSchema.safeParse({
    requestedName: formData.get("requestedName"),
    videoUrl: formData.get("videoUrl"),
  });
  if (!parsed.success)
    return {
      error: parsed.error.issues[0]?.message ?? "Check the request details.",
    };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in before submitting a shot request." };

  const { error } = await supabase
    .from("shot_requests")
    .insert({
      user_id: user.id,
      requested_name: parsed.data.requestedName,
      video_url: parsed.data.videoUrl,
    });
  if (error) return { error: "We could not submit that request right now." };
  return { success: true };
}
