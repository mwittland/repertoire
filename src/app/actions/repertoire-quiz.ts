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

const idListSchema = z.string().transform((value, context) => {
  try {
    return JSON.parse(value);
  } catch {
    context.addIssue({ code: "custom", message: "Invalid ID list." });
    return z.NEVER;
  }
}).pipe(z.array(z.string().uuid()).max(100));

const applyPresetSchema = z.object({
  shotEntries: shotEntriesSchema,
  drillIds: idListSchema,
  mastery: z.coerce.number().int().min(0).max(100),
  mode: z.literal("replace"),
});

export async function applyPreset(formData: FormData) {
  const parsed = applyPresetSchema.safeParse({
    shotEntries: String(formData.get("shotEntries") ?? "[]"),
    drillIds: String(formData.get("drillIds") ?? "[]"),
    mastery: formData.get("mastery"),
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

  const { error: drillsError } = await supabase
    .from("drill_routine_entries")
    .delete()
    .eq("user_id", user.id);
  if (drillsError) return { success: false, error: "Unable to replace your repertoire drills." };

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

  if (parsed.data.drillIds.length > 0) {
    const { error } = await supabase.from("drill_routine_entries").upsert(
      parsed.data.drillIds.map((drillId) => ({
        user_id: user.id,
        drill_id: drillId,
        mastery: parsed.data.mastery,
      })),
      { onConflict: "user_id,drill_id", ignoreDuplicates: true },
    );
    if (error) return { success: false, error: "Unable to add the preset drills." };
  }

  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  revalidatePath("/repertoire/drills");
  revalidatePath("/library");
  return { success: true };
}
