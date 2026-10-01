"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: boolean };

const handednessSchema = z.enum(["Right", "Left"]);

export async function updateHandedness(
  formData: FormData,
): Promise<ProfileState> {
  const parsed = handednessSchema.safeParse(formData.get("handedness"));
  if (!parsed.success) return { error: "Choose right or left handed." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in before updating your profile." };
  const { error } = await supabase
    .from("profiles")
    .update({ handedness: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: "Unable to update your profile right now." };
  revalidatePath("/profile");
  return { success: true };
}
