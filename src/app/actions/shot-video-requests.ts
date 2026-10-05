"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ShotVideoRequestState = { error?: string; success?: boolean };

const schema = z.object({
  shotId: z.string().uuid(),
  videoUrl: z.string().url("Enter a valid YouTube URL.").refine(isYoutubeUrl, "Enter a valid YouTube URL."),
  startSeconds: z.coerce.number().int().min(0),
  endSeconds: z.coerce.number().int().positive(),
}).refine((data) => data.endSeconds > data.startSeconds, {
  message: "End time must be greater than start time.",
});

function isYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.hostname === "youtu.be" ||
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) && (
      url.hostname === "youtu.be" ||
      url.pathname === "/watch" ||
      url.pathname.startsWith("/embed/") ||
      url.pathname.startsWith("/shorts/")
    );
  } catch {
    return false;
  }
}

export async function submitShotVideoRequest(
  _: ShotVideoRequestState,
  formData: FormData,
): Promise<ShotVideoRequestState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the video details." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in before requesting a video." };
  const { error } = await supabase.from("shot_video_requests").insert({
    shot_id: parsed.data.shotId,
    user_id: user.id,
    video_url: parsed.data.videoUrl,
    start_seconds: parsed.data.startSeconds,
    end_seconds: parsed.data.endSeconds,
  });
  return error ? { error: "We could not submit that video request." } : { success: true };
}
