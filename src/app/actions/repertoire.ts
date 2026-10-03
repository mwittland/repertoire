"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const entrySchema = z.object({
  shotId: z.string().uuid(),
  confidence: z.coerce.number().int().min(0).max(100),
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");
  return { supabase, user };
}

export async function addToRepertoire(formData: FormData) {
  const shotId = z.string().uuid().safeParse(formData.get("shotId"));
  if (!shotId.success) redirect("/discover");
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("repertoire_entries")
    .upsert(
      { user_id: user.id, shot_id: shotId.data, confidence: null },
      { onConflict: "user_id,shot_id", ignoreDuplicates: true },
    );
  if (error) throw new Error(`Unable to add shot: ${error.message}`);
  revalidatePath("/repertoire");
  redirect(`/shots/${shotId.data}?added=1`);
}

export async function quickAddToRepertoire(formData: FormData) {
  const shotId = z.string().uuid().safeParse(formData.get("shotId"));
  if (!shotId.success) return { success: false, error: "Invalid shot." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("repertoire_entries")
    .upsert(
      { user_id: user.id, shot_id: shotId.data, confidence: 0 },
      { onConflict: "user_id,shot_id", ignoreDuplicates: true },
    );
  if (error) return { success: false, error: "Unable to add shot right now." };
  revalidatePath("/library");
  revalidatePath("/discover");
  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  return { success: true };
}

export async function updateConfidence(formData: FormData) {
  const parsed = entrySchema.safeParse({
    shotId: formData.get("shotId"),
    confidence: formData.get("confidence"),
  });
  if (!parsed.success)
    return { success: false, error: "Invalid confidence value." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("repertoire_entries")
    .update({
      confidence: parsed.data.confidence,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("shot_id", parsed.data.shotId);
  if (error)
    return { success: false, error: "Unable to save confidence right now." };
  revalidatePath("/repertoire");
  revalidatePath(`/shots/${parsed.data.shotId}`);
  return { success: true };
}

export async function removeFromRepertoire(formData: FormData) {
  const shotId = z.string().uuid().safeParse(formData.get("shotId"));
  if (!shotId.success) return;
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("repertoire_entries")
    .delete()
    .eq("user_id", user.id)
    .eq("shot_id", shotId.data);
  if (error) throw new Error(`Unable to remove shot: ${error.message}`);
  revalidatePath("/repertoire");
  revalidatePath("/repertoire/shots");
  revalidatePath(`/shots/${shotId.data}`);
  revalidatePath("/library");
  revalidatePath("/discover");
}
