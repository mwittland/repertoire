"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const shotEntriesSchema = z.string().transform((value, context) => {
  try {
    return JSON.parse(value);
  } catch {
    context.addIssue({ code: "custom", message: "Invalid ID list." });
    return z.NEVER;
  }
}).pipe(z.array(z.object({
  id: z.string().uuid(),
  confidence: z.number().int().min(0).max(100),
})).max(100));

const applyPresetSchema = z.object({
  shotEntries: shotEntriesSchema,
  mode: z.literal("replace"),
});

export async function applyPreset(formData: FormData) {
  const parsed = applyPresetSchema.safeParse({
    shotEntries: String(formData.get("shotEntries") ?? "[]"),
    mode: formData.get("mode"),
  });
  if (!parsed.success) return { success: false, error: "Unable to apply this preset." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/quiz");

  const { error: shotsError } = await supabase
    .from("repertoire_entries")
    .delete()
    .eq("user_id", user.id);
  if (shotsError) return { success: false, error: "Unable to replace your repertoire shots." };

  if (parsed.data.shotEntries.length > 0) {
    const { error } = await supabase.from("repertoire_entries").upsert(
      parsed.data.shotEntries.map((shot) => ({
        user_id: user.id,
        shot_id: shot.id,
        confidence: shot.confidence,
      })),
      { onConflict: "user_id,shot_id", ignoreDuplicates: true },
    );
    if (error) return { success: false, error: "Unable to add the preset shots." };
  }

  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  revalidatePath("/library");
  return { success: true };
}

export async function resetRepertoire() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");

  const { error } = await supabase
    .from("repertoire_entries")
    .delete()
    .eq("user_id", user.id);
  if (error) return { success: false, error: "Unable to reset your repertoire." };

  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  revalidatePath("/library");
  return { success: true };
}
