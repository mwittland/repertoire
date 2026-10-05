"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  drillEntries: z.string().transform((value, context) => {
    try {
      return JSON.parse(value);
    } catch {
      context.addIssue({ code: "custom", message: "Invalid drill list." });
      return z.NEVER;
    }
  }).pipe(z.array(z.object({
    id: z.string().uuid(),
    mastery: z.number().int().min(0).max(100),
  })).max(100)),
});

export async function applyDrillPreset(formData: FormData) {
  const parsed = schema.safeParse({
    drillEntries: String(formData.get("drillEntries") ?? "[]"),
  });
  if (!parsed.success) return { success: false, error: "Unable to apply this drill profile." };
  if (parsed.data.drillEntries.length === 0) {
    return { success: false, error: "This profile does not contain any available drills." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/repertoire/drills/build");

  const { error: deleteError } = await supabase
    .from("drill_routine_entries")
    .delete()
    .eq("user_id", user.id);
  if (deleteError) {
    console.error("Unable to clear drill routine before applying profile.", deleteError);
    return { success: false, error: "Unable to replace your drill routine." };
  }

  const { error: insertError } = await supabase.from("drill_routine_entries").insert(
    parsed.data.drillEntries.map((drill) => ({
      user_id: user.id,
      drill_id: drill.id,
      mastery: drill.mastery,
    })),
  );
  if (insertError) {
    console.error("Unable to save drill profile.", insertError);
    return { success: false, error: "Unable to save the drill profile." };
  }

  revalidatePath("/repertoire");
  revalidatePath("/repertoire/drills");
  return { success: true };
}
