"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire");
  return { supabase, user };
}

export async function addToRoutine(formData: FormData) {
  const drillId = z.string().uuid().safeParse(formData.get("drillId"));
  if (!drillId.success) return { success: false, error: "Invalid drill." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("drill_routine_entries").upsert(
    { user_id: user.id, drill_id: drillId.data, mastery: 0 },
    { onConflict: "user_id,drill_id", ignoreDuplicates: true },
  );
  if (error) return { success: false, error: "Unable to add drill right now." };
  revalidatePath("/library");
  revalidatePath("/drills");
  revalidatePath(`/drills/${drillId.data}`);
  revalidatePath("/repertoire");
  return { success: true };
}

export async function updateDrillMastery(formData: FormData) {
  const parsed = z.object({
    drillId: z.string().uuid(),
    mastery: z.coerce.number().int().min(0).max(100),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Invalid mastery value." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("drill_routine_entries")
    .update({ mastery: parsed.data.mastery, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("drill_id", parsed.data.drillId);
  if (error) return { success: false, error: "Unable to save mastery right now." };
  revalidatePath("/repertoire");
  revalidatePath(`/drills/${parsed.data.drillId}`);
  return { success: true };
}

export async function removeFromRoutine(formData: FormData) {
  const drillId = z.string().uuid().safeParse(formData.get("drillId"));
  if (!drillId.success) return;
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("drill_routine_entries")
    .delete()
    .eq("user_id", user.id)
    .eq("drill_id", drillId.data);
  if (error) throw new Error(`Unable to remove drill: ${error.message}`);
  revalidatePath("/repertoire");
  revalidatePath(`/drills/${drillId.data}`);
  revalidatePath("/library");
}
