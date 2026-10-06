"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  updates: z.string().transform((value, context) => {
    try {
      return JSON.parse(value);
    } catch {
      context.addIssue({ code: "custom", message: "Invalid mastery updates." });
      return z.NEVER;
    }
  }).pipe(z.array(z.object({
    shotId: z.string().uuid(),
    confidence: z.number().int().min(0).max(100),
  })).min(1).max(100)),
});

export async function saveMasteryUpdates(formData: FormData) {
  const parsed = updateSchema.safeParse({
    updates: String(formData.get("updates") ?? "[]"),
  });
  if (!parsed.success) return { success: false, error: "Unable to save these updates." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/update");

  const { error } = await supabase.from("repertoire_entries").upsert(
    parsed.data.updates.map((update) => ({
      user_id: user.id,
      shot_id: update.shotId,
      confidence: update.confidence,
    })),
    { onConflict: "user_id,shot_id" },
  );
  if (error) return { success: false, error: "Unable to save these mastery updates." };

  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  revalidatePath("/repertoire/update");
  return { success: true };
}
